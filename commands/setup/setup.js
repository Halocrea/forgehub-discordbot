
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const generateEmbed = require('./../../utils/generateEmbed')
const Guilds        = require('./../../crud/Guilds')
const guildManager  = new Guilds()

const I18N     = require('./../../utils/I18N')
const $default = new I18N()

const topics = [
	{ name: 'Maps', value: 'maps'},
	{ name: 'Stream alerts', value: 'stream'},
	{ name: 'Tweets', value: 'tweets'}
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName($default.get('cmdSetup'))
		.setNameLocalizations({
			'es-ES': $default.getByLang('es', 'cmdSetup'),
			fr     : $default.getByLang('fr', 'cmdSetup')
		})
		.setDescription($default.get('cmdSetupDescription'))
		.setDescriptionLocalizations({
			'es-ES': $default.getByLang('es', 'cmdSetupDescription'),
			fr     : $default.getByLang('fr', 'cmdSetupDescription')
		})
		.addStringOption(option => 
			option.setName($default.get('topic'))
				.setNameLocalizations({
					'es-ES': $default.getByLang('es', 'topic'),
					fr     : $default.getByLang('fr', 'topic')
				})
				.setDescription($default.get('topicDescription'))
				.setDescriptionLocalizations({
					'es-ES': $default.getByLang('es', 'topicDescription'),
					fr     : $default.getByLang('fr', 'topicDescription')
				})
				.setRequired(true)
				.addChoices(...topics)
		)
		.addChannelOption(option =>
			option
				.setName($default.get('target'))
				.setNameLocalizations({
					'es-ES': $default.getByLang('es', 'target'),
					fr     : $default.getByLang('fr', 'target')
				})
				.setDescription($default.get('targetDescription'))
				.setDescriptionLocalizations({
					'es-ES': $default.getByLang('es', 'targetDescription'),
					fr     : $default.getByLang('fr', 'targetDescription')
				})							
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute (interaction) {
		const topic     = interaction.options.getString($default.get('topic'))
		const channel   = interaction.options.getChannel($default.get('target'))
		const thisGuild = guildManager.getById(interaction.guildId)
		const $t        = new I18N(thisGuild.locale)

		if (!channel.isTextBased()) {
			return interaction.reply({
				emebds: [generateEmbed({
					color      : 15548997,
					title      : $t.get('errorWrongChannel'),
					description: $t.get('errorWrongChannelDesc', {
						channel: channel.name
					})
				})],
				ephemeral: true
			})
		}
		
		const botGuildMember = await interaction.guild.members.fetch(interaction.client.user)

		if (!botGuildMember.permissionsIn(channel).has(PermissionFlagsBits.ViewChannel) ||
			!botGuildMember.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) {
			return interaction.reply({
				embeds: [generateEmbed({
					color      : 15548997,
					title      : $t.get('errorCantPostThereTitle'),
					description: $t.get('errorCantPostThere')
				})],
				ephemeral: true
			})
		}

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

		thisGuild[field] = channel.id
		guildManager.update(thisGuild)

		await channel.send($t.get('confirmChannel', { topic: topics.find(t => t.value === topic).name.toLowerCase() }))

		return interaction.reply({
			embeds: [{
				color      : 5763719,
				title      : $t.get('channelSet'),
				description: $t.get('channelSetDescription', {
					topic  : topics.find(t => t.value === topic).name.toLowerCase(),
					channel: channel.name 
				})
			}],
			ephemeral: true
		})
	}
}
