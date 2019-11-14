import lttbDownsampler from 'downsample-lttb'
import moment = require('moment')

export const toDate = val => {
	if (val instanceof Date) return val
	//@ts-ignore
	if (typeof val === 'string' && !isNaN(val)) {
		val = parseInt(val)
	}
	return moment(val).toDate()
}

export type Metrics = { [key: string]: number }
export const downsampleSeries = (
	series: { timestamp: Date; metrics: Metrics }[],
	targetPoints: number
) => {
	return Object.keys(series[0].metrics).reduce(
		(acc: [Date, Metrics][], metric: string) => {
			const downsampled = lttbDownsampler.processData(
				series.map(({ timestamp, metrics }) => [timestamp, metrics[metric]]),
				//@ts-ignore
				parseInt(targetPoints)
			)
			downsampled.forEach(([timestamp, value], i) => {
				if (acc.length < i + 1) acc.push([timestamp.getTime(), {}])
				acc[i][1][metric] = value
			})

			return acc
		},
		[]
	)
}
