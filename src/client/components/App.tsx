import React, { FC, useState } from 'react'
import TimeSeriesChart from './views/charts/TimeSeries'
import Reference from './views/Reference'
// import GanttChart from './views/charts/Gantt'
import { GetTimeRangeResponse } from '../../server/models/machine-log.model'
import './App.css'

export type MetricsOpts = { [key: string]: { show: boolean; graph: boolean } }

// console.log('initial data', window.initialData)

const App: FC<{ initialData?: GetTimeRangeResponse }> = ({
	initialData = window['initialData']
}) => {
	// const [metrics, setMetricsState] = useState<MetricsOpts>({
	// 	Iavg_A: { graph: true }
	// })
	const [data, setData] = useState<GetTimeRangeResponse>(initialData)

	return (
		<div style={{ display: 'flex' }}>
			<span style={{ flexGrow: 1 }}>
				<TimeSeriesChart data={data.groups} metrics={data.metrics} />
				{/* <GanttChart data={data.groups.map(({ subGroups }) => subGroups)} /> */}
			</span>
			{/* <Reference metrics={metrics} setMetricsState={setMetricsState} /> */}
		</div>
	)
}

export default App
