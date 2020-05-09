require('dotenv').config()

const Discord       = require('discord.js')
const Guilds        = require('./crud/Guilds')
const I18N          = require('./utils/I18N')
const MainCommands  = require('./commands/MainCommands')
const SetupCommands = require('./commands/SetupCommands')
const StreamAlert   = require('./controller/StreamAlert')
const Twitter       = require('./controller/Twitter')
const Website       = require('./controller/Website')

const client            = new Discord.Client({
    ws: { intents: [
        'GUILDS', 
        'GUILD_MESSAGES', 
        'GUILD_MESSAGE_REACTIONS', 
        'GUILD_INVITES', 
        'GUILD_INTEGRATIONS'
    ]}
})

let guilds          = null

client.on('ready', async () => {
    await require('./utils/dLogger').init(client)

    console.log('the bot is ready')

    guilds = new Guilds()
    
    if (process.env.TWITCH_CLIENT_ID 
        && process.env.TWITCH_CLIENT_ID.length > 0
        && process.env.TWITCH_CHANNEL_ID
        && process.env.TWITCH_CHANNEL_ID.length > 0
    ) {
        new StreamAlert(client)
    }
    client.user.setStatus('available')

    new Twitter(client)
    new Website(client)
})

client.on('message', async message => {
    if (!message.guild) // MPs
        return 
    
    const currentGuild  = guilds.getById(message.guild.id)
    const prefix        = currentGuild ? currentGuild.getPrefix() : process.env.DISCORD_PREFIX
    
    if (message.content.startsWith(prefix)) {
        if (currentGuild && currentGuild.setupCompleted) {
            const mainCommands = new MainCommands(client, currentGuild)
            mainCommands.handle(message, currentGuild)
        } else {
            // checking if the author of the message is allowed to do what he's trying to do
            const member = await message.guild.members.fetch(message.author)
            if (member.hasPermission('ADMINISTRATOR')) {
                const setupCommands = new SetupCommands(guilds) 
                setupCommands.handle(message, currentGuild)
            } else {
                const $t    = new I18N(currentGuild ? currentGuild.locale : 'en') 
                const embed = new Discord.MessageEmbed()
                    .setTitle($t.get('errorConfigureMeFirst'))
                    .setColor('#ff0000')
                    .setDescription($t.get('errorNotFullySetUpYet'))
                    .setImage('https://i.imgur.com/ZIfiTGO.gif')
                message.channel.send(embed)
            }
        }
    }

    if (currentGuild && 
        !currentGuild.setupCompleted && 
        currentGuild.waitingSetupAnswer && 
        currentGuild.waitingSetupAnswer.authorId === message.author.id && 
        currentGuild.waitingSetupAnswer.channelId === message.channel.id
    ) {
        const setupCommands = new SetupCommands(guilds) 
        setupCommands.handleAnswer(message, currentGuild)
    }
})

client.on('guildCreate', guild => {
    process.dLogger.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!\nI'm serving ${client.guilds.cache.size} servers now.`)
})

client.on('guildDelete', guild => {
    process.dLogger.log(`${guild.name} (id: ${guild.id}) removed me.\nI'm serving ${client.guilds.size} servers now.`)
    try {
        new Guilds().remove(guild.id)
    } catch (err) {
        process.dLogger.log(`in index.js, couldn't remove the guild from database: ${err.message}`)
    }
})

console.log('Sarting the bot...')
client.login(process.env.DISCORD_TOKEN)
