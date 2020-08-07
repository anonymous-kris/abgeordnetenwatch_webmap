//defines the zoom level: 0-> state, 1 -> county, 2 -> constituency
var previousCounty = null;


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

// source https://stackoverflow.com/questions/33076177/getting-name-initials-using-js
var name_initials = function(name) {
	return name.split(" ").map((n)=>n[0]).join("");
};







var previousPolitician = []
var politicianSidebar = function(feature) {
	//remove previous panels and empty array
	sidebarClear(previousPolitician);

	//request data for politicians in constituency
	$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=111&constituency_nr=" + feature.feature.properties.WKR_NR, function(data) {
//	 console.log(data)
	 var data1 = data.data
	 //itterate through each object
	 for(var key in data1) {
//	 	console.log(key + "->" + data1[key].politician.label);

	 	//create panel for each politician
		var panelContent = {
			id: 'politician' + key,       
			tab: '<b class='+ data1[key].fraction_membership[0].label +'>'+ name_initials(data1[key].politician.label) +'</b>',
			pane: "<div class = 'polInformation'><p>interesting content!</p></div>",
			title: data1[key].politician.label,
			position: 'top'                
		};
		//add panel to sidebar and remind to list of displayed politicans for later removal
		sidebar.addPanel(panelContent);
		previousPolitician.push(panelContent.id)


};
})};

var sidebarClear = function(list) {
	for(var i in list) {
		//console.log(i);
		sidebar.removePanel(list[i]);
	}
	previousPolitician = [];
}

var previousConstituency = null;
var clickConstituency = function(feature) {
	constituencies.resetStyle();
	var currentLayer = feature.target
	politicianSidebar(currentLayer);
	highlightConstituency(currentLayer);
	levelCounter = 2;
}

var highlightConstituency = function(feature) {
	feature.setStyle(highlightConstituencyStyle);
	previousConstituency = feature;
}







// fit to the zoom of feature
function zoomFit(feature) {
	map.flyToBounds(feature.getBounds(),{padding: [50, 50], duration: 0.5, easeLinearity: .1})
}



function highlightConstituencyHover(feature) {
	var currentLayer = feature.target;
		levelCounter = 1;
		currentLayer.setStyle(highlightStyle);

	
};

function resetConstituencyHover(feature) {
	if(levelCounter == 1) {
		var currentLayer = feature.target;
		constituencies.resetStyle(currentLayer);
	}
};


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




//ON ANY RIGHT CLICK, RETURN TO STATE VIEW
function onRightClick () {
	zoomFit(state);
	levelCounter = 0;
	counties.bringToFront();
	counties.resetStyle();
	constituencies.resetStyle();
	showLayer(previousCounty);
	sidebarClear(previousPolitician);
	sidebar.remove();

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


//upon click, zoom on layer and hide it. store layer information in "previousCounty". next click will show previously hidden layer
function focusCounty(feature) {
	if (previousCounty !== null) {
		showLayer(previousCounty);
		counties.resetStyle();
		sidebarClear(previousPolitician);


	}
	var currentLayer = feature.target;
	var currentName = currentLayer.feature.properties.GEN;
	hideLayer(currentName);
	zoomFit(currentLayer);
	levelCounter = 1;
	previousCounty = currentName;
	sidebar.addTo(map)

};


//Style definitions
var highlightStyle = {
	color: "black",
	fillOpacity: 0
};

var clickStyle = {
	fillOpacity: 0
};

var lightHighlightStyle = {

	fillColor: "rgb(200,200,200)",
	fillOpacity: 1
};

var highlightConstituencyStyle = {
	fillColor: "rgb(243,111,60)",
	fillOpacity: 1
}