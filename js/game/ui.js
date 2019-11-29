import {stringToFunction, gameInitHTML, GameObject, toDecimal, Cl, isN, notZ, Flr} from './utils.js';
import {characterRace, characterGender} from './data.js';
import {txt} from './locale.js';


export class UserInterface {
	constructor(gameInstance=null) {
		this.initialized = false
		this.running = false
		this.gameInstance = gameInstance
		this.fps     = 20
		this.zoom    = 1
		this.zoommag = 0
		this.defaultSVG = {
			ox: 0,
			oy: 100,
			w: 1865,
			h: 817
		}
		this.posSVG = {x: 0, y: 0}
		this.gameui = {
			partyview: {
				loaded: false,
				template: {
					group: null,
					groupprefix: "party-group-",
					raid: null,
					raidprefix: "party-raid-",
				},
				currentview: 1
			},
			newpartyview: {
				loaded: false,
				template: {
					characterwithoutparty: null,
					characterwithoutpartyprefix: "pt-leader-"
				},
				currentlist: []
			},
			groupunitview: {
				loaded: false,
				template: {
					character: null,
					characterprefix: "groupunit-char-",
					transport: null,
					transportprefix: "groupunit-trns-",
				},

				currentview: 1
				/**********************************\
				 * 1 = character view
				 * 2 = vehicle view
				\**********************************/
			},
			unitview: {
				loaded: false,
				template: {
					character: null,
					characterprefix: "unit-char-",
					transport: null,
					transportprefix: "unit-trns-",
				},

				currentview: 1
				/**********************************\
				 * 1 = character view
				 * 2 = vehicle view
				\**********************************/
			},
			bodyview: {
				loaded: false,
				template: {
					party: null,
					character: null,
					transport: null,
					map: null
				},
				currentview: 0,
				currentsubview: {
					group: 0,
					unit: 0,
				},
				subviewspecs: {
					group: {
						currentview: 1,
						/**********************************\
						 * 1 = overview view
						 * 2 = units view
						 * 3 = inventories view
						 * 4 = tasks view
						 * 5 = map view
						\**********************************/
						showinventory: false,
					},
					groupnew: {
						unitlisthash: ""
					},
					unit: {
						currentview: 1,
						/**********************************\
						 * 1 = information view
						 * 2 = skills view
						 * 3 = inventory view
						 * 4 = titles view
						\**********************************/
						showtalentadd: false
					}
				}
				/**********************************\
				 * 1 = party view
				 * 2 = character view
				 * 3 = transport view
				 * 4 = map view
				\**********************************/
			},
			maplogview: {
				loaded: false
			},
			debug: {
				loaded: false,
				fpsuimeter: null
			}
		}

		this.column2 = {
			current: 1,
			default: 1,
			listorder: ["unitlist", "groupunitlist", "raidunitlist"]
			/**********************************\
			 * 1 = unitlist view
			 * 2 = groupunitlist view
			 * 3 = raidunitlist view
			\**********************************/
		}

		/* needs to be the same as this.gameui properties */
		this.viewlist = ["partyview", "unitview", "groupunitview", "raidunitview", "bodyview", "maplogview"]
		/* =================== */
		this.attributeName = "game-ui-init"

		gameInitHTML(this.attributeName+"-party")
		gameInitHTML(this.attributeName+"-unit")
		gameInitHTML(this.attributeName+"-groupunit")
		gameInitHTML(this.attributeName+"-raidunit")
		gameInitHTML(this.attributeName+"-main")
		gameInitHTML(this.attributeName+"-maplog")
		gameInitHTML(this.attributeName+"-debug")
	}

	initViews() {
		if (this.gameui.partyview.loaded === true
			&& this.gameui.unitview.loaded === true
			&& this.gameui.bodyview.loaded === true
			&& this.gameui.maplogview.loaded === true
			&& this.gameui.debug.loaded === true) {

			this.initialized = true

			/* load templates */
			this.loadTemplates()

			/* set UI Events */
			this.initHandler(this)

			/* debug */
			this.constructor.eleByID("settingfps").addEventListener("change", function (e) {
				window.gamesettings.framerate = parseInt(this.value);
			});
			/* fps meter */
			this.gameui.debug.fpsuimeter = new FPSMeter(UserInterface.eleByID("fpsmetercontainer"), {graph: 1, history: 20})


		} else {
			if (this.gameui.partyview.loaded !== true && this.constructor.eleByID("partyview-loaded") !== null) {
				this.gameui.partyview.loaded = true
				console.log("partyview loaded")
			}
			if (this.gameui.unitview.loaded !== true && this.constructor.eleByID("unitview-loaded") !== null) {
				this.gameui.unitview.loaded = true
				console.log("unitview loaded")
			}
			if (this.gameui.bodyview.loaded !== true && this.constructor.eleByID("bodyview-loaded") !== null) {
				this.gameui.bodyview.loaded = true
				console.log("bodyview loaded")
			}
			if (this.gameui.maplogview.loaded !== true && this.constructor.eleByID("maplogview-loaded") !== null) {
				this.gameui.maplogview.loaded = true
				console.log("maplogview loaded")
			}
			if (this.gameui.debug.loaded !== true && this.constructor.eleByID("debug-loaded") !== null) {
				this.gameui.debug.loaded = true
				console.log("debug loaded")
			}
		}
	}


	/* ******************************** *\
	 * ******************************** *
	 * HANDLERS
	 * ******************************** *
	\* ******************************** */
	initHandler(thatInstance) {
		let that = thatInstance
		function eleHandle(id) {
			return document.getElementById(id)
		}

		/* Party View */
		eleHandle("setdata-party-groups").onclick = function () {
			that.gameui.partyview.currentview = 1
		}
		eleHandle("setdata-party-raids").onclick = function () {
			that.gameui.partyview.currentview = 2
		}
		
		/* Create new Party */
		eleHandle("setdata-party-newparty").onclick = function () {
			that.gameui.bodyview.currentview = 5
		}

		/* Unit View */
		eleHandle("setdata-unit-characters").onclick = function () {
			that.gameui.unitview.currentview = 1
		}
		eleHandle("setdata-unit-transports").onclick = function () {
			that.gameui.unitview.currentview = 2
		}

		/* Group Unit View */
		eleHandle("close-column2-group").onclick = function () {
			that.column2.current = that.column2.default
		}

		/* Raid Unit View */
		eleHandle("close-column2-raid").onclick = function () {
			that.column2.current = that.column2.default
		}


		/* Body View */
		/* Body View > Overview */
		eleHandle("main-title-overview").onclick = function () {
			that.gameui.bodyview.currentview = 0
		}
		/* Body View > New Party */

		/* Body View > Group > Subviews */
		eleHandle("main-group-submenu-overview").onclick = function () {
			that.gameui.bodyview.subviewspecs.group.currentview = 1
		}
		eleHandle("main-group-submenu-units").onclick = function () {
			that.gameui.bodyview.subviewspecs.group.currentview = 2
		}
		eleHandle("main-group-submenu-inventories").onclick = function () {
			that.gameui.bodyview.subviewspecs.group.currentview = 3
		}
		eleHandle("main-group-submenu-tasks").onclick = function () {
			that.gameui.bodyview.subviewspecs.group.currentview = 4
		}
		eleHandle("main-group-submenu-map").onclick = function () {
			that.gameui.bodyview.subviewspecs.group.currentview = 5
		}

		/* Body View > Unit > Subview */
		eleHandle("main-unit-uch-submenu-information").onclick = function () {
			that.gameui.bodyview.subviewspecs.unit.currentview = 1
		}
		eleHandle("main-unit-uch-submenu-skills").onclick = function () {
			that.gameui.bodyview.subviewspecs.unit.currentview = 2
		}
		eleHandle("main-unit-uch-submenu-inventory").onclick = function () {
			that.gameui.bodyview.subviewspecs.unit.currentview = 3
		}
		eleHandle("main-unit-uch-submenu-titles").onclick = function () {
			that.gameui.bodyview.subviewspecs.unit.currentview = 4
		}
		
		/* Body View > Unit > Talent Add Toggle */
		eleHandle("main-uch-talent-add-show-button").onclick = function () {
			that.gameui.bodyview.subviewspecs.unit.showtalentadd = true
		}
		eleHandle("main-uch-talent-add-hide-button").onclick = function () {
			that.gameui.bodyview.subviewspecs.unit.showtalentadd = false
		}
	}

