import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import serveClient from './serveClient'
import apiRouter from './api'

dotenv.config()
mongoose.connect(process.env.MONGO_URI || '', { useNewUrlParser: true })

const app = express()
app
	.disable('x-powered-by')
	.use(express.static(process.env.RAZZLE_PUBLIC_DIR || 'public'))
	.use('/api', apiRouter)
	.get('/*', serveClient)

export default app
