//defines the zoom level: 0-> state, 1 -> county, 2 -> constituency
var previousCounty = null;
var recentConstituencyPanel
var recentTopPanel;



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




var politicianData;
var committeeData;
var previousPolitician = [];


var panelContent






var politicianSidebar = function(feature) {
	//remove previous panels and empty array
	sidebarClear(previousPolitician);

	//request data for politicians in constituency
	$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=111&constituency_nr=" + feature.feature.properties.WKR_NR, function(data) {
	 	console.log(data)
	 	var data1 = data.data
	 //itterate through each object
	 	$.each(data1, function(key, value){


	 		//electionResult column translation
	 		var electionResult = function(result) {
	 			if(result == "constituency") {
	 				return "1. Stimme"}
	 			else { return "Landesliste"
	 			}}
	 		
	 		var education = function(result) {
	 			if (result == null) {
	 				return "keine"}
	 			else {return result}
	 			}
	 		


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
							"<p><b>Mandat gewonnen über: </b>" + electionResult(value.electoral_data.mandate_won) + "</p>" +
							"<p><b>Wahlergebnis: </b>" + getNum(value.electoral_data.constituency_result) +"%</p>"+
							"<p><b>Listenposition: </b>" + value.electoral_data.list_position + "</p>" +
							"<p><b>Beantwortete Fragen: </b>"+ getNum(politicianData.statistic_questions_answered) +"<b> / </b>"+ getNum(politicianData.statistic_questions) + "   (" + Math.round((politicianData.statistic_questions_answered / politicianData.statistic_questions)*100) +"%)</b></p>" +
						"<div id='line'></div>" +
							"<p><b>Geburtsjahr: </b>"+ politicianData.year_of_birth +"</p>" +
							"<p><b>Ausbildung: </b>" + education(politicianData.education) + "</p>" +
							"<p><b>Beruf: </b>"+ politicianData.occupation +"</p>" +

						"</div>",
						title: '<div id="polTitle"><a href="'+ politicianData.abgeordnetenwatch_url +'" target="_blank">' +  value.politician.label + "</a></div>",
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

var countySidebar = function(feature) {
	var countyContent = feature.feature.properties
	try {
	sidebar.removePanel(recentTopPanel)
	sidebar.removePanel(recentConstituencyPanel)
	}
	finally {
		panelContent = {
				id: 'countySidebarId',       
				tab: "<div class= 'countyTab'><b>"+ "Bundesland" +'</b></div>', //countyContent.GEN
				pane: "<div class=countyInformation>Here will be information on all MPs that dont won a mandate without having run in a constituency</div>",
				title: countyContent.GEN,
				position: 'top'
				}
	}
//	console.log(panelContent);
	sidebar.addPanel(panelContent);
	sidebar.open(panelContent.id)
	recentTopPanel = panelContent.id
}




var constituencySidebar = function(feature) {
	var constituencyContent = feature.feature.properties
	console.log (constituencyContent)
	panelContent = null;
	try {
		sidebar.removePanel(recentConstituencyPanel)
		}
	finally {

		$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=111&constituency_nr=" + feature.feature.properties.WKR_NR, function(data) {

			var metaData = data.meta
			var data1 = data.data

			var listString = []
				for(var i in data1) {
					listString.push("<li>" + data1[i].politician.label +" (" + data1[i].fraction_membership[0].label + ")</li>")
					}
				listString = listString.join("")


			panelContent = {
				id: 'constituencySidebarId',
				tab: "<div class= 'constituencyTab'><b>"+ 'Wahlkreis' +'</b></div>',
				pane: "<div class='constituencyInformation'>" +
					"<p><b>Wahlkreisnummer: </b>"+ constituencyContent.WKR_NR +"</p>" +
					"<p><b>Anzahl Abgeordnete: </b>"+ metaData.result.total +"</p>" +
					"<p><ul>" +
 					listString +
					"</ul></p>" +
				"</div>",
				title: constituencyContent.WKR_NAME,
				position: 'top'
		}
			sidebar.addPanel(panelContent)
			sidebar.open('constituencySidebarId')
			fitty('h1.leaflet-sidebar-header')
			console.log(panelContent)
			recentConstituencyPanel = panelContent.id
	})

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







// fit to the zoom of feature (leave space for sidebar)
function zoomFit(feature, rightValue) {
	map.flyToBounds(feature.getBounds(),{paddingBottomRight: [rightValue, 50], paddingTopLeft:[50,50], duration: 0.9, easeLinearity: .1})
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

	if(levelCounter !== 0) {
		counties.bringToFront();
		counties.resetStyle();
		constituencies.resetStyle();
		showLayer(previousCounty);
		sidebarClear(previousPolitician);
		sidebar.removePanel(recentTopPanel)
		sidebar.removePanel(recentConstituencyPanel)
		sidebar.close()
		sidebar.remove();
		zoomFit(state,50);
		previousCounty = null
		levelCounter = 0;
	}

	else{}
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


var openSidebar = function() {
	setTimeout(sidebar.open('countySidebarId'), 3000)
};


//upon click, zoom on layer and hide it. store layer information in "previousCounty". next click will show previously hidden layer
function focusCounty(feature) {
	if (previousCounty !== null) {
		showLayer(previousCounty);
		counties.resetStyle();
		sidebarClear(previousPolitician);
	}
	else {}
//		map.once("zoomend", openSidebar)
	
	var currentLayer = feature.target;
	var currentName = currentLayer.feature.properties.GEN;
	
	sidebar.addTo(map)
	countySidebar(currentLayer)

	hideLayer(currentName);
	zoomFit(currentLayer,450);
	//fire open sidebar once zoom is finished

//	sidebar.open('countySidebarId')
	
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

	fillColor: "rgb(180,180,180)",
	fillOpacity: 1
};

var highlightConstituencyStyle = {
	fillColor: "rgb(243,111,60)",
	fillOpacity: 1
}