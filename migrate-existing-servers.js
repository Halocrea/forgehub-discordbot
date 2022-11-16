
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')

const MainSlashCommands  = require('./commands/MainSlashCommands')
const SetupSlashCommands = require('./commands/SetupSlashCommands')

const Guilds       = require('./crud/Guilds')
const guildManager = new Guilds()

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.MessageContent
	]
})

client.commands = new Collection()

MainSlashCommands.forEach(command => {
	client.commands.set(command.data.name, command)
})
SetupSlashCommands.forEach(command => {
	client.commands.set(command.data.name, command)
})

client.on(Events.ClientReady, async client => {
	const guildCommands = []

	SetupSlashCommands.forEach(c => {
		guildCommands.push(c.data.toJSON())
	})
	MainSlashCommands.forEach(c => {
		guildCommands.push(c.data.toJSON())
	})

	const allGuilds = guildManager.all()
	for (let i = 0; i < allGuilds.length; i++) {
		const thisGuild = await client.guilds.cache.get(allGuilds[i].id)
		try {
			await thisGuild.commands.set(guildCommands)
			console.log(`Commands set for guild ${thisGuild.name}!`)
		} catch (err) {
			console.log(`Commands not set for guild ${allGuilds[i].name}: ${err?.message || err}`)
		}
	}

})

console.log('Sarting the bot...')
client.login('NzA2MTI0OTg5NTk3ODc2Mjk0.Gs3KL9.ti6sCm9x9ra7GGuk6AF1LbR6434ntPlZhmHYGo')
