import {stringToFunction, toDecimal, GameObject, Flr, Sqrt, Sq, rng, rngmm} from './utils.js';
import * as Data from './data.js';
import * as ItemDB from './data_item.js';



export class ItemModel {
	constructor(itemid=0, type=0, quality=1) {
		this.entity = {
			frame: 1000,
		}

		this.core = {
			itemid: itemid,
			type: type, /* 1=consumable, 2=material, 3=equipment, 4=weapon, 5=magic gem, 6=currency */
			quality: quality,
			weight: 10,
			name: "",
			makerid: 0
		}

		this.stats = {
			statratio: 1,
			main: {},
			prices: []
		}

		this.profiles = {

		}

		this.loadData()
	}
	/***********************\ 
	 * Setting up item
	\***********************/
	loadData() {
		let itemid = this.core.itemid
		if (ItemDB.itemList.hasOwnProperty("id_" + itemid) !== true) {
			throw new Error("item id " + itemid +" does not exist");
		}

		/* set automated data */
		if(this.core.quality < ItemDB.itemList["id_" + itemid].q) {
			this.core.quality = ItemDB.itemList["id_" + itemid].q
		}
		this.core.weight = ItemDB.itemList["id_" + itemid].w
		this.core.name = ItemDB.itemList["id_" + itemid].n

		this.stats.main = this.constructor.getMainStats(this.core.itemid, this.core.quality)
		/* stat ratio */
		this.stats.statratio = this.constructor.getStatRatio(this.core.quality)
	}


	getDataFromQuality(quality=1) {
		/* stat ratio */

	}

	static getStatRatio(quality=1) {
		return toDecimal((quality * 10 + 91) * 10 / (quality * 13 + 997), 6)
	}

	static getMainStats(itemid=1001, quality=1) {
		let itemMainstats = ItemDB.itemList["id_"+itemid].ms
		let mainstatNameList = ItemDB.mainstatsNameList
		let statratio = toDecimal((quality * 10 + 91) * 10 / (quality * 13 + 997), 6)

		let mainstatObj = {}

		for (var i = 0; i < mainstatNameList.length; i++) {
			let msName = mainstatNameList[i]

			if (itemMainstats.hasOwnProperty(msName)) {
				mainstatObj[msName] = {
					id: ItemDB.mainstats[msName],
					base: itemMainstats[msName],
					value: itemMainstats[msName] * statratio
				}
			}
		}

		return mainstatObj
	}
}

export class ConsumableItem extends ItemModel {
	constructor(itemid=0, type=1, quality=1) {
		super(itemid, 1, quality)
	}
}

export class MaterialItem extends ItemModel {
	constructor(itemid=0, type=2, quality=1) {
		super(itemid, type, quality)
	}
}

export class EquipmentItem extends ItemModel {
	constructor(itemid=0, type=3, quality=1, p=0, pbase=0, attributes=[], sockets=[], materials=[], makerid=0, isbroken=0) {
		super(itemid, type, quality)
		this.defineEquipmentSpecifications()

		this.loadEquipData(p, pbase, attributes, sockets, materials, makerid, isbroken)
	}

	defineEquipmentSpecifications() {
		this.core.potential = { current: 0, max: 0, }
		this.core.isbroken = 0
		this.stats.attributes = []
		this.stats.attributeCount = Flr(this.stats.statratio - 1)
		this.stats.sockets = []
		this.stats.socketCount = Flr(this.stats.attributeCount / 2)
		this.stats.materials = []
		this.stats.durability = {
			current: 0, 
			base: 0,
			max: 0, 
			bonus: {
				quality: this.stats.statratio - 1, 
				attributes: 0,
			}
		}

	}

