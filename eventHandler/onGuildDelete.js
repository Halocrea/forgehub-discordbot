const Guilds             = require('./../crud/Guilds')
const SetupSlashCommands = require('./../commands/SetupSlashCommands')

const onGuildDelete = guild => {
	process.dLogger.log(`${guild.name} (id: ${guild.id}) removed me.\nI'm serving ${guild.client.guilds.cache.size} servers now.`)

	try {
		new Guilds().remove(guild.id)
		const commands = []
		SetupSlashCommands.forEach(c => {
			commands.push(c.data.toJSON())
		})
		guild.commands.remove(commands).then(() => {
			console.log('Commands removed from the guild')
		})
	} catch (err) {
		process.dLogger.log(`in eventHandler/onGuildDelete, couldn't remove the guild from database: ${err.message}`)
	}
}

module.exports = onGuildDelete
