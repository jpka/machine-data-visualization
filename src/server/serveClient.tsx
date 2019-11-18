import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../client/components/App'
import MachineLog from './models/machine-log.model'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST ||
	'../../build/assets.json')

export default async (req, res) => {
	const initialData: any = await MachineLog.getTimeRange({
		metrics: req.query.metrics ? req.query.metrics.split(',') : ['Iavg_A'],
		start: req.query.start,
		end: req.query.end,
		unloadedLimit: req.query.unloadedLimit,
		idleLimit: req.query.idleLimit
	})
	const markup = renderToString(<App initialData={initialData} />)
	// const markup = ''

	res.status(200).send(
		`<!doctype html>
		<html lang="en">
			<head>
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta charset="utf-8" />
					<title>Machine uptime/downtime</title>
					<meta name="viewport" content="width=device-width, initial-scale=1">
					${
						assets.client.css
							? `<link rel="stylesheet" href="${assets.client.css}">`
							: ''
					}
					${
						process.env.NODE_ENV === 'production'
							? `<script src="${assets.client.js}" defer></script>`
							: `<script src="${assets.client.js}" defer crossorigin></script>`
					}
					<script>window.initialData = ${JSON.stringify(initialData)}</script>
			</head>
			<body>
					<div id="root">${markup}</div>
			</body>
		</html>`
	)
}
