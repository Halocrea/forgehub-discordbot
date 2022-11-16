const cheerio          = require('cheerio')
const { EmbedBuilder } = require('discord.js')
const got              = require('got')
const Guilds           = require('./../crud/Guilds')
const Map              = require('./../schemas/Map')
const Maps             = require('./../crud/Maps')
const I18N             = require('./../utils/I18N')

class Website {
	constructor (discordClient, watch = true) {
		this.discordClient = discordClient
		this.guildManager  = new Guilds()

		if (watch)
			this.watchForNewMaps()
	}

	broadcastNewMaps (maps) {
		const guilds = this.guildManager.all().filter(g => g.mapsChanId?.length > 0)
		guilds.forEach((g, i) => {
			setTimeout(async () => {
				try {
					const guild = this.discordClient.guilds.cache.get(g.id)
					if (!guild)
						return 

					const $t = new I18N(guild.locale)

					const guildMapChannel = guild.channels.cache.get(g.mapsChanId)
					if (maps.length > 1) {
						const fhLogo    = 'https://cdn.discordapp.com/attachments/740661585986715660/1037174451210555462/fh_logo.png'
						let image       = false 
						let description = ''
						maps.forEach((m, j) => {
							description += `• **${m.title}** by ${m.author} [${this._getEmoteForType(m.type).emote} ${$t.get('type' + m.type)}]. \n`
							if (!image && m.img)
								image = m.img
						})
						const embed = new EmbedBuilder()
							.setColor(15724527)
							.setTitle($t.get('newMapOnSite', { number: maps.length }, maps.length))
							.setURL('https://www.forgehub.com/maps')
							.setThumbnail(fhLogo)
							.setAuthor({
								name   : 'ForgeHub',
								iconURL: fhLogo,
								url    : 'https://www.forgehub.com/'
							})
							.setDescription(description)

						if (image) 
							embed.setImage(image)

						guildMapChannel.send({ embeds: [embed] })
							.then(() => console.log(`should have been posted on ${g.name}`))
							.catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
					} else {
						maps.forEach((m, j) => {
							setTimeout(() => {
								guildMapChannel.send($t.get('newMapOnSite'))
									.then(() => {
										guildMapChannel.send({ embeds: [this.buildEmbed(m, $t)] })
											.catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
									})
									.catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
							}, j * 60000) // to avoid Discord API rate limit
						})
					}
				} catch (err) {
					process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`)
				}
			}, i * 2000) // to avoid Discord API rate limit
		})
	}

	async fetchMapList () {
		try {
			const { body } = await got('https://www.forgehub.com/maps/')
			const $        = cheerio.load(body)
			return $
		} catch (err) {
			process.dLogger.log(`in controller/Website/fetchMapList: ${err.message}`)
		}
	}

	buildEmbed (map, $t) {
		const fhLogo = 'https://cdn.discordapp.com/attachments/740661585986715660/1037174451210555462/fh_logo.png'
		const embed  = new EmbedBuilder()
			.setColor(15724527)
			.setTitle(map.title)
			.setURL(map.link)
			.setThumbnail(fhLogo)
			.setAuthor({
				name   : 'ForgeHub', 
				iconURL: fhLogo, 
				url    : 'https://www.forgehub.com/'
			})
			.setDescription(map.desc)
			.addFields([
				{
					name  : $t.get('author'),
					value : map.author,
					inline: true
				},
				{
					name  : $t.get('mapType'),
					value : this._getEmoteForType(map.type).emote + $t.get(`type${map.type}`),
					inline: true
				}
			])
			.setFooter({
				text: this._genFooter(map, $t)
			})

		if (map.img) 
			embed.setImage(map.img)

		return embed
	}

	getNewMapsObjFromHTML (html, forceNew = true) {
		const list    = html('ol.resourceList > li')
		const newMaps = []

		list.each((index, elem) => {
			if (typeof elem.attribs === 'undefined' || typeof elem.attribs.id === 'undefined')
				return 

			const id = elem.attribs.id

			if (forceNew && !this._isNew(id))
				return
 
			const image = html(`li#${id} .resourceIcon > img`).attr('src')
			const map   = {
				author    : html(`li#${id} .username`).text(),
				id        : id, 
				img       : typeof image !== 'undefined' ? `https://www.forgehub.com/${image}` : null, 
				desc      : html(`li#${id} .tagLine`).text().replace(/\r?\n|\r|\t/g, ''), 
				link      : `https://www.forgehub.com/${html(`li#${id} .resourceLink`).attr('href')}`,
				nbComments: html(`li#${id} .stat.comments`).text(),
				nbDl      : html(`li#${id} .stat.downloads`).text(),
				nbViews   : html(`li#${id} .stat.views`).text(),
				title     : html(`li#${id} .resourceLink`).text(), 
				type      : html(`li#${id} .optimalPlayerCount`).text() 
			}

			newMaps.push(map)
		})
        
		if (newMaps.length > 0)
			this._saveMaps(newMaps)

		return newMaps
	}

	async getLatestMap (interaction) {
		const guild = this.guildManager.getById(interaction.guildId)
		const $t    = new I18N(guild.locale)

		try {
			const mapList = await this.fetchMapList()
			if (!mapList)
				return interaction.reply($t.get('errorCantFindMap'))
            
			const newMaps = this.getNewMapsObjFromHTML(mapList, false)
			if (newMaps && newMaps.length > 0 ) {
				interaction.reply({
					embeds: [
						this.buildEmbed(newMaps[0], $t)
					],
					ephemeral: true
				})
					.catch(err => process.dLogger.log(`in controller/Website/broadcastNewMaps: ${err.message}`))
			} else {
				interaction.reply({
					content  : $t.get('errorCantFindMap'),
					ephemeral: true
				})
			}
		} catch (err) {
			interaction.reply({
				content  : $t.get('errorCantFindMap'),
				ephemeral: true
			})
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
		setInterval(check, 2 * 3600 * 1000) // every two hours
	}

	_genFooter (map, $t) {
		return `${map.nbDl} ${$t.get('nbDownloads', {}, map.nbDl)} | ${map.nbComments} ${$t.get('nbComments', {}, map.nbComments)} | ${map.nbViews} ${$t.get('nbViews', {}, map.nbViews)}`
	}

	_getEmoteForType (type) {
		const types = [
			{
				type : 'Race',
				emote: '🏁 '
			},
			{
				type : '1v1',
				emote: '🎯 '
			},
			{
				type : '2v2',
				emote: '🎯 '
			},
			{
				type : '3v3',
				emote: '🎯 '
			},
			{
				type : '4v4',
				emote: '🎯 '
			},
			{
				type : '5v5',
				emote: '🎯 '
			},
			{
				type : '6v6',
				emote: '🎯 '
			},
			{
				type : '7v7',
				emote: '🎯 '
			},
			{
				type : '8v8',
				emote: '🎯 '
			},
			{
				type : '10v10',
				emote: '🎯 '
			},
			{
				type : '12v12',
				emote: '🎯 '
			},
			{
				type : 'Infection',
				emote: '☣️ '
			},
			{
				type : 'Extermination',
				emote: '☠️ '
			},
			{
				type : 'MiniGame',
				emote: '🎲 '
			},
			{
				type : 'Grifball',
				emote: '🔨 '
			},
			{
				type : 'Aesthetic',
				emote: '🖼️ '
			},
			{
				type : 'Puzzle',
				emote: '🧩 '
			},
			{
				type : 'Custom',
				emote: '💡 '
			}
		]

		return types.find(el => el.type === type) || ''
	}

	_isNew (id) {
		return !(new Maps().getById(id))
	}

	_saveMaps (maps) {
		const mapManager = new Maps()
		maps.forEach(m => mapManager.add(new Map(m)))
	}
}

module.exports = Website
