
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
    } else if (areaId === "merchant-street") {
        latLong = [51.45707, -2.58852];
        zoomLevel = 18;
    } else {
        latLong = [51.45921, -2.58229];
    }
    var mymap = L.map(elementId, {
            scrollWheelZoom: false
        }).setView(latLong, zoomLevel);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);

    // Co-ordinates popup
    var popup = L.popup();
    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(mymap);
    }
    mymap.on('click', onMapClick);

    // Note: domain for this scale is set when the valuations data is loaded
    var propertyTypeScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Styling for buildings
    var geojsonMarkerOptions = function (feature) {
        var fillColor = propertyTypeScale(feature.properties.TypeOfProperty);
        return {
            radius: 8,
            fillColor: fillColor,
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

    var valuationBuildingPointsPopupTemplate = '{HouseNum} {Street}<br>{TypeOfProperty}<br><small>Assessment Number: {AssessNum}</small>';
    valuationBuildingPoints.bindPopup(function(e){
        return L.Util.template(valuationBuildingPointsPopupTemplate, e.feature.properties)
    });

    // 1910 Valuation Survey building outlines 
    var valuationBuildingOutlines = new L.geoJson(null, {
        style: function (feature) {
            var fillColor = propertyTypeScale(feature.properties.TypeOfProperty);
            return {
                radius: 8,
                fillColor: fillColor,
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
    var districtValuations = {},
        distinctPropertyTypesLookup = {},
        unknownTypeOfProperty = "Unknown";
    // Bristol East Central valuation records
    // $.get("../csv/37271-6a.csv")
    $.get("../csv/Bristol_Valuation_Records_1910.csv")
        .then(function (valuationsData) {
            // Index the district valuations area (by district, street, assessment number)
            var valuationRecords = d3.csvParse(valuationsData);
            districtValuations = d3.nest()
                .key(function (d) { return d.District; })
                .key(function (d) { return d.Street; })
                .key(function (d) { return d["Source: No. of Assessment"]; })
                .object(valuationRecords);

            // Get building outline geojson
            return $.getJSON("../geojson/Valuations_1910_Building_Outline.geojson");
        })
        .then(function (geojsonData) {
            // Extend the GeoJSON with Property Type from valuations data
            $.each(geojsonData.features, function (ind, feature) {
                var districtRecords = (districtValuations[feature.properties.District] || {}),
                    streetRecords = (districtRecords || {})[feature.properties.Street],
                    assessmentRecords = (streetRecords || {})[feature.properties.AssessNum],
                    typeOfProperty;

                typeOfProperty = unknownTypeOfProperty;
                if (assessmentRecords && assessmentRecords.length > 0) {
                    typeOfProperty = assessmentRecords[0]["Type of Property"];
                    typeOfProperty = typeOfProperty === "" ? unknownTypeOfProperty : typeOfProperty;
                } 

                feature.properties["TypeOfProperty"] = typeOfProperty;
                distinctPropertyTypesLookup[typeOfProperty] = true;
            });

            // Add building outline data
            valuationBuildingOutlines.addData(geojsonData);

            // Get distinct Property Types and set colour scale
            var distinctPropertyTypes = [];
            for (var i in distinctPropertyTypesLookup) {
                distinctPropertyTypes.push(i);
            }
            propertyTypeScale.domain(distinctPropertyTypes);

            // Add map legend for property type colours
            var legend = L.control({position: 'bottomright'});

            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'map-info map-legend'),
                    tmpColour;

                // Add a legend entry for each Property Type
                for (var i = 0; i < distinctPropertyTypes.length; i++) {
                    tmpColour = propertyTypeScale(distinctPropertyTypes[i]);
                    div.innerHTML +=
                        '<i style="background:' + tmpColour + '"></i> ' +
                        distinctPropertyTypes[i] + (typeof distinctPropertyTypes[i + 1] !== "undefined" ? '<br>' : '');
                }

                return div;
            };

            legend.addTo(mymap);

            // Load the building points geojson
            return $.getJSON("../geojson/Valuations_1910_Building.geojson");
        })
        .then(function (geojsonData) {
            // Extend the GeoJSON with property type from valuations data
            $.each(geojsonData.features, function (ind, feature) {
                var districtRecords = (districtValuations[feature.properties.District] || {}),
                    streetRecords = (districtRecords || {})[feature.properties.Street],
                    assessmentRecords = (streetRecords || {})[feature.properties.AssessNum];

                if (assessmentRecords && assessmentRecords.length > 0) {
                    feature.properties["TypeOfProperty"] = assessmentRecords[0]["Type of Property"];
                } else {
                    feature.properties["TypeOfProperty"] = "Unknown";
                }
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
