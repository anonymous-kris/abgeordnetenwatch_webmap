//SCRIPT TO FOR ABGEORDNETENWATCH.DE | KARTENANSICHT
// initialises map, loads data and ads event listeners
// most functions are from the files js/js_functions.js
//by KRISTIAN KAESINGER

//TABLE OF CONTENTS
//1. Gloabal Variables
//2. Map 
//3. Sidebar
//4. Geographic data import
//5. External data import
//6. Splash Screen

//----------------------------

//GLOBAL VARIABLES
var constituencies;
var counties;
var state;
var levelCounter = 0; //tracks zoom level
var noConstituencyPolitician;

//array, collecting the various layergroups. Needed to hide counties on click
var mapLayerGroups = [];

//---------------------------

//MAP SECTION
//CREATE MAP 
var map = L.map("map", {
	center: [51.1657,10.515], 
	zoom: 6.5, 
	zoomControl: false, 
	zoomSnap: 0, 
	zoomDelta: 0.5, 
	doubleClickZoom: false, 
	minZoom: 5.5, 
	maxZoom: 11, 
//	keyboard: false,
//	scrollWheelZoom: false,
	zoomAnimationThreshold: 10,
});

map.on("contextmenu", onRightClick); //clicking anywhere will reset map

map.on("zoomend", function(event) {
	$('.blocking').remove();
	});

//define render settings with extended padding, to improve fluidity when panning and zooming
var myRenderer = L.canvas({padding: 1.5});

//--------------------------

//SIDEBAR SETUP
var sidebar = L.control.sidebar({
	autopan: true,       
    closeButton: true,   
    container: 'sidebar', 
    position: 'right',
});

sidebar.addTo(map);
sidebar.addPanel(resetSidebar); //added once and stays
sidebar.addPanel(attributionSidebar); //added once, and stays
sidebar.remove();


//------------------------

//GEOGRAPHIC DATA

//ADDING COUNTRY BORDER TO MAP
$.getJSON("shapes/countryLine-15-08-2020_15weightedVivisogram.geojson", function(data) {
	state = L.geoJSON(data, {    

		style: {
	        color: "black", 
	        weight: 3, 

	    },
	    renderer: myRenderer,
	    })
	state.addTo(map).bringToBack();
});  


//ADDING CONSTITUENCY LAYER TO MAP
//labeling options
var constituencyLabelOptions = {className: 'constituencyLabel','permanent': false, 'interactive': false, 'opacity': 1 , direction: 'center'}

$.getJSON("shapes/constituencies-23-08-2020_improvedBoundaries_15weightedVivisogram.geojson", function(data) {
	constituencies = L.geoJSON(data, { 
		onEachFeature: 
			function(feature, layer){
				var name = feature.properties.WKR_NAME.replace(/["\u0096"]/g, "\u2012") //chrome does not show unicode character u0096 properly, replaces with supported dash like symbol
				layer.bindTooltip(
 					'<div class="popup">' + 
    				name + '<br>' + 
    				'WK Nummer:' + feature.properties.WKR_NR + '</b>' + 
    				'</div>', constituencyLabelOptions
				);
				layer.on('mouseover', highlightConstituencyHover);
				layer.on("mouseout", resetConstituencyHover);
				layer.on("contextmenu", onRightClick);
				layer.on("click", clickConstituency); //changes color and adds local MPS to sidebar

		},    
		style: {
	        color: "grey", 
	        weight: 1, 
	        fillColor: "rgb(200,200,200)", 
	        fillOpacity: 1
	    },
	    renderer: myRenderer
	    });
	constituencies.addTo(map).bringToBack();


});


/* CITY LAYER, might be used in future versions, currentyl not used.
var cityLabels = {'className': 'cityLablesStyle','permanent': true, 'interactive': true, 'opacity': 1 , direction: 'right', offset: [10,-10]};
//capital cities import
$.getJSON("shapes/Landeshauptsadte.geojson", function(data) {
	cities = L.geoJSON(data, {
		onEachFeature: function(feature,layer) {

				layer.bindTooltip(feature.properties.NAME, cityLabels);
			},


		style: {
	        color: "orange", 
	        weight: 2, 
	        fillOpacity: 1
	    },
	    pointToLayer: function(geoJsonPoint, latlng) {
	    	return L.circleMarker(latlng, {radius: 4})
	    },
	    renderer: myRenderer,
	    }).addTo(map);
});  
*/


//ADDING COUNTIES TO THE MAP
$.getJSON("shapes/counties-23-08-2020_improvedBoundaries_15weightedVivisogram.geojson", function(data) {

//Labeloptions for counties
	var labelOptions = {className: 'labelstyle','permanent': true, 
		'interactive': true, 'opacity': 1 , direction: 'center'} //, 
//Brandenburg specific offset, prevent overlap between Berlin and Brandenburg counties
	var labelOptionsBrandenburg = {className: 'labelstyle','permanent': true, 
		'interactive': true, 'opacity': 1 , direction: 'center', offset: [25,45]}

	counties = L.geoJSON(data, {
		onEachFeature: function(feature, layer){

			layer.on("mouseover", highlightFeatureHover);
			layer.on("mouseout", resetHighlightHover);
			layer.on("click", focusCounty); //hides county so constituencies appear
			layer.on("contextmenu", onRightClick); //resets map

			if(feature.properties.GEN === 'Brandenburg') {
				layer.bindTooltip(feature.properties.GEN, labelOptionsBrandenburg);
			}
			else{
				layer.bindTooltip(feature.properties.GEN, labelOptions);
			};
			

			// inspired by https://stackoverflow.com/questions/16148598/leaflet-update-geojson-filte
			//create Layergroups for each county
			var lg = mapLayerGroups[feature.properties.GEN];
			if(lg === undefined) {
				lg = new L.layerGroup();
				lg.addTo(map);
				mapLayerGroups[feature.properties.GEN] = lg;
			}
			lg.addLayer(layer);

		},    
		style: {
	        color: "black", 
	        weight: 2, 
	        fillColor: "rgb(75,75,75)", 
	        fillOpacity: 1
	    },
	    renderer: myRenderer,
	    
	    })

});

//-------------------------

//EXTERNAL DATA LOAD
//load data on politicians that cannot be queried from abgeordnetenwatch.de
$.getJSON("data/candidacies_mandates(no-constituency).json", function(data){
	noConstituencyPolitician = data
	console.log(data)
});

//-------------------------

//SPLASH SCREEN
//adjust font size in header
fitty('#headline', {minSize: 12, maxSize: 20, multiLine: true}) //fits text of constituency into sidebar

//remove instructions and blur at the beginning (giving map time to load)
$('#description').on("click", function(){
	$('#backdrop').remove();
	$('#header').remove();
	$('#description').fadeOut(4000);
	$('#map').css({"animation": "noBlur 1s ease 0s 1 normal forwards"});
});


$('#backdrop').on("click", function(){
	$('#backdrop').remove();
	$('#header').remove();
	$('#description').fadeOut(4000);
	$('#map').css({"animation": "noBlur 1s ease 0s 1 normal forwards" });

});




