import React, { FC } from 'react'
import './App.css'
import TimeSeriesChart from './views/charts/TimeSeries'

const App: FC<{ initialData?: any[] }> = ({
	initialData = window['initialData'] || []
}) => {
	return (
		<div>
			<pre>{JSON.stringify(initialData)}</pre>
			<pre>Count: {initialData.value.Iavg_A.length}</pre>
			<TimeSeriesChart
				data={initialData.value.Iavg_A.map(([timestamp, value]) => [
					new Date(timestamp),
					value
				])}
			/>
		</div>
	)
}

export default App
