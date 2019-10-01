import {stringToFunction, toDecimal, GameObject, Flr, Sqrt, Sq, rng, rngmm} from './utils.js';
import * as Data from './data.js';



export class PartyModel {
	constructor(partyid=0, leaderid=0, name="") {
		this.entity = {
			frame: 1000,
			fps: 1,
			lastFrameTimeStamp: 0,
			ticks: {
				lastMission: 0,
				lastQuest: 0,
			}
		}

		this.core = {
			partyid: partyid,
			partytype: 1, /* 1=party 2=raid */
			name: name,
			leaderid: leaderid,
			size: {
				character: 1,
				transport: 0
			},
			members: {
				character: [leaderid],
				transport: []
			},
			formations: { /* first is the leader, should put character with high strategic/leadership skill */
				battle: [],
				work: [],
				transportation: { /* inventory ids, not transport/character ids */
					equipment: [],
					consummable: [],
					tool: [],
					special: [] /* artifact or quest item */
				}
			},
			position: {
				x: 0,
				y: 0,
				subpos: {
					isinsubmap: false,
					x: 0,
					y: 0,
					mapid: 1
				}
			}
		}


		this.profiles = {

		}

	}
	/***********************\ 
	 * Setting up party
	\***********************/
	loadData() {

	}
	setPosition() {

	}

	/***********************\ 
	 * Idle
	\***********************/

	/***********************\ 
	 * Work
	\***********************/

	/***********************\ 
	 * Battle
	\***********************/


}