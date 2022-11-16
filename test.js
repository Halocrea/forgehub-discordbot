const Guilds = require('./crud/Guilds')

const main = () => {
	const guildManager = new Guilds()

	let allGuilds = guildManager.all()
	console.log(allGuilds.length)
	console.log(allGuilds.map(g => g.name).join(', '))
}

main()
