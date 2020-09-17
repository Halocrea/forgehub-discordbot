const cheerio           = require('cheerio')
const got               = require('got')
const Guilds            = require('./../crud/Guilds')
const Map               = require('./../schemas/Map')
const { MessageEmbed }  = require('discord.js')
const Maps              = require('./../crud/Maps')
const I18N              = require('./../utils/I18N')

class Website {
    constructor (discordClient, watch = true) {
        this.discordClient  = discordClient
        this.guildsCrud     = new Guilds()

        if (watch)
            this.watchForNewMaps()
    }

    
    broadcastNewMaps (maps) {
        const guilds = this.guildsCrud.all().filter(g => !!g.setupCompleted && g.mapsChanId && g.mapsChanId.length > 0)
        guilds.forEach((g, i) => {
            setTimeout(async () => {
                try {
                    const guild = this.discordClient.guilds.cache.get(g.id)
                    if (!guild)
                        return 
                    
                    const $t    = new I18N(guild.locale)
                    
                    const guildMapChannel = guild.channels.cache.get(g.mapsChanId)
                    if (maps.length > 1) {
                        const fhLogo    = 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png'
                        let image       = false 
                        let description = ''
                        maps.forEach((m, j) => {
                            description += `• **${m.title}** by ${m.author} [${this._getEmoteForType(m.type).emote} ${$t.get('type' + m.type)}]. \n`
                            if (!image && m.img)
                                image = m.img
                        })
                        const embed = new MessageEmbed()
                            .setColor('#efefef')
                            .setTitle($t.get('newMapOnSite', { number: maps.length }, maps.length))
                            .setURL('https://www.forgehub.com/maps')
                            .setThumbnail(fhLogo)
                            .setAuthor('ForgeHub', fhLogo, 'https://www.forgehub.com/')
                            .setDescription(description)
                        
                        if (image) 
                            embed.setImage(image)

                        guildMapChannel.send(embed)
                            .catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
                    } else {
                        guildMapChannel.send($t.get('newMapOnSite'))
                            .then(() => {
                                guildMapChannel.send(this.generateEmbed(m, $t))
                                    .catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
                            })
                            .catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
                    }
                } catch (err) {
                    process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`)
                }
            }, i * 2000) // to avoid Discord API rate limit
        })
    }

    async fetchMapList () {
        try {
            const { body }  = await got('https://www.forgehub.com/maps/')
            const $         = cheerio.load(body)
            return $
        } catch (err) {
            process.dLogger.log(`in controller/Website/fetchMapList: ${err.message}`)
        }
    }

    generateEmbed (map, $t) {
        const fhLogo = 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png'
        const embed = new MessageEmbed()
            .setColor('#efefef')
            .setTitle(map.title)
            .setURL(map.link)
            .setThumbnail(fhLogo)
            .setAuthor('ForgeHub', fhLogo, 'https://www.forgehub.com/')
            .setDescription(map.desc)
            .addField($t.get('author'), map.author, true)
            .addField($t.get('mapType'), this._getEmoteForType(map.type).emote + $t.get(`type${map.type}`), true)
            .setFooter(this._genFooter(map, $t))

        if (map.img) 
            embed.setImage(map.img)

        return embed
    }

    getNewMapsObjFromHTML (html, forceNew = true) {
        const list      = html('ol.resourceList > li')
        const newMaps   = []
        for (let i in list) {
            const li = list[i]

            if (typeof li.attribs === 'undefined' || typeof li.attribs.id === 'undefined')
                continue 

            const id = li.attribs.id

            if (forceNew && !this._isNew(id))
                continue 
            
            const image = html(`li#${id} .resourceIcon > img`).attr('src')

            newMaps.push({
                author      : html(`li#${id} .username`).text(),
                id          : id, 
                img         : typeof image !== 'undefined' ? `https://www.forgehub.com/${image}` : null, 
                desc        : html(`li#${id} .tagLine`).text().replace(/\r?\n|\r|\t/g, ''), 
                link        : `https://www.forgehub.com/${html(`li#${id} .resourceLink`).attr('href')}`,
                nbComments  : html(`li#${id} .stat.comments`).text(),
                nbDl        : html(`li#${id} .stat.downloads`).text(),
                nbViews     : html(`li#${id} .stat.views`).text(),
                title       : html(`li#${id} .resourceLink`).text(), 
                type        : html(`li#${id} .optimalPlayerCount`).text(), 
            })
        }
        
        if (newMaps.length > 0)
            this._saveMaps(newMaps)

        return newMaps
    }

    async getLatestMap (message) {
        try {
            const guild     = this.guildsCrud.getById(message.guild.id)
            const $t        = new I18N(guild.locale)
            const mapList   = await this.fetchMapList()
            if (!mapList)
                return message.channel.send($t.get('errorCantFindMap'))
            
            const newMaps = this.getNewMapsObjFromHTML(mapList, false)
            if (newMaps && newMaps.length > 0 ) {
                message.channel.send(this.generateEmbed(newMaps[0], $t))
                    .catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
            } else 
                message.channel.send($t.get('errorCantFindMap'))
        } catch (err) {
            message.channel.send($t.get('errorCantFindMap'))
            process.dLogger.log(`in controller/Website/getLatestMap: ${err.message}`)
        }
    }

    async watchForNewMaps () {
        const check = async () => {
            const mapList = await this.fetchMapList()
            if (!mapList)
                return 
            
            const newMaps = this.getNewMapsObjFromHTML(mapList)
            if (newMaps && newMaps.length > 0 )
                this.broadcastNewMaps(newMaps)
        }
        check()
        setInterval(check, 4 * 3600 * 1000) // every four hours
    }

    _genFooter (map, $t) {
        return `${map.nbDl} ${$t.get('nbDownloads', {}, map.nbDl)} | ${map.nbComments} ${$t.get('nbComments', {}, map.nbComments)} | ${map.nbViews} ${$t.get('nbViews', {}, map.nbViews)}`
    }

    _getEmoteForType (type) {
        const types = [
            {
                type    : 'Race',
                emote   : '🏁 '
            },
            {
                type    : '1v1',
                emote   : '🎯 '
            },
            {
                type    : '2v2',
                emote   : '🎯 '
            },
            {
                type    : '3v3',
                emote   : '🎯 '
            },
            {
                type    : '4v4',
                emote   : '🎯 '
            },
            {
                type    : '5v5',
                emote   : '🎯 '
            },
            {
                type    : '6v6',
                emote   : '🎯 '
            },
            {
                type    : '7v7',
                emote   : '🎯 '
            },
            {
                type    : '8v8',
                emote   : '🎯 '
            },
            {
                type    : 'Infection',
                emote   : '☣️ '
            },
            {
                type    : 'Extermination',
                emote   : '☠️ '
            },
            {
                type    : 'MiniGame',
                emote   : '🎲 '
            },
            {
                type    : 'Grifball',
                emote   : '🔨 '
            },
            {
                type    : 'Aesthetic',
                emote   : '🖼️ '
            },
            {
                type    : 'Puzzle',
                emote   : '🧩 '
            },
            {
                type    : 'Custom',
                emote   : '💡 '
            }
        ]

        return types.find(el => el.type === type) || ''
    }

    _isNew (id) {
        return !(new Maps().getById(id))
    }

    _saveMaps (maps) {
        const mapsCrud = new Maps()
        maps.forEach(m => mapsCrud.add(new Map(m)))
    }
}

module.exports = Website