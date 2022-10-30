// to get color int for embeds: https://gist.github.com/thomasbnt/b6f455e2c7d743b796917fa3c205f812 

/*
 * TO BE DONE
 *    - welcome message
 *    - "normal command": latest map/tweet
 * 
 */

require('dotenv').config()

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')

const onClientReady       = require('./eventHandler/onClientReady')
const onGuildCreate       = require('./eventHandler/onGuildCreate')
const onGuildDelete       = require('./eventHandler/onGuildDelete')
const onInteractionCreate = require('./eventHandler/onInteractionCreate')

const MainSlashCommands  = require('./commands/MainSlashCommands')
const SetupSlashCommands = require('./commands/SetupSlashCommands')

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

client.on(Events.ClientReady, async client => await onClientReady(client))
client.on(Events.GuildCreate, onGuildCreate)
client.on(Events.GuildDelete, onGuildDelete)
client.on(Events.InteractionCreate, async interaction => await onInteractionCreate(interaction))

console.log('Sarting the bot...')
client.login(process.env.DISCORD_TOKEN)
