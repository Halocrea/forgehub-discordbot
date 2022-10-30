
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const Guilds       = require('./../../crud/Guilds')
const guildManager = new Guilds()

const I18N     = require('./../../utils/I18N')
const $default = new I18N()

const availableLanguages = [
	{ name: 'English (default)', value: 'en' },
	{ name: 'Español', value: 'es' },
	{ name: 'Français', value: 'fr' }
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName($default.get('setLanguage'))
		.setNameLocalizations({
			'es-ES': $default.getByLang('es', 'setLanguage'),
			fr     : $default.getByLang('fr', 'setLanguage')
		})
		.setDescription($default.get('setLanguageDescription'))
		.setDescriptionLocalizations({
			'es-ES': $default.getByLang('es', 'setLanguageDescription'),
			fr     : $default.getByLang('fr', 'setLanguageDescription')
		})
		.addStringOption(option => 
			option.setName($default.get('language'))
				.setNameLocalizations({
					'es-ES': $default.getByLang('es', 'language'),
					fr     : $default.getByLang('fr', 'language')
				})
				.setDescription($default.get('language'))
				.setDescriptionLocalizations({
					'es-ES': $default.getByLang('es', 'language'),
					fr     : $default.getByLang('fr', 'language')
				})
				.setRequired(true)
				.addChoices(...availableLanguages)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute (interaction) {
		const locale = interaction.options.getString($default.get('language'))
		const guild  = guildManager.getById(interaction.guildId)
		const $t     = new I18N(locale)

		guild.locale = locale
		guildManager.update(guild)

		return interaction.reply({
			embeds: [
				{
					color      : 5763719,
					title      : $t.get('languageSet'),
					description: $t.get('languageSetDescription', {
						language: availableLanguages.find(l => l.value === locale).name
					})
				}
			],
			ephemeral: true
		})
	}
}
