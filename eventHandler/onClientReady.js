require('dotenv').config()

const StreamAlert = require('./../controller/StreamAlert')
const Twitter     = require('./../controller/Twitter')
const Website     = require('./../controller/Website')

const onClientReady = client => {
	console.log('bot is ready')
	require('./../utils/dLogger').init(client)

	if (process.env?.TWITCH_CLIENT_ID?.length > 0
        && process.env?.TWITCH_CLIENT_SECRET?.length > 0
	)
		new StreamAlert(client)

	client.user.setStatus('available')

	new Twitter(client)
	new Website(client)
}

module.exports = onClientReady
