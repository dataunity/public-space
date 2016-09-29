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
        publicAccessibilityFillStyle = function (buildingCategory, fillOpacity) {
            var fillColor = publicAccessibilityColour(buildingCategory),
                fillOpacity = typeof fillOpacity === "undefined" ? 0.3 : fillOpacity;
            
            return {
                radius: 8,
                fillColor: fillColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: fillOpacity
            };
        },
        buildingCategoryScale = d3.scaleOrdinal(d3.schemeCategory10),
        buildingCategoryFillStyle = function (buildingCategory, fillOpacity) {
            var buildingCategory = buildingCategory === "Unknown" ? "Other" : buildingCategory,
                fillColor = buildingCategoryScale(buildingCategory),
                fillOpacity = typeof fillOpacity === "undefined" ? 0.3 : fillOpacity;
            
            return {
                radius: 8,
                fillColor: fillColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: fillOpacity
            };
        },
        colourScaleFillStyle = function (name, fillOpacity, buildingFillColourScale) {
            var fillColor = buildingFillColourScale(name),
                fillOpacity = typeof fillOpacity === "undefined" ? 0.3 : fillOpacity;
            
            return {
                radius: 8,
                fillColor: fillColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: fillOpacity
            };
        };

        // Tmp - might not be used depending on colour fill
        // Initialise category scale (so colours remain constant)
        $.each(Object.keys(categories).sort(), function (ind, val) {
            var tmpColour = buildingCategoryScale(val);
        });

    return {
        categories: categories,
        buildingTypeToCategory: buildingTypeToCategory,
        publicAccessibilityFillStyle: publicAccessibilityFillStyle,
        publiclyAccessibleColour: publiclyAccessibleColour,
        notPubliclyAccessibleColour: notPubliclyAccessibleColour,
        unknownPubliclyAccessibleColour: unknownPubliclyAccessibleColour,
        buildingCategoryFillStyle: buildingCategoryFillStyle,
        colourScaleFillStyle: colourScaleFillStyle
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
            var txt = "<h4>Public accessibility:</h4>";
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
        categoryIconsLegendText = function () {
            var txt = "",
                tmpPropertyCategory,
                tmpPropertyCategories = Object.keys(buildingCategories);

            txt += "<h4>Type of building:</h4>";
            for (var i = 0; i < tmpPropertyCategories.length; i++) {
                tmpPropertyCategory = tmpPropertyCategories[i];
                txt +=
                    '<img src="' + propertyCategoryIconPath(tmpPropertyCategory) + '"> ' +
                    tmpPropertyCategories[i] + (typeof tmpPropertyCategories[i + 1] !== "undefined" ? '<br>' : '');
            }
            return txt;
        },
        categoryColoursLegendText = function () {
            var colourStyle = PublicSpace.buildings.buildingCategoryFillStyle,
                txt = "",
                tmpPropertyCategory,
                tmpPropertyCategories = Object.keys(buildingCategories);

            txt += "<h4>Building category:</h4>";
            for (var i = 0; i < tmpPropertyCategories.length; i++) {
                tmpPropertyCategory = tmpPropertyCategories[i];
                txt +=
                    '<i style="background:' + colourStyle(tmpPropertyCategory).fillColor + '"></i> ' +
                    tmpPropertyCategories[i] + (typeof tmpPropertyCategories[i + 1] !== "undefined" ? '<br>' : '');
            }
            return txt;
        },
        colourScaleLegendText = function (title, items, colourScale) {
            var txt = "",
                tmpItem;

            txt += "<h4>" + title + ":</h4>";
            for (var i = 0; i < items.length; i++) {
                tmpItem = items[i];
                txt +=
                    '<i style="background:' + colourScale(tmpItem) + '"></i> ' +
                    items[i] + (typeof items[i + 1] !== "undefined" ? '<br>' : '');
            }
            return txt;
        };

    // Public interface
    return {
        publicAccessibilityLegendText: publicAccessibilityLegendText,
        categoryIconsLegendText: categoryIconsLegendText,
        categoryColoursLegendText: categoryColoursLegendText,
        colourScaleLegendText: colourScaleLegendText
    };
}());