	loadEquipData(p, pbase, attributes, sockets, materials, makerid, isbroken) {
		if (pbase === 0) {
			let prollmin = Flr(this.stats.statratio * 8)
			let prollmax = Flr(prollmin * 1.5) + this.stats.attributeCount
			let proll = Flr(rngmm(prollmin, prollmax + 1))
			this.core.potential.current = proll
			this.core.potential.max = proll
		} else {
			this.core.potential.current = p
			this.core.potential.max = pbase
		}

		if (attributes.length > 0) {
			for (var i = 0; i < attributes.length; i++) {
				this.setAttribute(attributes[i][0],attributes[i][1])
			}
		} else {
			this.fillAttributes()
		}

		if (sockets.length > 0) {
			for (var i = 0; i < sockets.length; i++) {
				this.setGem(sockets[i][0],sockets[i][1])
			}
		}

		/* mats & define durability based on */
		if (materials.length > 0) {
			for (var i = 0; i < materials.length; i++) {
				this.stats.materials.push(materials[i])
			}
		}
		this.setDurability()

		this.core.makerid = makerid
		this.core.isbroken = isbroken

	}

	fillAttributes() {
		let emptyAttributes = this.stats.attributeCount - this.stats.attributes.length
		if (emptyAttributes > 0) {
			for (var i = 0; i < emptyAttributes; i++) {
				this.generateAttribute()
			}
		}
	}

	generateAttribute(name=null,level=0) {
		// temporary, need to be specific per kind of equip
		let availableAttributes = ItemDB.attributesNameList
		let attributeName = availableAttributes[Flr(rngmm(0,availableAttributes.length+1))]
		let attributeID = ItemDB.attributes[attributeName][0]
		let attributeBase = ItemDB.attributes[attributeName][1]
		let attributeLevel = Flr(rngmm(1,Flr(this.stats.statratio)))
		let attribute = {
			name: 	attributeName,
			id: 	attributeID,
			base: 	attributeBase,
			level: 	attributeLevel,
			value: 	toDecimal(attributeBase * attributeLevel * this.stats.statratio, 2)
		}

		this.stats.attributes.push(attribute)
	}

	setAttribute(attributeID, attributeLevel) {

	}

	setGem(gemID, gemQuality) {

	}

	setDurability() {
		if (this.stats.materials.length > 0) {

		} else {
			this.stats.durability.base = 100
		}

	}

	getDataFromQuality(quality=1) {
		super.getDataFromQuality(quality)
	}
}

export class WeaponItem extends EquipmentItem {
	constructor(itemid=0, type=4, quality=1, p=0, pbase=0, attributes=[], sockets=[], materials=[], makerid=0, isbroken=0, aspd=0) {
		super(itemid, type, quality, p, pbase, attributes, sockets, materials, makerid, isbroken)

		this.defineWeaponSpecifications()
		this.loadWeaponData(aspd)
	}

	defineWeaponSpecifications() {
		this.stats.aspd = {
			base: 0,
			bonus: {
				attributes: 0,
				gems: 0,
			},
			total: 0,
		}
	}

	loadWeaponData(aspd) {
		if (aspd === 0) {
			this.generateAspdBase()
		} else {
			this.stats.aspd.base = aspd
		}
		this.stats.aspd.total = this.getAspdTotal()
	}

	generateAspdBase() {
		if (this.stats.main.hasOwnProperty("aspd2")) {
			this.stats.aspd.base = toDecimal(rngmm(this.stats.main.aspd.base, this.stats.main.aspd2.base),5)
		} else if (this.stats.main.hasOwnProperty("aspd")) {
			this.stats.aspd.base = this.stats.main.aspd.base
		} else {
			this.stats.aspd.base = 1
		}
	}

	getAspdTotal() {
		let aspdModifier = 1 + (this.stats.statratio / 100) * (1 + this.stats.aspd.bonus.attributes / 100) * (1 + this.stats.aspd.bonus.gems / 100)
		return toDecimal(this.stats.main.aspd.base * (1 / aspdModifier), 3)
	}

	getDataFromQuality(quality=1) {
		super.getDataFromQuality(quality)
		
	}
}

export class GemItem extends ItemModel {
	constructor(itemid=0, type=1, quality=1) {
		super(itemid, 1, quality)
	}
}

export class CurrencyItem extends ItemModel {
	constructor(itemid=0, type=1, quality=1) {
		super(itemid, 1, quality)
	}
}