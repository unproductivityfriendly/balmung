import {stringToFunction, toDecimal, GameObject, Flr, rng, rngmm, unique, arrsign} from './utils.js';
import {UnitModel, Human} from './unit.js';
import {SkillModel, PassiveSkill, ActiveSkill, ToggleSkill} from './skill.js';
import {ItemModel, ConsumableItem, MaterialItem, EquipmentItem, WeaponItem} from './item.js';
import {PartyModel} from './party.js';

export class GameEngine {
	constructor(gameInstance=null) {
		this.gameInstance = gameInstance
		this.frame = 1000
		this.fps = 1
		this.lastFrameTimeStamp = 0
		this.fpsmeter = null
		this.objectlimits = {
			character: 800,
			transport: 400,
		}
		this.rates = {
			exp: 1,
			restexp: 1,
			expabsorb: 1,
			skillexp: 1,
		}
		this.constances = {
			entitylists			: {
				units 			: {},
				resources 		: {},
				technologies 	: {},
				events 			: {},
				quests 			: {},

			},

			scenes 				: {},

			ui 					: {},
			uil 				: {},
			uie 				: {},

			buffs 				: {},
			modifiers 			: {}
		}
		this.characters = []
		this.parties = []

		this.newparty = {
			unitswithnoparty: [],
			hash: ""
		}

		this.nextid = {unit: 1, party: 1}
	}

	init(entitydata) {
		this.initConstances(entitydata.constances)
	}

	/* Add all entities as template */

	initConstances(cnstdata) {
		if (cnstdata.entitylists.hasOwnProperty('count') && cnstdata.entitylists.count > 0) {
			for (let i = cnstdata.entitylists.count - 1; i >= 0; i--) {
				let strID = GameObject.idToStringNumber(i+1)
				if (cnstdata.entitylists.hasOwnProperty('EL_'+strID) && cnstdata.entitylists['EL_'+strID].hasOwnProperty('grouptype')) {
					if (cnstdata.entitylists['EL_'+strID].grouptype === 'unit') {
						this.constances.entitylists.units['EL_'+strID] = cnstdata.entitylists['EL_'+strID]
					} else if (cnstdata.entitylists['EL_'+strID].grouptype === 'resource') {
						this.constances.entitylists.resources['EL_'+strID] = cnstdata.entitylists['EL_'+strID]
					} else if (cnstdata.entitylists['EL_'+strID].grouptype === 'technology') {
						this.constances.entitylists.technologies['EL_'+strID] = cnstdata.entitylists['EL_'+strID]
					} else if (cnstdata.entitylists['EL_'+strID].grouptype === 'event') {
						this.constances.entitylists.events['EL_'+strID] = cnstdata.entitylists['EL_'+strID]
					} else if (cnstdata.entitylists['EL_'+strID].grouptype === 'quest') {
						this.constances.entitylists.quests['EL_'+strID] = cnstdata.entitylists['EL_'+strID]
					}
				} else {throw new Error("initConstances: EL_"+strID+" is not a property.")}
			}
		}
	}

	loop() {
		let now = performance.now()
		this.frame += 1
		this.fps = toDecimal(1000 / (now - this.lastFrameTimeStamp), 0)
		this.lastFrameTimeStamp = now

		if (this.fpsmeter === null && document.getElementById("fpsmeterengine")) {
			this.fpsmeter = new FPSMeter(document.getElementById("fpsmeterengine"), {graph: 1, history: 20})
		}
		/**************************\
		|* CHECK QUEUES
		\**************************/

		/** Characters with no party (required to list units available to create a new party **/
		this.updateCharacterListWithoutParty()

		/** Characters Adventure **/
		/* State */

		/* Stamina */
		this.updateCharacters()

		/** Character Battle **/

		/*** fps meter ***/
		if (this.fpsmeter !== null) {
			this.fpsmeter.tick()
		}
	}


	loopResource() {

	}

	// 
	loadObjects() {

	}


	createCharacter(characterName="Hayenn", characterRace="Human", characterBodyratio=0.5, characterGender) {
		let charid = this.nextid.unit
		if (this.characters.length >= this.objectlimits.character) {
			return false
		}
		this.nextid.unit++

		if (characterRace === "Human") {
			//this.characters.push(new Human(charid, characterName, characterBodyratio, characterGender))
			let gender = characterGender || Math.round(rngmm(1,2))
			this.characters.push(new Human(charid, characterName, rngmm(30,70)/100, gender))
			this.characters[this.characters.length-1].core.exp = 100 /*Flr(rngmm(100,99999999))*/
			this.characters[this.characters.length-1].core.expectedexp = 999999999990 /*Flr(rngmm(100,9999999999))*/
			this.characters[this.characters.length-1].levelup()
			this.characters[this.characters.length-1].stats.secondary.stamina.current = Flr(rngmm(100,this.characters[this.characters.length-1].stats.secondary.stamina.max))
			this.characters[this.characters.length-1].stats.secondary.satiety.current = Flr(rngmm(100,this.characters[this.characters.length-1].stats.secondary.satiety.max))
			this.characters[this.characters.length-1].stats.secondary.energy.current = Flr(rngmm(100,this.characters[this.characters.length-1].stats.secondary.energy.max))

			this.characters[this.characters.length-1].stats.secondary.health.current = Flr(this.characters[this.characters.length-1].stats.secondary.health.max)
		}
	}

