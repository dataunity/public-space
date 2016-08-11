
function draw_area_map (elementId, areaId) {
    var latLong,
        zoomLevel = 17;

    // TODO: Move area co-ordinates into CSV lookup file (so new areas can be added easier)?
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

    // TODO: Get fresh access token (this one's from Leaflet demo)
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

    // Building icons
    var PropertyTypeIcon = L.Icon.extend({
        options: {
            iconSize:     [20, 18],
            iconAnchor:   [10, 9],
            popupAnchor:  [-3, -9]
        }
    });

    var propertyCategories = {
        "Shop": "Shop",
        "House": "House",
        "Public house": "Public house",
        "Industrial or storage": "Industrial or storage",
        "Other": "Other"
    };

    var propertyCategoryIcons = {
        "Shop": "../images/icons/shop.png",
        "House": "../images/icons/house.png",
        "Public house": "../images/icons/public_house.png",
        "Industrial or storage": "../images/icons/industrial_or_storage.png",
        "Other": "../images/icons/other.png"
    };

    function propertyCategoryIconPath (propertyCategory) {
        // Path to icon for building categories
        var pathToIcon = propertyCategoryIcons[propertyCategory];
        if (typeof pathToIcon === "undefined") {
            pathToIcon = "../images/icons/other.png";
        }
        return pathToIcon;
    }

    function isPubliclyAccessible (propertyCategory) {
        // Whether the building is publicly accessible or not
        switch (propertyCategory) {
            case "Shop":
            case "Public house":
                return true;
            case "Other":
            case "Unknown":
                return undefined;
            default:
                return false;
        }
    }

    var shopIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(propertyCategories["Shop"])}),
        houseIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(propertyCategories["House"])}),
        publicHouseIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(propertyCategories["Public house"])}),
        industrialIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(propertyCategories["Industrial or storage"])}),
        otherIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(propertyCategories["Other"])});

    function getBuildingIcon (buildingCategory, latlng) {
        switch (buildingCategory) {
            case "Shop":
                return L.marker(latlng, {icon: shopIcon});
            case "House":
                return L.marker(latlng, {icon: houseIcon});
            case "Public house":
                return L.marker(latlng, {icon: publicHouseIcon});
            case "Industrial or storage":
                return L.marker(latlng, {icon: industrialIcon});
            default:
                return L.marker(latlng, {icon: otherIcon});
        }
    }

    // 1910s Valuation building markers
    var valuationBuildingPoints = new L.geoJson(null, {
        pointToLayer: function (feature, latlng) {
            return getBuildingIcon(feature.properties.PropertyCategory, latlng);
        }
    });
    var valuationBuildingsPopupTemplate = '{HouseNum} {Street}<br>{TypeOfProperty}<br><small>Assessment Number: {AssessNum}</small>';
    valuationBuildingPoints.bindPopup(function(e){
        return L.Util.template(valuationBuildingsPopupTemplate, e.feature.properties)
    });

    // Present day building markers
    var presentDayBuildingPoints = new L.geoJson(null, {
        pointToLayer: function (feature, latlng) {
            return getBuildingIcon(feature.properties.Category, latlng);
        }
    });
    var presentDayBuildingsPopupTemplate = '{HouseNum} {Street}<br>{Category}';
    presentDayBuildingPoints.bindPopup(function(e){
        return L.Util.template(presentDayBuildingsPopupTemplate, e.feature.properties)
    });

    
    var publiclyAccessibleColour = "#2ca02c",
        notPubliclyAccessibleColour = "#1f77b4",
        unknownPubliclyAccessibleColour = "#aaaaaa";
    function propertyPublicAccessibilityColour (propertyCategory) {
        // Gives a colour corresponding to the public accessibility of the building
        var isAccessible = isPubliclyAccessible(propertyCategory);
        if (typeof isAccessible === "undefined") {
            return unknownPubliclyAccessibleColour;
        } else {
            return isAccessible ? publiclyAccessibleColour : notPubliclyAccessibleColour;
        }
    }

    function getBuildingFillStyle (buildingCategory) {
        var fillColor = propertyPublicAccessibilityColour(buildingCategory);
        return {
            radius: 8,
            fillColor: fillColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.3
        };
    }

    // 1910 Valuation Survey building outlines 
    var valuationBuildingOutlines = new L.geoJson(null, {
        style: function (feature) {
            return getBuildingFillStyle(feature.properties.PropertyCategory);
        }
    });
    valuationBuildingOutlines.bindPopup(function(e){
        return L.Util.template(valuationBuildingsPopupTemplate, e.feature.properties);
    });

    // Present day building outlines 
    var presentDayBuildingOutlines = new L.geoJson(null, {
        style: function (feature) {
            return getBuildingFillStyle(feature.properties.Category);
        }
    });
    presentDayBuildingOutlines.bindPopup(function(e){
        return L.Util.template(presentDayBuildingsPopupTemplate, e.feature.properties)
    });


    // Layer groups
    var valuations1910Layer = L.layerGroup([valuationBuildingOutlines, valuationBuildingPoints]);
    var presentDayLayer = L.layerGroup([presentDayBuildingOutlines, presentDayBuildingPoints]);
    presentDayLayer.addTo(mymap);

    var overlayMaps = {
        "Present day (2016)": presentDayLayer,
        "1910": valuations1910Layer
        
    };
    L.control.layers(overlayMaps, null, {collapsed: false}).addTo(mymap);
    
    // Load data
    var districtValuations = {},
        distinctPropertyTypesLookup = {},
        distinctPropertyCategoriesLookup = {},
        unknownTypeOfProperty = "Unknown";

    // How the property types should be mapped to broader categories
    function propertyTypeToCategory (propertyType) {
        switch (propertyType) {
            case "Shop":
            case "House and shop":
            case "Shop and offices":
            case "House, shop and offices":
            case "Showroom":
                return "Shop";
            case "House":
            case "Almshouses":
                return "House";
            case "Public house":
                return "Public house";
            case "Warehouse":
            case "Saw mill":
                return "Industrial or storage";
            default:
                return "Unknown";
        }
    }

    function getTypeOfProperty (districtValuations, feature) {
        var districtRecords = (districtValuations[feature.properties.District] || {}),
            streetRecords = (districtRecords || {})[feature.properties.Street],
            assessmentRecords = (streetRecords || {})[feature.properties.AssessNum],
            typeOfProperty;

        typeOfProperty = unknownTypeOfProperty;
        if (assessmentRecords && assessmentRecords.length > 0) {
            typeOfProperty = assessmentRecords[0]["Type of Property"];
            typeOfProperty = typeOfProperty === "" ? unknownTypeOfProperty : typeOfProperty;
        }

        return typeOfProperty;
    }

    // Load 1910 Valuation spreadsheet
    $.get("../csv/Bristol_Valuation_Records_1910.csv")
        .then(function (valuationsData) {
            // Index the 1910 Valuation data (by district, street, assessment number)
            var valuationRecords = d3.csvParse(valuationsData);
            districtValuations = d3.nest()
                .key(function (d) { return d.District; })
                .key(function (d) { return d.Street; })
                .key(function (d) { return d["Source: No. of Assessment"]; })
                .object(valuationRecords);

            // Load the GeoJSON data
            $.when($.getJSON("../geojson/Valuations_1910_Building_Outline.geojson"),
                $.getJSON("../geojson/Valuations_1910_Building_Centres.geojson"),
                $.getJSON("../geojson/Buildings_Present_Day.geojson"),
                $.getJSON("../geojson/Buildings_Present_Day_Centres.geojson"))
                .done(function (valBuildingsGeoJson, 
                        valBuildingCentresGeoJson,
                        presentDayBuildingsGeoJson,
                        presentDayBuildingCentresGeoJson) {

                    // Extend the GeoJSON with Property Type from valuations data
                    var allValFeatures = [].concat(valBuildingsGeoJson[0].features).concat(valBuildingCentresGeoJson[0].features);
                    $.each(allValFeatures, function (ind, feature) {
                        var typeOfProperty = getTypeOfProperty(districtValuations, feature),
                            propertyCategory = propertyTypeToCategory(typeOfProperty);
                        
                        feature.properties["TypeOfProperty"] = typeOfProperty;
                        feature.properties["PropertyCategory"] = propertyCategory;
                        distinctPropertyTypesLookup[typeOfProperty] = true;
                        distinctPropertyCategoriesLookup[propertyCategory] = true;
                    });

                    // Add 1910 valuation building data to map layers
                    valuationBuildingOutlines.addData(valBuildingsGeoJson[0]);
                    valuationBuildingPoints.addData(valBuildingCentresGeoJson[0]);

                    // Add present day building data to map layers
                    presentDayBuildingOutlines.addData(presentDayBuildingsGeoJson[0]);
                    presentDayBuildingPoints.addData(presentDayBuildingCentresGeoJson[0]);

                    // Add map legend for property type colours
                    var legend = L.control({position: 'topright'});

                    legend.onAdd = function (map) {
                        var div = L.DomUtil.create('div', 'map-info map-legend'),
                            tmpColour,
                            tmpPropertyCategory,
                            tmpPropertyCategories = Object.keys(propertyCategories);

                        // Add a legend entry for each Property Cateogory
                        div.innerHTML += "Type of building:<br>";
                        for (var i = 0; i < tmpPropertyCategories.length; i++) {
                            tmpPropertyCategory = tmpPropertyCategories[i];
                            div.innerHTML +=
                                '<img src="' + propertyCategoryIconPath(tmpPropertyCategory) + '"> ' +
                                tmpPropertyCategories[i] + (typeof tmpPropertyCategories[i + 1] !== "undefined" ? '<br>' : '');
                        }

                        // Add entry for whether building is accessible to public
                        div.innerHTML += "<br><br>Public accessibility:<br>";
                        div.innerHTML +=
                            '<i style="background:' + publiclyAccessibleColour + '"></i> ' +
                            'Publicly accessible<br>';
                        div.innerHTML +=
                            '<i style="background:' + notPubliclyAccessibleColour + '"></i> ' +
                            'Not publicly accessible<br>';
                        div.innerHTML +=
                            '<i style="background:' + unknownPubliclyAccessibleColour + '"></i> ' +
                            'Unknown accessibility<br>';

                        return div;
                    };

                    legend.addTo(mymap);
                });
        });

    return mymap;
}

function draw_main_map (elementId) {
    var mymap = L.map(elementId, {
            scrollWheelZoom: false
        }).setView([51.457565, -2.590507], 16);
    

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
