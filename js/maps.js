var PublicSpace = PublicSpace || {};

// Information about buildings
PublicSpace.buildings = (function () {
    var categories = {
            "Shop": "Shop",
            "House": "House",
            "Public house": "Public house",
            "Industrial or storage": "Industrial or storage",
            "Other": "Other"
        },
        buildingTypeToCategory = function (buildingType) {
            switch (buildingType) {
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
        },

        // Public accessibility colours
        publiclyAccessibleColour = "#2ca02c",
        notPubliclyAccessibleColour = "#1f77b4",
        unknownPubliclyAccessibleColour = "#aaaaaa",
        isPubliclyAccessible = function (buildingCategory) {
            // Whether the building is publicly accessible or not
            switch (buildingCategory) {
                case "Shop":
                case "Public house":
                    return true;
                case "Other":
                case "Unknown":
                    return undefined;
                default:
                    return false;
            }
        },
        publicAccessibilityColour = function (buildingCategory) {
            // Gives a colour corresponding to the public accessibility of the building
            var isAccessible = isPubliclyAccessible(buildingCategory);
            if (typeof isAccessible === "undefined") {
                return unknownPubliclyAccessibleColour;
            } else {
                return isAccessible ? publiclyAccessibleColour : notPubliclyAccessibleColour;
            }
        },
        publicAccessibilityFillStyle = function (buildingCategory) {
            var fillColor = publicAccessibilityColour(buildingCategory);
            return {
                radius: 8,
                fillColor: fillColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3
            };
        };

    return {
        categories: categories,
        buildingTypeToCategory: buildingTypeToCategory,
        publicAccessibilityFillStyle: publicAccessibilityFillStyle,
        publiclyAccessibleColour: publiclyAccessibleColour,
        notPubliclyAccessibleColour: notPubliclyAccessibleColour,
        unknownPubliclyAccessibleColour: unknownPubliclyAccessibleColour
    };
}());

// Icons to display on maps
PublicSpace.mapsIcons = (function (L) {
    var buildingCategories = PublicSpace.buildings.categories,
        PropertyTypeIcon = L.Icon.extend({
            options: {
                iconSize:     [20, 18],
                iconAnchor:   [10, 9],
                popupAnchor:  [-3, -9]
            }
        }),
        propertyCategoryIcons = {
            "Shop": "../images/icons/shop.png",
            "House": "../images/icons/house.png",
            "Public house": "../images/icons/public_house.png",
            "Industrial or storage": "../images/icons/industrial_or_storage.png",
            "Other": "../images/icons/other.png"
        },

        // Icon image paths
        propertyCategoryIconPath = function (propertyCategory) {
            // Path to icon for building categories
            var pathToIcon = propertyCategoryIcons[propertyCategory];
            if (typeof pathToIcon === "undefined") {
                pathToIcon = "../images/icons/other.png";
            }
            return pathToIcon;
        },

        // Icons
        shopIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(buildingCategories["Shop"])}),
        houseIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(buildingCategories["House"])}),
        publicHouseIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(buildingCategories["Public house"])}),
        industrialIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(buildingCategories["Industrial or storage"])}),
        otherIcon = new PropertyTypeIcon({iconUrl: propertyCategoryIconPath(buildingCategories["Other"])}),

        getBuildingIcon = function (buildingCategory, latlng) {
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
        };

    return {
        getBuildingIcon: getBuildingIcon,
        propertyCategoryIconPath: propertyCategoryIconPath
    }
}(L));

