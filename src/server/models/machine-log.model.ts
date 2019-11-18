import mongoose, { Schema, Document, Model, DocumentQuery } from 'mongoose'
import { toDate } from '../utils'
import lttbDownsampler from 'downsample-lttb'

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

const groupLogs = ({ unloadedLimit = 1, idleLimit = 30 }) => (
	logs: MachineLogDocument[]
) => {
	const groupTypes: [string, number?][] = [
		//@ts-ignore
		['unloaded', parseInt(unloadedLimit)],
		//@ts-ignore
		['idle', parseInt(idleLimit)],
		['loaded']
	]

	const getGroupType = metrics => {
		for (const [type, boundary] of groupTypes) {
			if (!boundary || metrics.get('Iavg_A') <= boundary) return type
		}
	}

	const groups: any[] = []
	let group: any = null
	let subgroup: any = null

	logs.forEach(({ timestamp, metrics }, i) => {
		const groupType = getGroupType(metrics)
		const previousTime = i > 0 ? logs[i - 1].timestamp.getTime() : undefined
		const thisTime = timestamp.getTime()

		// if no current group or last log was over a minute ago create a new group
		if (!group || (previousTime && thisTime - previousTime > 60000)) {
			// close current group
			if (group) {
				group.end = previousTime
			}
			// close current subgroup
			if (subgroup) {
				subgroup.end = previousTime
				subgroup = null
			}
			group = { start: thisTime, logs: [], subGroups: [] }
			groups.push(group)
		}
		if (
			!subgroup || // if there is no subgroup
			groupType !== subgroup.type // or this record's group is different than previous
		) {
			if (subgroup) {
				// close current group, if any
				subgroup.end = previousTime
			}
			// and create a new one, with current timestamp as starting boundary
			subgroup = { type: groupType, start: thisTime }
			if (group.subGroups) group.subGroups.push(subgroup)
		}
		group.logs.push([thisTime, metrics])
	})
	const lastTimestamp = logs[logs.length - 1].timestamp.getTime()
	// close the last subgroup
	if (subgroup) subgroup.end = lastTimestamp
	// close the last group
	if (group) group.end = lastTimestamp

	return {
		groups,
		logsTotal: logs.length
	}
}

export const downsampleSeries = (targetPoints: number) => ({
	groups,
	logsTotal
}: {
	groups: { logs: [Date, MachineLogDocument['metrics']][]; subGroups }[]
	logsTotal: number
}) => {
	if (logsTotal <= 1500) return groups

	return groups.map(({ logs, ...group }) => {
		const metrics = Array.from(logs[0][1].keys())

		return {
			...group,
			logs: metrics.reduce(
				(acc: [Date, { [key: string]: number }][], metric: string) => {
					const metricSeries = logs.map(([timestamp, metrics]) => [
						timestamp,
						metrics.get(metric)
					])
					const downsampled = lttbDownsampler.processData(
						metricSeries,
						//@ts-ignore
						parseInt((targetPoints * logs.length) / logsTotal)
					)
					downsampled.forEach(([timestamp, value], i) => {
						if (acc.length < i + 1) acc.push([timestamp, {}])
						// acc[i][1].set(metric, value)
						acc[i][1][metric] = value
					})

					return acc
				},
				[]
			)
		}
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
	groups: {
		start: number
		end: number
		logs: MachineLogTuple[]
		subGroups: { start: number; end: number; type: string }[]
	}[]
}

schema.statics.getTimeRange = function(
	this: mongoose.Model<MachineLogDocument>,
	{
		start,
		end,
		metrics,
		downsampleTarget = 500,
		unloadedLimit,
		idleLimit,
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
		.then(groupLogs({ unloadedLimit, idleLimit }))
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