	/* Handler > Unit View > Unit */
	clickParty(thatInstance, partyElementID, viewtype) {
		let that = thatInstance
		function eleHandle(id) {
			return document.getElementById(id)
		}
		eleHandle(partyElementID).onclick = function () {
			that.column2.current = 2
			that.gameui.bodyview.currentview = viewtype
			that.gameui.bodyview.currentsubview.party = parseInt(this.getAttribute("data-partyid"))
		}
	}

	/* Handler > Unit View > Unit */
	clickUnit(thatInstance, unitElementID, viewtype) {
		let that = thatInstance
		function eleHandle(id) {
			return document.getElementById(id)
		}
		eleHandle(unitElementID).onclick = function () {
			that.gameui.bodyview.currentview = viewtype
			that.gameui.bodyview.currentsubview.unit = parseInt(this.getAttribute("data-unitid"))
		}
	}

	/* Handler > Body View > New Party > Unit 
		with create a new party with this unit as leader, and switch to the party view */
	clickNewPartyUnit(thatInstance, unitElementID, viewtype) {
		let that = thatInstance
		function eleHandle(id) {
			return document.getElementById(id)
		}
		eleHandle(unitElementID).onclick = function () {
			that.gameui.bodyview.currentview = viewtype
			that.gameui.bodyview.currentsubview.party = that.gameInstance.engine.createParty(parseInt(this.getAttribute("data-unitid")))
			that.column2.current = 2
		}
	}

	/* Handler > Body View > Unit > Talent */
	clickTalentUpgrade(elementID, unitScope, statname, value) {
		function eleHandle(id) {
			return document.getElementById(id)
		}
		eleHandle(elementID).onclick = function () {
			if (this.getAttribute("data-v") === "false" || this.getAttribute("data-v") === "0") {
				return false
			}
			unitScope.upgradeTalentAdd(statname, value)
		}
	}
	clickTalentAddReset(elementID, unitScope) {
		function eleHandle(id) {
			return document.getElementById(id)
		}
		eleHandle(elementID).onclick = function () {
			if (this.getAttribute("data-v") === "false" || this.getAttribute("data-v") === "0") {
				return false
			}
			unitScope.resetTalentAdd()
		}
	}
	clickTalentAddConfirm(elementID, unitScope) {
		function eleHandle(id) {
			return document.getElementById(id)
		}
		eleHandle(elementID).onclick = function () {
			if (this.getAttribute("data-v") === "false" || this.getAttribute("data-v") === "0") {
				return false
			}
			unitScope.confirmTalentAdd()
		}
	}


	/* ******************************** *\
	 * ******************************** *
	 * Party View
	 * ******************************** *
	\* ******************************** */
	loadTemplates() {
		/* **************** *\
		 * Party View
		\* **************** */

		/*** party list ***/
		/*** group list ***/
		this.gameui.partyview.template.group = this.constructor.eleByID("party-group-tmp")
		/*** raid list ***/
		this.gameui.partyview.template.raid = this.constructor.eleByID("party-raid-tmp")

		/* **************** *\
		 * Unit View
		\* **************** */

		/*** char list ***/
		this.gameui.unitview.template.character = this.constructor.eleByID("unit-char-tmp")
		/*** transport list ***/
		this.gameui.unitview.template.transport = this.constructor.eleByID("unit-trns-tmp")

		/* **************** *\
		 * Group Unit View
		\* **************** */

		/*** party unit list ***/

		/* **************** *\
		 * Raid Unit View
		\* **************** */

		/*** party unit list ***/

		/* **************** *\
		 * Main View
		\* **************** */

		/*** new party ***/
		this.gameui.newpartyview.template.characterwithoutparty = this.constructor.eleByID("pt-leader-tmp")
	}

	loop(gameEngine, dateFormated="test") {
		if (this.initialized === false) { 
			this.initViews()
		} else {
			this.updateClock(dateFormated)

			/* Column 1*/
			this.loopPartyList(gameEngine)

			/* only update one view of the 2nd column */
			let col2views = this.column2.listorder
			for (var i = 0; i < col2views.length; i++) {
				if (i + 1 === this.column2.current) {
					// view to show
					this.constructor.updateAttributeByID(col2views[i], "data-showlist", "1")
				} else {
					// view to hide
					this.constructor.updateAttributeByID(col2views[i], "data-showlist", "0")
				}
			}

			/* Column 2 */
			if (this.column2.current === 1) {
				this.loopUnitList(gameEngine)
			} else if (this.column2.current === 2) {
				this.loopGroupList(gameEngine)
			} else if (this.column2.current === 3) {
				this.loopRaidList(gameEngine)
			}

			/* Column 3 (main) */
			this.loopBodyView(gameEngine)

			/* Column 4 */
			this.loopMapLogView(gameEngine)

			this.gameui.debug.fpsuimeter.tick()
		}
	}

	updateClock(clockText="##-##-## ##:##:##") {
		//this.constructor.updateTextByID("worldclock",clockText)
	}

