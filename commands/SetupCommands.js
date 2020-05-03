const generateEmbed = require('../utils/generateEmbed')
const Guild         = require('../schemas/Guild')
const I18N          = require('../utils/I18N')

class SetupCommands {
    constructor (guildManager) {
        this.guildManager = guildManager
    }

    handle (message, guild = null) {
        this.guild  = guild || new Guild({
            id  : message.guild.id, 
            name: message.guild.name 
        })
        this.$t     = new I18N(this.guild.locale)

        switch (this.guild.setupStep) {
            case 1: // language
                this._step1(message)
                break 
            case 2: // prefix
                this._step2(message)
                break 
            case 3: // maps channel
                this._step3(message)
                break 
            case 4: // tweets channel (confirm/cancel)
                this._step4(message)
                break 
            case 5: // tweets channel (set)
                this._step5(message)
                break 
            case 6: // stream alerts (confirm/cancel)
                this._step6(message)
            case 7: 
                this._step7(message)
        } 
    }

    handleAnswer (message, duelGuild) {
        this.guild  = duelGuild 
        this.$t     = new I18N(this.guild.locale)
        switch (this.guild.setupStep) {
            case 2:
                this._answerStep2(message)
                break
            case 3: 
                this._answerStep3(message)
                break 
            case 5: 
                this._answerStep5(message)
                break 
            case 7: 
                this._answerStep7(message)
                break 
            default: 
                message.channel.send(this.$t.get('errorCommandNotFound', { prefix: this.guild.prefix, cmdHelp: this.$t.get('cmdHelp') }))
        }
    }

    _answerStep2 (message) {
        const strippedContent = message.content.replace(/#| |@|`/g, '')
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
        this.guildManager.update(this.guild)
        
        message.channel.send(generateEmbed({
            color       : '#43b581', 
            title       : this.$t.get('setupPrefixSuccess', { prefix: this.guild.prefix })
        }))
            .then(() => this._step3(message))
    }

    async _answerStep3 (message) {
        if (message.content.trim().toLowerCase() !== 'none') {
            const channel = await this._fetchChannelFromMessage(message)
            
            if (!channel) {
                this.guild.waitingSetupAnswer = false 
                this.guildManager.update(this.guild)
                return message.channel.send(generateEmbed({
                    color       : '#ff0000',
                    description : this.$t.get('errorCantFindChannelDesc', { prefix: this.guild.prefix }),
                    title       : this.$t.get('errorCantFindChannel')
                }))
            }

            if (!channel.permissionsFor(message.client.user).has('SEND_MESSAGES')) {
                this.guild.waitingSetupAnswer = false 
                this.guildManager.update(this.guild)
                return message.channel.send(generateEmbed({
                    color       : '#ff0000',
                    description : this.$t.get('errorCantPostThere', { prefix: this.guild.prefix }),
                    title       : this.$t.get('errorCantPostThereTitle')
                }))
            }
            this.guild.mapsChanId = channel.id
        }
        this.guild.waitingSetupAnswer   = false 
        this.guild.setupStep            = 4
        this.guildManager.update(this.guild)
        
        await message.channel.send('OK!')
        this._step4(message)
    }
    
    async _answerStep5 (message) {
        if (message.content.trim().toLowerCase() !== 'none') {
            const channel = await this._fetchChannelFromMessage(message)
            
            if (!channel) {
                this.guild.waitingSetupAnswer = false 
                this.guildManager.update(this.guild)
                return message.channel.send(generateEmbed({
                    color       : '#ff0000',
                    description : this.$t.get('errorCantFindChannelDesc', { prefix: this.guild.prefix }),
                    title       : this.$t.get('errorCantFindChannel')
                }))
            }

            if (!channel.permissionsFor(message.client.user).has('SEND_MESSAGES')) {
                this.guild.waitingSetupAnswer = false 
                this.guildManager.update(this.guild)
                return message.channel.send(generateEmbed({
                    color       : '#ff0000',
                    description : this.$t.get('errorCantPostThere', { prefix: this.guild.prefix }),
                    title       : this.$t.get('errorCantPostThereTitle')
                }))
            }
            this.guild.tweetsChanId = channel.id
        }
        this.guild.waitingSetupAnswer   = false 
        this.guild.setupStep            = 6
        this.guildManager.update(this.guild)
        
        await message.channel.send('OK!')
        this._step6(message)
    }

    async _answerStep7 (message) {
        if (message.content.trim().toLowerCase() !== 'none') {
            const channel = await this._fetchChannelFromMessage(message)
            
            if (!channel) {
                this.guild.waitingSetupAnswer = false 
                this.guildManager.update(this.guild)
                return message.channel.send(generateEmbed({
                    color       : '#ff0000',
                    description : this.$t.get('errorCantFindChannelDesc', { prefix: this.guild.prefix }),
                    title       : this.$t.get('errorCantFindChannel')
                }))
            }

            if (!channel.permissionsFor(message.client.user).has('SEND_MESSAGES')) {
                this.guild.waitingSetupAnswer = false 
                this.guildManager.update(this.guild)
                return message.channel.send(generateEmbed({
                    color       : '#ff0000',
                    description : this.$t.get('errorCantPostThere', { prefix: this.guild.prefix }),
                    title       : this.$t.get('errorCantPostThereTitle')
                }))
            }
            this.guild.streamAlertChanId = channel.id
            this.guildManager.update(this.guild)
        }
        await message.channel.send('OK!')
        this._setupCompleted(message)
    }

    async _fetchChannelFromMessage(message) {
        const targetChannel = message.content.match(/<#(.*)>/)

        if (targetChannel) {
            const channelId = targetChannel.pop()
            const channel   = await message.client.channels.fetch(channelId)
            return channel 
        }

        return false
    }

    _step1 (message) {
        message.channel.send(generateEmbed({
            title       : 'FIRST STEP',
            description : `Welcome to the **unofficial ForgeHub bot** installation wizard! First things first, please select in reaction to this message the bot's language for this server:\n• 🇺🇸 English (USA)\n• 🇫🇷 Français (France)`,
            thumbnail   : 'https://www.forgehub.com/styles/forgehub/forgehub/favicon.png'
        }))
            .then(async msg => {
                msg.react('🇺🇸')
                msg.react('🇫🇷')
                const filter = (reaction, user) => {
                    const firstCheck = ['🇺🇸', '🇫🇷'].includes(reaction.emoji.name)
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
                        switch (reaction.emoji.name) {
                            case '🇫🇷':
                                this.guild.locale = 'fr'
                                break 
                            default: 
                                this.guild.locale = 'en'
                                break 
                        }
                        this.guild.setupStep    = 2
                        this.$t                 = new I18N(this.guild.locale)
                        this.guildManager.addOrOverwrite(this.guild)
                        
                        message.channel.send(this.$t.get('setupLanguageValidated'))
                            .then(this._step2(message))
                    })
                    .catch((err) => {
                        process.dLogger.log(`in commands/SetupCommands/_step1: ${err.message}`)
                        message.channel.send(this.$t.get('errorSetupTimeout'))
                    })
            })
    }

    _step2 (message) {
        const keep      = '✅'
        const change    = '⚙️'
        message.channel.send(generateEmbed({
            title       : this.$t.get('setupChoosePrefix'),
            description : this.$t.get('setupChoosePrefixDesc', { keep, change, prefix: this.guild.prefix })
        }))
            .then(msg => {
                msg.react(keep)
                msg.react(change)
                const filter = (reaction, user) => {
                    const firstCheck = [keep, change].includes(reaction.emoji.name)
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
                        switch (reaction.emoji.name) {
                            case change:
                                this.guild.waitingSetupAnswer = { authorId: message.author.id, channelId: message.channel.id }
                                this.guildManager.update(this.guild)
                                
                                message.channel.send(this.$t.get('setupDefinePrefix'))
                                break 
                            default: 
                                this.guild.setupStep = 3
                                this.guildManager.update(this.guild)
                                
                                this._step3(message)
                                break 
                        }
                    })
                    .catch((err) => {
                        process.dLogger.log(`in commands/SetupCommands/_step2: ${err.message}`)
                        message.channel.send(this.$t.get('errorSetupTimeout'))
                    })
            })
    }

