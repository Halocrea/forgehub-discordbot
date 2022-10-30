const { EmbedBuilder } = require('discord.js')

module.exports = ({ author, color, description, fields, footer, image, thumbnail, title }) => {
	const embed = new EmbedBuilder()
		.setTitle(title || '')
		.setColor(color || 16426522)
		.setDescription(description || '')

	if (author) {
		embed.setAuthor({
			name   : author.name,
			iconURL: author.iconURL,
			url    : author?.url
		})
	}

	if (thumbnail)
		embed.setThumbnail(thumbnail)

	for (let i in fields) {
		embed.addFields({
			name  : fields[i].name,
			value : fields[i].value,
			inline: fields[i]?.inline || false
		})
	}

	if (image)
		embed.setImage(image)

	if (footer)
		embed.setFooter({ text: footer })

	return embed
}
