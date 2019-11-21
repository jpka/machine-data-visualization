import moment from 'moment'
import lttbDownsampler from 'downsample-lttb'

export const toDate = val => {
	if (val instanceof Date) return val
	//@ts-ignore
	if (typeof val === 'string' && !isNaN(val)) {
		val = parseInt(val)
	}
	return moment(val).toDate()
}

export const downsampleSeries = (logs, targetPoints) => {
	const metrics = Array.from(logs[0].metrics.keys())

	//@ts-ignore
	metrics.reduce((acc: [Date, { [key: string]: number }][], metric: string) => {
		const metricSeries = logs.map(({ timestamp, metrics }) => [
			timestamp,
			metrics.get(metric)
		])
		const downsampled = lttbDownsampler.processData(
			metricSeries,
			//@ts-ignore
			parseInt(targetPoints)
		)
		downsampled.forEach(([timestamp, value], i) => {
			if (acc.length < i + 1) acc.push([timestamp, {}])
			// acc[i][1].set(metric, value)
			acc[i][1][metric] = value
		})

		return acc
	}, [])
}