PublicSpace.maps = (function ($, L) {

    // Private properties
        // Dependencies
    var buildingTypeToCategory = PublicSpace.buildings.buildingTypeToCategory,
        getBuildingIcon = PublicSpace.mapsIcons.getBuildingIcon,

        // Popup text templates
        valuationBuildingsPopupTemplate = '{HouseNum} {Street}<br>{TypeOfProperty}<br><small>Assessment Number: {AssessNum}</small>',
        presentDayBuildingsPopupTemplate = '{HouseNum} {Street}<br>Building use: {Category}<br>Ownership: {Ownership}<br>Occupier: {Occupier}',

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
        geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        },
        createCircleMarkersLayer = function (featurePropertyName, fillStyleFunc, popupTextTemplate, buildingFillColourScale) {
            var fillOpacity = typeof fillStyleFunc.__fillOpacity === "undefined" ? 0.3 : fillStyleFunc.__fillOpacity;
            return new L.geoJson(null, {
                    pointToLayer: function (feature, latlng) {
                        // console.log("feature", feature, feature.properties[featurePropertyName], fillStyleFunc(feature.properties[featurePropertyName], fillOpacity, buildingFillColourScale));
                        var fillColor = fillStyleFunc(feature.properties[featurePropertyName], fillOpacity, buildingFillColourScale).fillColor;
                        return L.circleMarker(latlng, {
                            radius: 8,
                            fillColor: fillColor,
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                        // return L.circleMarker(latlng, geojsonMarkerOptions);
                    }
                })
                .bindPopup(function(e){
                    return L.Util.template(popupTextTemplate, e.feature.properties)
                });
        },
        // createValuationBuildingOutlinesLayer = function (fillStyleFunc) {
        //     // 1910 Valuation Survey building outlines 
        //     var fillOpacity = typeof fillStyleFunc.__fillOpacity === "undefined" ? 0.3 : fillStyleFunc.__fillOpacity;
        //     return new L.geoJson(null, {
        //             style: function (feature) {
        //                 return fillStyleFunc(feature.properties.PropertyCategory, fillOpacity);
        //             }
        //         })
        //         .bindPopup(function(e){
        //             return L.Util.template(valuationBuildingsPopupTemplate, e.feature.properties);
        //         });
        // },
        createBuildingOutlinesLayer = function (featurePropertyName, fillStyleFunc, popUpTextTemplate, buildingFillColourScale) {
            // 1910 Valuation Survey building outlines 
            var fillOpacity = typeof fillStyleFunc.__fillOpacity === "undefined" ? 0.3 : fillStyleFunc.__fillOpacity;

            return new L.geoJson(null, {
                    style: function (feature) {
                        return fillStyleFunc(feature.properties[featurePropertyName], fillOpacity, buildingFillColourScale);
                    }
                })
                .bindPopup(function(e){
                    return L.Util.template(popUpTextTemplate, e.feature.properties);
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
        // createPresentDayBuildingOutlinesLayer = function (fillStyleFunc) {
        //     // Present day building outlines 
        //     var fillOpacity = typeof fillStyleFunc.__fillOpacity === "undefined" ? 0.3 : fillStyleFunc.__fillOpacity;
        //     return new L.geoJson(null, {
        //             style: function (feature) {
        //                 return fillStyleFunc(feature.properties.Category, fillOpacity);
        //             }
        //         })
        //         .bindPopup(function(e){
        //             return L.Util.template(presentDayBuildingsPopupTemplate, e.feature.properties)
        //         });
        // },
        getValuationsRecordValue = function (districtValuations, feature, valuationsColumn) {
            // Look up a value from a column in the valuations data for the specified feature
            var districtRecords = (districtValuations[feature.properties.District] || {}),
                streetRecords = (districtRecords || {})[feature.properties.Street],
                assessmentRecords = (streetRecords || {})[feature.properties.AssessNum],
                unknownValue = "Unknown",
                val = unknownValue;

            if (assessmentRecords && assessmentRecords.length > 0) {
                val = assessmentRecords[0][valuationsColumn];
                val = val === "" ? unknownValue : val;
            }

            return val;
        },
        // getBuildingType = function (districtValuations, feature) {
        //     // Look up building type from valuations data for the current feature
        //     var districtRecords = (districtValuations[feature.properties.District] || {}),
        //         streetRecords = (districtRecords || {})[feature.properties.Street],
        //         assessmentRecords = (streetRecords || {})[feature.properties.AssessNum],
        //         unknownBuildingType = "Unknown",
        //         buildingType = unknownBuildingType;

        //     if (assessmentRecords && assessmentRecords.length > 0) {
        //         buildingType = assessmentRecords[0]["Type of Property"];
        //         buildingType = buildingType === "" ? unknownBuildingType : buildingType;
        //     }

        //     return buildingType;
        // },
        loadMapData = function (valuationBuildingPoints, valuationBuildingOutlines,
            presentDayBuildingPoints, presentDayBuildingOutlines) {
            // Load data and apply it to map layers
            var deferred = $.Deferred();

            // Load data
            var districtValuations = {},
                distinctBuildingTypesLookup = {},
                distinctBuildingCategoriesLookup = {},
                distinctOwnershipLookup = {};

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
                                ownershipValues = [],
                                allFeatures = [],
                                allValFeatures = [].concat(valBuildingsGeoJson[0].features).concat(valBuildingCentresGeoJson[0].features);
                            $.each(allValFeatures, function (ind, feature) {
                                var buildingType = getValuationsRecordValue(districtValuations, feature, "Type of Property"),
                                    // buildingType = getBuildingType(districtValuations, feature),
                                    buildingCategory = buildingTypeToCategory(buildingType),
                                    ownership = getValuationsRecordValue(districtValuations, feature, "Ownership");
                                
                                feature.properties["TypeOfProperty"] = buildingType;
                                feature.properties["PropertyCategory"] = buildingCategory;
                                feature.properties["Ownership"] = ownership;

                                // Store the distinct values
                                distinctBuildingTypesLookup[buildingType] = true;
                                distinctBuildingCategoriesLookup[buildingCategory] = true;
                            });

                            allFeatures = [].concat(valBuildingsGeoJson[0].features)
                                .concat(valBuildingCentresGeoJson[0].features)
                                .concat(valBuildingsGeoJson[0].features)
                                .concat(valBuildingCentresGeoJson[0].features);
                            $.each(allValFeatures, function (ind, feature) {
                                var ownership = feature.properties["Ownership"];

                                // Store the distinct values
                                distinctOwnershipLookup[ownership] = true;
                            });

                            // Add 1910 valuation building data to map layers
                            if (valuationBuildingOutlines !== null) {
                                valuationBuildingOutlines.addData(valBuildingsGeoJson[0]);
                            }
                            if (valuationBuildingPoints !== null) {
                                valuationBuildingPoints.addData(valBuildingCentresGeoJson[0]);
                            }
                            
                            // Add present day building data to map layers
                            if (presentDayBuildingOutlines !== null) {
                                presentDayBuildingOutlines.addData(presentDayBuildingsGeoJson[0]);
                            }
                            if (presentDayBuildingPoints !== null) {
                                presentDayBuildingPoints.addData(presentDayBuildingCentresGeoJson[0]);
                            }

                            buildingTypes = Object.keys(distinctBuildingTypesLookup);
                            buildingCategories = Object.keys(distinctBuildingCategoriesLookup);
                            ownershipValues = Object.keys(distinctOwnershipLookup);
                            deferred.resolve(buildingTypes, buildingCategories, ownershipValues);
                        });
                });

            return deferred.promise();
        },
        tmpParseMapOptions = function (mapStyle) {
            // Makes map drawing options from string
            var mapOptions = {
                "fillOpacity": 0.3,
                "markers": "icons",
                "fillMethod": "publiclyaccessible",
                "showBuildings": true
            };

            if (mapStyle) {
                $.each(mapStyle.split(";"), function (ind, optionText) {
                    var parts = optionText.split(":"),
                        key = parts[0].trim(),
                        val = parts[1].trim();
                    if (key === "fillOpacity") {
                        mapOptions[key] = parseFloat(val);
                    } else if (key === "showBuildings") {
                        mapOptions[key] = val === "false" ? false : true;
                    } else {
                        mapOptions[key] = val;
                    }
                });
            }
            
            return mapOptions;
        }
        drawAreaMap = function (elementId, areaId, tmpMapStyle) {
            // Note: tmpMapStyle is temporary - just to experiment with styles
            var mapOptions = tmpParseMapOptions(tmpMapStyle);

            var mymap = createMap(elementId, areaId);

            var valuationBuildingPoints = null,
                valuationBuildingOutlines = null,
                presentDayBuildingPoints = null,
                presentDayBuildingOutlines = null;

            // Set the fill style for buildings
            var getBuildingFillStyle;
            // Colour scale for building type
            var buildingTypesColourScale = d3.scaleOrdinal(d3.schemeCategory10);
            var buildingFillColourScale = buildingTypesColourScale;

            switch (mapOptions.fillMethod) {
                case "buildingCategory":
                    getBuildingFillStyle = PublicSpace.buildings.buildingCategoryFillStyle;
                    break;
                case "buildingType":
                    getBuildingFillStyle = PublicSpace.buildings.colourScaleFillStyle;
                    break;
                case "ownership":
                    getBuildingFillStyle = PublicSpace.buildings.colourScaleFillStyle;
                    break;
                case "publiclyaccessible":
                default:
                    getBuildingFillStyle = PublicSpace.buildings.publicAccessibilityFillStyle;
                    break;
            }

            if (typeof mapOptions.fillOpacity !== "undefined") {
                getBuildingFillStyle.__fillOpacity = mapOptions["fillOpacity"];
            }

            // Map layers (actual data is assigned later, after data files loaded)
            switch (mapOptions["markers"]) {
                case "icons":
                    valuationBuildingPoints = createValuationBuildingIconsLayer();
                    presentDayBuildingPoints = createPresentDayBuildingIconsLayer();
                    break;
                case "circles":
                    valuationBuildingPoints = createCircleMarkersLayer("TypeOfProperty", getBuildingFillStyle,
                        valuationBuildingsPopupTemplate, buildingFillColourScale);
                    presentDayBuildingPoints = createCircleMarkersLayer("Category", getBuildingFillStyle,
                        presentDayBuildingsPopupTemplate, buildingFillColourScale);
                    break;
                default:
                    valuationBuildingPoints = createValuationBuildingIconsLayer();
                    presentDayBuildingPoints = createPresentDayBuildingIconsLayer();
                    break;
            }
            
            // Create the buildings map layer
            switch (mapOptions.fillMethod) {
                case "buildingCategory":
                    valuationBuildingOutlines = createBuildingOutlinesLayer("PropertyCategory", getBuildingFillStyle,
                        valuationBuildingsPopupTemplate);
                    presentDayBuildingOutlines = createBuildingOutlinesLayer("Category", getBuildingFillStyle, 
                        presentDayBuildingsPopupTemplate);
                    break;
                case "buildingType":
                    valuationBuildingOutlines = createBuildingOutlinesLayer("TypeOfProperty", getBuildingFillStyle,
                        valuationBuildingsPopupTemplate, buildingFillColourScale);
                    presentDayBuildingOutlines = createBuildingOutlinesLayer("Category", getBuildingFillStyle, 
                        presentDayBuildingsPopupTemplate, buildingFillColourScale);
                    break;
                case "ownership":
                    valuationBuildingOutlines = createBuildingOutlinesLayer("Ownership", getBuildingFillStyle,
                        valuationBuildingsPopupTemplate, buildingFillColourScale);
                    presentDayBuildingOutlines = createBuildingOutlinesLayer("Ownership", getBuildingFillStyle, 
                        presentDayBuildingsPopupTemplate, buildingFillColourScale);
                    break;
                case "publiclyaccessible":
                default:
                    valuationBuildingOutlines = createBuildingOutlinesLayer("PropertyCategory", getBuildingFillStyle,
                        valuationBuildingsPopupTemplate);
                    presentDayBuildingOutlines = createBuildingOutlinesLayer("Category", getBuildingFillStyle,
                        presentDayBuildingsPopupTemplate);
                    break;
            }
            // valuationBuildingOutlines = createValuationBuildingOutlinesLayer(getBuildingFillStyle);
            // presentDayBuildingOutlines = createPresentDayBuildingOutlinesLayer(getBuildingFillStyle);

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
            valuations1910Layer.addTo(mymap);
            // presentDayLayer.addTo(mymap);

            // Load data and apply it to map layers
            loadMapData(mapOptions["markers"] === "none" ? null : valuationBuildingPoints, 
                mapOptions.showBuildings === false ? null : valuationBuildingOutlines,
                mapOptions["markers"] === "none" ? null : presentDayBuildingPoints, 
                mapOptions.showBuildings === false ? null : presentDayBuildingOutlines)
                .done (function (buildingTypes, buildingCategories, ownershipValues) {
                    // Add map legend for property type colours
                    var legend = L.control({position: 'topright'});
                    legend.onAdd = function (map) {
                            var div = L.DomUtil.create('div', 'map-info map-legend');

                            if (mapOptions["markers"] !== "none") {
                                // Add a legend entry for each Property Category
                                div.innerHTML += PublicSpace.mapLegends.categoryIconsLegendText();
                            }
                            // Add entry for whether building is accessible to public
                            switch (mapOptions.fillMethod) {
                                case "none":
                                    break;
                                case "buildingCategory":
                                    div.innerHTML += PublicSpace.mapLegends.categoryColoursLegendText();
                                    break;
                                case "buildingType":
                                    div.innerHTML += PublicSpace.mapLegends.colourScaleLegendText("Building type",
                                        buildingTypes,
                                        buildingTypesColourScale);
                                    break;
                                case "ownership":
                                    div.innerHTML += PublicSpace.mapLegends.colourScaleLegendText("Building ownership",
                                        ownershipValues,
                                        buildingTypesColourScale);
                                    break;
                                default:
                                    div.innerHTML += PublicSpace.mapLegends.publicAccessibilityLegendText();
                                    break;
                            }

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
