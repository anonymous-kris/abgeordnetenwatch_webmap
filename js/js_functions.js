function party_color(p) {
	if(p === 1) return rgb(223,11,37); else
	if(p === 4) return rgb(254,235,52); else
	if(p === 2) return rgb(0,0,0); else
	if(p === 5) return rgb(74,147,43); else
	if(p === 3) return rgb(0,0,0); else
	if(p === 8) return rgb(188,52,117); else
	if(p === 9) return rgb(26,159,221);
};

/*
1 - SPD
2 - CDU
3 - CSU
4 - FDP
5 - DIE GRÜNEN
6 - Piraten
7 - FREIE WÄHLER
8 - DIE LINKE
9 - AfD
*/



function highlightFeatureHover(feature) {
	var currentLayer = feature.target;
	currentLayer.setStyle(highlightStyle);
	currentLayer.bringToFront();
	return currentLayer
}

function resetHighlightHover(feature) {
	var currentLayer = feature.target;
	counties.resetStyle(currentLayer);
}

function highlightFeatureClick(feature) {
	feature.setStyle(highlightStyle),
	feature.bringToBack()
}

function zoomFit(feature) {
	var corners = feature.getBounds()
	var coords = Object.values(corners)
	var SW = Object.values(coords[0])
	var SW_wide = []
	for(var i in SW) {
		SW_wide.push(SW[i]-0.2)
	}
	var NE = Object.values(coords[1])
	var NE_wide = []
	for(var i in NE) {
		NE_wide.push(NE[i]+0.2)
	}
	map.fitBounds([ [SW_wide[0],SW_wide[1]],[NE_wide[0],NE_wide[1]] ])
//	map.setMaxBounds([ [SW_wide[0],SW_wide[1]],[NE_wide[0],NE_wide[1]] ])
}


function onRightClick () {
	zoomFit(state)
	counties.bringToFront()
}


function focusCounty(feature) {
	var currentLayer = feature.target;
	zoomFit(currentLayer)
	highlightFeatureClick(currentLayer)
}
/*
function focusCounty(feature) {
	var currentLayer = feature.target;
	//gets outer boundaries
	var corners = currentLayer.getBounds()
	var coords = Object.values(corners)
	var NE = Object.values(coords[0])
	var SW = Object.values(coords[1])
	console.log(NE + " + " + SW)
	//zoom to best fit
	map.fitBounds([ [NE[0],NE[1]],[SW[0],SW[1]] ])
	highlightFeatureClick(currentLayer)
}
*/

var highlightStyle = {
	color: "white",
	fillOpacity: 0.2
}

