import React, { FC } from 'react'
import Highcharts from 'highcharts/highcharts-gantt'
import HighchartsReact from 'highcharts-react-official'

const GanttChart: FC<{ data: any[] }> = ({ data }) => {
	// don't render in server
	if (typeof window === 'undefined') return <div></div>

	return (
		<HighchartsReact
			highcharts={Highcharts}
			constructorType={'ganttChart'}
			options={{
				series: [
					{
						name: 'States',
						type: 'gantt',
						data: data.flat()
					}
				]
			}}
		/>
	)
}

export default GanttChart
