const fs       = require('fs')
const Database = require('better-sqlite3')
const Tweet    = require('../schemas/Tweet') 

class Tweets {
	constructor () {
		try {
			this.db = new Database('data/tweets.db')

			const createTweetTable = `CREATE TABLE IF NOT EXISTS tweets (
                id_str VARCHAR(30) PRIMARY KEY
            );`
			this.db.exec(createTweetTable)
		} catch (err) {
			process.dLogger.log(`in crud/Tweets/constructor: ${err.message}`)
		}
	}

	add (tweet) {
		const checkExistence = this.getById(tweet.id_str)

		if (!checkExistence) {
			let queryStr    = 'INSERT INTO tweets '
			let rowNames    = ''
			let namedValues = '' 

			for (let k in tweet._serialize()) {
				rowNames    += `${k},`
				namedValues += `@${k},`
			}

			rowNames    = rowNames.substring(0, rowNames.length - 1)
			namedValues = namedValues.substring(0, namedValues.length - 1)
			queryStr   += `(${rowNames}) VALUES (${namedValues})`

			const statement = this.db.prepare(queryStr)

			statement.run(tweet._serialize())
		}

		return tweet
	}

	all () {
		const tweetsRaw = this.db.prepare('SELECT * FROM tweets').all()
		const tweets    = []
		for (const i in tweetsRaw) 
			tweets.push(new Tweet(tweetsRaw[i]))

		return tweets
	}

	getById (id_str) {
		const tweetRaw = this.db.prepare('SELECT * FROM tweets WHERE id_str = ? LIMIT 1').get(id_str)

		return tweetRaw ? new Tweet(tweetRaw) : null
	}

	getLatest () {
		const tweetRaw = this.db.prepare('SELECT * FROM tweets ORDER BY id_str DESC LIMIT 1').get()

		return tweetRaw ? new Tweet(tweetRaw) : null
	}

	remove (id_str) {
		const info = this.db.prepare('DELETE FROM tweets WHERE id_str = ? LIMIT 1').run(id_str)
		return info.changes >= 0
	}

	update (args) {
		const currentTweet = this.getById(args.id_str)
        
		if (!currentTweet)
			return false 
        
		let queryStr = 'UPDATE tweets SET '

		for (let k in args._serialize()) {if (currentGuild.hasOwnProperty(k) && k !== 'id_str') 
			queryStr += `${k}=@${k},`}
		queryStr = `${queryStr.substring(0, queryStr.length - 1)} WHERE id_str=@id_str`

		return this.db.prepare(queryStr).run(args._serialize())
	}
}

module.exports = Tweets
