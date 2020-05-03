require('dotenv').config()

const Guilds            = require('../crud/Guilds')
const I18N              = require('../utils/I18N')
const { MessageEmbed }  = require('discord.js')

// to retrieve a channel's id = https://api.twitch.tv/kraken/users?login=forge_hub 
class StreamAlert {
    constructor (discordClient) {
        this.discordClient  = discordClient
        this.guildsCrud     = new Guilds()

        this.checkChannelStatus()
        setInterval(() => {
            this.checkChannelStatus()
        }, 3 * 60000)
    }

    async broadcastStreamAlert (streamInfo) {
        const guilds = this.guildsCrud.all().filter(g => !!g.setupCompleted && g.streamAlertChanId)
        
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
                        
                    streamAlertChannel.send(
                        new MessageEmbed()
                            .setColor('#9147ff')
                            .setAuthor('Twitch.tv', 'https://i.imgur.com/11GpdK7.png')
                            .setThumbnail('https://www.forgehub.com/styles/forgehub/forgehub/favicon.png')
                            .setDescription($t.get('newStream', { user: this.discordClient.user }))
                            .addField($t.get('category'), $t.get('streamInfo', { game: streamInfo.game || 'Halo', status: streamInfo.channel.status }))
                    )
                        .then(() => {
                            streamAlertChannel.send('https://twitch.tv/forge_hub')
                        })
                        .catch(err => process.dLogger.log(`in controller/StreamAlert/broadcastStreamAlert: ${err.message}`))
                } catch (err) {
                    process.dLogger.log(`in controller/StreamAlert/broadcastStreamAlert: ${err.message}`)
                }
            }, i * 2000) // to avoid Discord API rate limit
        })
    }

    
    async checkChannelStatus () {
        if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CHANNEL_ID) 
            return false 

        const axios     = require('axios')
        try {
            // const { data }  = await axios.get(`https://api.twitch.tv/kraken/streams/22577992`, {
            const { data }  = await axios.get(`https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL_ID}`, {
                headers: {
                    "Accept": "application/vnd.twitchtv.v5+json",
                    "Client-ID": process.env.TWITCH_CLIENT_ID
                }
            })
            if (data && data.stream && data.stream !== null) {
                if (this.discordClient.user.presence.activities.length > 0)
                    return 
                
                this.broadcastStreamAlert(data.stream)
                // data.stream.channel.status
                this.discordClient.user.setActivity(data.stream.game || 'Halo', {
                    type: "STREAMING",
                    url : data.stream.channel.url
                }) 
            } else {
                this.discordClient.user.setActivity('forgehub.com', {
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
