//FUNCTION THAT THE SCRIPT CALLS UPON
// 1. Global Variables
// 2. General Functions
// 3. Feature Event Listeners
// 4. Sidebar Panel Creation
// 5. Highlighting Style definitions


//----------------------
//GLOBAL VARIABLES
var previousCounty = null; //tracks which county was clicked previously, to show it again after hiding
var previousConstituency = null; //tracks which constituency was clicked before

var panelContent //stores sidebar panel content
var recentConstituencyPanel //tracks which constituency panel was created recently
var recentTopPanel; //tracks which county panel was created (for easy removal)
var previousPolitician = []; //tracks which sidebar panels were recently created for politicians (for easy removal)
var previousCountyList = []; //prevent fast clicking bug
var previousConstituencyList = []; //prevent fast cicking bug


var politicianData; //stores data on a requested politician
var committeeData; //stores data on a specific committee (not in use currently)
var noConstiuencyList = []; // stores information on which politicians have no constituency in the selected county

var currentRequest




//-------------------
//GENERAL FUNCTIONS

//party color conversion, for future symbolising
var party_color = function (party) {
	var conversion = {
		'CDU/CSU' : "rgb(50,50,50)" ,
		'SPD' : "#DF0B25" ,
		'DIELINKE' : "#BC3475" ,
		'DIEGRUENEN': "#4A932B" ,
		'FDP' :"#FEEB34",
		'AfD' : "#1A9FDD" ,
		'Parteilos': "#f0f0f0" , 
	}
	return conversion.party
}

//function to change name to get initials of names
// source https://stackoverflow.com/questions/33076177/getting-name-initials-using-js
var name_initials = function(name) {
	return name.split(/-| /).map((n)=>n[0]).join("");
};

var party_nospace = function(name) {
	return name.split(" ").join("");
}

//replaces Umalaute (ä-ö-ü-ß) for variables
//source https://stackoverflow.com/questions/11652681/replacing-umlauts-in-js/11653019
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


//replaces null with 0
function getNum(val) {
   val = +val || 0
   return val;
};

//electionResult column translation from database english to German
var electionResult = function(result) {
	if(result == "constituency") {
		return "1. Stimme"}
	else if(result =="list") { return "Landesliste"}
	else if(result =="move_up") {return "Nachgerückt"}
	else {return "k.A."}
	}

//replace null values for education
var education = function(result) {
	if (result == null) {
		return "k.A."}
	else {return result}
	}



//functions for showing and hiding layer in countyLayerGrp
function showLayer(id) {
	var lg = mapLayerGroups[id];
	map.addLayer(lg)
}

function hideLayer(id) {
	var lg = mapLayerGroups[id];
	map.removeLayer(lg)
}

/* NOT NEEDED IN CURRENT VERSION
//Function with timeout to ensure that zoom and sidebar open animation dont conflict (causes graphic bugs and map breaking)
var openSidebar = function() {
	setTimeout(sidebar.open('countySidebarId'), 3000)
};*/


// fly to target feature and fit boundaries (right value determines padding to the right)
function zoomFit(feature, sideSpace) {;
	createBlocking();
	if(window.innerWidth < 600) {
		map.flyToBounds(feature.getBounds(),{paddingBottomRight: [50, 10], paddingTopLeft:[50,400], duration: 0.9, easeLinearity: .1})
	}
	else {
		map.flyToBounds(feature.getBounds(),{paddingBottomRight: [sideSpace, 50], paddingTopLeft:[50,50], duration: 0.9, easeLinearity: .1})
	}
}

//function to determine padding value after zoom according to window size
function sideSpacing() {
	var sideSpace = 50;
	if(window.innerWidth < 1900) {sideSpace = 150};
	if(window.innerWidth < 1700) {sideSpace = 200};
	if(window.innerWidth < 1550) {sideSpace = 300};
	if(window.innerWidth < 1450) {sideSpace = 350};
	if(window.innerWidth < 1200) {sideSpace = 400};
	if(window.innerWidth < 900) {sideSpace = 450};
	if(window.innerWidth < 600) {sideSpace = 50};
	return sideSpace
}


function abortAJAX() {
	currentRequest.abort();
	console.log("Aborted!")
}

