class Tweet {
    constructor (args) {
        this.id_str = args.id_str 
        // for now, only storing the id, may change later if needed
    }


    _serialize () {
        return {
            id_str: this.id_str
        }
    }
}

module.exports = Tweet
