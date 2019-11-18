import React, { FC, useState, useEffect } from 'react'
import TimeSeriesChart from './views/charts/TimeSeries'
import Controls from './views/Controls'
import GanttChart from './views/charts/Gantt'
import { GetTimeRangeResponse } from '../../server/models/machine-log.model'
import { difference, merge, isEqual } from 'lodash'
import { fetchMetrics, getActiveMetrics, queryParams } from '../utils'
import Legend from './views/charts/Legend'
import './App.css'

export type MetricsOpts = { [key: string]: { show: boolean; graph: boolean } }

const App: FC<{ initialData?: GetTimeRangeResponse }> = ({
	initialData = window['initialData']
}) => {
	const [metrics, setMetricsState] = useState<MetricsOpts>({
		Iavg_A: { graph: true, show: true }
	})
	const [range, setRange] = useState<[any, any]>([
		queryParams.get('start'),
		queryParams.get('end')
	])
	const [data, setData] = useState<
		GetTimeRangeResponse & { queryRange: [any, any] }
	>({
		...initialData,
		queryRange: range
	})

	const fetchNewData = async (metricsToFetch: string[], replace: boolean) => {
		const newData = await fetchMetrics({
			metrics: metricsToFetch,
			start: range[0] || undefined,
			end: range[1] || undefined
		})
		setData({
			groups: replace ? newData.groups : merge(data.groups, newData.groups),
			metrics: getActiveMetrics(metrics),
			queryRange: range
		})
	}

	useEffect(() => {
		const activeMetrics = getActiveMetrics(metrics)
		const missingMetrics = difference(activeMetrics, data.metrics)
		if (missingMetrics.length > 0) {
			fetchNewData(missingMetrics, false)
		} else if (!isEqual(data.queryRange, range)) {
			fetchNewData(activeMetrics, true)
		}
	})

	return (
		<div style={{ display: 'flex' }}>
			<span style={{ flexGrow: 1, position: 'relative' }}>
				<Legend
					style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
				/>
				<TimeSeriesChart
					data={data.groups.map(({ logs }) => logs)}
					setRange={setRange}
					metrics={metrics}
				/>
				<GanttChart data={data.groups.map(({ subGroups }) => subGroups)} />
			</span>
			<Controls metrics={metrics} setMetricsState={setMetricsState} />
		</div>
	)
}

export default App
