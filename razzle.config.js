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
}