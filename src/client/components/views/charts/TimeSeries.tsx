import React, { FC } from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'

const TimeSeriesChart: FC<{ data: any[] }> = ({ data }) => {
	// don't render in server
	if (typeof window === 'undefined') return <div></div>
	return (
		<HighchartsReact
			highcharts={Highcharts}
			options={{
				chart: {
					zoomType: 'x'
				},
				title: {
					text: 'USD to EUR exchange rate over time'
				},
				subtitle: {
					text:
						document.ontouchstart === undefined
							? 'Click and drag in the plot area to zoom in'
							: 'Pinch the chart to zoom in'
				},
				xAxis: {
					type: 'datetime'
				},
				yAxis: {
					title: {
						text: 'Exchange rate'
					}
				},
				legend: {
					enabled: false
				},
				plotOptions: {
					area: {
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [
								[0, Highcharts.getOptions().colors[0]],
								[
									1,
									Highcharts.Color(Highcharts.getOptions().colors[0])
										.setOpacity(0)
										.get('rgba')
								]
							]
						},
						marker: {
							radius: 2
						},
						lineWidth: 1,
						states: {
							hover: {
								lineWidth: 1
							}
						},
						threshold: null
					}
				},

				series: [
					{
						type: 'area',
						name: 'USD to EUR',
						gapSize: 60000,
						gapUnit: 'value',
						data
						// [
						// 	[new Date('2012'), 1],
						// 	[new Date('2013'), 3],
						// 	[new Date('2014'), null],
						// 	[new Date('2016'), 6],
						// 	[new Date('2017'), 9]
						// ]
					}
				]
			}}
		/>
	)
}

export default TimeSeriesChart
