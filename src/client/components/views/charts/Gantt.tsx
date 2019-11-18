import React, { FC } from 'react'
import Highcharts from 'highcharts/highcharts-gantt'
import HighchartsReact from 'highcharts-react-official'
import { stateColors } from './utils'
import { flatten } from 'lodash'

const GanttChart: FC<{ data: any[] }> = ({ data }) => {
	// don't render in server
	if (typeof window === 'undefined') return <div></div>

	return (
		<HighchartsReact
			immutable={true}
			highcharts={Highcharts}
			constructorType={'ganttChart'}
			containerProps={{
				id: 'gantt-chart'
			}}
			//@ts-ignore
			options={{
				yAxis: {
					visible: false,
					uniqueNames: true,
					margin: 0,
					labels: {
						enabled: false
					}
				},
				plotOptions: {
					series: {
						turboThreshold: 5000
					}
				},
				series: [
					{
						name: 'States',
						data: flatten(data).map(({ type, start, end }, i) => ({
							id: i,
							name: 'States',
							label: type,
							color: stateColors[type],
							start,
							end,
							y: 0
						}))
					}
				]
			}}
		/>
	)
}

export default GanttChart
