import {stringToFunction, gameInitHTML, GameObject, toDecimal, isN, notZ, Flr} from './utils.js';
import {characterRace, characterGender} from './data.js';


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

	/**********************************\
	 * Update Elements
	\**********************************/
	/* Party List */

	updatePartyListHeader(groupCount, raidCount) {
		this.constructor.updateAttributeByID("party-submenu", "data-view", this.gameui.partyview.currentview)
		this.constructor.updateAttributeByID("party-body", "data-view", this.gameui.partyview.currentview)
		this.constructor.updateTextByID("groupcount", groupCount.toString())
		this.constructor.updateTextByID("raidcount", raidCount.toString())
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
			this.constructor.updateTextByID(partyElementID+"-name", groupData.core.name)
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
			this.constructor.updateTextByID(partyElementID+"-name", characterData.core.name)
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
		this.constructor.updateTextByID("charcount", characterCount.toString())
		this.constructor.updateTextByID("trnscount", transportCount.toString())
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
			this.constructor.updateTextByID(unitElementID+"-name", characterData.core.name)
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
		let staminaPercent = Math.ceil(characterData.stats.secondary.stamina.current / characterData.stats.secondary.stamina.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-stamina", "data-v", staminaPercent)
		/* set satiety level */
		let satietyPercent = Math.ceil(characterData.stats.secondary.satiety.current / characterData.stats.secondary.satiety.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-satiety", "data-v", satietyPercent)
		/* set energy level */
		let energyPercent = Math.ceil(characterData.stats.secondary.energy.current / characterData.stats.secondary.energy.max * 100)
		this.constructor.updateAttributeByID(unitElementID+"-energy", "data-v", energyPercent)
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
			this.constructor.updateTextByID(unitElementID+"-name", transportData.core.name)
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
		this.constructor.updateAttributeByID("main-group-submenu", "data-view", this.gameui.bodyview.subviewspecs.group.currentview)
		this.constructor.updateAttributeByID("main-group-body", "data-view", this.gameui.bodyview.subviewspecs.group.currentview)
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
		this.constructor.updateTextByID(unitElementID+"-name", characterData.core.name)
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
		
	}

	/* Main View > Character View*/

	updateBodyCharacterView(gameEngine) {
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
		let currentIndex = parseInt(this.constructor.eleByID("main-unit-uch-information").getAttribute("data-unitindex"))
		let isNewIndex = false
		if (currentIndex !== currentUnitObject.core.unitid) {
			isNewIndex = true
			this.constructor.updateAttributeByID("main-unit-uch-information", "data-unitindex", currentUnitObject.core.unitid.toLocaleString())
		}

		/* core */
		this.constructor.updateTextByID("main-uch-name", currentUnitObject.core.name.toString())
		this.constructor.updateTextByID("main-uch-race", characterRace[currentUnitObject.core.race])
		this.constructor.updateTextByID("main-uch-gender", characterGender[currentUnitObject.core.gender])

		this.constructor.updateTextByID("main-uch-level", currentUnitObject.core.level.toLocaleString())
		this.constructor.updateTextByID("main-uch-exptotal", currentUnitObject.core.exp.toLocaleString())
		this.constructor.updateTextByID("main-uch-expectedexp", toDecimal(currentUnitObject.core.expectedexp, 0).toLocaleString())
		this.constructor.updateTextByID("main-uch-exptospirit", toDecimal(currentUnitObject.core.exptospirit, 0).toLocaleString())

		let levelcurrentexp = currentUnitObject.getCharacterCurrentExpOfLevel()
		let leveltotalexp = currentUnitObject.getCharacterCurrentLevelTotalExp()
		let levelpercentexp = toDecimal(levelcurrentexp/leveltotalexp*100, 2)
		this.constructor.updateTextByID("main-uch-exp-current", levelcurrentexp.toLocaleString())
		this.constructor.updateTextByID("main-uch-exp-total", leveltotalexp.toLocaleString())
		this.constructor.eleByID("main-uch-exp-progress").style.width = levelpercentexp.toString()+"%"

		/* party */
		let partyid = currentUnitObject.party.partyid === 0 ? "Not assigned" : currentUnitObject.party.partyid
		this.constructor.updateTextByID("main-uch-party", partyid.toLocaleString())

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
		this.constructor.updateTextByID("main-uch-stat-talent-used", talentpointsUsed.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-talent-unused", currentUnitObject.stats.talentpoints.unused.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-talent-level", currentUnitObject.stats.talentpoints.level.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-talent-spirit", currentUnitObject.stats.talentpoints.spirit.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-talent-total", currentUnitObject.stats.talentpoints.total.toLocaleString())

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
		this.constructor.updateTextByID("main-uch-talent-add-total-unused", currentUnitObject.stats.talentpoints.addtemp.unused.toLocaleString())

		let totalAddUpgrade = currentUnitObject.getTalentAddUsedForAllStats()

		this.constructor.updateAttributeByID("main-uch-talent-reset-button", "data-v", totalAddUpgrade.toLocaleString())
		this.constructor.updateAttributeByID("main-uch-talent-confirm-button", "data-v", totalAddUpgrade.toLocaleString())

		/* secondary stats - resources */
		this.constructor.updateTextByID("main-uch-health-current", toDecimal(currentUnitObject.stats.secondary.health.current,0).toLocaleString())
		this.constructor.updateTextByID("main-uch-health-max", toDecimal(currentUnitObject.stats.secondary.health.max,0).toLocaleString())
		this.constructor.updateTextByID("main-uch-stamina-current", currentUnitObject.stats.secondary.stamina.current.toLocaleString())
		this.constructor.updateTextByID("main-uch-stamina-max", currentUnitObject.stats.secondary.stamina.max.toLocaleString())
		this.constructor.updateTextByID("main-uch-satiety-current", currentUnitObject.stats.secondary.satiety.current.toLocaleString())
		this.constructor.updateTextByID("main-uch-satiety-max", currentUnitObject.stats.secondary.satiety.max.toLocaleString())
		this.constructor.updateTextByID("main-uch-energy-current", currentUnitObject.stats.secondary.energy.current.toLocaleString())
		this.constructor.updateTextByID("main-uch-energy-max", currentUnitObject.stats.secondary.energy.max.toLocaleString())

		/* resources ticks */
		this.constructor.updateTextByID("main-uch-ticks-stamina", currentUnitObject.entity.ticks.lastStamina.toLocaleString())
		this.constructor.updateTextByID("main-uch-ticks-satiety", currentUnitObject.entity.ticks.lastSatiety.toLocaleString())
		this.constructor.updateTextByID("main-uch-ticks-energy", currentUnitObject.entity.ticks.lastEnergy.toLocaleString())

		/* secondary stats - utility */

		/* secondary stats - defense */
		this.constructor.updateTextByID("main-uch-threat", currentUnitObject.stats.secondary.threat.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-tenacity", currentUnitObject.stats.secondary.tenacity.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-willpower", currentUnitObject.stats.secondary.willpower.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-evasion", currentUnitObject.stats.secondary.evasion.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-dodge", currentUnitObject.stats.secondary.dodge.value.toLocaleString())

		/* secondary stats - offensive */
		this.constructor.updateTextByID("main-uch-base-attack", currentUnitObject.stats.secondary.base.attack.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-magicpower", currentUnitObject.stats.secondary.base.magicpower.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-penetration", currentUnitObject.stats.secondary.base.penetration.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-accuracy", currentUnitObject.stats.secondary.base.accuracy.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-critical", currentUnitObject.stats.secondary.base.critical.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-criticaldamage", currentUnitObject.stats.secondary.base.criticaldamage.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-parry", currentUnitObject.stats.secondary.base.parry.value.toLocaleString())
		this.constructor.updateTextByID("main-uch-base-block", currentUnitObject.stats.secondary.base.block.value.toLocaleString())

	}

	updateBodyCharacterViewPrimaryStat(statname, statsObject) {
		this.constructor.updateTextByID("main-uch-stat-"+statname+"-base", statsObject[statname].base.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-"+statname+"-talent", statsObject[statname].talent.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-"+statname+"-skill", statsObject[statname].skill.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-"+statname+"-equipment", statsObject[statname].equipment.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-"+statname+"-status", statsObject[statname].status.toLocaleString())
		let stattotal = statsObject[statname].base 
		+ statsObject[statname].talent 
		+ statsObject[statname].skill 
		+ statsObject[statname].equipment 
		+ statsObject[statname].status
		this.constructor.updateTextByID("main-uch-stat-"+statname+"-total", stattotal.toLocaleString())

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
		this.constructor.updateTextByID("main-uch-stat-allstats-base", allBase.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-allstats-talent", allTalent.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-allstats-skill", allSkill.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-allstats-equipment", allEquipment.toLocaleString())
		this.constructor.updateTextByID("main-uch-stat-allstats-status", allStatus.toLocaleString())

		let allstatstotal = allBase + allTalent + allSkill + allEquipment + allStatus
		this.constructor.updateTextByID("main-uch-stat-allstats-total", allstatstotal.toLocaleString())

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
		this.constructor.updateTextByID("main-uch-talent-add-"+statname+"-upgrade", unitObject.stats.talentpoints.addtemp[statname].upgrade.toLocaleString())
		this.constructor.updateTextByID("main-uch-talent-add-"+statname+"-new", unitObject.stats.talentpoints.addtemp[statname].newstat.toLocaleString())
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
		this.constructor.updateTextByID("main-uch-talent-add-"+statname+"-pointsused-default", ptsUsedDefault.toLocaleString())

		let statTalent = unitObject.stats[statname].talent
		let newTalentAdd = unitObject.stats.talentpoints.addtemp[statname].newstat
		let ptsUsedUpgrade = 0
		if (statTalent < newTalentAdd) {
			ptsUsedUpgrade = unitObject.getTlntPtsAtStat(statTalent, newTalentAdd)
		}
		this.constructor.updateTextByID("main-uch-talent-add-"+statname+"-pointsused-upgrade", ptsUsedUpgrade.toLocaleString())

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

