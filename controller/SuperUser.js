const generateEmbed = require('../utils/generateEmbed')
const Guilds        = require('../crud/Guilds')

class SuperUser {
    constructor (guild, translations) { 
        this.guilds     = new Guilds() 
        this.guild      = guild 
        this.$t         = translations
    }

    async prefix (message, arg) {
        const canDoThis = await this._checkAuthorization(message)
        if (!canDoThis)
            return 

        const strippedContent = arg.replace(/#| |@|`/g, '')
        if (strippedContent.length < 1) {
            return message.channel.send(generateEmbed({
                color       : '#ff0000',
                description : this.$t.get('setupDefinePrefix'), 
                title       : this.$t.get('errorInvalidPrefix')
            }))
        }
        this.guild.prefix               = strippedContent
        this.guild.waitingSetupAnswer   = false
        this.guild.setupStep            = 3
        this.guilds.update(this.guild)
        
        message.channel.send(generateEmbed({
            color       : '#43b581', 
            title       : this.$t.get('setupPrefixSuccess', { prefix: this.guild.prefix })
        }))
    }

    async uninstall (message) {
        const canDoThis = await this._checkAuthorization(message)
        if (!canDoThis)
            return 
            
        const confirm   = '✅'
        const cancel    = '❎'
        const msg = await message.channel.send(generateEmbed({
            description : this.$t.get('confirmUninstall', { confirm, cancel }), 
            title       : this.$t.get('confirmUninstallTitle')
        }))
        msg.react(confirm)
        msg.react(cancel)
        const filter = (reaction, user) => {
            const firstCheck = [confirm, cancel].includes(reaction.emoji.name)
            if (!firstCheck)
                return false 

            return user.id === message.author.id
        }
        msg.awaitReactions(filter, { 
                max     : 1, 
                time    : (5 * 60000), 
                errors  : ['time'] 
            }
        )
            .then(collected => {
                const reaction  = collected.first()

                if (reaction.emoji.name === confirm) {
                    message.channel.send('See you, space cowboy!')
                        .then(() => {
                            this.guilds.remove(this.guild.id)
                            message.guild.leave()
                        })

                } else
                    message.channel.send(this.$t.get('goodCancel'))

                
            })
            .catch(err => process.dLogger.log(`in controller/SuperUser/uninstall: ${err.message}`))
    }

    async _checkAuthorization (message) {
        const discordGuild  = message.guild
        const member        = await discordGuild.members.fetch(message.author)
        if (!member.hasPermission('ADMINISTRATOR')) {
            message.channel.send(this.$t.get('errorNotAllowed', { prefix: this.guild.prefix }))
            return false
        }
        
        return true
    }
}
module.exports = SuperUser
