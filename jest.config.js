const baseConfig = env => ({
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
		'^.+\\.css$': '<rootDir>/node_modules/razzle/config/jest/cssTransform.js',
		'^(?!.*\\.(js|jsx|ts|tsx|css|json)$)':
			'<rootDir>/node_modules/razzle/config/jest/fileTransform.js'
	},
	testMatch: [
		`<rootDir>/src/${env}/**/__tests__/**/*.{js,jsx,ts,tsx}`,
		`<rootDir>/src/${env}/**/*.{test,spec}.{js,jsx,ts,tsx}`
	]
})

module.exports = {
	setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
	projects: [
		Object.assign(baseConfig('client'), {
			displayName: 'client',
			testEnvironment: 'jsdom'
		}),
		Object.assign(baseConfig('server'), {
			setupFilesAfterEnv: ['<rootDir>/src/server/tests/setup.ts'],
			displayName: 'server',
			testEnvironment: 'node'
		}),
		Object.assign(baseConfig('e2e'), {
			displayName: 'e2e',
			testEnvironment: 'node',
			testMatch: ['<rootDir>/src/tests/**/*.{test,spec}.{js,jsx,ts,tsx}']
		})
	]
}