	loopPartyList(gameEngine) {
		if (gameEngine.parties.length === 0) {
			return false
		}
		let groupCount = 0
		let raidCount = 0

		for (var i = 0; i < gameEngine.parties.length; i++) {
			if (gameEngine.parties[i].core.partytype === 1) {
				/* update only if we are in the character view */
				if (this.gameui.partyview.currentview === 1) {
					let partyElement = this.constructor.eleByID(this.gameui.partyview.template.groupprefix + gameEngine.parties[i].core.partyid)
					this.updatePartyListGroup(partyElement, gameEngine.parties[i])
				}
				groupCount++
			} else if (this.gameui.partyview.currentview === 1 
				&& gameEngine.parties[i].core.partytype === 2
				&& this.constructor.eleByID(this.gameui.partyview.template.groupprefix + gameEngine.parties[i].core.partyid)) {
				/* remove partytype 2 from view 1 */
				this.constructor.rmByID(this.gameui.partyview.template.groupprefix + gameEngine.parties[i].core.partyid)
			} else if (gameEngine.parties[i].core.partytype === 2) {
				/* update only if we are in the character view */
				if (this.gameui.partyview.currentview === 2) {
					let partyElement = this.constructor.eleByID(this.gameui.partyview.template.raidprefix + gameEngine.parties[i].core.partyid)
					this.updatePartyListRaid(partyElement, gameEngine.parties[i])
				}
				raidCount++
			} else if (this.gameui.partyview.currentview === 2
				&& gameEngine.parties[i].core.partytype === 1
				&& this.constructor.eleByID(this.gameui.partyview.template.raidprefix + gameEngine.parties[i].core.partyid)) {
				/* remove partytype 1 from view 2 */
				this.constructor.rmByID(this.gameui.partyview.template.raidprefix + gameEngine.parties[i].core.partyid)
			} else {
				console.warn("ui.loopPartyList(): unexpected view ID "+this.gameui.partyview.currentview)
			}
		}
		this.updatePartyListHeader(groupCount, raidCount)
	}

	loopUnitList(gameEngine) {
		if (gameEngine.characters.length === 0) {
			return false
		}
		let characterCount = 0
		let transportCount = 0

		for (var i = 0; i < gameEngine.characters.length; i++) {
			if (gameEngine.characters[i].core.unittype === 1) {
				/* update only if we are in the character view */
				if (this.gameui.unitview.currentview === 1) {
					let unitElement = this.constructor.eleByID(this.gameui.unitview.template.characterprefix + gameEngine.characters[i].core.unitid)
					this.updateUnitListCharacter(unitElement, gameEngine.characters[i])
				}
				characterCount++
			} else if (this.gameui.unitview.currentview === 1 
				&& gameEngine.characters[i].core.unittype === 2
				&& this.constructor.eleByID(this.gameui.unitview.template.characterprefix + gameEngine.characters[i].core.unitid)) {
				/* remove unittype 2 from view 1 */
				this.constructor.rmByID(this.gameui.unitview.template.characterprefix + gameEngine.characters[i].core.unitid)
			} else if (gameEngine.characters[i].core.unittype === 2) {
				/* update only if we are in the character view */
				if (this.gameui.unitview.currentview === 2) {
					let unitElement = this.constructor.eleByID(this.gameui.unitview.template.transportprefix + gameEngine.characters[i].core.unitid)
					this.updateUnitListTransport(unitElement, gameEngine.characters[i])
				}
				transportCount++
			} else if (this.gameui.unitview.currentview === 2
				&& gameEngine.characters[i].core.unittype === 1
				&& this.constructor.eleByID(this.gameui.unitview.template.characterprefix + gameEngine.characters[i].core.unitid)) {
				/* remove unittype 1 from view 2 */
				this.constructor.rmByID(this.gameui.unitview.template.transportprefix + gameEngine.characters[i].core.unitid)
			} else {
				console.warn("ui.loopUnitList(): unexpected view ID "+this.gameui.unitview.currentview)
			}
		}
		this.updateUnitListHeader(characterCount, transportCount)
	}

	loopGroupList(gameEngine) {
		
	}

	loopRaidList(gameEngine) {
		
	}

	loopBodyView(gameEngine) {
		// TO DO
		if (this.gameui.bodyview.currentview === 0) {
			// update overview
			// TO DO
		} else if (this.gameui.bodyview.currentview === 1) {
			// update party
			this.updateBodyPartyView(gameEngine)
		} else if (this.gameui.bodyview.currentview === 2) {
			// update character
			this.updateBodyCharacterView(gameEngine)
		} else if (this.gameui.bodyview.currentview === 3) {
			// update transport
			// TO DO
		} else if (this.gameui.bodyview.currentview === 4) {
			// update map buildings
			// TO DO
		} else if (this.gameui.bodyview.currentview === 5) {
			// creat new party
			this.updateBodyNewPartyView(gameEngine)
		} else if (this.gameui.bodyview.currentview === 6) {
			// update raid
			this.updateBodyRaidView(gameEngine)
		} else {
			console.warn("ui.loopBodyView(): unexpected view ID "+this.gameui.bodyview.currentview)
		}

		this.updateBodyViewHeader()
	}

	loopMapLogView(gameEngine) {
		
		txt("worldtime", undefined, [this.gameInstance.currentWorld.dateFormat.toString()])
	}
	/**********************************\
	 * Update Elements
	\**********************************/
	/* Party List */

	updatePartyListHeader(groupCount, raidCount) {
		this.constructor.updateAttributeByID("party-submenu", "data-view", this.gameui.partyview.currentview)
		this.constructor.updateAttributeByID("party-body", "data-view", this.gameui.partyview.currentview)
		txt("groupcount", undefined, [groupCount.toString()])
		txt("raidcount", undefined, [raidCount.toString()])
	}

	updatePartyListParty() {


	}

	updatePartyListAdd() {

	}

	/* Party List */
	// TO DU

	updatePartyListGroup(partyElement, groupData) {
		let partyElementID = this.gameui.partyview.template.groupprefix + groupData.core.partyid
		/* create the element if not already created*/
		if (partyElement === null) {
			//console.log("new "+groupData.core.partyid)
			let newpartyElement = this.constructor.newEleFromModel(this.gameui.partyview.template.group)
			
			newpartyElement.id = partyElementID
			/* render the element for first time */
			this.constructor.eleByID("party-group-list").appendChild(newpartyElement)
			/* set attributes (those should be one time only */
			this.constructor.updateAttributeBySelector("#"+partyElementID, "data-partyid", groupData.core.partyid)
			/* set ID for group name element */
			this.constructor.updateAttributeBySelector("#"+partyElementID+" .party-name", "id", partyElementID+"-name")
			/* set the group name */
			txt(partyElementID+"-name", undefined, [groupData.core.name])
			this.clickParty(this, partyElementID, 1)
		} else {

		}
		/* update data */

		/* update attributes */
		// TO DO
	}

	updatePartyListRaid(partyElement, characterData) {
		let partyElementID = this.gameui.partyview.template.characterprefix + characterData.core.partyid
		/* create the element if not already created*/
		if (partyElement === null) {
			//console.log("new "+characterData.core.partyid)
			let newpartyElement = this.constructor.newEleFromModel(this.gameui.partyview.template.character)
			
			newpartyElement.id = partyElementID
			/* render the element for first time */
			this.constructor.eleByID("party-raid-list").appendChild(newpartyElement)
			/* set attributes (those should be one time only */
			this.constructor.updateAttributeBySelector("#"+partyElementID, "data-partyid", characterData.core.partyid)
			/* set ID for character name element */
			this.constructor.updateAttributeBySelector("#"+partyElementID+" .unit-name", "id", partyElementID+"-name")
			/* set the character name */
			txt(partyElementID+"-name", undefined, [characterData.core.name])
			this.clickParty(this, partyElementID, 6)
		} else {

		}
		/* update data */

		/* update attributes */
		// TO DO
	}

