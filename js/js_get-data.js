var constituencies_DIELINKE = []
var constituencies_FDP = []
var constituencies_SPD = []
var constituencies_CDU = []
var constituencies_AfD = []
var constituencies_DIEGRUENEN = []
var constituencies_Parteilos = []


$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=111",  function(data) {
	$.each(data.data, function(key, value) {
		var str

		if(value.electoral_data.constituency !== null) {
			if(value.fraction_membership[0].label == "DIE LINKE"){

				str = value.electoral_data.constituency.label
				constituencies_DIELINKE.push(str.substr(0,str.indexOf(' ')));
			}
			else if(value.fraction_membership[0].label == "FDP"){

				str = value.electoral_data.constituency.label
				constituencies_FDP.push(str.substr(0,str.indexOf(' ')));
			}
			else if(value.fraction_membership[0].label == "SPD"){
				str = value.electoral_data.constituency.label
				constituencies_SPD.push(str.substr(0,str.indexOf(' ')));
			}
			else if(value.fraction_membership[0].label == "CDU/CSU"){

				str = value.electoral_data.constituency.label
				constituencies_CDU.push(str.substr(0,str.indexOf(' ')));
			}
			else if(value.fraction_membership[0].label == "AfD"){

				str = value.electoral_data.constituency.label
				constituencies_AfD.push(str.substr(0,str.indexOf(' ')));
			}
			else if(value.fraction_membership[0].label == "DIE GRÜNEN"){

				str = value.electoral_data.constituency.label
				constituencies_DIEGRUENEN.push(str.substr(0,str.indexOf(' ')));
			} 
			else {

				str = value.electoral_data.constituency.label
				constituencies_Parteilos.push(str.substr(0,str.indexOf(' ')));
			}
		}
})})

var layerGroupCDU = L.layerGroup()

$.each(constituencies_CDU, function(key,value) {
	layerGroupCDU.addLayer(partyLayerGroups[value])
})