PublicSpace.mapLegends = (function () {
    // Private properties
        // Dependencies
    var buildingCategories = PublicSpace.buildings.categories,
        propertyCategoryIconPath = PublicSpace.mapsIcons.propertyCategoryIconPath,
        publiclyAccessibleColour = PublicSpace.buildings.publiclyAccessibleColour,
        notPubliclyAccessibleColour = PublicSpace.buildings.notPubliclyAccessibleColour,
        unknownPubliclyAccessibleColour = PublicSpace.buildings.unknownPubliclyAccessibleColour

    // Private methods
        publicAccessibilityLegendText = function () {
            var txt = "<br><br>Public accessibility:<br>";
            txt +=
                '<i style="background:' + publiclyAccessibleColour + '"></i> ' +
                'Publicly accessible<br>';
            txt +=
                '<i style="background:' + notPubliclyAccessibleColour + '"></i> ' +
                'Not publicly accessible<br>';
            txt +=
                '<i style="background:' + unknownPubliclyAccessibleColour + '"></i> ' +
                'Unknown accessibility<br>';
            return txt;
        },
        categoriesLegendText = function () {
            var txt = "",
                tmpPropertyCategory,
                tmpPropertyCategories = Object.keys(buildingCategories);

            txt += "Type of building:<br>";
            for (var i = 0; i < tmpPropertyCategories.length; i++) {
                tmpPropertyCategory = tmpPropertyCategories[i];
                txt +=
                    '<img src="' + propertyCategoryIconPath(tmpPropertyCategory) + '"> ' +
                    tmpPropertyCategories[i] + (typeof tmpPropertyCategories[i + 1] !== "undefined" ? '<br>' : '');
            }
            return txt;
        };

    // Public interface
    return {
        publicAccessibilityLegendText: publicAccessibilityLegendText,
        categoriesLegendText: categoriesLegendText
    };
}());

