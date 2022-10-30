const onInteractionCreate = async interaction => {
	if (!interaction.isChatInputCommand()) return

	const command = interaction.client.commands.get(interaction.commandName)

	if (!command)
		return

	try {
		await command.execute(interaction)
	} catch (error) {
		console.warn(error)
		process.dLogger.log(`Error in eventHandler/onInteractionCreate: ${error?.message || error}`)
		await interaction.reply({
			content  : 'There was an error while executing this command.',
			ephemeral: true
		})
	}
}

module.exports = onInteractionCreate
