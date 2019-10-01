import {stringToFunction, toDecimal, GameObject, Flr, rng, rngmm, unique, arrsign} from './utils.js';
import {UnitModel, Human} from './unit.js';
import {PartyModel} from './party.js';

export class GameEngine {
	constructor() {
		this.frame = 1000
		this.fps = 1
		this.lastFrameTimeStamp = 0
		this.fpsmeter = null

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
		this.updateCharactersStamina()

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
		this.nextid.unit++

		if (characterRace === "Human") {
			//this.characters.push(new Human(charid, characterName, characterBodyratio, characterGender))
			let gender = characterGender || Math.round(rngmm(1,2))
			this.characters.push(new Human(charid, characterName, rngmm(0,100)/100, gender))
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

	loadCharacter() {
		/* load basic data */

		/* set current values */

		/* set status (buff/debuff) */
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
	updateCharactersStamina() {
		let frameBundle = this.frame % 20

		for (var i = frameBundle; i < this.characters.length; i+=20) {
			this.characters[i].living()
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