import mongoose, { Schema, Document, Model } from 'mongoose'
import { downsampleSeries, toDate } from '../utils'

export interface MachineLogSubGroup {
	type: string
	start: Date
	end: Date
}

export interface MachineLogGroupDocument extends Document {
	deviceid: string
	start: Date
	end: Date
	subGroups: MachineLogSubGroup[]
}

const schema = new Schema({
	deviceid: { type: String, required: true },
	start: { type: Date, required: true },
	end: { type: Date, required: false },
	subGroups: [
		new Schema({
			type: String,
			start: Date,
			end: Date
		})
	]
})

type GetPopulatedGroupsProps = {
	metrics?: string[]
	start?: string | number | Date
	end?: string | number | Date
	downsampleTarget: number
	[key: string]: any
}

export type PopulatedGroup = {
	subGroups: any
	logs: [Date | number, { [key: string]: number }][]
}
export type GetPopulatedGroupsResponse = {
	metrics: string[]
	groups: PopulatedGroup[]
}

export interface MachineLogGroupModel extends Model<MachineLogGroupDocument> {
	getPopulatedGroups: (
		GetPopulatedGroupsProps
	) => Promise<GetPopulatedGroupsResponse>
}

schema.statics.getPopulatedGroups = async function(
	this: mongoose.Model<MachineLogGroupDocument>,
	{
		metrics,
		start,
		end,
		downsampleTarget = 500,
		...query
	}: GetPopulatedGroupsProps
) {
	const $match: any = { ...query }

	if (start) {
		start = toDate(start)
		$match.end = { $gte: start }
	}
	if (end) {
		end = toDate(end)
		$match.start = { $lte: end }
	}

	const $project: any = { timestamp: 1 }
	if (metrics) {
		metrics.forEach(metric => {
			$project[`metrics.${metric}`] = 1
		})
	} else {
		$project.metrics = 1
	}

	let groups = await this.aggregate([
		{ $match },
		{ $sort: { start: 1 } },
		{
			$lookup: {
				from: 'machineLogs',
				let: {
					start: { $max: ['$start', start] },
					end: { $min: ['$end', end] }
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $gte: ['$timestamp', '$$start'] },
									{ $lte: ['$timestamp', '$$end'] }
								]
							}
						}
					},
					{ $sort: { timestamp: 1 } },
					{ $project }
				],
				as: 'logs'
			}
		}
	])

	groups = groups.map(({ subGroups, logs }) => ({
		subGroups,
		logs: downsampleSeries(logs, 500)
	}))

	return { metrics, groups }
}

const MachineLogGroup = mongoose.model<
	MachineLogGroupDocument,
	MachineLogGroupModel
>('MachineLogGroup', schema, 'machineLogGroups')

export default MachineLogGroup
