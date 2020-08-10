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
	return name.split(/-| /).map((n)=>n[0]).join("");
};

var county_initials = function(name) {
	return name.split(/-| /).map((n)=>n[0]).join("");
};

var party_nospace = function(name) {
	return name.split(" ").join("");
}

//from https://stackoverflow.com/questions/11652681/replacing-umlauts-in-js/11653019
const umlautMap = {
  '\u00dc': 'UE',
  '\u00c4': 'AE',
  '\u00d6': 'OE',
  '\u00fc': 'ue',
  '\u00e4': 'ae',
  '\u00f6': 'oe',
  '\u00df': 'ss',
}

function replaceUmlaute(str) {
  return str
    .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
      const big = umlautMap[a.slice(0, 1)];
      return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
    })
    .replace(new RegExp('['+Object.keys(umlautMap).join('|')+']',"g"),
      (a) => umlautMap[a]
    );
}





//replace null with 0
function getNum(val) {
   val = +val || 0
   return val;
};



var panelContent;
var politicianData;
var committeeData;
var previousPolitician = [];









var politicianSidebar = function(feature) {
	//remove previous panels and empty array
	sidebarClear(previousPolitician);

	//request data for politicians in constituency
	$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=111&constituency_nr=" + feature.feature.properties.WKR_NR, function(data) {
	 	console.log(data)
	 	var data1 = data.data
	 //itterate through each object
	 	$.each(data1, function(key, value){

//				//committee memberships
//				$.getJSON("https://www.abgeordnetenwatch.de/api/v2/committee-memberships?candidacy_mandate[entity.id]=" + value.id, function(data) {
//					committeeData = data.data
//					console.log(committeeData)
				
				//get information from politician entity
				$.getJSON("https://www.abgeordnetenwatch.de/api/v2/politicians/" + value.politician.id, function(data) {
					politicianData = data.data;



		 		//create panel for each politician
				panelContent = {
						id: replaceUmlaute(party_nospace(politicianData.party.label)),       
						tab: '<div class='+ replaceUmlaute(party_nospace(politicianData.party.label)) + '><b class="tab_text">'+ name_initials(value.politician.label) +'</b></div>',
						pane: "<div class='polInformation'>" +
							"<p><b>Fraktion: </b>"+ value.fraction_membership[0].label +"</p>" +
							"<p><b>Geburtsjahr: </b>"+ politicianData.year_of_birth +"</p>" +
							"<p><b>Ausbildung: </b>" + politicianData.education + "</p>" +
							"<p><b>Beruf: </b>"+ politicianData.occupation +"</p>" +
							"<p><b>Beantwortete Fragen: </b>"+ getNum(politicianData.statistic_questions_answered) +"<b> / </b>"+ getNum(politicianData.statistic_questions) + "   (" + Math.round((politicianData.statistic_questions_answered / politicianData.statistic_questions)*100) +"%)</b></p>" +
						"</div>",
						title: value.politician.label,
						position: 'top'
						}
			console.log(panelContent);
			sidebar.addPanel(panelContent);

//	      	sidebar.addPanel(panelContent);        
			previousPolitician.push(panelContent.id) 
			})})

			})
		}

 
		//add panel to sidebar and remind to list of displayed politicans for later removal



var sidebarClear = function(list) {
	for(var i in list) {
		//console.log(i);
		sidebar.removePanel(list[i]);
	}
	previousPolitician = [];
}

//store information on recent info panel to easily remove it before a new one is added
var recentTopPanel;

var countySidebar = function(feature) {
	var countyContent = feature.feature.properties
	try {
	sidebar.removePanel(recentTopPanel)
	}
	finally {
		panelContent = {
				id: 'countySidebarId',       
				tab: "<div class= 'countyTab'><b>"+ county_initials(countyContent.GEN) +'</b></div>',
				pane: "<div>EMpty Space</div>",
				title: countyContent.GEN,
				position: 'top'
				}
	}
	console.log(panelContent);
	sidebar.addPanel(panelContent);
	recentTopPanel = panelContent.id
}


var constituencySidebar = function(feature) {
	var constituencyContent = feature.feature.properties
	console.log (constituencyContent)

	try {
		sidebar.removePanel(recentTopPanel)
		}
	finally {


		panelContent = {
			id: 'constituencySidebarId',
			tab: "<div class= 'constituencyTab'><b>"+ 'Wahlkreis' +'</b></div>',
			pane: "<div>EMpty Space</div>",
			title: constituencyContent.WKR_NAME,
			position: 'top'
		}
	sidebar.addPanel(panelContent)
	sidebar.open('constituencySidebarId')
	recentTopPanel = panelContent.id
	}
}










var previousConstituency = null;

var clickConstituency = function(feature) {
	constituencies.resetStyle();
	var currentLayer = feature.target
	constituencySidebar(currentLayer);
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

	levelCounter = 0;
	counties.bringToFront();
	counties.resetStyle();
	constituencies.resetStyle();
	showLayer(previousCounty);
	sidebarClear(previousPolitician);
	sidebar.close()
	sidebar.remove();
	zoomFit(state);

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

	sidebar.addTo(map)
	countySidebar(currentLayer)
	hideLayer(currentName);
	zoomFit(currentLayer);
	//fire open sidebar once zoom is finished
	//map.on("zoomend", sidebar.open('countySidebarId')
	sidebar.open('countySidebarId')
	
	levelCounter = 1;
	previousCounty = currentName;



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