    _step3 (message) {
        message.channel.send(generateEmbed({
            description : this.$t.get('setupMapsChannelDesc'),
            title       : this.$t.get('setupMapsChannel')
        }))
            .then(() => {
                this.guild.waitingSetupAnswer = { authorId: message.author.id, channelId: message.channel.id }
                this.guildManager.update(this.guild)
            })
    }

    async _step4 (message) {
        const confirm   = '✅'
        const cancel    = '❎'
        const msg = await message.channel.send(generateEmbed({
            description : this.$t.get('setupTweetsChannel1Desc', { confirm, cancel }), 
            title       : this.$t.get('setupTweetsChannel1')
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
                switch (reaction.emoji.name) {
                    case confirm:
                        this.guild.setupStep = 5
                        this._step5(message)
                        break 
                    default: 
                        this._setupCompleted(message)
                        break 
                }
            })
            .catch(err => process.dLogger.log(`in commands/SetupCommands/_step4: ${err.message}`))
    }

    _step5 (message) {
        message.channel.send(generateEmbed({
            description : this.$t.get('setupTweetsChannel2Desc'),
            title       : this.$t.get('setupTweetsChannel2')
        }))
            .then(() => {
                this.guild.waitingSetupAnswer = { authorId: message.author.id, channelId: message.channel.id }
                this.guildManager.update(this.guild)
            })
    }

    async _step6 (message) {
        const confirm   = '✅'
        const cancel    = '❎'
        const msg = await message.channel.send(generateEmbed({
            description : this.$t.get('setupStreamAlertChannel1Desc', { confirm, cancel }), 
            title       : this.$t.get('setupStreamAlertChannel1')
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
                switch (reaction.emoji.name) {
                    case confirm:
                        this.guild.setupStep = 7
                        this._step7(message)
                        break 
                    default: 
                        this._setupCompleted(message)
                        break 
                }
            })
            .catch(err => process.dLogger.log(`in commands/SetupCommands/_step6: ${err.message}`))
    }

    _step7 (message) {
        message.channel.send(generateEmbed({
            description : this.$t.get('setupStreamAlertChannel2Desc'),
            title       : this.$t.get('setupStreamAlertChannel2')
        }))
            .then(() => {
                this.guild.waitingSetupAnswer = { authorId: message.author.id, channelId: message.channel.id }
                this.guildManager.update(this.guild)
            })
    }

    _setupCompleted(message) {
        
        const successEmbed = generateEmbed({
            color       : '#43b581', 
            description : this.$t.get('setupAutoCompletedDesc', { prefix: this.guild.prefix, cmdPrefix: this.$t.get('cmdPrefix'), cmdUninstall: this.$t.get('cmdUninstall') }),
            title       : this.$t.get('setupAutoCompleted')
        })
        this.guild.setupStep      = 7
        this.guild.setupCompleted = true
        this.guildManager.update(this.guild)
        
        message.channel.send(successEmbed)
    }
}

module.exports = SetupCommands
