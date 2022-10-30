const fs = require('fs')

class I18N {
	constructor (langKey = 'en') {
		this.translations = { [langKey]: null }
		this.currentLang  = langKey

		try {
			const langFile             = fs.readFileSync(`i18n/${langKey}.json`, 'utf8')
			this.translations[langKey] = JSON.parse(langFile)
		} catch (err) {
			const langFile          = fs.readFileSync('i18n/en.json', 'utf8')
			this.currentLang        = 'en'
			this.translations['en'] = JSON.parse(langFile)
		}
	}

	get (key, args = {}, amount = 1, lang = null) {
		let value = (lang ? this.translations?.[lang]?.[key] : this.translations[this.currentLang][key]) || key
		for (const a in args) {
			const regex = new RegExp(`{${a}}`, 'g')
			value       = value.replace(regex, args[a])
		}

		if (value.indexOf(' | ') >= 0) {
			const valueArr = value.split(' | ')
			if (amount <= 1) 
				value = valueArr[0]
			else 
				value = valueArr[1]
		}

		return value 
	}

	getByLang (lang, key, args = {}, amount = 1) {
		if (!this.translations[lang]) {
			try {
				const langFile          = fs.readFileSync(`i18n/${lang}.json`, 'utf8')
				this.translations[lang] = JSON.parse(langFile)
			} catch (err) {
				lang = 'en'
			}
		}

		return this.get(key, args, amount, lang)
	}
}

module.exports = I18N
