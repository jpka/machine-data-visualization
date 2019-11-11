import express from 'express'
import serveClient from './serveClient'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()
mongoose.connect(process.env.MONGO_URI || '', { useNewUrlParser: true })

const app = express()
app
	.disable('x-powered-by')
	.use(express.static(process.env.RAZZLE_PUBLIC_DIR || 'public'))
	.get('/*', serveClient)

export default app