function createBlocking() {
	var div = document.createElement("div");
	div.className = "blocking"
//	div.innterHTML = "<div class='blocking'> 'a' </div>";
	document.body.appendChild(div);	
}



//-------------------------
//CLICK ON FEATURE EVENTS (Event listeners)

//CONSTITUENCY
//click on constituency
var clickConstituency = function(feature) { //takes information on target feature
	abortAJAX(); //abort previous ajax requests, to prevent loading of previously clicked constituencies 
	constituencies.resetStyle(); //reset old selection styles
	var currentLayer = feature.target;
	sidebarClear(previousPolitician); //clear sidebar of previous politicians
	constituencySidebar(currentLayer); //create sidebar for the constituency and its politicians

	highlightConstituency(currentLayer); //highlight the clicked constituency
}

//highlighting of constituency
var highlightConstituency = function(feature) {
	feature.setStyle(highlightConstituencyStyle);
	previousConstituency = feature;
}

//light constituency highlighting on hover
function highlightConstituencyHover(feature) {
	var currentLayer = feature.target;
	if(currentLayer.options.fillColor !== "rgb(243,111,60)"){ //prevents changing the color of clicked constituency
		currentLayer.setStyle(highlightStyle);
	}
	
};

//resets constituency style on mouseout
function resetConstituencyHover(feature) {
	var currentLayer = feature.target;
	if(currentLayer.options.fillColor !== "rgb(243,111,60)"){ //prevents changing the color of clicked constituency
		constituencies.resetStyle(currentLayer);
	}
};




//COUNTIES
//upon click, zoom on layer and hide it. store layer information in "previousCounty". next click will show previously hidden layer
function focusCounty(feature) {

	if (previousCounty !== null) {
		abortAJAX();
		showLayer(previousCounty);
		counties.resetStyle();
		constituencies.resetStyle();
	}
	else {sidebar.addTo(map)} //show sidebar again
	//remove existing tabs
	sidebarClear(previousPolitician);
	sidebarClear(previousCountyList);
	sidebarClear(previousConstituencyList)

	var currentLayer = feature.target;
	var currentName = currentLayer.feature.properties.GEN;
	

	countySidebar(currentLayer) //create county sidebar

	hideLayer(currentName); //hide layer to show constituencies underneath
	zoomFit(currentLayer, sideSpacing()); //zoom to layer, with space for sidebar
	levelCounter = 1; //set logic counter to 1
	previousCounty = currentName; //save information on clicked county
};


//Highlighting counties on hover
//strong highlighting if on logic levle 0, light highlighting if already on lvl 1
function highlightFeatureHover(feature) {
	var currentLayer = feature.target;
	if(levelCounter == 0) {
	currentLayer.setStyle(highlightStyle);
	currentLayer.bringToFront();

	}
	else {
		currentLayer.setStyle(lightHighlightStyle)
	}
};

//reset highlighting on mouseout
function resetHighlightHover(feature) {
	var currentLayer = feature.target;
	counties.resetStyle(currentLayer);
}



//on rightclick anywhere, reset map to starting position
function onRightClick () {
//	if(levelCounter !== 0) {  //Since free zoom with mousewheel is allowed, right click has to function alyways as a reset
		counties.bringToFront();
		counties.resetStyle();
		constituencies.resetStyle();
		if(previousCounty !== null){
			showLayer(previousCounty);}
		sidebarClear(previousPolitician);
		sidebarClear(previousCountyList)
		sidebarClear(previousConstituencyList)		
		sidebar.close()
		sidebar.remove();
		zoomFit(state,50);
		previousCounty = null
		levelCounter = 0; // reset logic counter back to 1
//	}
//	else{}
}





//-----------------------------
//SIDEBAR PANEL CREATION


//takes list of sidebar IDs and removes them, resets the list
var sidebarClear = function(list) {
	for(var i in list) {
		//console.log(i);
		sidebar.removePanel(list[i]);
	}
	list = [];
}




//content for reset sidebar
var resetSidebar = {
	id: 'reset',       
	tab: "<div class= 'attributionTab'><i class='fas fa-home fa-2x'></i></div>",
	button: function (event) {onRightClick()},
	position: 'bottom'
}


