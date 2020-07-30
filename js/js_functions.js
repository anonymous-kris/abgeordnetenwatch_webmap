//defines the zoom level: 0-> state, 1 -> county, 2 -> constituency



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


//strong highlighting if on state view, light highlighting if in county view
function highlightFeatureHover(feature) {
	var currentLayer = feature.target;
	if(levelCounter == 0) {
	currentLayer.setStyle(highlightStyle);
	currentLayer.bringToFront();
	}
	else {
		currentLayer.setStyle(lightHighlightStyle)
	}
}	

function resetHighlightHover(feature) {
	var currentLayer = feature.target;
	counties.resetStyle(currentLayer);
}

function highlightFeatureClick(feature) {
	feature.setStyle(clickStyle)
}



// fit to the zoom of feature
function zoomFit(feature) {
	map.fitBounds(feature.getBounds(),{padding: [50, 50]})
}

//ON ANY RIGHT CLICK, RETURN TO STATE VIEW
function onRightClick () {
	zoomFit(state)
	levelCounter = 0
	counties.bringToFront()
	counties.resetStyle()
}



//FUNCTIONS TO TOGGLE COUNTY LAYERGRPS
function showLayer(id) {
	var lg = mapLayerGroups[id];
	map.addLayer(lg)
}

function hideLayer(id) {
	var lg = mapLayerGroups[id];
	map.removeLayer(lg)
}

var previousCounty = null;
//upon click, zoom on layer and hide it. store layer information in "previousCounty". next click will show previously hidden layer
function focusCounty(feature) {
	if (previousCounty !== null) {
		showLayer(previousCounty);
		counties.resetStyle();

	}
	var currentLayer = feature.target;
	var currentName = currentLayer.feature.properties.GEN;
	hideLayer(currentName);
	zoomFit(currentLayer)
	levelCounter = 1
	previousCounty = currentName

};


//Style definitions
var highlightStyle = {
	color: "white",
	fillOpacity: 0.2
};

var clickStyle = {
	fillOpacity: 0
};

var lightHighlightStyle = {

	fillColor: "rgb(200,200,200)",
	fillOpacity: 1
};