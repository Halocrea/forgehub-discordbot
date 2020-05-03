require('dotenv').config()

const axios     = require('axios')
const Guilds    = require('../crud/Guilds')
const I18N      = require('../utils/I18N')
const Tweet     = require('../schemas/Tweet')
const Tweets    = require('../crud/Tweets')

class Twitter {
    constructor (client) {
        this.discordclient  = client
        
        this.checkForNewTweets()
        setInterval(() => {
            this.checkForNewTweets()
        }, 5 * 60000)
    }

    static async authenticate () {
        return new Promise(async (resolve, reject) => {
            const credentials               = `${process.env.TWITTER_API_KEY}:${process.env.TWITTER_SECRET_KEY}`
            const credentialsBase64Encoded  = Buffer.from(credentials).toString('base64')
            try {
                const { data } = await axios.post('https://api.twitter.com/oauth2/token', 'grant_type=client_credentials', {
                    headers : { 
                        'Authorization' : `Basic ${credentialsBase64Encoded}`, 
                        'Content-Type'  :'application/x-www-form-urlencoded;charset=UTF-8'
                    } 
                })
                resolve(data.access_token)
            } 
            catch (err) {
                reject(`in controller/Twitter/authenticate: ${err.message}`)
            }
        })
    }

    broadcastTweetURL (tweetURL) {
        const guilds = new Guilds().all().filter(g => !!g.setupCompleted && g.tweetsChanId && g.tweetsChanId.length > 0)
        guilds.forEach((g, i) => {
            setTimeout(async () => {
                try {
                    const guild = this.discordclient.guilds.cache.get(g.id)
                    if (!guild)
                        return 
                    
                    const guildTweetsChannel = guild.channels.cache.get(g.tweetsChanId)
                    guildTweetsChannel.send(tweetURL)
                        .catch(err => process.dLogger.log(`in controller/Twitter/broadcastTweetURL: ${err.message}`))
                } catch (err) {
                    process.dLogger.log(`in controller/Twitter/broadcastTweetURL: ${err.message}`)
                }
            }, i * 60000) // to avoid Discord API rate limit
        })
    }

    async checkForNewTweets () {
        try {
            const lastTweet     = new Tweets().getLatest()
            const token         = await Twitter.authenticate()
            const headers       = { Authorization: `Bearer ${token}` }
            const params        = {
                'exclude_replies'   : true,
                'include_rts'       : false,
                'screen_name'       : 'ForgeHub'
            }
    
            if (lastTweet)
                params.since_id = lastTweet.id_str
            
            const { data }      = await axios.get('https://api.twitter.com/1.1/statuses/user_timeline.json?', { headers, params })
            data.forEach(d => this.digestTweet(d))
        } catch (err) {
            process.dLogger.log(`in controller/Twitter/checkForNewTweets: ${err.message}`)
        }
    }

    digestTweet (tweet) {
        new Tweets().add(new Tweet(tweet))
        this.broadcastTweetURL(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
    }

    static async getLatestTweet (message) {
        try {
            const guild         = new Guilds().getById(message.guild.id)
            const token         = await Twitter.authenticate()
            const headers       = { Authorization: `Bearer ${token}` }
            const params        = {
                'exclude_replies'   : true,
                'include_rts'       : false,
                'screen_name'       : 'ForgeHub'
            }

            const { data }      = await axios.get('https://api.twitter.com/1.1/statuses/user_timeline.json?', { headers, params })
            if (data.length < 1) {
                const $t = new I18N(guild.locale)
                message.channel.send($t.get('errorCantFindTweet'))
            } else 
                message.channel.send(`https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`)
            
        } catch (err) {
            process.dLogger.log(`in controller/Twitter/getLatestTweet: ${err.message}`)
        }
    }
}

module.exports = Twitter
