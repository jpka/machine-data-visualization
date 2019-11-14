import { Router } from 'express'
import MachineLogsCtrl from './controllers/machine-logs.ctrl'

export default Router()
	.get('/status', (req, res) => {
		res.json({ message: 'OK', timestamp: new Date().toISOString() })
	})
	.use('/machine-logs', MachineLogsCtrl)
