const { SlashCommandBuilder } = require('discord.js')

const Guilds       = require('./../../crud/Guilds')
const guildManager = new Guilds()

const I18N     = require('./../../utils/I18N')
const $default = new I18N()

module.exports = {
	data: new SlashCommandBuilder()
		.setName($default.get('cmdInvite'))
		.setNameLocalizations({
			'es-ES': $default.getByLang('es', 'cmdInvite'),
			fr     : $default.getByLang('fr', 'cmdInvite')
		})
		.setDescription($default.get('cmdInviteDescription'))
		.setDescriptionLocalizations({
			'es-ES': $default.getByLang('es', 'cmdInviteDescription'),
			fr     : $default.getByLang('fr', 'cmdInviteDescription')
		}),

	async execute (interaction) {
		const guild = guildManager.getById(interaction.guildId)
		await interaction.reply(
			$default.getByLang(guild.locale, 'inviteCmdText', {
				link: `https://discordapp.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot&permissions=27712`
			})
		)
	}
}
