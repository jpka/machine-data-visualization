import mongoose, { Schema, Document, Model, DocumentQuery } from 'mongoose'
import { toDate } from '../utils'
import lttbDownsampler from 'downsample-lttb'
// import { downsampleSeries } from '../../../build/main.06084ef4380cc44fcb5a.hot-update'

export interface MachineLogDocument extends Document {
	timestamp: Date
	deviceid: string
	metrics: Map<string, number> //{ [key: string]: number }
}

export type MachineLogTuple = [
	Date | string | number,
	MachineLogDocument['metrics'] | { [key: string]: number }
]

export interface MachineLogModel extends Model<MachineLogDocument> {
	getTimeRange(
		GetTimeRangeProps
	): DocumentQuery<MachineLogDocument[], MachineLogDocument, {}>
}

const schema = new Schema({
	timestamp: { type: Date, required: true },
	deviceid: { type: String, required: true },
	metrics: { type: Map, of: Number }
})

const groupLogs = (logs: MachineLogDocument[]) => ({
	groups: logs.reduce(
		(groups, { timestamp, metrics }) => {
			let group = groups[groups.length - 1]

			if (
				group.length > 0 &&
				timestamp.getTime() - group[group.length - 1][0].getTime() > 60000
			) {
				group = []
				groups.push(group)
			}
			group.push([timestamp, metrics])

			return groups
		},
		[[]] as [MachineLogDocument['timestamp'], MachineLogDocument['metrics']][][]
	),
	logsTotal: logs.length
})

export const downsampleSeries = (targetPoints: number) => ({
	groups,
	logsTotal
}: {
	groups: [MachineLogDocument['timestamp'], MachineLogDocument['metrics']][][]
	logsTotal: number
}) => {
	if (logsTotal <= 1500) return groups

	return groups.map(group => {
		const metrics = Array.from(group[0][1].keys())

		return metrics.reduce(
			(
				acc: [MachineLogDocument['timestamp'], { [key: string]: number }][],
				metric: string
			) => {
				const metricSeries = group.map(([timestamp, metrics]) => [
					timestamp,
					metrics.get(metric)
				])
				const downsampled = lttbDownsampler.processData(
					metricSeries,
					//@ts-ignore
					parseInt((targetPoints * group.length) / logsTotal)
				)
				downsampled.forEach(([timestamp, value], i) => {
					if (acc.length < i + 1) acc.push([timestamp.getTime(), {}])
					// acc[i][1].set(metric, value)
					acc[i][1][metric] = value
				})

				return acc
			},
			[]
		)
	})
}

type GetTimeRangeProps = {
	metrics?: string[]
	start?: string | number | Date
	end?: string | number | Date
	downsampleTarget: number
	[key: string]: any
}

export interface GetTimeRangeResponse {
	metrics: string[]
	groups: MachineLogTuple[]
}

schema.statics.getTimeRange = function(
	this: mongoose.Model<MachineLogDocument>,
	{
		start,
		end,
		metrics,
		downsampleTarget = 500,
		...otherParams
	}: GetTimeRangeProps
) {
	const query: any = {}

	if (start) {
		start = toDate(start)
		query.timestamp = { $gte: start }
	}
	if (end) {
		end = toDate(end)
		if (!query.timestamp) query.timestamp = {}
		query.timestamp.$lte = end
	}

	const project: any = { timestamp: 1 }
	if (metrics) {
		metrics.forEach(metric => {
			project[`metrics.${metric}`] = 1
		})
	} else {
		project.metrics = 1
	}

	Object.keys(otherParams).forEach(key => {
		const value = otherParams[key]
		if (value !== undefined) query[key] = value
	})

	return this.find(query, project)
		.sort({
			timestamp: 1
		})
		.exec()
		.then(groupLogs)
		.then(downsampleSeries(downsampleTarget))
		.then(groups => ({ groups, metrics }))
}

schema.pre('save', function(this: any, next) {
	this.timestamp = toDate(this.timestamp)

	Object.keys(this.metrics).forEach(metric => {
		const value = this.metrics[metric]
		if (typeof value === 'string') this.metrics[metric] = parseFloat(value)
	})

	next()
})

const MachineLog = mongoose.model<MachineLogDocument, MachineLogModel>(
	'MachineLog',
	schema,
	'machineLogs'
)

export default MachineLog