PublicSpace.maps = (function ($, L) {

    // Private properties
        // Dependencies
    var buildingTypeToCategory = PublicSpace.buildings.buildingTypeToCategory,
        getBuildingIcon = PublicSpace.mapsIcons.getBuildingIcon,

        // Popup text templates
        valuationBuildingsPopupTemplate = '{HouseNum} {Street}<br>{TypeOfProperty}<br><small>Assessment Number: {AssessNum}</small>',
        presentDayBuildingsPopupTemplate = '{HouseNum} {Street}<br>{Category}',

    // Private methods
        addTileLayer = function (map) {
            // TODO: Get fresh access token (this one's from Leaflet demo)
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(map);
        },
        addCoordinatesPopup = function (map) {
            // Co-ordinates popup
            var popup = L.popup();
            function onMapClick(e) {
                popup
                    .setLatLng(e.latlng)
                    .setContent("You clicked the map at " + e.latlng.toString())
                    .openOn(map);
            }
            map.on('click', onMapClick);
        },
        createMap = function (elementId, areaId) {
            var map,
                latLong,
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
            } else if (areaId === "broad-street") {
                latLong = [51.45543, -2.59377];
                zoomLevel = 18;
            } else {
                latLong = [51.45921, -2.58229];
            }

            map = L.map(elementId, {
                    scrollWheelZoom: false
                })
                .setView(latLong, zoomLevel);

            addTileLayer(map);
            addCoordinatesPopup(map);

            return map;
        },
        createValuationBuildingIconsLayer = function () {
            // 1910s Valuation building markers
            return new L.geoJson(null, {
                    pointToLayer: function (feature, latlng) {
                        return getBuildingIcon(feature.properties.PropertyCategory, latlng);
                    }
                })
                .bindPopup(function(e){
                    return L.Util.template(valuationBuildingsPopupTemplate, e.feature.properties)
                });
        },
        createValuationBuildingOutlinesLayer = function (fillStyleFunc) {
            // 1910 Valuation Survey building outlines 
            return new L.geoJson(null, {
                    style: function (feature) {
                        return fillStyleFunc(feature.properties.PropertyCategory);
                    }
                })
                .bindPopup(function(e){
                    return L.Util.template(valuationBuildingsPopupTemplate, e.feature.properties);
                });
        },
        createPresentDayBuildingIconsLayer = function () {
            // Present day building markers
            return new L.geoJson(null, {
                    pointToLayer: function (feature, latlng) {
                        return getBuildingIcon(feature.properties.Category, latlng);
                    }
                })
                .bindPopup(function(e){
                    return L.Util.template(presentDayBuildingsPopupTemplate, e.feature.properties)
                });
        },
        createPresentDayBuildingOutlinesLayer = function (fillStyleFunc) {
            // Present day building outlines 
            return new L.geoJson(null, {
                    style: function (feature) {
                        return fillStyleFunc(feature.properties.Category);
                    }
                })
                .bindPopup(function(e){
                    return L.Util.template(presentDayBuildingsPopupTemplate, e.feature.properties)
                });
        },
        getBuildingType = function (districtValuations, feature) {
            // Look up building type from valuations data for the current feature
            var districtRecords = (districtValuations[feature.properties.District] || {}),
                streetRecords = (districtRecords || {})[feature.properties.Street],
                assessmentRecords = (streetRecords || {})[feature.properties.AssessNum],
                unknownBuildingType = "Unknown",
                buildingType = unknownBuildingType;

            if (assessmentRecords && assessmentRecords.length > 0) {
                buildingType = assessmentRecords[0]["Type of Property"];
                buildingType = buildingType === "" ? unknownBuildingType : buildingType;
            }

            return buildingType;
        },
        loadMapData = function (valuationBuildingPoints, valuationBuildingOutlines,
            presentDayBuildingPoints, presentDayBuildingOutlines) {
            var deferred = $.Deferred();

            // Load data
            var districtValuations = {},
                distinctBuildingTypesLookup = {},
                distinctBuildingCategoriesLookup = {};

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

                            // Extend the GeoJSON with building type from valuations data
                            var buildingTypes = [],
                                buildingCategories = [],
                                allValFeatures = [].concat(valBuildingsGeoJson[0].features).concat(valBuildingCentresGeoJson[0].features);
                            $.each(allValFeatures, function (ind, feature) {
                                var buildingType = getBuildingType(districtValuations, feature),
                                    buildingCategory = buildingTypeToCategory(buildingType);
                                
                                feature.properties["TypeOfProperty"] = buildingType;
                                feature.properties["PropertyCategory"] = buildingCategory;
                                distinctBuildingTypesLookup[buildingType] = true;
                                distinctBuildingCategoriesLookup[buildingCategory] = true;
                            });

                            // Add 1910 valuation building data to map layers
                            valuationBuildingOutlines.addData(valBuildingsGeoJson[0]);
                            valuationBuildingPoints.addData(valBuildingCentresGeoJson[0]);

                            // Add present day building data to map layers
                            presentDayBuildingOutlines.addData(presentDayBuildingsGeoJson[0]);
                            presentDayBuildingPoints.addData(presentDayBuildingCentresGeoJson[0]);

                            buildingTypes = Object.keys(distinctBuildingTypesLookup);
                            buildingCategories = Object.keys(distinctBuildingCategoriesLookup);
                            deferred.resolve(buildingTypes, buildingCategories);
                        });
                });

            return deferred.promise();
        },
        drawAreaMap = function (elementId, areaId) {
            // Dependencies
            var getBuildingFillStyle = PublicSpace.buildings.publicAccessibilityFillStyle;

            var mymap = createMap(elementId, areaId);

            // Map layers (actual data is assigned later, after data files loaded)
            var valuationBuildingPoints = createValuationBuildingIconsLayer();
            var valuationBuildingOutlines = createValuationBuildingOutlinesLayer(getBuildingFillStyle);

            var presentDayBuildingPoints = createPresentDayBuildingIconsLayer();
            var presentDayBuildingOutlines = createPresentDayBuildingOutlinesLayer(getBuildingFillStyle);

            // Map layer groups
            var valuations1910Layer = L.layerGroup([valuationBuildingOutlines, valuationBuildingPoints]);
            var presentDayLayer = L.layerGroup([presentDayBuildingOutlines, presentDayBuildingPoints]);
            L.control.layers(
                    {
                        "Present day (2016)": presentDayLayer,
                        "1910": valuations1910Layer
                    }, 
                    null, 
                    {collapsed: false})
                .addTo(mymap);
            
            // Set default layer to visible
            presentDayLayer.addTo(mymap);

            loadMapData(valuationBuildingPoints, valuationBuildingOutlines,
                presentDayBuildingPoints, presentDayBuildingOutlines)
                .done (function (buildingTypes, buildingCategories) {
                    // Add map legend for property type colours
                    var legend = L.control({position: 'topright'});
                    legend.onAdd = function (map) {
                            var div = L.DomUtil.create('div', 'map-info map-legend');

                            // Add a legend entry for each Property Cateogory
                            div.innerHTML += PublicSpace.mapLegends.categoriesLegendText();
                            // Add entry for whether building is accessible to public
                            div.innerHTML += PublicSpace.mapLegends.publicAccessibilityLegendText();

                            return div;
                        };
                    legend.addTo(mymap);
                });

            return mymap;
        };

    

    // Public interface
    return {
        drawAreaMap: drawAreaMap
    };
}(jQuery, L));

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