//content for attribution tab
var attributionSidebar = {
	id: 'attribution',       
	tab: "<div class= 'attributionTab' class=''><i class='fas fa-info-circle fa-2x'></i></div>",
	pane: "<div class='attributionInformation'>" +
			"<p>Die Daten zu allen Abgeordneten werden über <a href='www.abgeordnetenwatch.de'>abgeordnetenwatch.de's</a> web API abgerufen. </p>"  +
			"<p>Die Geodaten wurden vom <a href='http://www.bkg.bund.de'>© GeoBasis-DE / BKG (2020) </a> und dem <a href='https://www.bundeswahlleiter.de/bundestagswahlen/2017/wahlkreiseinteilung/downloads.html'> © Der Bundeswahlleiter, Statistisches Bundesamt, Wiesbaden 2016 </a> bereitgestellt. </p>"+
			"<hr id ='line'>" +
			"<p>Dies ist ein Projekt welches im Zusammenhang mit der Masterarbeit von Kristian Käsinger erstellt wurde. Bei Fragen und Anregungen melden Sie sich gerne per <a href='mailto:kristian.kaesinger@gmail.com'>Email</a> bei mir. </p>" +
			"<p>Version 0.9.9</p>" +
//			"<p>Diese Version ist eine Legacy Version, die nicht weiter entwickelt wird, damit sie mit der Dokumentation der dazugehörigen Masterarbeit übereinstimmt.<br>Eine neue Version können Sie später hier finden:<br>'_________________'</p>" +
			"<div id='symbolsBar'>" +
				"<a href='https://github.com/anonymous-kris/abgeordnetenwatch_webmap' target='_blank'><i id='gitHub' class='fab fa-github fa-5x'></i></a>"+
				"<a href='https://twitter.com/kristiankaese' target='_blank'><i id='twitter' class='fab fa-twitter fa-5x'></i></a>"+
				
			"</div>" +

		"</div>",
	title: '<div id="sidebarTitleColor"><div id="sidebarTitle"><div id=sidebarTitleText>Datenquellen</div></div></div>',
	position: 'bottom'
}

//create politicianSidebar
var politicianSidebar = function(feature) {
	//remove previous panels and empty array
	sidebarClear(previousPolitician);

	//request data for politicians in constituency
	currentRequest = $.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?current_on=now&parliament_period=111&constituency_nr=" + feature.feature.properties.WKR_NR, function(data) {
	 	var data1 = data.data
	  //itterate through each object
	 	$.each(data1, function(key, value){


				/* //committee memberships - currently not used due to issues with the AJAX requests
				$.getJSON("https://www.abgeordnetenwatch.de/api/v2/committee-memberships?candidacy_mandate[entity.id]=" + value.id, function(data) {
					committeeData = data.data
					console.log(committeeData)
				*/

				//get information from politician entity
				$.getJSON("https://www.abgeordnetenwatch.de/api/v2/politicians/" + value.politician.id, function(data) {
					politicianData = data.data;



		 		//create panel for each politician
				panelContent = {
						id: "politician" + key, //unique, responsible for opening content   
						tab: '<div class='+ replaceUmlaute(party_nospace(politicianData.party.label)) + '><b class="tab_text">'+ politicianData.last_name +'</b></div>',
						pane: "<div class='polInformation'>" +
							"<p><b>Fraktion: </b>"+ value.fraction_membership[0].label +"</p>" +
							"<p><b>Mandat gewonnen über: </b>" + electionResult(value.electoral_data.mandate_won) + "</p>" +
							"<p><b>Wahlergebnis: </b>" + getNum(value.electoral_data.constituency_result) +"%</p>"+
							"<p><b>Listenposition: </b>" + value.electoral_data.list_position + "</p>" +
						"<hr id='"+replaceUmlaute(party_nospace(politicianData.party.label)) +"Line'>" +
							"<p><b>Geburtsjahr: </b>"+ politicianData.year_of_birth +"</p>" +
							"<p><b>Ausbildung: </b>" + education(politicianData.education) + "</p>" +
							"<p><b>Beruf: </b>"+ politicianData.occupation +"</p>" +
							"<p><b>Beantwortete Fragen: </b>"+ getNum(politicianData.statistic_questions_answered) +"<b> / </b>"+ getNum(politicianData.statistic_questions) + "   (" + Math.round((politicianData.statistic_questions_answered / politicianData.statistic_questions)*100) +"%)</b></p>" +

						//icon that links to their profile
						"<div id='symbolsBar'><a href='"+ politicianData.abgeordnetenwatch_url +"' target='_blank'><i id='"+replaceUmlaute(party_nospace(politicianData.party.label))+"' class='fas fa-user fa-5x'></i><img id='ask' src='images/askQuestion.svg'></a></div>"+

						"</div>",
						title: '<div id="sidebarTitleColor" class="'+ replaceUmlaute(party_nospace(politicianData.party.label)) +'"><div id="sidebarTitle"><div id=sidebarTitleText><a class="link" href="'+ politicianData.abgeordnetenwatch_url +'" target="_blank">' +  value.politician.label + "</a></div></div></div>",
						position: 'top'
						}
			sidebar.addPanel(panelContent);
     
     		//save the id of the added tab in the list
			previousPolitician.push(panelContent.id) 
			})})

			})
		}

 
