const { SlashCommandBuilder } = require('discord.js')

const Twitter = require('./../../controller/Twitter')
const Website = require('./../../controller/Website')

const I18N     = require('./../../utils/I18N')
const $default = new I18N()

const topics = [
	{ name: 'Maps', value: 'maps'},
	{ name: 'Tweets', value: 'tweets'}
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName($default.get('latest'))
		.setNameLocalizations({
			'es-ES': $default.getByLang('es', 'latest'),
			fr     : $default.getByLang('fr', 'latest')
		})
		.setDescription($default.get('latestDescription'))
		.setDescriptionLocalizations({
			'es-ES': $default.getByLang('es', 'latestDescription'),
			fr     : $default.getByLang('fr', 'latestDescription')
		})
		.addStringOption(option => 
			option.setName($default.get('topic'))
				.setNameLocalizations({
					'es-ES': $default.getByLang('es', 'topic'),
					fr     : $default.getByLang('fr', 'topic')
				})
				.setDescription($default.get('topicDescription2'))
				.setDescriptionLocalizations({
					'es-ES': $default.getByLang('es', 'topicDescription2'),
					fr     : $default.getByLang('fr', 'topicDescription2')
				})
				.setRequired(true)
				.addChoices(...topics)
		),

	async execute (interaction) {
		const topic = interaction.options.getString($default.get('topic'))

		switch (topic) {
			case 'maps':
				new Website(interaction.client, false).getLatestMap(interaction)
				break
			case 'tweets':
				Twitter.getLatestTweet(interaction)
				break
			default:
				break
		}
	}
}

