const disable     = require('./setup/disable')
const setLanguage = require('./setup/setLanguage')
const setup       = require('./setup/setup')

module.exports = [
	disable, // disable autopost command
	setLanguage, // set-language command
	setup // setup command
]
