class Map {
	constructor (args) {
		this.id = args.id 
		// for now, only storing the id, may change later if needed
	}


	_serialize () {
		return {
			id: this.id
		}
	}
}

module.exports = Map
