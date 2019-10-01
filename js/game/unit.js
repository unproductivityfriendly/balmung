import {stringToFunction, toDecimal, GameObject, Flr, Sqrt, Sq, rng, rngmm, log10} from './utils.js';
import * as Data from './data.js';



export class UnitModel {
	constructor(race=0, unitid=0, bodyratio=0.5, gender=1) {
		this.entity = {
			frame: 1000,
			fps: 1,
			lastFrameTimeStamp: 0,
			ticks: {
				lastHealth: 0,
				lastStamina: 0,
				lastSatiety: 0,
				lastEnergy: 0
			}
		}

		this.core = {
			unitid: unitid,
			name: "",
			exp: 199,
			expectedexp: 0,
			exptospirit: 0,
			unittype: 1, /* 1=character 2=transport */
			level: 0, /* calculated by calcLevel */
			levelratio: 1,
			race: race,
			gender: gender, /* 1=male 2=female*/
			genderratio: 1,
			bodyratio: bodyratio,
			body: {
				baseweight: 50000,
				equipweight: 1200,
				totalweight: 51200,
				slots: {}
			}, /* specified by race */
			state: 1,
				/* 0=dead 1=alive */
		}

		this.stats = {
			strength: 		{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			constitution: 	{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			agility: 		{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			dexterity: 		{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			intelligence: 	{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			wisdom: 		{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			charm: 			{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			luck: 			{base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
			talentpoints: {
				unused: 0, level: 0, spirit: 0, total: 0,
				spent: {strength: 0, constitution: 0, agility: 0, dexterity: 0, intelligence: 0, wisdom: 0, charm: 0,luck: 0},
				addtemp: {
					strength: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					constitution: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					agility: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					dexterity: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					intelligence: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					wisdom: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					charm: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					luck: {upgrade: 0, newstat: 0, defaultused: 0, upgradeused: 0},
					unused: 0
				}
			},
			racialstat: {},
			/***********************\ 
			 * base = racial base + level * racial ratio
			 * talent = 
			 * skill = 
			 * equipment = 
			 * status = 
			\***********************/
			secondary: {
				/* offensive */
				/* offensive stats depend on the weapon used */
				base: {
					attack: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 1.4,		constitution: 0.4,
							agility: 0,			dexterity: 0.2,
							intelligence: 0,	wisdom: 0,
							charm: 0,			luck: 0
						}},
					magicpower: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0,		constitution: 0.1,
							agility: 0,			dexterity: 0.4,
							intelligence: 1.5,	wisdom: 0,
							charm: 0,			luck: 0
						}},
					penetration: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0.5,		constitution: 0,
							agility: 0.2,		dexterity: 1,
							intelligence: 0,	wisdom: 0.2,
							charm: 0,			luck: 0.1
						}},
					accuracy: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0,		constitution: 0,
							agility: 0.4,		dexterity: 1.4,
							intelligence: 0,	wisdom: 0,
							charm: 0,			luck: 0.2
						}},
					critical: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0,		constitution: 0,
							agility: 0.3,		dexterity: 0.4,
							intelligence: 0,	wisdom: 0,
							charm: 0,			luck: 1.3
						}},
					criticaldamage: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0.5,		constitution: 0.1,
							agility: 0.1,		dexterity: 0.5,
							intelligence: 0,	wisdom: 0,
							charm: 0,			luck: 0.8
						}},
					parry: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0.8,		constitution: 0.5,
							agility: 0.3,		dexterity: 0.2,
							intelligence: 0,	wisdom: 0,
							charm: 0,			luck: 0.2
						}},
					block: {
						value: 0,
						ratio: { /*total stat, total ratio of 2 */
							strength: 0.4,		constitution: 1.3,
							agility: 0,			dexterity: 0.2,
							intelligence: 0,	wisdom: 0,
							charm: 0,			luck: 0.1
						}}
				},
				perWeapon: {
					default: {},
				},
				perWeaponModel: {
					attack: 0,
					magicpower: 0,
					penetration: 0,
					accuracy: 0,
					critical: 0,
					criticaldamage: 0,
					parry: 0,
					block: 0
				},

				/* defense */
				threat: {
					value: 0,
					ratio: { /*total stat, total ratio of 2 */
						strength: 0.4,
						constitution: 0.4,
						agility: 0.25,
						dexterity: 0.25,
						intelligence: 0.25,
						wisdom: 0,
						charm: 0.3,
						luck: 0.15
					}},
				tenacity: { /* total stat, total ratio of 2, physical crowd control resistance */
					value: 0,
					ratio: {
						strength: 0.7,
						constitution: 0.8,
						agility: 0.2,
						dexterity: 0.2,
						intelligence: 0,
						wisdom: 0.05,
						luck: 0.05
					}},
				willpower: { /* total stat, mental crowd control resistance */
					value: 0,
					ratio: {
						strength: 0.1,
						constitution: 0.2,
						agility: 0.15,
						dexterity: 0.05,
						intelligence: 0.9,
						wisdom: 0.5,
						luck: 0.1
					}},
				evasion: {
					value: 0,
					ratio: { /*total stat, total ratio of 2 */
						strength: 0.07,
						constitution: 0.18,
						agility: 1.2,
						dexterity: 0.44,
						intelligence: 0,
						wisdom: 0.01,
						luck: 0.1
					}},
				dodge: {
					value: 0,
					ratio: { /* total stat, total ratio of 2 */
						strength: 0.07,
						constitution: 0.04,
						agility: 0.35,
						dexterity: 0.13,
						intelligence: 0,
						wisdom: 0.01,
						luck : 1.4
					}},

				resistance: {armor: 0, magic: 0, piercing: 0, slashing: 0},
				/* adventure */
				/* speed: 100 = 1 meter per second */
				movespeed: {base: 100, talent: 0, skill: 0, equipment: 0, status: 0},
				walkspeed: {
					value: 0, mspdratio: 1.1, max: 255, /* max is set by race */
					upkeep: 0.2, tick: 30, /* upkeep is in percent, upkeep ratio is reduced by level */
					default: {mspdratio: 1.1, upkeep: 0.2, tick: 30}
				},
				runspeed: {
					value: 0, mspdratio: 6, max: 1390,
					upkeep: 0.7, tick: 15,
					default: {mspdratio: 6, upkeep: 0.7, tick: 15}
				},
				sprintspeed: {
					value: 0, mspdratio: 11, max: 2550,
					upkeep: 0, tick: 10,
					default: {mspdratio: 11, upkeep: 0.4, tick: 7}
				},
				restexprate: {value:0},
				/* state affects upkeep|rest */
				state: 2,
				/* need to sleep or specific drink to restore energy */
				health: {
					current: 0, max: 0, 
					upkeep: 0, rest: 0, 
					tick: 2, default: {upkeep: 5, rest: 2, tick: 3},
					ratio: { /*growth stat, total ratio of 20 */
						strength: 28,
						constitution: 60,
						agility: 6,
						dexterity: 4,
						intelligence: 1,
						wisdom: 1
					}},
				energy: {
					current: 0, max: 0, 
					upkeep: 0, rest: 0, 
					tick: 6, default: {upkeep: 0, tick: 6},
					ratio: { /* base+talent+skill */
						strength: 40,
						constitution: 50,
						agility: 30,
						dexterity: 20,
						intelligence: 40,
						wisdom: 5
					}},
				/* need to eat and rest to restore satiety */
				satiety: {
					current: 0, max: 0, 
					todigest: 0, upkeep: 0, 
					tick: 5, default: {upkeep: 0, tick: 5},
					ratio: { /* base+talent+skill */
						strength: 20,
						constitution: 35,
						agility: 20,
						dexterity: 5,
						intelligence: 10,
						wisdom: 0
					}},
				/* need to sleep to restore stamina */
				stamina: {
					current: 0, max: 0, 
					upkeep: 0, rest: 0, 
					tick: 3, default: {upkeep: 0, rest: 0, tick: 3},
					ratio: { /* base+talent+skill */
						strength: 40,
						constitution: 55,
						agility: 20,
						dexterity: 5,
						intelligence: 0,
						wisdom: 3
					}},
			}
		}

		this.status = {
			
		}

		this.knowledge = {
			scores: {
				battle: {
					racial: {},
					size: {},
				},
			},
		}

		this.party = {
			partyid: 0,
			position: {
				x: 0,
				y: 0
			}
		}

		this.profiles = {

		}

	}
	/***********************\ 
	 * Calculation order
	 ***********************
	 * calcCoreLevel
	 * calcPrimaryStats
	 * calcCoreBodyMax
	\***********************/

	living() {
		let stamina = this.stats.secondary.stamina
		let satiety = this.stats.secondary.satiety
		let energy = this.stats.secondary.energy

		let health = this.stats.secondary.health
		let state = this.stats.secondary.state

		/* if no health, then dead */
		if (health.current === 0) {
			this.core.state = 0
			this.stats.secondary.stamina.current = 0
			this.stats.secondary.satiety.current = 0
			this.stats.secondary.energy.current = 0
			return false
		} else if (this.core.state === 0) {
			this.core.state = 1
		}

		/* STAMINA */
		if (this.entity.ticks.lastStamina >= stamina.tick) {
			if (state === 1) { /* deep sleep */
				this.stats.secondary.stamina.current = Math.min(stamina.max, stamina.current + stamina.rest * 2)
				if (this.core.expectedexp !== 0) {
					this.absorbingExp(2)
				}
			} else if (state === 2) { /* meditating, sleeping */
				this.stats.secondary.stamina.current = Math.min(stamina.max, stamina.current + stamina.rest)
				if (this.core.expectedexp !== 0) {
					this.absorbingExp(1)
				}
			} else if (state === 3) { /* sitting */
				this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep)
			} else if (state === 4) { /* walking or small work */
				this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep * 2)
			} else if (state === 5) { /* battle, working, learning, running */
				this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep * 4)
			} else if (state === 6) { /* light status impaired */
				this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep * 7)
			} else if (state === 7) { /* normal status impaired */
				this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep * 11)
			} else if (state === 8) { /* high status impaired, poisoned, bleeding */
				this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep * 19)
			} else {
				console.warn("Character ("+this.core.name+") state is unexpected : "+state)
			}
			
			this.entity.ticks.lastStamina = 0
		} else {
			this.entity.ticks.lastStamina++
		}

		
		/* when there is no stamina, lose life & energy */
		if (this.stats.secondary.stamina.current === 0) {
			// TO DO
			this.stats.secondary.health.current = Math.max(0, health.current - health.upkeep * 5)
			this.stats.secondary.energy.current = Math.max(0, energy.current - energy.upkeep * 10)
		}

		/* SATIETY */
		if (this.entity.ticks.lastSatiety >= satiety.tick) {
			if (state === 1) { /* deep sleep */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep)
			} else if (state === 2) { /* meditating, sleeping */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep)
			} else if (state === 3) { /* sitting */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep)
			} else if (state === 4) { /* walking or small work */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep * 2)
			} else if (state === 5) { /* battle, working, learning, running */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep * 3)
			} else if (state === 6) { /* light status impaired */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep * 3)
			} else if (state === 7) { /* normal status impaired */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep * 4)
			} else if (state === 8) { /* high status impaired, poisoned, bleeding */
				this.stats.secondary.satiety.current = Math.max(0, satiety.current - satiety.upkeep * 4)
			}
			this.entity.ticks.lastSatiety = 0
		} else {
			this.entity.ticks.lastSatiety++
		}

		/* when there is no satiety, lose stamina */
		if (this.stats.secondary.satiety.current === 0) {
			// TO DO
			this.stats.secondary.stamina.current = Math.max(0, stamina.current - stamina.upkeep * 3)
		}

		/* ENERGY */
		if (this.entity.ticks.lastEnergy >= energy.tick) {
			if (state === 1) { /* deep sleep */
				this.stats.secondary.energy.current = Math.min(energy.max, energy.current + energy.rest * 2)
			} else if (state === 2) { /* meditating, sleeping */
				this.stats.secondary.energy.current = Math.min(energy.max, energy.current + energy.rest)
			} else if (state === 3) { /* sitting */
				this.stats.secondary.energy.current = Math.min(energy.max, energy.current + energy.rest)
			} else if (state === 4) { /* walking or small work */
				this.stats.secondary.energy.current = Math.min(energy.max, energy.current + Flr(energy.rest / 2))
			} else if (state === 8) { /* high status impaired, poisoned, bleeding */
				this.stats.secondary.energy.current = Math.max(0, energy.current - energy.max / 100)
			}
			this.entity.ticks.lastEnergy = 0
		} else {
			this.entity.ticks.lastEnergy++
		}

		/* secondary stats */

		/* Health */
		if (this.core.state === 1 && this.entity.ticks.lastHealth >= health.tick) {
			if (state === 1) { /* deep sleep */
				this.stats.secondary.health.current = Math.min(health.max, health.current + health.rest * 2)
			} else if (state === 2) { /* meditating, sleeping */
				this.stats.secondary.health.current = Math.min(health.max, health.current + health.rest * 1.8)
			} else if (state === 3) { /* sitting */
				this.stats.secondary.health.current = Math.min(health.max, health.current + health.rest)
			} else if (state === 4) { /* walking or small work */
			} else if (state === 5) { /* battle, working, learning, running */
			} else if (state === 6) { /* light status impaired */
			} else if (state === 7) { /* normal status impaired */
			} else if (state === 8) { /* high status impaired, poisoned, bleeding */
			} else {
				console.warn("Character ("+this.core.name+") health is unexpected : "+health)
			}
			
			this.entity.ticks.lastHealth = 0
		} else {
			this.entity.ticks.lastHealth++
		}
		
	}
		
	setExp(number) {
		let minExp = 50
		let maxExp = 1E15
		this.exp = intval(number)
		if (this.exp < minExp) {
			console.warn("Character ("+this.core.name+") exp below "+minExp+". Set to "+minExp)
			this.exp = minExp
		} else if (this.exp > maxExp) {
			console.warn("Character ("+this.core.name+") exp below "+maxExp+". Set to "+maxExp)
			this.exp = maxExp
		}
	}

	calcCoreLevel() {
		let level = this.getCharacterLevelByExp()
		if (this.core.level !== level) {
			this.core.level = level
		}
	}

	getCharacterLevelsExp(level) {
		return Flr(Data.characterLevel[level-1] * this.core.levelratio)
	}

	getCharLevelTableLength() {
		return Data.characterLevel.length
	}

	getCharacterLevelByExp() {
		let raw_level = 0
		let tableLength = this.getCharLevelTableLength()
		if (this.core.level <= tableLength) {
			for (var u = 0; u < tableLength; u++) {
				if (this.core.exp >= this.getCharacterLevelsExp(u)) {
					raw_level++
				}
			}
		} else {
			raw_level = this.core.level - 1 
		}
		//console.log("level", raw_level)
		if (raw_level + 1 >= tableLength) {
			/* if the exp exceed the level of the last table item, calculate each level based on the last exp required */
			let char_max_exp_of_level = this.getCharacterLevelsExp(tableLength) - this.getCharacterLevelsExp(tableLength-1)
			raw_level = tableLength + Flr((this.core.exp - this.getCharacterLevelsExp(tableLength)) / char_max_exp_of_level)
			//console.log("level's max exp", char_max_exp_of_level, "remaining current exp", this.core.exp - this.getCharacterLevelsExp(tableLength-1))
		}
		return Math.min(raw_level + 1, 999999)
	}
	getCharacterCurrentExpOfLevel() {
		let char_current_level = this.getCharacterLevelByExp()
		if (char_current_level >= this.getCharLevelTableLength()) {
			let totalexpperlevelafterceil = this.getCharacterCurrentLevelTotalExp()
			let expperlevelafterceil = this.core.exp - this.getCharacterLevelsExp(this.getCharLevelTableLength()-1)
			return expperlevelafterceil % totalexpperlevelafterceil
		} else {
			let char_base_exp_of_level = this.getCharacterLevelsExp(char_current_level-1) || 0
			return this.core.exp - char_base_exp_of_level
		}
	}
	getCharacterCurrentLevelTotalExp() {
		let char_current_level = this.getCharacterLevelByExp()
		let tableLength = this.getCharLevelTableLength()
		if (char_current_level >= tableLength) {
			char_current_level = tableLength
		}
		let char_base_exp_of_level = this.getCharacterLevelsExp(char_current_level-1) || 0
		let char_max_exp_of_level = this.getCharacterLevelsExp(char_current_level)
		return char_max_exp_of_level - char_base_exp_of_level
	}

	/* Should be called after calcStats */
	calcCoreBodyMax(bodyspec) {
		let strratio = toDecimal(this.core.bodyratio + Math.sqrt((this.stats.strength.base + this.stats.strength.talent) * 0.5 + this.stats.constitution) / 400, 3)
		let bslots = bodyspec.slots

		this.core.body.baseweight = this.core.genderratio * (bodyspec.baseweight.min + this.core.bodyratio * (bodyspec.baseweight.max - bodyspec.baseweight.min))

		this.core.body.slots.head.limit = this.core.genderratio * (bslots.head.min + strratio * (bslots.head.max - bslots.head.min))
		this.core.body.slots.ears.limit = this.core.genderratio * (bslots.ears.min + strratio * (bslots.ears.max - bslots.ears.min))
		this.core.body.slots.neck.limit = this.core.genderratio * (bslots.neck.min + strratio * (bslots.neck.max - bslots.neck.min))
		this.core.body.slots.chest.limit = this.core.genderratio * (bslots.chest.min + strratio * (bslots.chest.max - bslots.chest.min))
		this.core.body.slots.arms.limit = this.core.genderratio * (bslots.arms.min + strratio * (bslots.arms.max - bslots.arms.min))
		this.core.body.slots.hands.limit = this.core.genderratio * (bslots.hands.min + strratio * (bslots.hands.max - bslots.hands.min))
		this.core.body.slots.legs.limit = this.core.genderratio * (bslots.legs.min + strratio * (bslots.legs.max - bslots.legs.min))
		this.core.body.slots.feets.limit = this.core.genderratio * (bslots.feets.min + strratio * (bslots.feets.max - bslots.feets.min))
		if (bslots.hasOwnProperty("tail")) {
			this.core.body.slots.tail.limit = this.core.genderratio * (bslots.tail.min + strratio * (bslots.tail.max - bslots.tail.min))
		}
	}

	calcCoreBodyCurrent() {

	}

	calcPrimaryStat(statname) {
		// TO DO
		let bodytype = this.getBodyRatioType()
		let bodymultiplier = this.getBodyRatioMultiplier()
		let gendertype = this.getGenderRatioType()
		let gendermultiplier = this.getGenderRatioMultiplier()
		let racialdefault= this.stats.racialstat[statname]

		let charraw = racialdefault.rbase + racialdefault[bodytype] * bodymultiplier +  racialdefault[gendertype] * gendermultiplier
		this.stats[statname].base = Flr(charraw * (1 + toDecimal(this.core.level/10,2)))
		//this.stats[statname].talent = 2
		//this.stats[statname].skill = 0
		//this.stats[statname].equipment = 0
		if (statname === "wisdom") {
			this.stats[statname].equipment = 0
		}
		this.stats[statname].status = -6
	}

	calcPrimaryStats() {
		this.calcPrimaryStat("strength")
		this.calcPrimaryStat("constitution")
		this.calcPrimaryStat("agility")
		this.calcPrimaryStat("dexterity")
		this.calcPrimaryStat("intelligence")
		this.calcPrimaryStat("wisdom")
		this.calcPrimaryStat("charm")
		this.calcPrimaryStat("luck")
	}

	/* Positive or Negative */
	getBodyRatioType() {
		return this.core.bodyratio > 0.5 ? "positive" : "negative"
	}
	getBodyRatioMultiplier() {
		if (this.getBodyRatioType() === "positive") {
			return (this.core.bodyratio - 0.5) * 2
		} else {
			return (this.core.bodyratio - 0.5) * -2
		}
	}

	/* Positive or Negative */
	getGenderRatioType() {
		return this.core.genderratio > 1 ? "positive" : "negative"
	}
	getGenderRatioMultiplier() {
		if (this.getGenderRatioType() === "positive") {
			return (this.core.genderratio - 1) * 2
		} else {
			return (this.core.genderratio - 1) * -2
		}
	}


	/* base + talent + skill */
	getPrimaryStatGrowth(statname) {
		let stat = this.stats[statname]
		return stat.base + stat.talent + stat.skill
	}

	getPrimaryStatEquipment() {
		let stat = this.stats[statname]
		return stat.equipment
	}

	getPrimaryStatTotal(statname) {
		let stat = this.stats[statname]
		return stat.base + stat.talent + stat.skill + stat.equipment + stat.status
	}

	getSecondaryByGrowthRatio(statname, withCharm=false, withLuck=false) {
		let stat = this.stats.secondary[statname]
		let max = stat.ratio.strength * this.getPrimaryStatGrowth("strength")
		+ stat.ratio.constitution * this.getPrimaryStatGrowth("constitution")
		+ stat.ratio.agility * this.getPrimaryStatGrowth("agility")
		+ stat.ratio.dexterity * this.getPrimaryStatGrowth("dexterity")
		+ stat.ratio.intelligence * this.getPrimaryStatGrowth("intelligence")
		+ stat.ratio.wisdom * this.getPrimaryStatGrowth("wisdom")
		if (withCharm) { max += stat.ratio.charm * this.getPrimaryStatGrowth("charm") }
		if (withLuck) { max += stat.ratio.luck * this.getPrimaryStatGrowth("luck") }
		return Flr(max / 10)
	}

	getSecondaryByEquipmentRatio(statname, withCharm=false, withLuck=false) {
		let stat = this.stats.secondary[statname]
		let max = stat.ratio.strength * this.getPrimaryStatEquipment("strength")
		+ stat.ratio.constitution * this.getPrimaryStatEquipment("constitution")
		+ stat.ratio.agility * this.getPrimaryStatEquipment("agility")
		+ stat.ratio.dexterity * this.getPrimaryStatEquipment("dexterity")
		+ stat.ratio.intelligence * this.getPrimaryStatEquipment("intelligence")
		+ stat.ratio.wisdom * this.getPrimaryStatEquipment("wisdom")
		if (withCharm) { max += stat.ratio.charm * this.getPrimaryStatEquipment("charm") }
		if (withLuck) { max += stat.ratio.luck * this.getPrimaryStatEquipment("luck") }
		return Flr(max / 10)
	}

	getSecondaryByTotalRatio(statname, withCharm=false, withLuck=false) {
		let stat = this.stats.secondary[statname]
		let max = stat.ratio.strength * this.getPrimaryStatTotal("strength")
		+ stat.ratio.constitution * this.getPrimaryStatTotal("constitution")
		+ stat.ratio.agility * this.getPrimaryStatTotal("agility")
		+ stat.ratio.dexterity * this.getPrimaryStatTotal("dexterity")
		+ stat.ratio.intelligence * this.getPrimaryStatTotal("intelligence")
		+ stat.ratio.wisdom * this.getPrimaryStatTotal("wisdom")
		if (withCharm) { max += stat.ratio.charm * this.getPrimaryStatTotal("charm") }
		if (withLuck) { max += stat.ratio.luck * this.getPrimaryStatTotal("luck") }
		return Flr(max / 10)
	}

	getSecondaryBaseByTotalRatio(statname, withCharm=false, withLuck=false) {
		let stat = this.stats.secondary.base[statname]
		let max = stat.ratio.strength * this.getPrimaryStatTotal("strength")
		+ stat.ratio.constitution * this.getPrimaryStatTotal("constitution")
		+ stat.ratio.agility * this.getPrimaryStatTotal("agility")
		+ stat.ratio.dexterity * this.getPrimaryStatTotal("dexterity")
		+ stat.ratio.intelligence * this.getPrimaryStatTotal("intelligence")
		+ stat.ratio.wisdom * this.getPrimaryStatTotal("wisdom")
		if (withCharm) { max += stat.ratio.charm * this.getPrimaryStatTotal("charm") }
		if (withLuck) { max += stat.ratio.luck * this.getPrimaryStatTotal("luck") }
		return Flr(max / 10)
	}

	/* base offensive */
	calcAttack() {
		let stat = this.stats.secondary.base.attack
		this.stats.secondary.base.attack.value = this.getSecondaryBaseByTotalRatio("attack", true, true) 
	}
	calcMagicpower() {
		let stat = this.stats.secondary.base.magicpower
		this.stats.secondary.base.magicpower.value = this.getSecondaryBaseByTotalRatio("magicpower", true, true) 
	}
	calcPenetration() {
		let stat = this.stats.secondary.base.penetration
		this.stats.secondary.base.penetration.value = this.getSecondaryBaseByTotalRatio("penetration", true, true) 
	}
	calcAccuracy() {
		let stat = this.stats.secondary.base.accuracy
		this.stats.secondary.base.accuracy.value = this.getSecondaryBaseByTotalRatio("accuracy", true, true) 
	}
	calcCritical() {
		let stat = this.stats.secondary.base.critical
		this.stats.secondary.base.critical.value = this.getSecondaryBaseByTotalRatio("critical", true, true) 
	}
	calcCriticaldamage() {
		let stat = this.stats.secondary.base.criticaldamage
		this.stats.secondary.base.criticaldamage.value = this.getSecondaryBaseByTotalRatio("criticaldamage", true, true) 
	}
	calcParry() {
		let stat = this.stats.secondary.base.parry
		this.stats.secondary.base.parry.value = this.getSecondaryBaseByTotalRatio("parry", true, true) 
	}
	calcBlock() {
		let stat = this.stats.secondary.base.block
		this.stats.secondary.base.block.value = this.getSecondaryBaseByTotalRatio("block", true, true) 
	}

	/* defensive */
	calcThreat() {
		let stat = this.stats.secondary.threat
		this.stats.secondary.threat.value = this.getSecondaryByTotalRatio("threat", true, true) 
	}

	calcTenacity() {
		let stat = this.stats.secondary.tenacity
		this.stats.secondary.tenacity.value = this.getSecondaryByTotalRatio("tenacity", false, true)
	}

	calcWillpower() {
		let stat = this.stats.secondary.willpower
		this.stats.secondary.willpower.value = this.getSecondaryByTotalRatio("willpower", false, true)
	}

	calcEvasion() {
		let stat = this.stats.secondary.evasion
		this.stats.secondary.evasion.value = this.getSecondaryByTotalRatio("evasion", false, true)
	}

	calcDodge() {
		let stat = this.stats.secondary.dodge
		this.stats.secondary.dodge.value = this.getSecondaryByTotalRatio("dodge", false, true)
	}

	/* stats bt growth */

	calcHealth() {
		let stat = this.stats.secondary.health
		this.stats.secondary.health.max = this.getSecondaryByGrowthRatio("health")
		this.stats.secondary.health.upkeep = Flr(stat.default.upkeep * (1 + this.core.level / 30))
		this.stats.secondary.health.rest = Flr(stat.default.rest * (1 + this.core.level / 30))
	}

	calcStamina(upkeep, rest) {
		this.stats.secondary.stamina.max = this.getSecondaryByGrowthRatio("stamina")
		this.stats.secondary.stamina.upkeep = upkeep || Flr(1 * (1 + this.core.level / 50) + this.getPrimaryStatGrowth("constitution") / 100)
		this.stats.secondary.stamina.rest = rest || Flr(4 * (1 + this.core.level / 50) + this.getPrimaryStatGrowth("constitution") / 50)
	}

	calcSatiety(upkeep) {
		this.stats.secondary.satiety.max = this.getSecondaryByGrowthRatio("satiety")
		this.stats.secondary.satiety.upkeep = upkeep || Flr(1 * (1 + this.core.level / 50) + this.getPrimaryStatGrowth("constitution") / 100)
	}

	calcEnergy(upkeep, rest) {
		this.stats.secondary.energy.max = this.getSecondaryByGrowthRatio("energy")
		this.stats.secondary.energy.upkeep = upkeep || Flr(1 * (1 + this.core.level / 50) + this.getPrimaryStatGrowth("constitution") / 100)
		this.stats.secondary.energy.rest = rest || Flr(4 * (1 + this.core.level / 50) + this.getPrimaryStatGrowth("constitution") / 50)
	}

	calcSecondaryStats() {
		/* Stats by Total */
		this.calcAttack()
		this.calcMagicpower()
		this.calcPenetration()
		this.calcAccuracy()
		this.calcCritical()
		this.calcCriticaldamage()
		this.calcParry()
		this.calcBlock()

		this.calcThreat()
		this.calcTenacity()
		this.calcWillpower()
		this.calcEvasion()
		this.calcDodge()

		/* Stats by growth */
		this.calcHealth()
		this.calcStamina()
		this.calcSatiety()
		this.calcEnergy()
	}

	calcTalentPointsLevel() {
		if (this.core.level <= Data.talentPointsPerCharacterLevel.length) {
			this.stats.talentpoints.level = Data.talentPointsPerCharacterLevel[this.core.level-1]
		} else {
			let tableLength = Data.talentPointsPerCharacterLevel.length
			let additionalTalentPointPerLevelAfterCeil = Data.talentPointsPerCharacterLevel[tableLength-1] - Data.talentPointsPerCharacterLevel[tableLength-2]
			let additionalLevelOverTableLength = this.core.level - tableLength
			this.stats.talentpoints.level = Data.talentPointsPerCharacterLevel[tableLength-1] + additionalLevelOverTableLength * additionalTalentPointPerLevelAfterCeil
		}
	}


	/* count how much talent points can get from spirit */
	getTalentFromSpirit() {
		return Flr(Sqrt(this.core.exptospirit))
	}

	/* result from getTalentFromSpirit() */
	getSpiritUsedForTalent(talentpoints) {
		return Sq(talentpoints)
	}

	convertSpiritToTalent() {
		let newTalentPoints = this.getTalentFromSpirit()
		let usedSpiritForTalent = this.getSpiritUsedForTalent(newTalentPoints)
		this.core.exptospirit -= usedSpiritForTalent
		this.stats.talentpoints.spirit += newTalentPoints
	}

	calcTalentPointsTotal() {
		this.calcTalentPointsLevel()
		this.stats.talentpoints.total = this.stats.talentpoints.level + this.stats.talentpoints.spirit
	}

	getTalentPointsUsedForStat(statname) {
		let stattalent = this.stats[statname].talent
		if (stattalent === 0) {
			return 0
		} else {
			return this.getTlntPtsOnStat(stattalent)
		}
	}

	getTalentPointsUsedForAllStats() {
		return this.getTalentPointsUsedForStat("strength")
		+ this.getTalentPointsUsedForStat("constitution")
		+ this.getTalentPointsUsedForStat("agility")
		+ this.getTalentPointsUsedForStat("dexterity")
		+ this.getTalentPointsUsedForStat("intelligence")
		+ this.getTalentPointsUsedForStat("wisdom")
		+ this.getTalentPointsUsedForStat("charm")
		+ this.getTalentPointsUsedForStat("luck")
	}

	calcTalentPointsUnused() {
		let talentpointsused = this.getTalentPointsUsedForAllStats()
		let talentpointstotal = this.stats.talentpoints.total
		if (talentpointsused <= talentpointstotal) {
			this.stats.talentpoints.unused = talentpointstotal - talentpointsused
		} else {
			this.stats.talentpoints.unused = talentpointstotal - talentpointsused * 9000
			console.warn("It's not nice to modify the data =)")
		}
	}

	/* Talent Add TEMPORARY STATS */
	getTalentAddUsedForStat(statname) {
		return this.stats.talentpoints.addtemp[statname].upgradeused
	}

	getTalentAddUsedForAllStats() {
		return this.getTalentAddUsedForStat("strength")
		+ this.getTalentAddUsedForStat("constitution")
		+ this.getTalentAddUsedForStat("agility")
		+ this.getTalentAddUsedForStat("dexterity")
		+ this.getTalentAddUsedForStat("intelligence")
		+ this.getTalentAddUsedForStat("wisdom")
		+ this.getTalentAddUsedForStat("charm")
		+ this.getTalentAddUsedForStat("luck")
	}

	/* talent value per stat on talent add */
	getTalentAddAllUpgrade(statname) {
		return this.stats.talentpoints.addtemp[statname].upgrade
	}

	/* talent value of all stats on talent add */
	getTalentAddUpgradeForAllStats() {
		return this.getTalentAddAllUpgrade("strength")
		+ this.getTalentAddAllUpgrade("constitution")
		+ this.getTalentAddAllUpgrade("agility")
		+ this.getTalentAddAllUpgrade("dexterity")
		+ this.getTalentAddAllUpgrade("intelligence")
		+ this.getTalentAddAllUpgrade("wisdom")
		+ this.getTalentAddAllUpgrade("charm")
		+ this.getTalentAddAllUpgrade("luck")
	}

	/* talent points spent on talent stats */
	calcTalentSpent(statname) {
		this.stats.talentpoints.spent[statname] = this.getTlntPtsOnStat(this.stats[statname].talent)
	}

	calcTalentAllSpent() {
		this.calcTalentSpent("strength")
		this.calcTalentSpent("constitution")
		this.calcTalentSpent("agility")
		this.calcTalentSpent("dexterity")
		this.calcTalentSpent("intelligence")
		this.calcTalentSpent("wisdom")
		this.calcTalentSpent("charm")
		this.calcTalentSpent("luck")
		this.calcTalentPointsUnused()
	}

	calcTalentAdd() {
		this.stats.talentpoints.addtemp.unused = this.stats.talentpoints.unused - this.getTalentAddUsedForAllStats()
	}

	/* talent add */

	/* value: talent stat 
	 * UI > Talent Add > Pts Used (Current)
	 */
	getTlntPtsOnStat(value) {
		let tableLength = this.getTlntPtsPerStatLength()
		if (value <= tableLength) {
			return Flr(Data.talentPointsPerStat[value-1]) || 0
		} else {
			let valueOverCeil = value - tableLength
			let totalpointsCeil = Flr(Data.talentPointsPerStat[tableLength-1])
			let pointperstatafterceil = totalpointsCeil - Flr(Data.talentPointsPerStat[tableLength-2])
			return totalpointsCeil + valueOverCeil * pointperstatafterceil
		}
	}

	/* for buttons to upgrade talent, pts required to upgrade */
	getTlntPtsAtStat(base=0, value) {
		let basept = base > 0 ? this.getTlntPtsOnStat(base) : 0
		return this.getTlntPtsOnStat(value) - basept
	}

	getMaxStatFromTalentPoints(base, talentpoints) {
		let tableLength = this.getTlntPtsPerStatLength()
		let basept = base > 0 ? this.getTlntPtsOnStat(base) : 0
		let totalpoints = basept + talentpoints
		let maxstat = 0

		let tlntPtsOnMaxTableStat = this.getTlntPtsOnStat(tableLength)

		if (totalpoints <= this.getTlntPtsOnStat(tableLength)) {
			for (var u = base; u < tableLength; u++) {
				if (totalpoints >= this.getTlntPtsOnStat(u)) {
					maxstat++
				}
			}
			maxstat -= 1
		} else {
			let pointperstatafterceil = tlntPtsOnMaxTableStat - this.getTlntPtsOnStat(tableLength-1)
			let tlntPtsOnMaxTableStatMinusBasePt = tlntPtsOnMaxTableStat - basept
			let currentstat = tableLength - base

			maxstat = currentstat + Flr((talentpoints - tlntPtsOnMaxTableStatMinusBasePt) / pointperstatafterceil)
		}
		return maxstat
	}

	getTlntPtsPerStatLength() {
		return Data.talentPointsPerStat.length
	}

	getTlntPtsReqForUpgrade(statname, amount) {
		let tmpBaseTalent = this.stats[statname].talent + this.stats.talentpoints.addtemp[statname].upgrade
		if (this.stats.talentpoints.addtemp.unused < this.getTlntPtsAtStat(tmpBaseTalent, tmpBaseTalent+1)) {
			return false
		}
		if (amount === -1) { /* max */
			let amountFromUnusedPts = this.getMaxStatFromTalentPoints(tmpBaseTalent, this.stats.talentpoints.addtemp.unused)
			return this.getTlntPtsAtStat(tmpBaseTalent, tmpBaseTalent + amountFromUnusedPts)
		} else {
			return this.getTlntPtsAtStat(tmpBaseTalent, tmpBaseTalent + amount)
		}
	}

	resetTalentAdd() {
		this.stats.talentpoints.addtemp.strength.upgrade = 0
		this.stats.talentpoints.addtemp.strength.newstat =  this.stats.strength.talent + this.stats.talentpoints.addtemp.strength.upgrade
		this.stats.talentpoints.addtemp.strength.defaultused = 0
		this.stats.talentpoints.addtemp.strength.upgradeused = 0
		this.stats.talentpoints.addtemp.constitution.upgrade = 0
		this.stats.talentpoints.addtemp.constitution.newstat = this.stats.constitution.talent + this.stats.talentpoints.addtemp.constitution.upgrade
		this.stats.talentpoints.addtemp.constitution.defaultused = 0
		this.stats.talentpoints.addtemp.constitution.upgradeused = 0
		this.stats.talentpoints.addtemp.agility.upgrade = 0
		this.stats.talentpoints.addtemp.agility.newstat = this.stats.agility.talent + this.stats.talentpoints.addtemp.agility.upgrade
		this.stats.talentpoints.addtemp.agility.defaultused = 0
		this.stats.talentpoints.addtemp.agility.upgradeused = 0
		this.stats.talentpoints.addtemp.dexterity.upgrade = 0
		this.stats.talentpoints.addtemp.dexterity.newstat = this.stats.dexterity.talent + this.stats.talentpoints.addtemp.dexterity.upgrade
		this.stats.talentpoints.addtemp.dexterity.defaultused = 0
		this.stats.talentpoints.addtemp.dexterity.upgradeused = 0
		this.stats.talentpoints.addtemp.intelligence.upgrade = 0
		this.stats.talentpoints.addtemp.intelligence.newstat = this.stats.intelligence.talent + this.stats.talentpoints.addtemp.intelligence.upgrade
		this.stats.talentpoints.addtemp.intelligence.defaultused = 0
		this.stats.talentpoints.addtemp.intelligence.upgradeused = 0
		this.stats.talentpoints.addtemp.wisdom.upgrade = 0
		this.stats.talentpoints.addtemp.wisdom.newstat = this.stats.wisdom.talent + this.stats.talentpoints.addtemp.wisdom.upgrade
		this.stats.talentpoints.addtemp.wisdom.defaultused = 0
		this.stats.talentpoints.addtemp.wisdom.upgradeused = 0
		this.stats.talentpoints.addtemp.charm.upgrade = 0
		this.stats.talentpoints.addtemp.charm.newstat = this.stats.charm.talent + this.stats.talentpoints.addtemp.charm.upgrade
		this.stats.talentpoints.addtemp.charm.defaultused = 0
		this.stats.talentpoints.addtemp.charm.upgradeused = 0
		this.stats.talentpoints.addtemp.luck.upgrade = 0
		this.stats.talentpoints.addtemp.luck.newstat = this.stats.luck.talent + this.stats.talentpoints.addtemp.luck.upgrade
		this.stats.talentpoints.addtemp.luck.defaultused = 0
		this.stats.talentpoints.addtemp.luck.upgradeused = 0
		/* don't change the order or it won't undate the addtemp.unused */
		this.calcTalentAllSpent()
		this.calcTalentAdd()
	}

	upgradeTalentAdd(statname, amount) {
		let thisAmount = parseInt(amount)
		let tmpPreviousValue = this.stats[statname].talent + this.stats.talentpoints.addtemp[statname].upgrade
		if (thisAmount === -1) {
			let ptsReq = this.getTlntPtsReqForUpgrade(statname, thisAmount)
			if (ptsReq === false) {
				return false
			}
			thisAmount = this.getMaxStatFromTalentPoints(tmpPreviousValue, ptsReq)
		}
		this.stats.talentpoints.addtemp[statname].upgrade += thisAmount
		this.stats.talentpoints.addtemp[statname].newstat = tmpPreviousValue + thisAmount
		let talentpointsSpent = this.getTlntPtsAtStat(tmpPreviousValue, tmpPreviousValue + thisAmount)
		this.stats.talentpoints.addtemp[statname].upgradeused += talentpointsSpent
		this.stats.talentpoints.addtemp.unused -= talentpointsSpent
		if (this.stats.talentpoints.addtemp.unused < 0 ) {
			this.resetTalentAdd()
		}
	}

	talentAddtoTalentStat(statname) {
		this.stats[statname].talent += this.stats.talentpoints.addtemp[statname].upgrade
	}

	confirmTalentAdd() {
		this.talentAddtoTalentStat("strength")
		this.talentAddtoTalentStat("constitution")
		this.talentAddtoTalentStat("agility")
		this.talentAddtoTalentStat("dexterity")
		this.talentAddtoTalentStat("intelligence")
		this.talentAddtoTalentStat("wisdom")
		this.talentAddtoTalentStat("charm")
		this.talentAddtoTalentStat("luck")
		this.resetTalentAdd()
		/* update stamina|satiety|energy */
		this.calcSecondaryStats()
	}

	levelup() {
		let currentLevel = this.core.level
		this.calcCoreLevel()
		if (currentLevel === this.core.level) {
			return false
		}

		this.calcPrimaryStats()
		this.calcSecondaryStats()
		/* set current health to max*/

		this.calcTalentPointsTotal()
		/* don't change the order or it won't undate the addtemp.unused */
		this.calcTalentAllSpent()
		this.calcTalentAdd()
		// this.calcTalentPointsUnused() : called by calcTalentAllSpent()
	}

	/* call this if expectedexp is not === 0 */
	absorbingExp(ratio=1) {
		let baseExpToAbsorb = Math.min(this.core.level, 999)
		let totalWisdom = this.getPrimaryStatTotal("wisdom")
		let effectiveWistom = log10(totalWisdom)
		let expToAbsorb = Math.min(this.core.expectedexp, Flr((baseExpToAbsorb*3+5) * (1+effectiveWistom) * ratio) / 10)
		let expToAbsorbAfterEffectiveness = Flr(expToAbsorb / (1 + (Math.max(this.core.level, 999) - 999)/1000))
		this.core.exp += expToAbsorbAfterEffectiveness
		this.core.exptospirit += expToAbsorb - expToAbsorbAfterEffectiveness
		this.core.expectedexp -= expToAbsorb
		//console.log("rest effectiveness", Flr(expToAbsorb / (1 + (Math.max(this.core.level, 999) - 999)/100)) / expToAbsorb)
		this.levelup()
	}

}

