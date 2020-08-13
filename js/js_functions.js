//defines the zoom level: 0-> state, 1 -> county, 2 -> constituency
var previousCounty = null;
var recentConstituencyPanel
var recentTopPanel;
var noConstiuencyList = []
var previousConstituency = null;




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



//electionResult column translation
var electionResult = function(result) {
	if(result == "constituency") {
		return "1. Stimme"}
	else if(result =="list") { return "Landesliste"}
	else if(result =="move_up") {return "Nachgerückt"}
	else {return "k.A."}
	}

var education = function(result) {
	if (result == null) {
		return "k.A."}
	else {return result}
	}



var attributionSidebar = {
	id: 'attribution',       
	tab: "<div class= 'attributionTab'><i class='fas fa-info-circle fa-2x'></i></div>", //countyContent.GEN
	pane: "<div class='attributionInformation'>" +
			"<br>"+
			"<p>Die Daten zu allen Abgeordneten werden über <a href='www.abgeordnetenwatch.de'>abgeordnetenwatch.de's</a> web API abgerufen. </p>"  +
			"<p>Die Geodaten wurden vom <a href='http://www.bkg.bund.de'>© GeoBasis-DE / BKG (2020) </a> und dem <a href='https://www.bundeswahlleiter.de/bundestagswahlen/2017/wahlkreiseinteilung/downloads.html'> © Der Bundeswahlleiter, Statistisches Bundesamt, Wiesbaden 2016 </a> bereitgestellt. </p>"+
			"<hr id ='line'>" +
			"<p>Dies ist ein Projekt welches im Zusammenhang mit der Masterarbeit von Kristian Käsinger erstellt wurde. Bei Fragen und Anregungen melden Sie sich gerne per <a href='mailto:kristian.kaesinger@gmail.com'>Email</a> bei mir. </p>" +
			
			"<div id='symbolsBar'>" +
				"<a href='https://github.com/anonymous-kris/abgeordnetenwatch_webmap' target='_blank'><i id='symbols' class='fab fa-github fa-5x'></i></a>"+
				"<a href='https://abgeordnetenwatch.de' target='_blank'><img id='symbols' href='images/logo_RGB/aw_logo_2017_bildmarke_mittel.png'" +
			"</div>" +
 

		"</div>",
	title: '<div id="sidebarTitle">Datenquellen</div>',
	position: 'bottom'
}





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
				

				//cors anywhere prefix: https://cors-anywhere.herokuapp.com/

				//get information from politician entity
				$.getJSON("https://www.abgeordnetenwatch.de/api/v2/politicians/" + value.politician.id, function(data) {
					politicianData = data.data;



		 		//create panel for each politician
				panelContent = {
						id: "politician" + key, //unique, responsible for opening content   
						tab: '<div class='+ replaceUmlaute(party_nospace(politicianData.party.label)) + '><b class="tab_text">'+ name_initials(value.politician.label) +'</b></div>',
						pane: "<div class='polInformation'>" +
							"<br>" +
							"<p><b>Fraktion: </b>"+ value.fraction_membership[0].label +"</p>" +
							"<p><b>Mandat gewonnen über: </b>" + electionResult(value.electoral_data.mandate_won) + "</p>" +
							"<p><b>Wahlergebnis: </b>" + getNum(value.electoral_data.constituency_result) +"%</p>"+
							"<p><b>Listenposition: </b>" + value.electoral_data.list_position + "</p>" +
							"<p><b>Beantwortete Fragen: </b>"+ getNum(politicianData.statistic_questions_answered) +"<b> / </b>"+ getNum(politicianData.statistic_questions) + "   (" + Math.round((politicianData.statistic_questions_answered / politicianData.statistic_questions)*100) +"%)</b></p>" +
						"<hr id='"+replaceUmlaute(party_nospace(politicianData.party.label)) +"Line'>" +
							"<p><b>Geburtsjahr: </b>"+ politicianData.year_of_birth +"</p>" +
							"<p><b>Ausbildung: </b>" + education(politicianData.education) + "</p>" +
							"<p><b>Beruf: </b>"+ politicianData.occupation +"</p>" +

//symbols							"<div><a href='"+ politicianData.abgeordnetenwatch_url +"' target='_blank'><i class='fas fa-user'></i></a> <i class='fas fa-envelope''></i></div>"+

						"</div>",
						title: '<div id="sidebarTitle" class="'+ replaceUmlaute(party_nospace(politicianData.party.label)) +'"><a class="link" href="'+ politicianData.abgeordnetenwatch_url +'" target="_blank">' +  value.politician.label + "</a></div>",
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
	finally {}
	//empty the list
	noConstiuencyList = []
	sidebarClear(previousPolitician)
	var listString = []


	$.each(noConstituencyPolitician, function(key,value) {
		//ignore null values
		if(value.electoral_data_electoral_list !== null) {
			if(value.electoral_data_electoral_list.label == "Landesliste " + countyContent.GEN + " (Bundestag)") 
			{
				listString.push("<li>" + value.politician.label +" (" + value.fraction_membership[0].label + ")</li>")
				noConstiuencyList.push(key)
			}
		}
		})
	listString = listString.join("")
	console.log(listString)
	panelContent = {
			id: 'countySidebarId',       
			tab: "<div class= 'countyTab'><b>"+ "Bundesland" +'</b></div>', //countyContent.GEN
			pane: "<div class='countyInformation'>" +
					"<br>" +
					"<p><b>Abgeordnete die in keinem Wahlkreis angetreten sind: </b></p>" +
					"<p><ul>" +
 					listString +
					"</ul></p>" +
				"</div>",
			title: '<div id="sidebarTitle">'+countyContent.GEN +"</div>",
			position: 'top',
			button: function (event) { //opens county panel again
				sidebar.open('countySidebarId')
				sidebarClear(previousPolitician);
				sidebar.removePanel(recentConstituencyPanel);
				constituencies.resetStyle();
				countyNoConstituency(noConstiuencyList);
			 }
			}
	
//	console.log(panelContent);
	sidebar.addPanel(panelContent);
	sidebar.open(panelContent.id)
	recentTopPanel = panelContent.id

	//create noConstituencyPanels

	countyNoConstituency(noConstiuencyList)

}

var countyNoConstituency = function(list) {
	$.each(list, function(key,value){
		$.getJSON("https://www.abgeordnetenwatch.de/api/v2/politicians/" + noConstituencyPolitician[value].politician.id, function(data) {
			politicianData = data.data;

			panelContentNoConstituency = {
				id: "politician" + key,       
				tab: '<div class=' + replaceUmlaute(party_nospace(politicianData.party.label)) + '><b class="tab_text">'+ name_initials(noConstituencyPolitician[value].politician.label) +'</b></div>',
				pane:"<div class='polInformation'>" +		
						"<br>" +
						"<p><b>Fraktion: </b>"+ noConstituencyPolitician[value].fraction_membership[0].label +"</p>" +
						"<p><b>Mandat gewonnen über: </b>" + electionResult(noConstituencyPolitician[value].electoral_data_mandate_won) + "</p>" +
						"<p><b>Wahlergebnis: </b>" + getNum(noConstituencyPolitician[value].electoral_data_constituency_result) +"%</p>"+
						"<p><b>Listenposition: </b>" + noConstituencyPolitician[value].electoral_data_list_position + "</p>" +
						"<p><b>Beantwortete Fragen: </b>"+ getNum(politicianData.statistic_questions_answered) +"<b> / </b>"+ getNum(politicianData.statistic_questions) + "   (" + Math.round((politicianData.statistic_questions_answered / politicianData.statistic_questions)*100) +"%)</b></p>" +
					"<hr id='"+replaceUmlaute(party_nospace(politicianData.party.label)) +"Line'>" +
						"<p><b>Geburtsjahr: </b>"+ politicianData.year_of_birth +"</p>" +
						"<p><b>Ausbildung: </b>" + education(politicianData.education) + "</p>" +
						"<p><b>Beruf: </b>"+ politicianData.occupation +"</p>" +

					"</div>",
				title: '<div id="sidebarTitle" class="'+ replaceUmlaute(party_nospace(politicianData.party.label)) +'"><a class="link" href="'+ politicianData.abgeordnetenwatch_url +'" target="_blank">' +  noConstituencyPolitician[value].politician.label  +"</a></div>",
				position: 'top'
		}
		sidebar.addPanel(panelContentNoConstituency)
		previousPolitician.push(panelContentNoConstituency.id)
	}) 
})}







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
					console.log(data1[i].politician.label)
					}
				listString = listString.join("")


			panelContent = {
				id: 'constituencySidebarId',
				tab: "<div class= 'constituencyTab'><b>"+ 'Wahlkreis' +'</b></div>',
				pane: "<div class='constituencyInformation'>" +
					"<br>" +
					"<p><b>Wahlkreisnummer: </b>"+ constituencyContent.WKR_NR +"</p>" +
					"<p><b>Anzahl Abgeordnete: </b>"+ metaData.result.total +"</p>" +
					"<p><ul>" +
 					listString +
					"</ul></p>" +
				"</div>",
				title: '<div id="sidebarTitle">' + constituencyContent.WKR_NAME + "</div>",
				position: 'top'
		}
			sidebar.addPanel(panelContent)
			sidebar.open('constituencySidebarId')
			fitty('#sidebarTitle', {minSize: 4})
			console.log(panelContent)
			recentConstituencyPanel = panelContent.id
	})

	}
}












var clickConstituency = function(feature) {
	constituencies.resetStyle();
	var currentLayer = feature.target;
	sidebarClear(previousPolitician);
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
	}
	else {}

	sidebarClear(previousPolitician);
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
	fillColor: "rgb(240,240,240)",
	fillOpacity: 0.5
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