require('dotenv').config()

const SuperUserController   = require('../controller/SuperUser')
const generateEmbed         = require('../utils/generateEmbed')
const I18N                  = require('../utils/I18N')

class MainCommands {
    constructor (client, guild) {
        this.client                 = client
        this.$t                     = new I18N(guild.locale)
        this.superUserController    = new SuperUserController(guild, this.$t)
        this.discordGuild           = client.guilds.resolve(guild.id)
        this.guild                  = guild
    }

    async handle (message) {
        const cmdAndArgs = message.content.replace(this.guild.prefix, '').trim().split(' ')
        const cmd        = cmdAndArgs[0]
        let args         = ''
        
        for (let i = 1; i < cmdAndArgs.length; i++) 
            args += cmdAndArgs[i] + ' '

        args.trim()

        switch (cmd) {
            case this.$t.get('cmdHelp'): 
                this.help(message)
                break 
            case this.$t.get('cmdInvite'):
                this.inviteBot(message)
                break 
            case this.$t.get('cmdPrefix'): 
                this.superUserController.prefix(message, args)
                break 
            case this.$t.get('cmdUninstall'):
                this.superUserController.uninstall(message)
                break
            default: 
                message.channel.send(this.$t.get('errorCommandNotFound', { prefix: this.guild.prefix, cmdHelp: this.$t.get('cmdHelp') }))
                break
        }
    }

    async help (message) {
        const commands = Object.keys(this.$t.translations)
            .filter(key => key.startsWith('cmd'))
            .reduce((obj, key) => {
                obj[key] = this.$t.translations[key]
                return obj
            }, {})

        let description = ''
        description += this.$t.get('helpText', Object.assign({
                prefix          : this.guild.prefix,
                discordInvite   : 'https://discord.gg/74UAq84'
            }, commands))

        message.channel.send(generateEmbed({
            color       : '#43b581',
            description, 
            footer      : 'made with ♥️ by Halo Création',
            thumbnail   : 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png',
            title       : this.$t.get('helpTitle')
        }))
    }

    inviteBot (message) {
        message.channel.send(this.$t.get('inviteCmdText', { link : `https://discordapp.com/oauth2/authorize?client_id=${message.client.user.id}&scope=bot&permissions=27712` }))
    }
}

module.exports = MainCommands
