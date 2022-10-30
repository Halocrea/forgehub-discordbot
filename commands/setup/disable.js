
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const Guilds       = require('./../../crud/Guilds')
const guildManager = new Guilds()

const I18N     = require('./../../utils/I18N')
const $default = new I18N()

const topics = [
	{ name: 'Maps', value: 'maps'},
	{ name: 'Stream alerts', value: 'stream'},
	{ name: 'Tweets', value: 'tweets'}
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName($default.get('cmdDisable'))
		.setNameLocalizations({
			es: $default.getByLang('es', 'cmdDisable'),
			fr: $default.getByLang('fr', 'cmdDisable')
		})
		.setDescription($default.get('cmdDisableDescription'))
		.setDescriptionLocalizations({
			es: $default.getByLang('es', 'cmdDisableDescription'),
			fr: $default.getByLang('fr', 'cmdDisableDescription')
		})
		.addStringOption(option => 
			option.setName($default.get('topic'))
				.setNameLocalizations({
					es: $default.getByLang('es', 'topic'),
					fr: $default.getByLang('fr', 'topic')
				})
				.setDescription($default.get('topicDescription3'))
				.setDescriptionLocalizations({
					es: $default.getByLang('es', 'topicDescription3'),
					fr: $default.getByLang('fr', 'topicDescription3')
				})
				.setRequired(true)
				.addChoices(...topics)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute (interaction) {
		const topic = interaction.options.getString($default.get('topic'))

		let field = ''
		switch (topic) {
			case 'maps':
				field = 'mapsChanId'
				break
			case 'stream':
				field = 'streamAlertChanId'
				break
			case 'tweets':
				field = 'tweetsChanId'
				break
			default:
				break
		}

		const thisGuild  = guildManager.getById(interaction.guildId)
		const $t         = new I18N(thisGuild.locale)
		thisGuild[field] = null
		guildManager.update(thisGuild)

		return interaction.reply({
			embeds: [{
				color: 5763719,
				title: $t.get('disabled', {
					topic: topics.find(t => t.value === topic).name
				}),
				description: $t.get('disabledDescription', {
					topic: topics.find(t => t.value === topic).name.toLowerCase()
				})
			}],
			ephemeral: true
		})
	}
}
