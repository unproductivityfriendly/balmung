import {stringToFunction, toDecimal, GameObject, Flr, Sqrt, Sq, rng, rngmm} from './utils.js';
import * as Data from './data.js';
import * as SkillDB from './data_skill.js';



export class SkillModel {
	constructor(skillid=0, exp=0) {
		this.entity = {
			frame: 1000,
		}

		this.core = {
			skillid: skillid,
			skilltype: 1, /* 1=passive 2=active 3=toggle */
			name: name,
		}

		this.attributes = []


		this.profiles = {

		}

	}
	/***********************\ 
	 * Setting up skill
	\***********************/
	loadData() {


		/* attribute structure */

		let attributeData = Data
		for (var i = 0; i < attributeData.length; i++) {
			//attributeData[i]
		}
	}
}

export class PassiveSkill extends SkillModel {
	constructor(skillid=0, exp=0) {
		super(skillid,exp)
	}
}

export class ActiveSkill extends SkillModel {
	constructor(skillid=0, exp=0) {
		super(skillid,exp)
	}
}

export class ToggleSkill extends SkillModel {
	constructor(skillid=0, exp=0) {
		super(skillid,exp)
	}
}