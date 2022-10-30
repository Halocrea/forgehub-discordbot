require('dotenv').config()

const generateEmbed = require('../utils/generateEmbed')
const Guilds        = require('../crud/Guilds')
const I18N          = require('../utils/I18N')
const TwitchAPI     = require('node-twitch').default

// to retrieve a channel's id = https://api.twitch.tv/kraken/users?login=forgehub 
class StreamAlert {
	constructor (discordClient) {
		this.discordClient = discordClient
		this.guildManager  = new Guilds()

		this.checkChannelStatus()
		setInterval(() => {
			this.checkChannelStatus()
		}, 3 * 60000)
	}

	async broadcastStreamAlert (streamInfo) {
		const guilds = this.guildManager.all().filter(g => !!g.setupCompleted && g.streamAlertChanId)
        
		guilds.forEach((g, i) => {
			setTimeout(async () => {
				try {
					const guild = this.discordClient.guilds.cache.get(g.id)
					const $t    = new I18N(guild.locale)
					if (!guild)
						return 
                    
					const streamAlertChannel = guild.channels.cache.get(g.streamAlertChanId)
					if (!streamAlertChannel)
						return 
                        
					streamAlertChannel.send({ embeds: [
						generateEmbed({
							author: {
								name   : 'Twitch.tv',
								iconURL: 'https://i.imgur.com/11GpdK7.png',
								url    : 'https://twitch.tv/forgehub'
							},
							color      : 9521151,
							description: $t.get('newStream', { user: this.discordClient.user }),
							fields     : [
								{
									name : $t.get('category'),
									value: $t.get('streamInfo', {
										game  : streamInfo?.game_name || 'Halo',
										status: streamInfo?.title || 'Playing' 
									})
								}
							],
							image    : streamInfo?.thumbnail_url.replace('{width}', '640').replace('{height}', '382'),
							title    : 'LIVE ON TWITCH!',
							thumbnail: 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png'
						})
					]})
				} catch (err) {
					process.dLogger.log(`in controller/StreamAlert/broadcastStreamAlert: ${err.message}`)
				}
			}, i * 2000) // to avoid Discord API rate limit
		})
	}

    
	async checkChannelStatus () {
		if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) 
			return false 

		try {
			const twitch = new TwitchAPI({
				client_id    : process.env.TWITCH_CLIENT_ID,
				client_secret: process.env.TWITCH_CLIENT_SECRET
			})

			const { data } = await twitch.getStreams({ channel: 'forgehub' })

			if (data?.length > 0) {
				console.log(data)
				if (this.discordClient.user.presence.activities.length > 0)
					return 
			
				this.broadcastStreamAlert(data[0])
				// data.stream.channel.status
				this.discordClient.user.setActivity(data[0]?.game_name || 'Halo', {
					type: 'STREAMING',
					url : 'https://www.twitch.tv/forgehub'
				}) 
			} else {
				this.discordClient.user.setActivity('!fh | forgehub.com', {
					type: 'PLAYING',
					url : 'https://www.forgehub.com'
				}) 
			}
		} catch (err) {
			process.dLogger.log(`in controller/StreamAlert/checkChannelStatus: ${err.message}`)
		}   
	}
}

module.exports = StreamAlert
