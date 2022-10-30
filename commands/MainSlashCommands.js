const help   = require('./main/help')
const invite = require('./main/invite')
const latest = require('./main/latest')

module.exports = [
	help, // help command
	invite, // get an invitation
	latest // manually get latest map or tweet
]
