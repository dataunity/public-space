
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

    // 1910 Valuation Survey building points
    // var geojsonMarkerOptions = {
    //     radius: 8,
    //     // fillColor: "#ff7800",
    //     fillColor: function () { return "#ff7800"; },
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // };

    var geojsonMarkerOptions = function (feature) {
        var fillColor;

        return {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    };

    var valuationBuildingPoints = new L.geoJson(null, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions(feature));
        }
    }).addTo(mymap);

    var valuationBuildingPointsPopupTemplate = '{HouseNum} {StreetName}<br>{TypeOfProperty}<br><small>Assessment Number: {AssessNum}</small>';
    valuationBuildingPoints.bindPopup(function(e){
        return L.Util.template(valuationBuildingPointsPopupTemplate, e.feature.properties)
    });

    // 1910 Valuation Survey building outlines 
    var valuationBuildingOutlines = new L.geoJson(null, {
        style: function (feature) {
            return {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3
            };
        }
    });
    valuationBuildingOutlines.addTo(mymap);

    var valuationBuildingOutlinesPopupTemplate = '{HouseNum} {Street}<br>{TypeOfProperty}<br><small>Assessment Number: {AssessNum}</small>';
    valuationBuildingOutlines.bindPopup(function(e){
        return L.Util.template(valuationBuildingOutlinesPopupTemplate, e.feature.properties)
    });

    
    // Load data
    var districtValuations = {};
    $.get("../csv/37271-6a.csv")
        .then(function (valuationsData) {
            // TODO: extend GeoJSON with properties from CSV file
            // Index the district valuations area (by district, street, assessment number)
            var bristolEastCentralVal = d3.csvParse(valuationsData);
            districtValuations = d3.nest()
                .key(function (d) { return "Bristol East Central"; })
                .key(function (d) { return d.Street; })
                .key(function (d) { return d["Source: No. of Assessment"]; })
                .object(bristolEastCentralVal);
            // console.log(districtValuations);
            return $.getJSON("../geojson/Valuations_1910_Building_Outline.geojson");
            // $.getJSON("../geojson/Valuations_1910_Building.geojson").
            //     done(function (geojsonData) {
            //         // Mark up the GeoJSON with property type from
            //         // valuations data
            //         $.each(geojsonData.features, function (ind, feature) {
            //             var valuationsRecord = 
            //             console.log(feature);
            //         });
            //         valuationBuildingPoints.addData(geojsonData);
            //     });
        })
        .then(function (geojsonData) {
            console.log(districtValuations);
            console.log(geojsonData);
            // Mark up the GeoJSON with property type from
            // valuations data
            $.each(geojsonData.features, function (ind, feature) {
                var districtRecords = (districtValuations[feature.properties.District] || {}),
                    streetRecords = (districtRecords || {})[feature.properties.Street],
                    assessmentRecords = (streetRecords || {})[feature.properties.AssessNum];
                console.log("streetRecords", streetRecords);
                console.log("assessmentRecords", assessmentRecords);
                if (assessmentRecords && assessmentRecords.length > 0) {

                    // console.log(assessmentRecords[0]["Type of Property"]);
                    feature.properties["TypeOfProperty"] = assessmentRecords[0]["Type of Property"];
                } else {
                    feature.properties["TypeOfProperty"] = "";
                }
                
                // feature.properties["TypeOfProperty"] = "dd";// (assessmentRecord || {})["Type of Property"];
            });
            valuationBuildingOutlines.addData(geojsonData);

            return $.getJSON("../geojson/Valuations_1910_Building.geojson");
        })
        .then(function (geojsonData) {
            // console.log(districtValuations);
            // console.log(geojsonData);
            // Mark up the GeoJSON with property type from
            // valuations data
            $.each(geojsonData.features, function (ind, feature) {
                var districtRecords = (districtValuations[feature.properties.District] || {}),
                    streetRecords = (districtRecords || {})[feature.properties.StreetName],
                    assessmentRecords = (streetRecords || {})[feature.properties.AssessNum];
                // console.log("streetRecords", streetRecords);
                // console.log("assessmentRecords", assessmentRecords);
                if (assessmentRecords && assessmentRecords.length > 0) {

                    // console.log(assessmentRecords[0]["Type of Property"]);
                    feature.properties["TypeOfProperty"] = assessmentRecords[0]["Type of Property"];
                } else {
                    feature.properties["TypeOfProperty"] = "";
                }
                
                // feature.properties["TypeOfProperty"] = "dd";// (assessmentRecord || {})["Type of Property"];
            });
            valuationBuildingPoints.addData(geojsonData);
        });

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