//Create sidebar with county information after click as well as politicians that belong to no constituency
var countySidebar = function(feature) {
	//gets information on the clicked feature
	var countyContent = feature.feature.properties

	//remove old panels, only exist if levelCounter is 1
	if(levelCounter == 1) {
	sidebarClear(previousConstituencyList)
	sidebarClear(previousCountyList)
	sidebarClear(previousPolitician)
	}

	//empty the list of politicians in the county that have no constituency
	noConstiuencyList = []
	//array used to create for pane content
	var listString = []


	$.each(noConstituencyPolitician, function(key,value) {
		//ignore null values
		if(value.electoral_data_electoral_list !== null) {
			//check if they are of this sppecific counties electionList
			if(value.electoral_data_electoral_list.label == "Landesliste " + countyContent.GEN + " (Bundestag)") 
			{	
				//create a list item and push the politician for later sidebarTab creation
				listString.push("<li>" + value.politician.label +" (" + value.fraction_membership[0].label + ")</li>")
				noConstiuencyList.push(key)

			}
		}
		})
	//convert the array into a long string
	listString = listString.join("")

	//create panel content for county
	panelContent = {
			id: 'countySidebarId',       
			tab: "<div class= 'countyTab'><b class='tab_text'>"+ "Land" +'</b></div>',
			pane: "<div class='countyInformation'>" +
					"<p>Abgeordnete, die ihr Mandat über die Landesliste gewonnen haben, aber in keinem Wahlkreis angetreten sind: </b></p>" +
					"<p><ul>" +
 					listString +
					"</ul></p>" +
				"</div>",
			title: '<div id="sidebarTitleColor"><div id="sidebarTitle"><div id=sidebarTitleText>'+countyContent.GEN +"</div></div></div>",
			position: 'top',
			button: function (event) { //button that resets constituency and politician tabs
				sidebar.open('countySidebarId')
				sidebarClear(previousPolitician);
				sidebarClear(previousConstituencyList);
				constituencies.resetStyle();
				countyNoConstituency(noConstiuencyList);
			 }
			}
	
//	console.log(panelContent);
	sidebar.addPanel(panelContent);
	//open unless screensize is too small
	if(window.innerWidth > 600) {
		sidebar.open(panelContent.id);
	}
	previousCountyList.push(panelContent.id)

	//create noConstituencyPanels by giving above created list
	countyNoConstituency(noConstiuencyList)

}

