export const textTemplates = {
	"blank": 			"#0#",
	"percent": 			"#0#%",

	"stamina": 			"🔥",
	"satiety": 			"🍴",
	"energy": 			"💧",

	"main-unit-level": 	"#0# (#1#%)",

	"title-char-info": 	"#0# #1# #2# Level #3#",
	"title-char-info2": "#0#&nbsp; ❤#1#%&nbsp;🔥#2#%&nbsp;🍴#3#%&nbsp;💧#4#%",
	"inv-es": 			"#0#",
	"inv-es2": 			"#0# (#1#%)",
	"inv-esbug": 		"BR:#0#<br>Strratio: #1#"
}

export const txt = (elementID, templateCode="blank", valuesArray=undefined) => {
	let thisElement = document.getElementById(elementID)
	let thisLocaleTemplate = textTemplates[templateCode]

	if (valuesArray !== undefined) {
		for (var i = 0; i < valuesArray.length; i++) {
			thisLocaleTemplate = thisLocaleTemplate.replace("#"+i+"#", valuesArray[i])
		}
	}
	
	//thisLocaleTemplate = thisLocaleTemplate.toString()
	if (thisElement.innerHTML !== thisLocaleTemplate) {
		thisElement.innerHTML = thisLocaleTemplate
	}
}