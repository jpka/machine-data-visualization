import fs from 'fs'
import papa from 'papaparse'
import moment from 'moment'

const data = fs.readFileSync('./data/demoCompressorWeekData.csv', 'utf8')

const parsed = papa.parse(data)

const toDate = v => moment(parseInt(v)).toLocaleString()

let currentDate = 0
// const metrics: any[] = []
// const diffs: Set<number> = new Set([])
const diffs = {}
parsed.data.forEach((row, i) => {
	// if (row[3] !== row[4]) console.log(i, row[3], row[4])
	// const metric = row[1]
	// if (metrics.indexOf(metric) === -1) {
	// metrics.push(metric)
	// console.log(toDate(row[0]) + '\n')
	// }
	if (i === 0) return
	const date = parseInt(row[0])
	if (currentDate < date) {
		const diff = moment(date).diff(currentDate) / 1000
		// console.log(diff)
		if (!diffs[diff]) diffs[diff] = 0
		diffs[diff]++
		// diffs.add(diff)
		currentDate = date
		// console.log(new Date(date))
	} else if (currentDate > date) {
		throw new Error(`dates go back ${currentDate} -> ${date}`)
		process.exit()
	}
})
// const arrDiff = Array.from(diffs)
// arrDiff.sort((a, b) => (a > b ? 1 : -1))
// console.log(JSON.stringify(arrDiff))
console.log(
	JSON.stringify(diffs)
		.replace(/:/g, ' (')
		.replace(/,/g, '), ')
		.replace(/\"/g, '')
)

process.exit()
// console.log(metrics)

// console.log(
// 	toDate(parsed.data[1][0]),
// 	toDate(parsed.data[parsed.data.length - 2][0])
// )