//crate sidebar tabs for politicians that have no constituency
var countyNoConstituency = function(list) {
	$.each(list, function(key,value){
		//get additional data from API
		currentRequest = $.getJSON("https://www.abgeordnetenwatch.de/api/v2/politicians/" + noConstituencyPolitician[value].politician.id, function(data) {
			politicianData = data.data;

			panelContentNoConstituency = {
				id: "politician" + key,       
				tab: '<div class=' + replaceUmlaute(party_nospace(politicianData.party.label)) + '><b class="tab_text">'+ politicianData.last_name +'</b></div>',
				pane:"<div class='polInformation'>" +		
						"<p><b>Fraktion: </b>"+ noConstituencyPolitician[value].fraction_membership[0].label +"</p>" +
						"<p><b>Mandat gewonnen über: </b>" + electionResult(noConstituencyPolitician[value].electoral_data_mandate_won) + "</p>" +
						"<p><b>Wahlergebnis: </b>" + getNum(noConstituencyPolitician[value].electoral_data_constituency_result) +"%</p>"+
						"<p><b>Listenposition: </b>" + noConstituencyPolitician[value].electoral_data_list_position + "</p>" +
					"<hr id='"+replaceUmlaute(party_nospace(politicianData.party.label)) +"Line'>" +
						"<p><b>Geburtsjahr: </b>"+ politicianData.year_of_birth +"</p>" +
						"<p><b>Ausbildung: </b>" + education(politicianData.education) + "</p>" +
						"<p><b>Beruf: </b>"+ politicianData.occupation +"</p>" +
						"<p><b>Beantwortete Fragen: </b>"+ getNum(politicianData.statistic_questions_answered) +"<b> / </b>"+ getNum(politicianData.statistic_questions) + "   (" + Math.round((politicianData.statistic_questions_answered / politicianData.statistic_questions)*100) +"%)</b></p>" +


						"<div id='symbolsBar'><a href='"+ politicianData.abgeordnetenwatch_url +"' target='_blank'><i id='"+replaceUmlaute(party_nospace(politicianData.party.label))+"' class='fas fa-user fa-5x'></i><img id='ask' src='images/askQuestion.svg'></a></div>"+


					"</div>",
				title: '<div id="sidebarTitleColor" class="'+ replaceUmlaute(party_nospace(politicianData.party.label)) +'"><div id="sidebarTitle"><div id=sidebarTitleText><a class="link" href="'+ politicianData.abgeordnetenwatch_url +'" target="_blank">' +  noConstituencyPolitician[value].politician.label  +"</a></div></div></div>",
				position: 'top'
		}
		sidebar.addPanel(panelContentNoConstituency)
		previousPolitician.push(panelContentNoConstituency.id)
	}) 
})}



//crate sidebar for the clicked constituency
var constituencySidebar = function(feature) {


	//create blocking element until the tab has been created to prevent user from breaking the website
	createBlocking();

	//gets data from constituency
	var constituencyContent = feature.feature.properties
	sidebarClear(previousConstituencyList)
	//resets panelContent
	panelContent = null;


	sidebarClear(previousConstituencyList)

		//get data on MPs from constituency
		$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?current_on=now&parliament_period=111&constituency_nr=" + feature.feature.properties.WKR_NR, function(data) {
			//get metadata for total amount of politicians
			var metaData = data.meta
			var data1 = data.data

			//prepare string with List of politicians
			var listString = []
				for(var i in data1) {
					listString.push("<li>" + data1[i].politician.label +" (" + data1[i].fraction_membership[0].label + ")</li>");
					}
				listString = listString.join("");


			panelContent = {
				id: 'constituencySidebarId',
				tab: "<div class= 'constituencyTab'><b class='tab_text'>"+ 'Wahlkreis' +'</b></div>',
				pane: "<div class='constituencyInformation'>" +
					"<p><b>Wahlkreisnummer: </b>"+ constituencyContent.WKR_NR +"</p>" +
					"<p><b>Anzahl Abgeordnete: </b>"+ metaData.result.total +"</p>" +
					"<p><ul>" +
 					listString +
					"</ul></p>" +
				"</div>",
				title: '<div id="sidebarTitleColor"><div id="sidebarTitle"><div id="sidebarTitleText">' + constituencyContent.WKR_NAME.replace(/["\u0096"]/g, "\u2012") + "</div></div></div>",
				position: 'top'
		}
			sidebar.addPanel(panelContent)
			sidebar.open('constituencySidebarId')
			fitty('#sidebarTitleText', {minSize: 12, maxSize: 16, multiLine: true}) //fits text of constituency into sidebar


			//safe name of recent constituency
			previousConstituencyList.push(panelContent.id)
			$('.blocking').remove();

			//crate the politician tabs that belong to the constituency
			politicianSidebar(feature);

	})

	}


//-------------------------------------
//HIGHLIGHTING STYLE INFORMATION
var highlightStyle = {
	color: "black",
	fillColor: "rgb(220,220,220)",
	fillOpacity: 0.5
};

var clickStyle = {
	fillOpacity: 0
};

var lightHighlightStyle = {

	fillColor: "rgb(85,85,85)",
	fillOpacity: 1
};

var highlightConstituencyStyle = {
	fillColor: "rgb(243,111,60)",
	fillOpacity: 1
}

