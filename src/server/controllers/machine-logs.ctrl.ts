import { Router } from 'express'
import MachineLog from '../models/machine-log.model'

const handleError = (err, res) => res.status(500).send({ message: err.message })

export default Router().get('/', async (req: any, res) => {
	try {
		const result = await MachineLog.getTimeRange({
			metrics: req.query.metrics.split(','),
			start: req.query.start,
			end: req.query.end
		})
		res.status(200).send(result)
	} catch (err) {
		handleError(err, res)
	}
})

// export default Router().get('/', async (req: any, res) => {
// 	try {
// 		const groups = await MachineLogGroup.getPopulatedGroups({
// 			metrics: req.query.metrics.split(','),
// 			start: req.query.start,
// 			end: req.query.end
// 		})
// 		res.status(200).send(groups)
// 	} catch (err) {
// 		handleError(err, res)
// 	}
// })
