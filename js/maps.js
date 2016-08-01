
function draw_area_map (elementId, areaId) {
	var latLong,
		zoomLevel = 17;

	// TODO: Move area co-ordinates into CSV lookup file
	if (areaId === "cabot") {
		latLong = [51.45921, -2.58229];
		zoomLevel = 17;
	} else if (areaId === "mary-le-port") {
		latLong = [51.45482, -2.5909];
		zoomLevel = 18;
	} else {
		latLong = [51.45921, -2.58229];
	}
	var mymap = L.map(elementId).setView(latLong, zoomLevel);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	L.polygon([
		[51.45974, -2.58196],
		[51.45958, -2.58143],
		[51.45925, -2.58181]
	]).addTo(mymap).bindPopup("I am a polygon.");

	var popup = L.popup();

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(mymap);
	}

	mymap.on('click', onMapClick);

	return mymap;
}

function draw_main_map (elementId) {
	var mymap = L.map(elementId).setView([51.457565, -2.590507], 16);
	

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	L.polygon([
		[51.45974, -2.58196],
		[51.45958, -2.58143],
		[51.45925, -2.58181]
	]).addTo(mymap).bindPopup("I am a polygon.");

	var popup = L.popup();

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(mymap);
	}

	mymap.on('click', onMapClick);

	return mymap;
}
