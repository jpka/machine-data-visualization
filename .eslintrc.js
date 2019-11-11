module.exports = {
  parser:  '@typescript-eslint/parser',
  extends:  [
		'plugin:@typescript-eslint/recommended',
		'prettier/@typescript-eslint',
		'plugin:react/recommended',
    'plugin:prettier/recommended',
	],
	rules: {
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-use-before-define": 0,
		"@typescript-eslint/explicit-function-return-type": 0,
		"@typescript-eslint/no-var-requires": 0,
		"@typescript-eslint/ban-ts-ignore": 0,
		"@typescript-eslint/camelcase": 0,
		"react/prop-types": 0
	}
}