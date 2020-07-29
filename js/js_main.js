var map = L.map("map", {center: [51.1657,8.9515], zoom: 6});


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
    {attribution: "&copy; OpenStreetMap"}
).addTo(map);


//var constituencies = 
$.getJSON("shapes/constituencies_29-07-2020_Mapshaper(50p).json", function(data) {
	L.geoJSON(data).addTo(map);
//	return data
});

//console.log(constituencies)





var popup = L.popup();


function onMapClick(e) {
	popup
		.setLatLng(e.latlng)
		.setContent(
			"You clickede the map at <br>" + "lon: " +  e.latlng.lng.toFixed(5) + "<br>" + 
			"Lat: " + e.latlng.lat.toFixed(5))
		.openOn(map);
	var zoom = map.getZoom()
	map.setView([e.latlng.lat,e.latlng.lng],zoom+1)
}


map.on("click",onMapClick);
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

/*var legend = L.control({position: "bottomright"});
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
legend.addTo(map); */