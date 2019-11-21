import Mongoose from 'mongoose'
import '../src/server/db-connection'
import MachineLogGroup, {
	MachineLogGroupDocument,
	MachineLogSubGroup
} from '../src/server/models/machine-log-group.model'
import MachineLog, {
	MachineLogDocument
} from '../src/server/models/machine-log.model'

const groupTypes: [string, number?][] = [
	['unloaded', 1],
	['idle', 30],
	['loaded']
]

const getGroupType = I => {
	for (const [type, boundary] of groupTypes) {
		if (!boundary || I <= boundary) return type
	}
}

const doIt = async () => {
	try {
		await MachineLogGroup.collection.drop()
	} catch (e) {}
	await MachineLogGroup.collection.createIndex({ start: 1 })

	const logs = await MachineLog.find(
		{},
		{ timestamp: true, deviceid: true, 'metrics.Iavg_A': true }
	)
		.sort({ timestamp: 1 })
		.exec()
	const groups: Partial<MachineLogGroupDocument>[] = []
	let group: Partial<MachineLogGroupDocument> | null = null
	let subgroup: Partial<MachineLogSubGroup> | null = null

	logs.forEach(({ timestamp, metrics, deviceid }, i) => {
		const I = metrics.get('Iavg_A')
		const groupType = getGroupType(I)
		const previousTime = i > 0 ? logs[i - 1].timestamp : undefined

		// if no current group or last log was over a minute ago create a new group
		if (
			!group ||
			(previousTime && timestamp.getTime() - previousTime.getTime() > 60000)
		) {
			// close current group
			if (group) {
				group.end = previousTime
			}
			// close current subgroup
			if (subgroup) {
				subgroup.end = previousTime
				subgroup = null
			}
			group = { start: timestamp, subGroups: [], deviceid }
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
			subgroup = { type: groupType, start: timestamp }
			if (group.subGroups) group.subGroups.push(subgroup as MachineLogSubGroup)
		}
	})
	const lastTimestamp = logs[logs.length - 1].timestamp
	// close the last subgroup
	// @ts-ignore
	if (subgroup) subgroup.end = lastTimestamp
	// close the last group
	// @ts-ignore
	if (group) group.end = lastTimestamp

	console.log(groups)
	try {
		await MachineLogGroup.create(groups)
		console.log('groups created')
	} catch (e) {
		console.error('error creating groups', e)
	}
}

doIt().finally(() => process.exit())
