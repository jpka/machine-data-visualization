module.exports = {
	plugins: [
		{
			name: 'typescript',
			options: {
				useBabel: true,
				forkTsChecker: {
					typeCheck: false,
					tslint: undefined,
					eslint: true
				}
			}
		}
	]
	// modify: (config, { target, dev }, webpack) => {
	// 	if (target === 'node' && dev === true) {
	// 		console.log('config', JSON.stringify(config))
	// 		config.devServer.hot = false
	// 	}

	// 	return config
	// }
}
