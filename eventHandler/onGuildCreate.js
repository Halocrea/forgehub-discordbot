const Guild              = require('./../schemas/Guild')
const Guilds             = require('./../crud/Guilds')
const MainSlashCommands  = require('./../commands/MainSlashCommands')
const SetupSlashCommands = require('./../commands/SetupSlashCommands')

const generateEmbed = require('./../utils/generateEmbed')
const guildManager  = new Guilds()
const I18N          = require('./../utils/I18N')

const greet = guild => {
	const thisGuild = guildManager.getById(guild.id)
	const $t        = new I18N(thisGuild.locale)
	const embed     = generateEmbed({
		color      : 4437377,
		description: $t.get('setupIntroDescription') + '\n\n' + $t.get('helpText', Object.assign({
			discordInvite: 'https://discord.gg/74UAq84'
		})), 
		footer   : $t.get('credits'),
		thumbnail: 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png',
		title    : $t.get('setupIntroTitle')
	})
	try {
		if (guild.systemChannel) // try a system channel if it exists
			guild.systemChannel.send({ embeds: [embed] }).catch(() => guild.owner.send({ embeds: [embed] }))
		else { 
			const generalChannel = guild.channels.cache.find(
				ch => ch.name.toLowerCase().includes('general')
			)
			if (generalChannel) // if we found a channel that looks like a "general" channel
				generalChannel.send({ embeds: [embed] }).catch(() => guild.owner.send({ embeds: [embed] }))
			else // otherwise, we send a DM to the guild owner
				guild.owner.send({ embeds: [embed] })
		}
	} catch (err) {
		process.dLogger.log(`Could not send greet message to ${guild.name}. Error was: ${err?.message || err}`)
	}
}

const onGuildCreate = guild => {
	process.dLogger.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!\nI'm serving ${guild.client.guilds.cache.size} servers now.`)

	guildManager.addOrOverwrite(new Guild({
		id  : guild.id, 
		name: guild.name
	}))

	const commands = []

	SetupSlashCommands.forEach(c => {
		commands.push(c.data.toJSON())
	})
	MainSlashCommands.forEach(c => {
		commands.push(c.data.toJSON())
	})

	guild.commands.set(commands)
		.then(() => {
			greet(guild)
		})
		.catch(() => {
			process.dLogger.log(`in eventHandler/onGuildDelete, couldn't deploy commands on guild: ${err.message}`)
		})
}

module.exports = onGuildCreate
