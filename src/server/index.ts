import express from 'express'
import serveClient from './serveClient'

const app = express()
app
	.disable('x-powered-by')
	.use(express.static(process.env.RAZZLE_PUBLIC_DIR || 'public'))
	.get('/*', serveClient)

export default app
