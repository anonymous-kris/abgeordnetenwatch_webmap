

var constituencies;
var counties;
var state;
var levelCounter = 0;

//CREATE MAP 

var map = L.map("map", {
	center: [51.1657,10.515], 
	zoom: 6.5, 
	zoomControl: false, 
	zoomSnap: 0, 
	zoomDelta: 0.5, 
	doubleClickZoom: false, 
	minZoom: 6, 
	maxZoom: 15, 
//	keyboard: false,
	scrollWheelZoom: false,
	zoomAnimationThreshold: 10,

});

var sidebar = L.control.sidebar({
	autopan: true,       // whether to maintain the centered map point when opening the sidebar
    closeButton: true,    // whether t add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'right',     // left or right
});


//remove instructions and blur (added to give map time to load)
$('#description').on("click", function(){
	$('#backdrop').remove()
	$('#description').fadeOut(4000);
	$('#map').css({"animation": "noBlur 1s ease 0s 1 normal forwards"})
})

$('#backdrop').on("click", function(){
	$('#backdrop').remove()
	$('#description').fadeOut(4000);
	$('#map').css({"animation": "noBlur 1s ease 0s 1 normal forwards" })

})


var myRenderer = L.canvas({padding: 1.5});




/*
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
    {attribution: "&copy; OpenStreetMap"}
).addTo(map);
*/


/* EXAMPLE OF Styling with function
var state = $.getJSON("shapes/state_29-07-2020.geojson", function(data) {
	L.geoJSON(data, function party_membership(feature) {
		return {    
		    color: "orange", 
	        weight: 3, 
	        fillColor: party_color(feature.properties.party), 
	        fillOpacity: 0
	    };
	    }).addTo(map);
	return data;
});  
*/

$.getJSON("shapes/state_line_03-08-2020_ZhouJones500m_ArcGIS.geojson", function(data) {
	state = L.geoJSON(data, {    



		style: {
	        color: "black", 
	        weight: 3, 
	        fillColor: "", 
	        fillOpacity: 0
	    },
	    renderer: myRenderer,
	    })
	state.addTo(map).bringToBack();

});  

var geosjonvt

var layersConstituency = {};
var constituencyLabelOptions = {className: 'constituencyLabel','permanent': false, 'interactive': false, 'opacity': 1 , direction: 'center'}

$.getJSON("shapes/constituencies_10weightedVivisogram.geojson", function(data) {
	constituencies = L.geoJSON(data, {
		onEachFeature: 
			function(feature, layer){
//				layer.bindPopup(feature.properties.WKR_NAME);
				
				layer.bindTooltip(
 					'<div class="popup">' + 
    				'WK:' + feature.properties.WKR_NAME + '<br>' + 
    				'WK Nummer:' + feature.properties.WKR_NR + '</b>' + 
    				'</div>', constituencyLabelOptions
				);
				layer.on("mouseover", highlightConstituencyHover);
				layer.on("mouseout", resetConstituencyHover);
				layer.on("contextmenu", onRightClick);
				layer.on("click", clickConstituency);


		
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


/*
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
	    pane: 'citiesPane',
	    renderer: myRenderer,
	    });
});  
*/




var labelOptions = {className: 'labelstyle','permanent': true, 'interactive': true, 'opacity': 1 , direction: 'center'} //, 
//prevent overlap between Berlin and Brandenburg counties
var labelOptionsBrandenburg = {className: 'labelstyle','permanent': true, 'interactive': true, 'opacity': 1 , direction: 'center', offset: [25,45]}

var mapLayerGroups = [];
//var label = new L.Label();

//counties data
$.getJSON("shapes/counties_10weightedVivisogram.geojson", function(data) {
	 counties = L.geoJSON(data, {
		onEachFeature: function(feature, layer){

			layer.on("mouseover", highlightFeatureHover);
			layer.on("mouseout", resetHighlightHover);
			layer.on("click", focusCounty);
			layer.on("contextmenu", onRightClick);

			if(feature.properties.GEN === 'Brandenburg') {
				layer.bindTooltip(feature.properties.GEN, labelOptionsBrandenburg);
			}
			else{
				layer.bindTooltip(feature.properties.GEN, labelOptions);
			};
			

			// inspired by https://stackoverflow.com/questions/16148598/leaflet-update-geojson-filte

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

map.on("contextmenu", onRightClick)

