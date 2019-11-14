import mongoose from 'mongoose'
import fs from 'fs'
import readline from 'readline'
import dotenv from 'dotenv'
import MachineLog from '../src/server/models/machine-log.model'
dotenv.config()

console.log('seeding to', process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI || '', { useNewUrlParser: true })

const promises: Promise<any>[] = []
const create = doc => {
	const creation = new MachineLog(doc)
		.save()
		.then(() => console.log(`created record for ${doc.timestamp}`))
	promises.push(creation)
}

const doIt = async () => {
	await mongoose.connection.dropDatabase()
	await MachineLog.collection.createIndex({ timestamp: 1, deviceid: 1 })

	const input = readline.createInterface({
		input: fs.createReadStream('./data/demoCompressorWeekData.csv', 'utf8')
	})

	let l = -1
	let record: any = {}
	// let finished = false
	input.on('line', async line => {
		// if (finished) return
		l++
		// if (l > 100) process.exit()
		// if (l > 200) return
		if (l === 0) return
		// console.log(line)
		const [timestamp, metricid, deviceid, value] = line.split(',')
		if (timestamp !== record.timestamp || deviceid !== record.deviceid) {
			if (record.timestamp) {
				// input.close()
				create(record)
			}
			record = { timestamp, deviceid, metrics: {} }
		}
		record.metrics[metricid] = value
	})

	input.on('close', async () => {
		create(record)
		await Promise.all(promises)
		process.exit()
	})
}

doIt()
