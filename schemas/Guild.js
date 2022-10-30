require('dotenv').config()

class Guild {
	constructor (args) {
		this.id                = args.id 
		this.joinedAt          = args.joinedAt ? new Date(args.joinedAt) : new Date()
		this.updatedAt         = args.updatedAt ? new Date(args.updatedAt) : new Date()
		this.locale            = args.locale || 'en'
		this.mapsChanId        = args.mapsChanId || ''
		this.name              = args.name 
		this.prefix            = args.prefix || process.env.DISCORD_PREFIX
		this.setupCompleted    = !!args.setupCompleted
		this.setupStep         = args.setupStep || 1
		this.streamAlertChanId = args.streamAlertChanId || ''
		this.tweetsChanId      = args.tweetsChanId ||''

		if (args.waitingSetupAnswer) {
			if (typeof args.waitingSetupAnswer === 'string') 
				this.waitingSetupAnswer = JSON.parse(args.waitingSetupAnswer)
			else 
				this.waitingSetupAnswer = args.waitingSetupAnswer
		} else 
			this.waitingSetupAnswer = false
	}

	getPrefix () {
		return this.prefix
	}

	_serialize () {
		return {
			id                : this.id, 
			joinedAt          : this.joinedAt.toISOString(), 
			updatedAt         : this.updatedAt.toISOString(),
			locale            : this.locale, 
			mapsChanId        : this.mapsChanId, 
			name              : this.name, 
			prefix            : this.prefix, 
			setupStep         : this.setupStep, 
			setupCompleted    : this.setupCompleted ? 1 : 0, 
			streamAlertChanId : this.streamAlertChanId, 
			tweetsChanId      : this.tweetsChanId, 
			waitingSetupAnswer: JSON.stringify(this.waitingSetupAnswer)
		}
	}
}

module.exports = Guild
