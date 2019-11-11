import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { renderToString } from 'react-dom/server'
import App from '../client/components/App'
// import compMetricsSvc from './services/comp-metric.svc'
import MachineLog from './models/machine-log.model'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST ||
	'../../build/assets.json')

export default async (req, res) => {
	// const initialData = { value: { Iavg_A: [] } }
	const initialData: any = await MachineLog.getTimeRange({
		deviceid: req.query.deviceid,
		range: [req.query.start, req.query.end]
	})
	// initialData = initialData.map(doc => [
	// 	doc.timestamp,
	// 	doc.metrics.get('Iavg_A')
	// ])
	// console.log('initial data', JSON.stringify(initialData))
	console.log('initial data', initialData)
	const context: any = {}
	const markup = renderToString(
		<StaticRouter context={context} location={req.url}>
			<App initialData={initialData} />
		</StaticRouter>
	)

	if (context.url) {
		res.redirect(context.url)
	} else {
		res.status(200).send(
			`<!doctype html>
			<html lang="en">
				<head>
						<meta http-equiv="X-UA-Compatible" content="IE=edge" />
						<meta charset="utf-8" />
						<title>Express React universal example</title>
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
}
