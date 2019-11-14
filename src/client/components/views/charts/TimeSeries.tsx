import React, { FC } from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { MetricsOpts } from '../../App'
import { getActiveMetrics, fetchMetrics } from '../../../utils'
import {
	MachineLogTuple,
	GetTimeRangeResponse
} from '../../../../server/models/machine-log.model'

// data comes in groups of continuous data. we need to insert null points in between
// for highcharts to show the gap
const processLogGroups = (
	groupedLogs: GetTimeRangeResponse['groups']
): MachineLogTuple[] =>
	groupedLogs.reduce(
		(acc, logs: any) =>
			acc.concat(logs, [[logs[logs.length - 1][0] + 1, null]]),
		[] as any
	)

const extractSingleMetricSeries = (logs, metric: string) =>
	logs.map(([timestamp, metrics]) => [
		new Date(timestamp).getTime(),
		metrics ? metrics[metric] : null
	])

const TimeSeriesChart: FC<{
	data: GetTimeRangeResponse['groups']
	// metrics: MetricsOpts
	metrics: string[]
}> = ({ data, metrics }) => {
	// don't render in server
	if (typeof window === 'undefined') return <div></div>

	let currentExtremes

	const processedLogs = processLogGroups(data)

	const graphedData = metrics.map(metric => ({
		name: metric,
		data: extractSingleMetricSeries(processedLogs, metric),
		type: 'line',
		connectNulls: false,
		zones:
			metric === 'Iavg_A'
				? [
						{
							// unloaded
							value: 1.5,
							color: 'yellow'
						},
						{
							// idle
							value: 30,
							color: 'orange'
						},
						{
							// loaded
							color: 'red'
						}
				  ]
				: undefined
	}))

	return (
		<HighchartsReact
			highcharts={Highcharts}
			constructorType={'stockChart'}
			//@ts-ignore
			options={{
				chart: {
					zoomType: 'x',
					events: {
						load: function() {
							currentExtremes = this.xAxis[0].getExtremes()
						}
					}
				},
				xAxis: {
					crosshair: true,
					type: 'datetime',
					ordinal: false,
					events: {
						afterSetExtremes: async function(e) {
							// check that the extremes actually changed, abort otherwise
							if (
								e.min === currentExtremes.min &&
								e.max === currentExtremes.max
							) {
								return
							}
							//@ts-ignore
							currentExtremes = e
							console.log('aftersetextremes', e)
							const newData = await fetchMetrics({
								metrics: getActiveMetrics(metrics),
								start: Math.round(e.min),
								end: Math.round(e.max)
							})
							console.log('fetched data', newData)
							//@ts-ignore
							const processed = processLogGroups(newData.groups)
							this.series.forEach(series => {
								series.setData(
									extractSingleMetricSeries(processed, series.name)
								)
							})
						}
					}
				},
				yAxis: {
					crosshair: true,
					startOnTick: false
				},
				legend: {
					enabled: false
				},
				plotOptions: {
					series: {
						connectNulls: false,
						dataGrouping: {
							enabled: false
						}
						// point: {
						// 	events: {
						// 		mouseOver: function() {
						// 			const chart: Highcharts.Chart & {
						// 				lbl?: Highcharts.SVGElement
						// 			} = this.series.chart

						// 			if (!chart.lbl) {
						// 				chart.lbl = chart.renderer
						// 					//@ts-ignore
						// 					.label('')
						// 					.attr({
						// 						padding: 10,
						// 						r: 10,
						// 						//@ts-ignore
						// 						fill: Highcharts.getOptions().colors[1]
						// 					})
						// 					.css({
						// 						color: '#FFFFFF'
						// 					})
						// 					.add()
						// 			}
						// 			//@ts-ignore
						// 			chart.lbl.show().attr({
						// 				text: Object.keys(metrics)
						// 					.filter(metric => metrics[metric].show)
						// 					.map(metric => `${metric}`)
						// 					.join(',\n')
						// 			})
						// 		}
						// 	}
						// }
					}
				},

				tooltip: {
					enabled: true
				},

				rangeSelector: {
					buttons: [
						{
							type: 'hour',
							count: 1,
							text: '1h'
						},
						{
							type: 'day',
							count: 1,
							text: '1d'
						},
						{
							type: 'all',
							text: 'All'
						}
					],
					// inputEnabled: false, // it supports only days
					selected: 3 // all
				},

				scrollbar: {
					liveRedraw: false
				},

				navigator: {
					adaptToUpdatedData: false
				},

				series: graphedData
			}}
		/>
	)
}

export default TimeSeriesChart
