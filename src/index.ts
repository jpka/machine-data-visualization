import http from 'http'

let app = require('./server').default

let server = http.createServer(app)

let currentApp = app

server
	.listen(process.env.PORT || 3000, () => {
		console.log('🚀 started')
	})
	.on('error', console.error)

// Readline lets us tap into the process events
const readline = require('readline')

// Allows us to listen for events from stdin
// readline.emitKeypressEvents(process.stdin)
// process.stdin.setRawMode(true)
// process.stdin.on('keypress', (str, key) => {
// 	console.log('keypress', str, key)

// 	if (key.sequence === '\u0003') {
// 		process.exit()
// 	}

// 	process.stdout.write(key)
// })

if (module.hot) {
	console.log('✅  Server-side HMR Enabled!')

	const restartServer = () => {
		server.removeAllListeners()
		server.close(() => {
			server = http.createServer(require('./server').default)
			server
				.listen(process.env.PORT || 3000, () => {
					console.log('🚀 started')
				})
				.on('error', console.error)
		})
	}

	module.hot.accept('./server', () => {
		console.log('🔁  HMR Reloading `./server`...')

		try {
			app = require('./server').default
			server.removeListener('request', currentApp)
			server.on('request', app)
			currentApp = app
		} catch (error) {
			console.error(error)
			// setTimeout(() => {
			// 	process.stdin.write('rs')
			// 	process.stdin.emit('keypress', )
			// }, 3000)
		}
	})
}
