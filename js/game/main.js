/* Core Components*/
import {stringToFunction, GameObject, Flr, rngmm} from './utils.js';
import {World} from './world.js';
import {GameEngine} from './game.js';
import {UserInterface} from './ui.js';

/* Load Custom Characters */

/* Load Custom Skills */
window.gamesettings = {
	difficulty: 0,
	framerate : 20
}
const GameInstance = {
	engine: null,
	ui: null,
	debug: {lastsecondframe: 0, lastsecondtime: 0},
	board: null,
	currentWorld: null
}

GameInstance.currentWorld = new World("Titan")
GameInstance.engine = new GameEngine(GameInstance)
GameInstance.ui = new UserInterface(GameInstance)

/*var boardOffset = UserInterface.eleByID("boardbackground").getBoundingClientRect()
document.addEventListener('mousemove', function(e) {
	GameInstance.ui.posSVG.x = Math.max(0, e.pageX - boardOffset.left)
	GameInstance.ui.posSVG.y = Math.max(0, e.pageY - boardOffset.top)
})*/

console.log(GameInstance.currentWorld)
console.log(GameInstance.engine)
console.log(GameInstance.ui)

function gameGELoop() {
	GameInstance.currentWorld.tick()
	GameInstance.engine.loop()
	window.setTimeout(gameGELoop, 1000 / window.gamesettings.framerate)
}
let gameUILoop = function () { 
	GameInstance.ui.loop(GameInstance.engine, GameInstance.currentWorld.dateFormat)
	if (GameInstance.ui.initialized === true) {
		UserInterface.updateTextByID("rangevalue",window.gamesettings.framerate)
		//UserInterface.updateTextByID("gamenginefps",GameInstance.engine.fps)
	}
}
let _gameGELoop = gameGELoop()
let _gameUILoopId = setInterval(gameUILoop, 1000 / 20)



GameInstance.engine.createCharacter("Hayennnnn",undefined,undefined,1)
GameInstance.engine.createItem(3101)
GameInstance.engine.createItem(4010)

let unitStressTestCount = 80
for (var usti = 0; usti < unitStressTestCount; usti++) {
	GameInstance.engine.createCharacter("Unit Stress Test #"+(usti+1))
}

console.log(GameInstance.engine.characters[0].getCharacterCurrentExpOfLevel())
console.log(GameInstance.engine.characters[0].getCharacterCurrentLevelTotalExp())