import * as Utils from './utils.js'

export class World extends Utils.GameObject {
	constructor(race='DefaultWorld') {
		super('World')
		this.difficulty = 0
		/* in seconds*/
		this.timeTotal   = 100000000001
		this.timePerTick = 2

		/* time settings */
		this.clock = {
			second: 1,
			minute: 70, /* amount of seconds in a minute */
			hour  : 70, /* amount of minute in a hour */
			day   : 28, /* amount of hour in a day */
			week  : 10, /* amount of day in a week */
			month : 3, /* amount of week in a month */
			year  : 10 /* amount of month in a year */
		}

		this.speed = 1
	}

	tick() {
		this.timeTotal += Math.round(Utils.rngmm(Math.floor(this.timePerTick*0.9),Math.floor(this.timePerTick*1.1)))
	}


	/* this.clock */
	get c() {
		return this.clock
	}

	get secperyear() {
		return this.c.year * this.c.month * this.c.week * this.c.day * this.c.hour * this.c.minute * this.c.second
	}
	get secpermonth() {
		return this.c.month * this.c.week * this.c.day * this.c.hour * this.c.minute * this.c.second
	}
	get secperweek() {
		return this.c.week * this.c.day * this.c.hour * this.c.minute * this.c.second
	}
	get secperday() {
		return this.c.day * this.c.hour * this.c.minute * this.c.second
	}
	get secperhour() {
		return this.c.hour * this.c.minute * this.c.second
	}
	get secperminute() {
		return this.c.minute * this.c.second
	}

	get date() {
		let ts = this.timeTotal

		let year   = Math.floor(ts / this.secperyear)
		let month  = Math.floor((ts - year * this.secperyear) / this.secpermonth)
		let week   = Math.floor((ts - month * this.secpermonth - year * this.secperyear) / this.secperweek)
		let day    = Math.floor((ts - week * this.secperweek - month * this.secpermonth - year * this.secperyear) / this.secperday)
		let hour   = Math.floor((ts - day * this.secperday - week * this.secperweek - month * this.secpermonth - year * this.secperyear) / this.secperhour)
		let minute = Math.floor((ts - hour * this.secperhour - day * this.secperday - week * this.secperweek - month * this.secpermonth - year * this.secperyear) / this.secperminute)
		let second = Math.floor(ts - minute * this.secperminute - hour * this.secperhour - day * this.secperday - week * this.secperweek - month * this.secpermonth - year * this.secperyear)

		return [second,minute,hour,day+1,week,month+1,year]
	}

	get dateFormat() {
		let date = this.date
		let text = ""
		if (date[0] < 10) { text = "0"+date[0] } else { text = date[0] }
		if (date[1] < 10) { text = "0"+date[1]+":"+text } else { text = date[1]+":"+text }
		if (date[2] < 10) { text = "0"+date[2]+":"+text } else { text = date[2]+":"+text }
		let days = date[3] + date[4]*this.c.week
		if (days < 10) { text = "0"+days+" "+text } else { text = days+" "+text }
		/*text = date[4]+"w "+text*/
		if (date[5] < 10) { text = "0"+date[5]+"-"+text } else { text = date[5]+"-"+text }
		text = date[6]+"-"+text
		return text
	}
}