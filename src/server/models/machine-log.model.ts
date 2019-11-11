import mongoose, { Schema, Document, Model, DocumentQuery } from 'mongoose'
import moment from 'moment'

export interface MachineLogDocument extends Document {
	timestamp: Date
	deviceid: string
	metrics: Map<string, number> //{ [key: string]: number }
}

export interface MachineLogModel extends Model<MachineLogDocument> {
	getTimeRange(params: {
		range: string[]
		[key: string]: any
	}): DocumentQuery<MachineLogDocument[], MachineLogDocument, {}>
}

const toDate = val => {
	if (val instanceof Date) return val
	//@ts-ignore
	if (typeof val === 'string' && !isNaN(val)) {
		val = parseInt(val)
	}
	return moment(val).toDate()
}

const schema = new Schema({
	timestamp: { type: Date, required: true },
	deviceid: { type: String, required: true },
	metrics: { type: Map, of: Number }
})

schema.statics.getTimeRange = function(
	this: mongoose.Model<MachineLogDocument>,
	{ range, ...other }
) {
	const query: any = {}
	if (range) {
		const timestamp: any = {}
		if (range[0]) timestamp.$gte = toDate(range[0])
		if (range[1]) timestamp.$lte = toDate(range[1])
		if (timestamp.$gte || timestamp.$lte) query.timestamp = timestamp
	}
	Object.keys(other).forEach(key => {
		const value = other[key]
		if (value !== undefined) query[key] = value
	})

	return this.mapReduce({
		query,
		sort: { timestamp: 1 },
		scope: {
			shouldMerge: (a, b) => a === b
			// shouldMerge: (a, b) => Math.abs(a - b) < 1 //,
			// shouldInsertBreak: (a, b) => b - a > 60000 // over 1 minute time between records
		},
		map: function() {
			emit(this.deviceid, [this.timestamp, this.metrics.Iavg_A])
			// emit(this.deviceid, { timestamp: this.timestamp, metrics: this.metrics })
		},
		reduce: function(deviceid, records) {
			//@ts-ignore
			const reduced = records.reduce((acc, record) => {
				// if the record is an array it's what's been emitted by the map function
				// otherwise it's an already reduced collection of records
				const recordIsReduced = !Array.isArray(record)
				const previousValue = acc.length === 0 ? null : acc[acc.length - 1][1]

				//@ts-ignore
				if (!recordIsReduced) {
					// if next value is eligible for merging, merge it, otherwise just add it
					if (!shouldMerge(previousValue, record[1])) {
						//@ts-ignore
						acc.push(record)
					}
				} else if (record.Iavg_A.length > 0) {
					// if first value of reduced collection is mergeable with previous value, merge it
					if (shouldMerge(previousValue, record.Iavg_A[0][1])) {
						record.Iavg_A.unshift()
					}
					acc = acc.concat(record.Iavg_A)
				}

				return acc
			}, [])

			return { Iavg_A: reduced }
		}
	}).then(({ results }) => results[0])
	// return this.find(query, { timestamp: true, 'metrics.Iavg_A': true })
	// 	.sort({
	// 		timestamp: 1
	// 	})
	// 	.exec()
	// 	.then(docs => ({
	// 		value: {
	// 			Iavg_A: docs.map(({ timestamp, metrics }) => [
	// 				timestamp,
	// 				metrics.get('Iavg_A')
	// 			])
	// 		}
	// 	}))
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
	schema
)

export default MachineLog
