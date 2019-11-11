import React from 'react'
import GanttChart from './views/graphs/Gantt'

const data = [
	{
		id: '999e8ab',
		versionNumber: 1.0,
		startDate: new Date('2018-02-28'),
		endDate: new Date('2018-04-26'),
		taskName: 'IOS Development',
		description: 'Sprint 5',
		color: '#BA68C8',
		percentageCompleted: 80.0
	},
	{
		id: '16c0013',
		versionNumber: 0.95,
		startDate: new Date('2018-01-31'),
		endDate: new Date('2018-02-27'),
		taskName: 'IOS Development',
		description: 'Sprint 6',
		color: '#BA68C8',
		percentageCompleted: 100.0
	},
	{
		id: '4a16c13',
		versionNumber: 0.95,
		startDate: new Date('2018-01-31'),
		endDate: new Date('2018-02-27'),
		taskName: 'Android Development',
		description: 'Sprint 6',
		color: '#BA68C8',
		percentageCompleted: 100.0
	}
]

const Home = () => {
	return <GanttChart chartData={data}></GanttChart>
}

export default Home