export class Human extends UnitModel {
	constructor(unitid, name, bodyratio, gender) {
		super(1, unitid, bodyratio, gender)

		this.core.name = name.toString()

		/* for stamina/satiety/energy */
		if (this.core.gender === 1) {
			this.core.genderratio = 1.24
		} else if (this.core.gender === 2) {
			this.core.genderratio = 0.67
		}
		/* racial ratio */
		this.core.levelratio = 0.98

		this.defineRacialSpecifications()
		
		this.calcCoreLevel()
		this.calcPrimaryStats()
		this.calcSecondaryStats()
	}

	defineRacialSpecifications() {
		this.core.body.baseweight = 60000
		this.core.body.slots.head = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.ears = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.neck = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.chest = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.arms = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.hands = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.legs = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.feets = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.holdweaponright = {current: 0, limit: 0, type: 1, property: null}
		this.core.body.slots.holdweaponleft = {current: 0, limit: 0, type: 1, property: null}
		/* base stats */
		this.stats.racialstat = {
			strength: 		{rbase: 95, positive: 20, negative: -15},
			constitution: 	{rbase: 105, positive: 30, negative: -25},
			agility: 		{rbase: 85, positive: -30, negative: 25},
			dexterity: 		{rbase: 75, positive: -20, negative: 15},
			intelligence: 	{rbase: 100, positive: 40, negative: -15},
			wisdom: 		{rbase: 140, positive: 20, negative: -40},
			charm: 			{rbase: 95, positive: -40, negative: 15},
			luck: 			{rbase: 105, positive: -20, negative: 40}
		}
		/* secondary limits */
		this.stats.secondary.walkspeed.max = 255
		this.stats.secondary.runspeed.max = 1390
		this.stats.secondary.sprintspeed.max = 2550
	}

	calcCoreLevel() {
		return super.calcCoreLevel()
	}

	getCharacterLevelByExp() {
		return super.getCharacterLevelByExp()
	}
	getCharacterCurrentExpOfLevel() {
		return super.getCharacterCurrentExpOfLevel()
	}
	getCharacterCurrentLevelTotalExp() {
		return super.getCharacterCurrentLevelTotalExp()
	}

	calcCoreBodyMax() {
		const bodyspec = {
			baseweight: { min: 23985, max: 44030 },
			slots: {
				head: 	{ min: 1400, max: 1700 },
				ears: 	{ min: 135, max: 160 },
				neck: 	{ min: 400, max: 520 },
				chest: 	{ min: 9500, max: 16000 },
				arms: 	{ min: 4500, max: 7000 },
				hands: 	{ min: 500, max: 850 },
				legs: 	{ min: 7000, max: 16000 },
				feets: 	{ min: 850, max: 1400 },
			}
		}

		super.calcCoreBodyMax(bodyspec)
	}

	calcCoreStats() {

	}

}