	createParty(leaderID, leaderName="") {
		let partyid = this.nextid.party
		this.nextid.party++

		let leaderInstance = this.getUnitInstance(leaderID)
		if (leaderInstance.core.hasOwnProperty("unitid") && leaderInstance.core.unitid === leaderID) {
			leaderInstance.party.partyid = partyid
			if (leaderName === "") {
				leaderName = leaderInstance.core.name
			}
			this.parties.push(new PartyModel(partyid, leaderID, leaderName+"'s party"))
			return partyid
		} else {
			console.log("unitid not found, can't create the party")
			this.nextid.party--
			return false
		}
		
	}

	createItem(itemID) {
		let newItem = null
		/* 1=consumable, 2=material, 3=equipment, 4=weapon, 5=magic gem, 6=currency */
		if (itemID >= 1000 && itemID <= 1999) {
			newItem = new ConsumableItem(itemID, undefined, Flr(rngmm(1, 500 + 1)))
		} else if (itemID >= 2000 && itemID <= 2999) {
			newItem = new MaterialItem(itemID, undefined, Flr(rngmm(1, 500 + 1)))
		} else if (itemID >= 3000 && itemID <= 3999) {
			newItem = new EquipmentItem(itemID, undefined, Flr(rngmm(1, 500 + 1)))
		} else if (itemID >= 4000 && itemID <= 4999) {
			newItem = new WeaponItem(itemID, undefined, Flr(rngmm(1, 500 + 1)))
		} else if (itemID >= 5000 && itemID <= 5999) {
			newItem = new GemItem(itemID, undefined, Flr(rngmm(1, 500 + 1)))
		} else if (itemID >= 6000 && itemID <= 6999) {
			newItem = new CurrencyItem(itemID, undefined, Flr(rngmm(1, 500 + 1)))
		}
		console.log("New Item with ID: " + itemID)
		console.log(newItem)
	}

	loadCharacter() {
		/* load basic data */

		/* set current values */

		/* set status (buff/debuff) */
	}

	loadItem(itemData) {
		let newItem = null
		/* 1=consumable, 2=material, 3=equipment, 4=weapon, 5=magic gem, 6=currency */
		if (itemData[0] >= 1000 && itemData[0] <= 1999) {
			newItem = new ConsumableItem(itemData[0], undefined, itemData[1])
		} else if (itemData[0] >= 2000 && itemData[0] <= 2999) {
			newItem = new MaterialItem(itemData[0], undefined, itemData[1])
		} else if (itemData[0] >= 3000 && itemData[0] <= 3999) {
			newItem = new EquipmentItem(itemData[0], undefined, itemData[1], itemData[2][0], itemData[2][1], itemData[3], itemData[4], itemData[7], itemData[8], itemData[9])
		} else if (itemData[0] >= 4000 && itemData[0] <= 4999) {
			newItem = new WeaponItem(itemData[0], undefined, itemData[1], itemData[2][0], itemData[2][1], itemData[3], itemData[4], itemData[7], itemData[8], itemData[9], itemData[10])
		} else if (itemData[0] >= 5000 && itemData[0] <= 5999) {
			newItem = new GemItem(itemData[0], undefined, itemData[1])
		} else if (itemData[0] >= 6000 && itemData[0] <= 6999) {
			newItem = new CurrencyItem(itemData[0])
		}

	}

	loadParty() {

	}

	loadData() {

	}

	/* get instances */

	getUnitInstance(unitid) {
		for (var i = 0; i < this.characters.length; i++) {
			if (this.characters[i].core.unitid === unitid) {
				return this.characters[i]
			}
		}
	}

	getPartyInstance(partyid) {
		for (var i = 0; i < this.parties.length; i++) {
			if (this.parties[i].core.partyid === partyid) {
				return this.parties[i]
			}
		}
	}


	/**************************************************\
	 * this is the natural stamina upkeep/rest 
	 * only update 1/20th of characters every 20 frames
	\**************************************************/
	updateCharacters() {
		let frameBundle = this.frame % 20

		for (var i = frameBundle; i < this.characters.length; i+=20) {
			this.characters[i].living(this.rates.exp,this.rates.restexp,this.rates.expabsorb)
		}
	}

	updateCharacterListWithoutParty() {
		let frameBundle = this.frame % 20
		/* only update once every 20 frames */
		if (frameBundle !== 5) {
			return false
		}

		let listofUpdatedCharacters = []
		for (var i = 0; i < this.characters.length; i++) {
			if (this.characters[i].core.unittype === 1 && this.characters[i].party.partyid === 0) {
				listofUpdatedCharacters.push(this.characters[i].core.unitid)
			}
		}

		this.newparty.unitswithnoparty = unique(listofUpdatedCharacters)
		let newhash = arrsign(this.newparty.unitswithnoparty)
		if (newhash !== this.newparty.hash) {
			this.newparty.hash = newhash
		}
		
	}

	createBuilding() {

	}
/*	createEnvironment(svg,params) {
		doMap(svg,params)
	}*/


}