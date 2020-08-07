

var constituencies;
var counties;
var state;
var levelCounter = 0;

//CREATE MAP 

var map = L.map("map", {
	center: [51.1657,8.9515], 
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


/*
var panelContent = {
	id: 'userinfo',                     // UID, used to access the panel
	tab: '<i class="fa fa-gear">What happens next?</i>',  // content can be passed as HTML string,
//    pane: someDomNode.innerHTML,        // DOM elements can be passed, too
	title: 'Your Profile',              // an optional pane header
	position: 'top'                  // optional vertical alignment, defaults to 'top'
};

sidebar.addPanel(panelContent);
*/
/*

map.createPane('countryPane').style.zIndex = 1;


map.createPane('constituenciesPane').style.zIndex = 2;


map.createPane('citiesPane').style.zIndex = 3;


map.createPane('countiesPane').style.zIndex = 4;

*/





var myRenderer = L.canvas({padding: 5});

map.on("contextmenu", onRightClick)


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
	state.addTo(map);

});  



var layersConstituency = {};
var constituencyLabelOptions = {className: 'constituencyLabel','permanent': false, 'interactive': false, 'opacity': 1 , direction: 'center'}

//constituencies
$.getJSON("shapes/constituencies_10weightedVivisogram.json", function(data) {
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
	        fillColor: "grey", 
	        fillOpacity: 0.1
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
	        fillColor: "grey", 
	        fillOpacity: 1
	    },
	    pane: 'countiesPane',
	    renderer: myRenderer,
	    
	    })

});






//GET DATA
/*
var mandates
$.getJSON("https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=111&constituency_nr=80", function(data) {
	 console.log(data)
	 var data1 = data.data
	 for(var key in data1) {
	 	console.log(key + "->" + data1[key].politician.label);

		var panelContent = {
			id: 'userinfo',       
			tab: '<i class="sidebar_tab">'+ name_initials(data1[key].politician.label) +'</i>',
			title: data1[key].politician.label,
			position: 'top'                
		};
		sidebar.addPanel(panelContent);






	 }
})

*/













//labelling
//map.showLabel(label);







//on click zoom
//function onMapClick(e) {
//	popup
//		.setLatLng(e.latlng)
//		.setContent(
//			"You clickede the map at <br>" + "lon: " +  e.latlng.lng.toFixed(5) + "<br>" + 
//			"Lat: " + e.latlng.lat.toFixed(5))
//		.openOn(map);
//	var zoom = map.getZoom()
//	map.setView([e.latlng.lat,e.latlng.lng],zoom+1)
//}


//map.on("click",onMapClick);



/*
 Create a marker with latlong object
L.marker(L.latLng(31.264, 34.802)).addTo(map);
/*

/*var circle = L.circle(
  [51.262218, 8.801472 - 0.001], 
  {radius: 10000, color: "black", fillColor: "red"}
)
circle.addTo(map);
circle.bindPopup("First circle to be ever created!")
*/

/*
var legend = L.control({position: "bottomright"});
legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML = 
        '<p><b>Simple shapes in Leaflet</b></p><hr>' +
        '<p>This map shows an example of adding shapes ' + 
        'on a Leaflet map</p>' +
        'The following shapes were added:<br>' +
        '<p><ul>' +
        '<li>A marker</li>' +
        '<li>A line</li>' +
        '<li>A polygon</li>' +
        '</ul></p>' +
        'The line layer has a <b>popup</b>. ' + 
        'Click on the line to see it!<hr>' +
        'Created with the Leaflet library<br>'
    return div;
};
legend.addTo(map); 
*/
