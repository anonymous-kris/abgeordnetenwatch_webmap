var constituencies;
var counties;
var state;
var levelCounter = 0;

//CREATE MAP 

var map = L.map("map", {center: [51.1657,8.9515], zoom: 6.5, 
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


var myRenderer = L.canvas({padding: 7});

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

var layersConstituency = {};
var constituencyLabelOptions = {className: 'constituencyLabel','permanent': false, 'interactive': false, 'opacity': 1 , direction: 'center'}

//constituencies
$.getJSON("shapes/constituencies_29-07-2020_v3_10p.geojson", function(data) {
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

		
		},    
		style: {
	        color: "grey", 
	        weight: 1, 
	        fillColor: "grey", 
	        fillOpacity: 0
	    },
	    renderer: myRenderer
	    });
	constituencies.addTo(map).bringToBack();

}); 




//state layer import
$.getJSON("shapes/state_29-07-2020.geojson", function(data) {
	state = L.geoJSON(data, {    



		style: {
	        color: "orange", 
	        weight: 3, 
	        fillColor: "", 
	        fillOpacity: 0
	    },
	    renderer: myRenderer,
	    })
	state.addTo(map).bringToBack();

});  


var labelOptions = {className: 'labelstyle','permanent': true, 'interactive': true, 'opacity': 1 , direction: 'center'} //, 
//prevent overlap between Berlin and Brandenburg counties
var labelOptionsBrandenburg = {className: 'labelstyle','permanent': true, 'interactive': true, 'opacity': 1 , direction: 'center', offset: [25,45]}

var mapLayerGroups = [];
//var label = new L.Label();

//constituencies data
$.getJSON("shapes/Counties_29-07-2020_v2_5p.geojson", function(data) {
	 counties = L.geoJSON(data, {
		onEachFeature: function(feature, layer){

			layer.on("mouseover", highlightFeatureHover);
			layer.on("mouseout", resetHighlightHover);
			layer.on("click", focusCounty);

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
	    renderer: myRenderer,
	    
	    })

});


//labelling
//map.showLabel(label);





var popup = L.popup();

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