	/* Unit List */
	updateUnitListHeader(characterCount, transportCount) {
		this.constructor.updateAttributeByID("unit-submenu", "data-view", this.gameui.unitview.currentview)
		this.constructor.updateAttributeByID("unit-body", "data-view", this.gameui.unitview.currentview)
		txt("charcount", undefined, [characterCount.toString()])
		txt("trnscount", undefined, [transportCount.toString()])
	}
	updateUnitListCharacter(unitElement, characterData) {
		let unitElementID = this.gameui.unitview.template.characterprefix + characterData.core.unitid
		/* create the element if not already created*/
		if (unitElement === null) {
			//console.log("new "+characterData.core.unitid)
			let newUnitElement = this.constructor.newEleFromModel(this.gameui.unitview.template.character)
			
			newUnitElement.id = unitElementID
			/* render the element for first time */
			this.constructor.eleByID("unit-char-list").appendChild(newUnitElement)
			/* set attributes (those should be one time only */
			this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitid", characterData.core.unitid)
			this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitrace", characterData.core.race)
			this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitgender", characterData.core.gender)
			/* set ID for character name element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-name", "id", unitElementID+"-name")
			/* set the character name */
			txt(unitElementID+"-name", undefined, [characterData.core.name])
			/* set ID for character livingstatus element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-livingstatus", "id", unitElementID+"-livingstatus")
			/* set ID for character level element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-level", "id", unitElementID+"-level")
			/* set ID for character stamina element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-stamina", "id", unitElementID+"-stamina")
			/* set ID for character satiety element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-satiety", "id", unitElementID+"-satiety")
			/* set ID for character energy element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-energy", "id", unitElementID+"-energy")

			this.clickUnit(this, unitElementID, 2)
		} else {

		}
		/* update data */

		/* update attributes */
		/* set character level */

		this.constructor.updateAttributeByID(unitElementID+"-level", "data-v", characterData.core.level)
		/* set stamina level */
		let staminaPercent = Cl(characterData.stats.secondary.stamina.current / characterData.stats.secondary.stamina.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-stamina", "data-v", staminaPercent)
		if (staminaPercent != 100) {
			txt(unitElementID+"-stamina", undefined, [staminaPercent])
		} else {
			txt(unitElementID+"-stamina", "stamina")
		}
		
		/* set satiety level */
		let satietyPercent = Cl(characterData.stats.secondary.satiety.current / characterData.stats.secondary.satiety.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-satiety", "data-v", satietyPercent)
		if (satietyPercent != 100) {
			txt(unitElementID+"-satiety", undefined, [satietyPercent])
		} else {
			txt(unitElementID+"-satiety", "satiety")
		}
		/* set energy level */
		let energyPercent = Cl(characterData.stats.secondary.energy.current / characterData.stats.secondary.energy.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-energy", "data-v", energyPercent)
		if (energyPercent != 100) {
			txt(unitElementID+"-energy", undefined, [energyPercent])
		} else {
			txt(unitElementID+"-energy", "energy")
		}
	}
	updateUnitListTransport(unitElement, transportData) {
		let unitElementID = this.gameui.unitview.template.characterprefix + transportData.core.unitid
		/* create the element if not already created*/
		if (unitElement === null) {
			//console.log("new "+transportData.core.unitid)
			let newUnitElement = this.constructor.newEleFromModel(this.gameui.unitview.template.transport)
			
			newUnitElement.id = unitElementID
			/* render the element for first time */
			this.constructor.eleByID("unit-trns-list").appendChild(newUnitElement)
			/* set attributes (those should be one time only */
			this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitid", transportData.core.unitid)
			/* set ID for character name element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-name", "id", unitElementID+"-name")
			/* set the character name */
			txt(unitElementID+"-name", undefined, [transportData.core.name])
			/* set ID for character livingstatus element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-livingstatus", "id", unitElementID+"-livingstatus")
			/* set ID for character level element */
			this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-level", "id", unitElementID+"-level")

			this.clickUnit(this, unitElementID, 3)
		}
		/* update data */

		/* update attributes */
		/* set transport level */

		this.constructor.updateAttributeByID(unitElementID+"-level", "data-v", transportData.core.level)
	}

	/* **************** *
	 * **************** *
	 *	Main View 		*
	 * **************** *
	 * **************** */
	updateBodyViewHeader() {
		this.constructor.updateAttributeByID("main-title", "data-view", this.gameui.bodyview.currentview)
		this.constructor.updateAttributeByID("main-body", "data-view", this.gameui.bodyview.currentview)
	}

	/* Main View > Overview */
	// TO DO


	/* Main View > Group View */
	updateBodyPartyView(gameEngine) {
		this.constructor.updateAttributeByID("main-group", "data-groupsubview", this.gameui.bodyview.subviewspecs.group.currentview)
	}

	/* Main View > Raid View */
	updateBodyRaidView(gameEngine) {

	}

	/* Main View > New Part View */
	updateBodyNewPartyView(gameEngine) {
		/* Unit List without Party */
		this.updateBodyNewPartyViewCharacterWithoutPartyList(gameEngine)
	}

	updateBodyNewPartyViewCharacterWithoutPartyList(gameEngine) {
		let currentUnitListHash = this.gameui.bodyview.subviewspecs.groupnew.unitlisthash

		if (currentUnitListHash !== gameEngine.newparty.hash) {
			// need to re-organize since list is different
			let newhash = gameEngine.newparty.hash
			let newlist = gameEngine.newparty.unitswithnoparty
			let currentlist = this.gameui.newpartyview.currentlist
			// list of units currently showed that needs to be removed
			let unitsToRemove = currentlist.filter(function(item) {
				return !newlist.includes(item)
			})
			// list of units that need to be added (shouldn't add an unit from the new list if it already exists)
			let unitsToAdd = newlist.filter(function(item) {
				return !currentlist.includes(item)
			})
			/* remove unneeded unit elements */
			for (var i = 0; i < unitsToRemove.length; i++) {
				this.removeBodyNewPartyViewCharacter(unitsToRemove[i])
			}
			/* add/update new unit elements */
			for (var i = 0; i < gameEngine.characters.length; i++) {
				if (newlist.indexOf(gameEngine.characters[i].core.unitid) !== -1) {
					/* create the unit element if it's a new one */
					if (unitsToAdd.indexOf(gameEngine.characters[i].core.unitid) !== -1) {
						this.addNewPartyViewCharacter(gameEngine.characters[i])
					}
					/* update the unit element */
					this.updateBodyNewPartyViewCharacter(gameEngine.characters[i])
				}
			}
			/* update the list */
			this.gameui.newpartyview.currentlist = newlist
			this.gameui.bodyview.subviewspecs.groupnew.unitlisthash = newhash
		} else {
			// Nothing to do
			for (var i = 0; i < gameEngine.characters.length; i++) {
				this.updateBodyNewPartyViewCharacter(gameEngine.characters[i])
			}
		}
	}

	removeBodyNewPartyViewCharacter(unitid) {
		this.constructor.rmByID(this.gameui.newpartyview.template.characterwithoutpartyprefix + unitid)
	}

	addNewPartyViewCharacter(characterData) {
		let unitElementID = this.gameui.newpartyview.template.characterwithoutpartyprefix + characterData.core.unitid
		let newUnitElement = this.constructor.newEleFromModel(this.gameui.newpartyview.template.characterwithoutparty)
		
		newUnitElement.id = unitElementID
		/* render the element for first time */
		this.constructor.eleByID("pt-leader-list").appendChild(newUnitElement)
		/* set attributes (those should be one time only */
		this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitid", characterData.core.unitid)
		this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitrace", characterData.core.race)
		this.constructor.updateAttributeBySelector("#"+unitElementID, "data-unitgender", characterData.core.gender)
		/* set ID for character name element */
		this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-name", "id", unitElementID+"-name")
		/* set the character name */
		txt(unitElementID+"-name", undefined, [characterData.core.name])
		/* set ID for character livingstatus element */
		this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-livingstatus", "id", unitElementID+"-livingstatus")
		/* set ID for character level element */
		this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-level", "id", unitElementID+"-level")
		/* set ID for character stamina element */
		this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-stamina", "id", unitElementID+"-stamina")
		/* set ID for character satiety element */
		this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-satiety", "id", unitElementID+"-satiety")
		/* set ID for character energy element */
		this.constructor.updateAttributeBySelector("#"+unitElementID+" .unit-energy", "id", unitElementID+"-energy")
		this.clickNewPartyUnit(this, unitElementID, 1)
	}

	updateBodyNewPartyViewCharacter(characterData) {
		let unitElementID = this.gameui.newpartyview.template.characterwithoutpartyprefix + characterData.core.unitid
		this.constructor.updateAttributeByID(unitElementID+"-level", "data-v", characterData.core.level)
		/* set stamina level */
		let staminaPercent = Cl(characterData.stats.secondary.stamina.current / characterData.stats.secondary.stamina.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-stamina", "data-v", staminaPercent)
		txt(unitElementID+"-stamina", undefined, [staminaPercent])
		/* set satiety level */
		let satietyPercent = Cl(characterData.stats.secondary.satiety.current / characterData.stats.secondary.satiety.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-satiety", "data-v", satietyPercent)
		txt(unitElementID+"-satiety", undefined, [satietyPercent])
		/* set energy level */
		let energyPercent = Cl(characterData.stats.secondary.energy.current / characterData.stats.secondary.energy.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-energy", "data-v", energyPercent)
		txt(unitElementID+"-energy", undefined, [energyPercent])
	}

	/* Main View > Character View */

	updateBodyCharacterView(gameEngine) {
		this.constructor.updateAttributeByID("main-unit-character", "data-unitsubview", this.gameui.bodyview.subviewspecs.unit.currentview)

		let currentUnitID = this.gameui.bodyview.currentsubview.unit
		let currentUnitObject = null
		/* find the charcter object */
		if (gameEngine.characters[currentUnitID-1].core.unitid === currentUnitID) {
			currentUnitObject = gameEngine.characters[currentUnitID-1]
		} else {
			let unitIndex = gameEngine.characters.findIndex(item => item.core.unitid === currentUnitID)
			currentUnitObject = gameEngine.characters[unitIndex] 
		}
		/* define unit index & check if different */
		let currentIndex = parseInt(this.constructor.eleByID("main-unit-character").getAttribute("data-unitindex"))
		let isNewIndex = false
		if (currentIndex !== currentUnitObject.core.unitid) {
			isNewIndex = true
			this.constructor.updateAttributeByID("main-unit-character", "data-unitindex", currentUnitObject.core.unitid.toLocaleString())
		}

		let charCoreName = currentUnitObject.core.name.toString()
		let charCoreRace = characterRace[currentUnitObject.core.race]
		let charCoreGender = characterGender[currentUnitObject.core.gender]
		let charCoreLevel = currentUnitObject.core.level.toLocaleString()

		let charStatHPpercent = Cl(currentUnitObject.stats.secondary.health.current/currentUnitObject.stats.secondary.health.max*100).toLocaleString()
		let charStatStaminapercent = Cl(currentUnitObject.stats.secondary.stamina.current/currentUnitObject.stats.secondary.stamina.max*100).toLocaleString()
		let charStatSatietypercent = Cl(currentUnitObject.stats.secondary.satiety.current/currentUnitObject.stats.secondary.satiety.max*100).toLocaleString()
		let charStatEnergypercent = Cl(currentUnitObject.stats.secondary.energy.current/currentUnitObject.stats.secondary.energy.max*100).toLocaleString()

		let levelcurrentexp = currentUnitObject.getCharacterCurrentExpOfLevel()
		let leveltotalexp = currentUnitObject.getCharacterCurrentLevelTotalExp()
		let levelper = levelcurrentexp/leveltotalexp
		let levelwithdecimal = toDecimal(levelper,3).toString().slice(1)
		let levelpercentexp = toDecimal(levelper*100, 2)

		/* header */
		txt("main-title-unit-character-info", "title-char-info", [charCoreName,charCoreGender,charCoreRace,currentUnitObject.core.level])
		txt("main-title-unit-character-info2", "title-char-info2", [levelwithdecimal,charStatHPpercent,charStatStaminapercent,charStatSatietypercent,charStatEnergypercent])

		if (this.gameui.bodyview.subviewspecs.unit.currentview === 1) {
			/* **************** *\
			 * Character Subview : information 
			\* **************** */
			/* core: base */
			txt("main-uch-name", undefined, [charCoreName])
			txt("main-uch-race", undefined, [charCoreRace])
			txt("main-uch-gender", undefined, [charCoreGender])
			/* core: level stat */
			txt("main-uch-level", "main-unit-level", [charCoreLevel,levelpercentexp])
			txt("main-uch-exptotal", undefined, [currentUnitObject.core.exp.toLocaleString()])
			txt("main-uch-expectedexp", undefined, [toDecimal(currentUnitObject.core.expectedexp, 0).toLocaleString()])
			txt("main-uch-exptospirit", undefined, [toDecimal(currentUnitObject.core.exptospirit, 0).toLocaleString()])
			/* core: current exp */
			txt("main-uch-exp-current", undefined, [levelcurrentexp.toLocaleString()])
			txt("main-uch-exp-total", undefined, [leveltotalexp.toLocaleString()])
			this.constructor.eleByID("main-uch-exp-progress").style.width = levelpercentexp.toString()+"%"

			/* party */
			let partyid = currentUnitObject.party.partyid === 0 ? "Not assigned" : currentUnitObject.party.partyid
			txt("main-uch-party", undefined, [partyid.toLocaleString()])

			/* primary stats */
			this.updateBodyCharacterViewPrimaryStat("strength", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("constitution", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("agility", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("dexterity", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("intelligence", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("wisdom", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("charm", currentUnitObject.stats)
			this.updateBodyCharacterViewPrimaryStat("luck", currentUnitObject.stats)
			this.updateBodyCharacterViewAllPrimaryStats(currentUnitObject.stats)

			/* talent points */
			let talentpointsUsed = currentUnitObject.stats.talentpoints.total - currentUnitObject.stats.talentpoints.unused
			txt("main-uch-stat-talent-used", undefined, [talentpointsUsed.toLocaleString()])
			txt("main-uch-stat-talent-unused", undefined, [currentUnitObject.stats.talentpoints.unused.toLocaleString()])
			txt("main-uch-stat-talent-level", undefined, [currentUnitObject.stats.talentpoints.level.toLocaleString()])
			txt("main-uch-stat-talent-spirit", undefined, [currentUnitObject.stats.talentpoints.spirit.toLocaleString()])
			txt("main-uch-stat-talent-total", undefined, [currentUnitObject.stats.talentpoints.total.toLocaleString()])

			/* talent add */
			let talentaddview = this.gameui.bodyview.subviewspecs.unit.showtalentadd === false ? "hidden" : "shown"
			this.constructor.updateAttributeByID("main-uch-talent-add-show-button", "data-v", talentaddview)
			this.constructor.updateAttributeByID("main-uch-talent-add-hide-button", "data-v", talentaddview)
			this.constructor.updateAttributeByID("main-unit-uch-info3", "data-v", talentaddview)

			if (isNewIndex) {
				currentUnitObject.resetTalentAdd()
				this.clickTalentAddReset("main-uch-talent-reset-button", currentUnitObject)
				this.clickTalentAddConfirm("main-uch-talent-confirm-button", currentUnitObject)
			}

			this.updateBodyCharacterViewTalentAddStat("strength", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("constitution", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("agility", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("dexterity", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("intelligence", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("wisdom", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("charm", currentUnitObject, isNewIndex)
			this.updateBodyCharacterViewTalentAddStat("luck", currentUnitObject, isNewIndex)
			txt("main-uch-talent-add-total-unused", undefined, [currentUnitObject.stats.talentpoints.addtemp.unused.toLocaleString()])

			let totalAddUpgrade = currentUnitObject.getTalentAddUsedForAllStats()

			this.constructor.updateAttributeByID("main-uch-talent-reset-button", "data-v", totalAddUpgrade.toLocaleString())
			this.constructor.updateAttributeByID("main-uch-talent-confirm-button", "data-v", totalAddUpgrade.toLocaleString())

			/* secondary stats - resources */
			txt("main-uch-health-current", undefined, [toDecimal(currentUnitObject.stats.secondary.health.current,0).toLocaleString()])
			txt("main-uch-health-max", undefined, [toDecimal(currentUnitObject.stats.secondary.health.max,0).toLocaleString()])
			txt("main-uch-health-percent", "percent", [charStatHPpercent])
			txt("main-uch-stamina-current", undefined, [toDecimal(currentUnitObject.stats.secondary.stamina.current,0).toLocaleString()])
			txt("main-uch-stamina-max", undefined, [toDecimal(currentUnitObject.stats.secondary.stamina.max,0).toLocaleString()])
			txt("main-uch-stamina-percent", "percent", [charStatStaminapercent])
			txt("main-uch-satiety-current", undefined, [toDecimal(currentUnitObject.stats.secondary.satiety.current,0).toLocaleString()])
			txt("main-uch-satiety-max", undefined, [toDecimal(currentUnitObject.stats.secondary.satiety.max,0).toLocaleString()])
			txt("main-uch-satiety-percent", "percent", [charStatSatietypercent])
			txt("main-uch-energy-current", undefined, [toDecimal(currentUnitObject.stats.secondary.energy.current,0).toLocaleString()])
			txt("main-uch-energy-max", undefined, [toDecimal(currentUnitObject.stats.secondary.energy.max,0).toLocaleString()])
			txt("main-uch-energy-percent", "percent", [charStatEnergypercent])

			/* resources ticks */
			txt("main-uch-ticks-stamina", undefined, [currentUnitObject.entity.ticks.lastStamina.toLocaleString()])
			txt("main-uch-ticks-satiety", undefined, [currentUnitObject.entity.ticks.lastSatiety.toLocaleString()])
			txt("main-uch-ticks-energy", undefined, [currentUnitObject.entity.ticks.lastEnergy.toLocaleString()])

			/* secondary stats - utility */

			/* secondary stats - defense */
			txt("main-uch-threat", undefined, [currentUnitObject.stats.secondary.threat.value.toLocaleString()])
			txt("main-uch-tenacity", undefined, [currentUnitObject.stats.secondary.tenacity.value.toLocaleString()])
			txt("main-uch-willpower", undefined, [currentUnitObject.stats.secondary.willpower.value.toLocaleString()])
			txt("main-uch-evasion", undefined, [currentUnitObject.stats.secondary.evasion.value.toLocaleString()])
			txt("main-uch-dodge", undefined, [currentUnitObject.stats.secondary.dodge.value.toLocaleString()])

			/* secondary stats - offensive */
			txt("main-uch-base-attack", undefined, [currentUnitObject.stats.secondary.base.attack.value.toLocaleString()])
			txt("main-uch-base-magicpower", undefined, [currentUnitObject.stats.secondary.base.magicpower.value.toLocaleString()])
			txt("main-uch-base-penetration", undefined, [currentUnitObject.stats.secondary.base.penetration.value.toLocaleString()])
			txt("main-uch-base-accuracy", undefined, [currentUnitObject.stats.secondary.base.accuracy.value.toLocaleString()])
			txt("main-uch-base-critical", undefined, [currentUnitObject.stats.secondary.base.critical.value.toLocaleString()])
			txt("main-uch-base-criticaldamage", undefined, [currentUnitObject.stats.secondary.base.criticaldamage.value.toLocaleString()])
			txt("main-uch-base-parry", undefined, [currentUnitObject.stats.secondary.base.parry.value.toLocaleString()])
			txt("main-uch-base-block", undefined, [currentUnitObject.stats.secondary.base.block.value.toLocaleString()])
		} else if (this.gameui.bodyview.subviewspecs.unit.currentview === 2) {
			/* **************** *\
			 * Character Subview : skills 
			\* **************** */
			
		} else if (this.gameui.bodyview.subviewspecs.unit.currentview === 3) {
			/* **************** *\
			 * Character Subview : inventory 
			\* **************** */

			/* Equip Stats*/
			let esSlots = currentUnitObject.core.body.slots
			let esSlotsCurrent = esSlots.head.current + esSlots.ears.current + esSlots.neck.current + esSlots.chest.current
				+ esSlots.arms.current + esSlots.hands.current + esSlots.legs.current + esSlots.feets.current
			let esSlotsLimit = esSlots.head.limit + esSlots.ears.limit + esSlots.neck.limit + esSlots.chest.limit
				+ esSlots.arms.limit + esSlots.hands.limit + esSlots.legs.limit + esSlots.feets.limit

			txt("main-uch-inv-es-head-current", "inv-es", [esSlots.head.current.toLocaleString()])
			txt("main-uch-inv-es-head-limit", "inv-es2", [esSlots.head.limit.toLocaleString(), Flr(esSlots.head.current / esSlots.head.limit * 100)])
			txt("main-uch-inv-es-ears-current", "inv-es", [esSlots.ears.current.toLocaleString()])
			txt("main-uch-inv-es-ears-limit", "inv-es2", [esSlots.ears.limit.toLocaleString(), Flr(esSlots.ears.current / esSlots.ears.limit * 100)])
			txt("main-uch-inv-es-neck-current", "inv-es", [esSlots.neck.current.toLocaleString()])
			txt("main-uch-inv-es-neck-limit", "inv-es2", [esSlots.neck.limit.toLocaleString(), Flr(esSlots.neck.current / esSlots.neck.limit * 100)])
			txt("main-uch-inv-es-chest-current", "inv-es", [esSlots.chest.current.toLocaleString()])
			txt("main-uch-inv-es-chest-limit", "inv-es2", [esSlots.chest.limit.toLocaleString(), Flr(esSlots.chest.current / esSlots.chest.limit * 100)])
			txt("main-uch-inv-es-arms-current", "inv-es", [esSlots.arms.current.toLocaleString()])
			txt("main-uch-inv-es-arms-limit", "inv-es2", [esSlots.arms.limit.toLocaleString(), Flr(esSlots.arms.current / esSlots.arms.limit * 100)])
			txt("main-uch-inv-es-hands-current", "inv-es", [esSlots.hands.current.toLocaleString()])
			txt("main-uch-inv-es-hands-limit", "inv-es2", [esSlots.hands.limit.toLocaleString(), Flr(esSlots.hands.current / esSlots.hands.limit * 100)])
			txt("main-uch-inv-es-legs-current", "inv-es", [esSlots.legs.current.toLocaleString()])
			txt("main-uch-inv-es-legs-limit", "inv-es2", [esSlots.legs.limit.toLocaleString(), Flr(esSlots.legs.current / esSlots.legs.limit * 100)])
			txt("main-uch-inv-es-feets-current", "inv-es", [esSlots.feets.current.toLocaleString()])
			txt("main-uch-inv-es-feets-limit", "inv-es2", [esSlots.feets.limit.toLocaleString(), Flr(esSlots.feets.current / esSlots.feets.limit * 100)])
			txt("main-uch-inv-es-total-current", "inv-es", [esSlotsCurrent.toLocaleString()])
			txt("main-uch-inv-es-total-limit", "inv-es2", [esSlotsLimit.toLocaleString(), Flr(esSlotsCurrent / esSlotsLimit * 100)])

			let strratio = toDecimal(currentUnitObject.core.bodyratio + Math.sqrt((currentUnitObject.stats.strength.base + currentUnitObject.stats.strength.talent) * 0.5 + (currentUnitObject.stats.constitution.base + currentUnitObject.stats.constitution.talent)) / 400, 3)
			txt("main-uch-inv-es-debug", "inv-esbug", [currentUnitObject.core.bodyratio.toLocaleString(),strratio.toLocaleString()])

			
		} else if (this.gameui.bodyview.subviewspecs.unit.currentview === 4) {
			/* **************** *\
			 * Character Subview : titles 
			\* **************** */
			
		}

	}

	/* Main View > Character View > Information */
	updateBodyCharacterViewPrimaryStat(statname, statsObject) {
		txt("main-uch-stat-"+statname+"-base", undefined, [statsObject[statname].base.toLocaleString()])
		txt("main-uch-stat-"+statname+"-talent", undefined, [statsObject[statname].talent.toLocaleString()])
		txt("main-uch-stat-"+statname+"-skill", undefined, [statsObject[statname].skill.toLocaleString()])
		txt("main-uch-stat-"+statname+"-equipment", undefined, [statsObject[statname].equipment.toLocaleString()])
		txt("main-uch-stat-"+statname+"-status", undefined, [statsObject[statname].status.toLocaleString()])
		let stattotal = statsObject[statname].base 
		+ statsObject[statname].talent 
		+ statsObject[statname].skill 
		+ statsObject[statname].equipment 
		+ statsObject[statname].status
		txt("main-uch-stat-"+statname+"-total", undefined, [stattotal.toLocaleString()])

		//this.constructor.updateAttributeByID("main-uch-stat-"+statname+"-base", "data-n", statsObject[statname].base.toLocaleString())
		let statsigntalent = isN(statsObject[statname].talent, true)
		if (statsigntalent === 0 && notZ(statsObject[statname].talent, true) === 1) {
			statsigntalent += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-"+statname+"-talent", "data-s", statsigntalent.toLocaleString())

		let statsignskill = isN(statsObject[statname].skill, true)
		if (statsignskill === 0 && notZ(statsObject[statname].skill, true) === 1) {
			statsignskill += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-"+statname+"-skill", "data-s", statsignskill.toLocaleString())

		let statsignequipment = isN(statsObject[statname].equipment, true)
		if (statsignequipment === 0 && notZ(statsObject[statname].equipment, true) === 1) {
			statsignequipment += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-"+statname+"-equipment", "data-s", statsignequipment.toLocaleString())

		let statsignstatus = isN(statsObject[statname].status, true)
		if (statsignstatus === 0 && notZ(statsObject[statname].status, true) === 1) {
			statsignstatus += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-"+statname+"-status", "data-s", statsignstatus.toLocaleString())
		
		let statsigntotal = isN(stattotal, true)
		if (statsigntotal === 0 && notZ(stattotal, true) === 1) {
			statsigntotal += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-"+statname+"-total", "data-s",  statsigntotal.toLocaleString())
	}

	updateBodyCharacterViewAllPrimaryStats(statsObject) {
		let allBase = statsObject.strength.base 
		+ statsObject.constitution.base 
		+ statsObject.agility.base 
		+ statsObject.dexterity.base 
		+ statsObject.intelligence.base 
		+ statsObject.wisdom.base 
		+ statsObject.charm.base 
		+ statsObject.luck.base 
		let allTalent = statsObject.strength.talent 
		+ statsObject.constitution.talent 
		+ statsObject.agility.talent 
		+ statsObject.dexterity.talent 
		+ statsObject.intelligence.talent 
		+ statsObject.wisdom.talent 
		+ statsObject.charm.talent 
		+ statsObject.luck.talent 
		let allSkill = statsObject.strength.skill 
		+ statsObject.constitution.skill 
		+ statsObject.agility.skill 
		+ statsObject.dexterity.skill 
		+ statsObject.intelligence.skill 
		+ statsObject.wisdom.skill 
		+ statsObject.charm.skill 
		+ statsObject.luck.skill 
		let allEquipment = statsObject.strength.equipment 
		+ statsObject.constitution.equipment 
		+ statsObject.agility.equipment 
		+ statsObject.dexterity.equipment 
		+ statsObject.intelligence.equipment 
		+ statsObject.wisdom.equipment 
		+ statsObject.charm.equipment 
		+ statsObject.luck.equipment 
		let allStatus = statsObject.strength.status 
		+ statsObject.constitution.status 
		+ statsObject.agility.status 
		+ statsObject.dexterity.status 
		+ statsObject.intelligence.status 
		+ statsObject.wisdom.status 
		+ statsObject.charm.status 
		+ statsObject.luck.status 
		txt("main-uch-stat-allstats-base", undefined, [allBase.toLocaleString()])
		txt("main-uch-stat-allstats-talent", undefined, [allTalent.toLocaleString()])
		txt("main-uch-stat-allstats-skill", undefined, [allSkill.toLocaleString()])
		txt("main-uch-stat-allstats-equipment", undefined, [allEquipment.toLocaleString()])
		txt("main-uch-stat-allstats-status", undefined, [allStatus.toLocaleString()])

		let allstatstotal = allBase + allTalent + allSkill + allEquipment + allStatus
		txt("main-uch-stat-allstats-total", undefined, [allstatstotal.toLocaleString()])

		//this.constructor.updateAttributeByID("main-uch-stat-allstats-base", "data-n", allBase.toLocaleString())
		let statsigntalent = isN(allTalent, true)
		if (statsigntalent === 0 && notZ(allTalent, true) === 1) {
			statsigntalent += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-allstats-talent", "data-s", statsigntalent.toLocaleString())

		let statsignskill = isN(allSkill, true)
		if (statsignskill === 0 && notZ(allSkill, true) === 1) {
			statsignskill += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-allstats-skill", "data-s", statsignskill.toLocaleString())

		let statsignequipment = isN(allEquipment, true)
		if (statsignequipment === 0 && notZ(allEquipment, true) === 1) {
			statsignequipment += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-allstats-equipment", "data-s", statsignequipment.toLocaleString())

		let statsignstatus = isN(allStatus, true)
		if (statsignstatus === 0 && notZ(allStatus, true) === 1) {
			statsignstatus += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-allstats-status", "data-s", statsignstatus.toLocaleString())
		
		let statsigntotal = isN(allstatstotal, true)
		if (statsigntotal === 0 && notZ(allstatstotal, true) === 1) {
			statsigntotal += 2
		}
		this.constructor.updateAttributeByID("main-uch-stat-allstats-total", "data-s",  statsigntotal.toLocaleString())
	}

	updateBodyCharacterViewTalentAddStat(statname, unitObject, updateHandler) {
		let unused = unitObject.stats.talentpoints.addtemp.unused
		txt("main-uch-talent-add-"+statname+"-upgrade", undefined, [unitObject.stats.talentpoints.addtemp[statname].upgrade.toLocaleString()])
		txt("main-uch-talent-add-"+statname+"-new", undefined, [unitObject.stats.talentpoints.addtemp[statname].newstat.toLocaleString()])
		let button1value = unitObject.getTlntPtsReqForUpgrade(statname, 1)
		if (button1value > unused) { button1value = 0}
		this.constructor.updateAttributeByID("main-uch-talent-add-"+statname+"-button1", "data-v", button1value.toLocaleString())
		let button2value = unitObject.getTlntPtsReqForUpgrade(statname, 10)
		if (button2value > unused) { button2value = 0}
		this.constructor.updateAttributeByID("main-uch-talent-add-"+statname+"-button2", "data-v", button2value.toLocaleString())
		let button3value = unitObject.getTlntPtsReqForUpgrade(statname, -1)
		if (button3value > unused || button3value < 0) { button3value = 0}
		this.constructor.updateAttributeByID("main-uch-talent-add-"+statname+"-button3", "data-v", button3value.toLocaleString())
		let ptsUsedDefault = unitObject.stats.talentpoints.spent[statname]
		txt("main-uch-talent-add-"+statname+"-pointsused-default", undefined, [ptsUsedDefault.toLocaleString()])

		let statTalent = unitObject.stats[statname].talent
		let newTalentAdd = unitObject.stats.talentpoints.addtemp[statname].newstat
		let ptsUsedUpgrade = 0
		if (statTalent < newTalentAdd) {
			ptsUsedUpgrade = unitObject.getTlntPtsAtStat(statTalent, newTalentAdd)
		}
		txt("main-uch-talent-add-"+statname+"-pointsused-upgrade", undefined, [ptsUsedUpgrade.toLocaleString()])

		/* init the handlers if new character */
		if (updateHandler) {
			console.log("new handler")
			this.clickTalentUpgrade("main-uch-talent-add-"+statname+"-button1", unitObject, statname, 1)
			this.clickTalentUpgrade("main-uch-talent-add-"+statname+"-button2", unitObject, statname, 10)
			this.clickTalentUpgrade("main-uch-talent-add-"+statname+"-button3", unitObject, statname, -1)
		}
	}

	/**********************************\
	 * DOM METHODS
	\**********************************/
	static newEleFromModel(element) {
		return element.cloneNode(true)
	}

	static eleByID(id) {
		return document.getElementById(id)
	}

	static rmByID(id) {
		let thisElement = document.getElementById(id)
		thisElement.parentNode.removeChild(thisElement)
	}

	static eleByClass(classname) {
		return document.getElementsByClassName(classname)
	}

	static eleBySelector(selector) {
		return document.querySelector(selector)
	}

	static getAttributeValueByID(elementID, attribute) {
		let thisElement = document.getElementById(elementID)
		return thisElement.getAttribute(attribute)
	}

	static updateTextByID(elementID, text) {
		text = text || ""
		let thisElement = document.getElementById(elementID)
		if (thisElement.innerHTML !== text.toString()) {
			thisElement.innerHTML = text.toString()
		}
	}

	static updateTextBySelector(elementSelector, text) {
		text = text || ""
		let thisElement = document.querySelector(elementSelector)
		if (thisElement.innerHTML !== text.toString()) {
			thisElement.innerHTML = text.toString()
		}
	}

	static updateAttributeByID(elementID, attribute, value) {
		let thisElement = document.getElementById(elementID)
		if (thisElement.getAttribute(attribute) !== value.toString()) {
			thisElement.setAttribute(attribute, value.toString())
		}
	}

	static updateAttributeBySelector(elementSelector, attribute, value) {
		let thisElement = document.querySelector(elementSelector)
		if (thisElement.getAttribute(attribute) !== value.toString()) {
			thisElement.setAttribute(attribute, value.toString())
		}
	}
}

