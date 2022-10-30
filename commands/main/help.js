const { SlashCommandBuilder } = require('discord.js')

const generateEmbed = require('./../../utils/generateEmbed')
const Guilds        = require('./../../crud/Guilds')
const guildManager  = new Guilds()

const I18N     = require('./../../utils/I18N')
const $default = new I18N()

module.exports = {
	data: new SlashCommandBuilder()
		.setName($default.get('cmdHelp'))
		.setNameLocalizations({
			'es-ES': $default.getByLang('es', 'cmdHelp'),
			fr     : $default.getByLang('fr', 'cmdHelp')
		})
		.setDescription($default.get('cmdHelpDescription'))
		.setDescriptionLocalizations({
			'es-ES': $default.getByLang('es', 'cmdHelpDescription'),
			fr     : $default.getByLang('fr', 'cmdHelpDescription')
		}),

	async execute (interaction) {
		const guild = guildManager.getById(interaction.guildId)
		const $t    = new I18N(guild.locale)
		await interaction.reply({
			embeds: [generateEmbed({
				color      : 4437377,
				description: $t.get('helpText', Object.assign({
					discordInvite: 'https://discord.gg/74UAq84'
				})), 
				footer   : $t.get('credits'),
				thumbnail: 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png',
				title    : $t.get('helpTitle')
			})],
			ephemeral: true
		})
	}
}
