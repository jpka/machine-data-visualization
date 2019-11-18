import { Router } from 'express'
import MachineLog from '../models/machine-log.model'
import { pick } from 'lodash'

const handleError = (err, res) => res.status(500).send({ message: err.message })

export default Router().get('/', async (req: any, res) => {
	try {
		const result = await MachineLog.getTimeRange({
			metrics: req.query.metrics && req.query.metrics.split(','),
			// because the model method allows any param to be added to the query which goes
			// straight into mongo, we should consciously limit the params we allow here at the endpoint
			// to avoid abuse from an attacker
			...pick(req.query, ['start', 'end', 'idleLimit', 'unloadedLimit'])
		})
		res.status(200).send(result)
	} catch (err) {
		console.error(err)
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
