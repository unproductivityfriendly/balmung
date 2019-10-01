export let stringToFunction = function(str) {
	var arr = str.split(".");

	var fn = (window || this);
	for (var i = 0, len = arr.length; i < len; i++) {
		fn = fn[arr[i]];
	}

	if (typeof fn !== "function") {
		throw new Error("function not found");
	}

	return  fn;
};

export let Flr = function(number) {
	return Math.floor(number)
}

export let Cl = function(number) {
	return Math.ceil(number)
}

export let Sqrt = function(number) {
	return Math.sqrt(number)
}

export let Sq = function(number) {
	return number * number
}

export let gameInitHTML = function(attributeName) {
	var attributeName = attributeName || "game-ui-init"
	var file, xhttp
	let template = null
	let templates = document.querySelectorAll("["+attributeName+"]")
	let n = templates.length

	for (var i = templates.length - 1; i >= 0; i--) {
		template = templates[i]
		file = template.getAttribute(attributeName)
		if (file) {
			xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
			  if (this.readyState == 4) {
			    if (this.status == 200) {template.innerHTML = this.responseText.toString();}
			    if (this.status == 404) {template.innerHTML = "Page not found.";}
			    /*remove the attribute, and call this function once more:*/
			    template.removeAttribute(attributeName);
			    //gameInitHTML();
			  }
			}
			xhttp.open("GET", file, true);
			xhttp.send();
		}
	}
}

export let mapInitHTML = function() {
	var attributeName = "loadmap"
	var file, xhttp
	let template = null
	let templates = document.querySelectorAll("["+attributeName+"]")
	let n = templates.length

	for (var i = templates.length - 1; i >= 0; i--) {
		template = templates[i]
		file = template.getAttribute(attributeName)
		if (file) {
			xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
			  if (this.readyState == 4) {
			    if (this.status == 200) {template.innerHTML = this.responseText.toString();}
			    if (this.status == 404) {template.innerHTML = "Page not found.";}
			    /*remove the attribute, and call this function once more:*/
			    template.removeAttribute(attributeName);
			    //gameInitHTML();
			  }
			}
			xhttp.open("GET", file, true);
			xhttp.send();
		}
	}
}

export class GameObject {
	construct(gotype='none') {
		this.gotype = gotype
	}

	is() {
		return this.gotype
	}

	static isGo() {
		return true
	}
}

/* Math */
export let rng = (chance,max) => {
	let result = Math.random() * max + 1 || 0
	return result < chance
}

export let rngmm = (min, max) => {
	min = min || 0
	max = max || 1
	return Math.random() * (max - min) + min
}

export let log10 = (val) => {
	return Math.log(val) / Math.LN10;
}

export let isN = (val, binary=false) => {
	if (binary) {
		return val < 0 ? 1 : 0
	} else {
		return val < 0 ? true : false
	}
}

export let notZ = (val, binary=false) => {
	if (binary) {
		return val !== 0 ? 1 : 0
	} else {
		return val !== 0 ? true : false
	}
}

/* formatting */

export let capFirst = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
}

export let percent = (number, decimal) => {
	number = number || 0
	decimal = decimal || 0
	if (number === 0) { return 0 }
	return toDecimal(Math.floor(number * 100 * Math.pow(10, decimal)) / Math.pow(10, decimal),decimal)
}

export let toDecimal = (number, decimal) => {
	number = number || 0
	decimal = decimal || 0
	var dec = Math.pow(10,decimal)
	if (number === 0) { return 0 }
	return Math.round(number * dec) / dec
}

/* array */

export let unique = (array) => {
	function onlyUnique(value, index, self) { 
	    return self.indexOf(value) === index
	}
	return array.filter( onlyUnique )
}

export let arrsign = (array) => {
	let elementList = array.join()
	return hashCode(elementList)
}

/* hash */

export let hashCode = (s) => {
	let string = s.toString()
	let char = 0
	var hash = 0;
	if (string.length == 0) return hash;
	for (var i = 0; i < string.length; i++) {
		char = string.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
