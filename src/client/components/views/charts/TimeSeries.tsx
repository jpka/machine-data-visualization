import React, { FC, createRef } from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { MetricsOpts } from '../../App'
import { MachineLogTuple } from '../../../../server/models/machine-log.model'
import { queryParams } from '../../../utils'

// data comes in groups of continuous data. we need to insert null points in between
// for highcharts to show the gap
const processLogGroups = (
	groupedLogs: MachineLogTuple[][]
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
	data: MachineLogTuple[][]
	metrics: MetricsOpts
	setRange: ([min, max]) => any
}> = ({ data, metrics, setRange }) => {
	// don't render in server
	if (typeof window === 'undefined') return <div></div>

	const chartRef = createRef()
	let currentExtremes

	const processedLogs = processLogGroups(data)

	const graphedData = Object.keys(metrics)
		.filter(m => metrics[m].graph)
		.map(metric => ({
			name: metric,
			data: extractSingleMetricSeries(processedLogs, metric),
			type: 'line',
			connectNulls: false,
			zones:
				metric === 'Iavg_A'
					? [
							{
								// unloaded
								value: parseInt(queryParams.get('unloadedLimit')) || 1.5,
								color: 'yellow'
							},
							{
								// idle
								value: parseInt(queryParams.get('idleLimit')) || 30,
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
			//@ts-ignore
			ref={chartRef}
			highcharts={Highcharts}
			constructorType={'stockChart'}
			containerProps={{
				id: 'time-series-chart',
				'data-testid': 'time-series-chart'
			}}
			//@ts-ignore
			options={{
				title: {
					text: 'Average current'
				},
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
							if (
								currentExtremes &&
								(e.min !== currentExtremes.min || e.max !== currentExtremes.max)
							) {
								setRange([e.min, e.max])
							}
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
						},
						point: {
							events: {
								mouseOver: function(e) {
									const chart: Highcharts.Chart & {
										lbl?: Highcharts.SVGElement
									} = this.series.chart

									if (!chart.lbl) {
										chart.lbl = chart.renderer
											//@ts-ignore
											.label('')
											.attr({
												padding: 10,
												r: 10,
												//@ts-ignore
												fill: Highcharts.getOptions().colors[1]
											})
											.css({
												color: '#FFFFFF'
											})
											.add()
											.hide()
									}
									//@ts-ignore
									const point = processedLogs.find(l => l[0] === e.target.x)
									if (!point) return
									const values = point[1]
									//@ts-ignore
									chart.lbl.show().attr({
										text: Object.keys(metrics)
											.filter(metric => metrics[metric].show)
											.map(
												metric =>
													`${metric}: ${
														values.hasOwnProperty(metric)
															? values[metric]
															: 'null'
													}`
											)
											.join(', ')
									})
								}
							}
						}
					}
				},

				tooltip: {
					enabled: true
				},

				rangeSelector: {
					buttons: [
						{
							text: 'Reset',
							events: {
								click: function() {
									//@ts-ignore
									const chart = chartRef.current.chart
									setTimeout(() => {
										const initialGroups = window['initialData'].groups
										chart.xAxis[0].setExtremes(
											initialGroups[0].start,
											initialGroups[initialGroups.length - 1].end
										)
									}, 1)
								}
							}
						}
					],
					inputEnabled: true // it supports only days
				},

				scrollbar: {
					enabled: false
				},

				navigator: {
					enabled: false,
					adaptToUpdatedData: false
				},

				series: graphedData
			}}
		/>
	)
}

export default TimeSeriesChart
