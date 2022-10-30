const fs       = require('fs')
const Database = require('better-sqlite3')
const Map      = require('../schemas/Map') 

class Maps {
	constructor () {
		try {
			this.db = new Database('data/maps.db')

			const createMapTable = `CREATE TABLE IF NOT EXISTS maps (
                id VARCHAR(30) PRIMARY KEY
            );`
			this.db.exec(createMapTable)
		} catch (err) {
			process.dLogger.log(`in crud/Maps/constructor: ${err.message}`)
		}
	}

	add (map) {
		const checkExistence = this.getById(map.id)

		if (!checkExistence) {
			let queryStr    = 'INSERT INTO maps '
			let rowNames    = ''
			let namedValues = '' 

			for (let k in map._serialize()) {
				rowNames    += `${k},`
				namedValues += `@${k},`
			}

			rowNames    = rowNames.substring(0, rowNames.length - 1)
			namedValues = namedValues.substring(0, namedValues.length - 1)
			queryStr   += `(${rowNames}) VALUES (${namedValues})`

			const statement = this.db.prepare(queryStr)

			statement.run(map._serialize())
		}

		return map
	}

	all () {
		const mapsRaw = this.db.prepare('SELECT * FROM maps').all()
		const maps    = []
		for (const i in mapsRaw) 
			maps.push(new Map(mapsRaw[i]))

		return maps
	}

	getById (id) {
		const mapRaw = this.db.prepare('SELECT * FROM maps WHERE id = ? LIMIT 1').get(id)

		return mapRaw ? new Map(mapRaw) : null
	}

	remove (id) {
		const info = this.db.prepare('DELETE FROM maps WHERE id = ? LIMIT 1').run(id)
		return info.changes >= 0
	}

	update (args) {
		const currentMap = this.getById(args.id)
        
		if (!currentMap)
			return false 
        
		let queryStr = 'UPDATE maps SET '

		for (let k in args._serialize()) {if (currentGuild.hasOwnProperty(k) && k !== 'id') 
			queryStr += `${k}=@${k},`}
		queryStr = `${queryStr.substring(0, queryStr.length - 1)} WHERE id=@id`

		return this.db.prepare(queryStr).run(args._serialize())
	}
}

module.exports = Maps
