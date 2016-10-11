var PublicSpace = PublicSpace || {};

// Information about buildings
PublicSpace.buildings = (function () {
    // var categories = {
    //         "Shop": "Shop",
    //         "House": "House",
    //         "Public house": "Public house",
    //         "Industrial or storage": "Industrial or storage",
    //         "Other": "Other"
    //     },
    //     buildingTypeToCategory = function (buildingType) {
    //         switch (buildingType) {
    //             case "Shop":
    //             case "House and shop":
    //             case "Shop and offices":
    //             case "House, shop and offices":
    //             case "Showroom":
    //                 return "Shop";
    //             case "House":
    //             case "Almshouses":
    //                 return "House";
    //             case "Public house":
    //                 return "Public house";
    //             case "Warehouse":
    //             case "Saw mill":
    //                 return "Industrial or storage";
    //             default:
    //                 return "Unknown";
    //         }
    //     };

        // Public accessibility colours
    var publiclyAccessibleColour = "#2ca02c",
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
        // buildingCategoryScale = d3.scaleOrdinal(d3.schemeCategory10),
        // buildingCategoryFillStyle = function (buildingCategory, fillOpacity) {
        //     var buildingCategory = buildingCategory === "Unknown" ? "Other" : buildingCategory,
        //         fillColor = buildingCategoryScale(buildingCategory),
        //         fillOpacity = typeof fillOpacity === "undefined" ? 0.3 : fillOpacity;
            
        //     return {
        //         radius: 8,
        //         fillColor: fillColor,
        //         color: "#000",
        //         weight: 1,
        //         opacity: 1,
        //         fillOpacity: fillOpacity
        //     };
        // },
        colourScaleFillStyle = function (name, fillOpacity, buildingFillColourScale) {
            var fillColor = buildingFillColourScale(name),
                fillOpacity = typeof fillOpacity === "undefined" ? 1.0 : fillOpacity;
            
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
        // $.each(Object.keys(categories).sort(), function (ind, val) {
        //     var tmpColour = buildingCategoryScale(val);
        // });

    return {
        //categories: categories,
        //buildingTypeToCategory: buildingTypeToCategory,
        publicAccessibilityFillStyle: publicAccessibilityFillStyle,
        publiclyAccessibleColour: publiclyAccessibleColour,
        notPubliclyAccessibleColour: notPubliclyAccessibleColour,
        unknownPubliclyAccessibleColour: unknownPubliclyAccessibleColour,
        //buildingCategoryFillStyle: buildingCategoryFillStyle,
        colourScaleFillStyle: colourScaleFillStyle
    };
}());

/*
// Icons to display on maps
PublicSpace.mapsIcons = (function (L) {
    // var buildingCategories = PublicSpace.buildings.categories,
    var PropertyTypeIcon = L.Icon.extend({
            options: {
                iconSize:     [20, 18],
                iconAnchor:   [10, 9],
                popupAnchor:  [-3, -9]
            }
        }),
        propertyCategoryIcons = {
            "Shop": "./images/icons/shop.png",
            "House": "./images/icons/house.png",
            "Public house": "./images/icons/public_house.png",
            "Industrial or storage": "./images/icons/industrial_or_storage.png",
            "Other": "./images/icons/other.png"
        },

        // Icon image paths
        propertyCategoryIconPath = function (propertyCategory) {
            // Path to icon for building categories
            var pathToIcon = propertyCategoryIcons[propertyCategory];
            if (typeof pathToIcon === "undefined") {
                pathToIcon = "./images/icons/other.png";
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
*/

PublicSpace.mapLegends = (function () {
    // Private properties
        // Dependencies
    // var buildingCategories = PublicSpace.buildings.categories,
    // var propertyCategoryIconPath = PublicSpace.mapsIcons.propertyCategoryIconPath,
    var publiclyAccessibleColour = PublicSpace.buildings.publiclyAccessibleColour,
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
        // categoryIconsLegendText = function () {
        //     var txt = "",
        //         tmpPropertyCategory,
        //         tmpPropertyCategories = Object.keys(buildingCategories);

        //     txt += "<h4>Type of building:</h4>";
        //     for (var i = 0; i < tmpPropertyCategories.length; i++) {
        //         tmpPropertyCategory = tmpPropertyCategories[i];
        //         txt +=
        //             '<img src="' + propertyCategoryIconPath(tmpPropertyCategory) + '"> ' +
        //             tmpPropertyCategories[i] + (typeof tmpPropertyCategories[i + 1] !== "undefined" ? '<br>' : '');
        //     }
        //     return txt;
        // },
        // categoryColoursLegendText = function () {
        //     var colourStyle = PublicSpace.buildings.buildingCategoryFillStyle,
        //         txt = "",
        //         tmpPropertyCategory,
        //         tmpPropertyCategories = Object.keys(buildingCategories);

        //     txt += "<h4>Building category:</h4>";
        //     for (var i = 0; i < tmpPropertyCategories.length; i++) {
        //         tmpPropertyCategory = tmpPropertyCategories[i];
        //         txt +=
        //             '<i style="background:' + colourStyle(tmpPropertyCategory).fillColor + '"></i> ' +
        //             tmpPropertyCategories[i] + (typeof tmpPropertyCategories[i + 1] !== "undefined" ? '<br>' : '');
        //     }
        //     return txt;
        // },
        colourScaleLegendText = function (title, items, colourScale) {
            var txt = "",
                tmpItem;

            txt += "<strong>" + title + ":</strong></br></br>";
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
        // categoryIconsLegendText: categoryIconsLegendText,
        //categoryColoursLegendText: categoryColoursLegendText,
        colourScaleLegendText: colourScaleLegendText
    };
}());

PublicSpace.maps = (function ($, L) {

    // Private properties
        // Dependencies
    // var buildingTypeToCategory = PublicSpace.buildings.buildingTypeToCategory,
    // var getBuildingIcon = PublicSpace.mapsIcons.getBuildingIcon,

        // Popup text templates
    var valuationBuildingsPopupTemplate = '{HouseNum} {Street}<br>Building use: {BuildingUse}<br>Ownership: {Ownership}<br><small>Assessment Number: {AssessNum}</small>',
        presentDayBuildingsPopupTemplate = '{HouseNum} {Street}<br>Building use: {BuildingUse}<br>Ownership: {Ownership}<br>Occupier: {Occupier}',
        leechBuildingsPopupTemplate = '{Ref} {StreetName}<br>Building use: {BuildingUse}<br>Ownership: {Ownership}',
        ashmead1828BuildingsPopupTemplate = '<strong>{Name}</strong><br>Category: {Category}<br>Ashmead Ref: {RefNum}',

    // Private methods
        createTileLayer = function () {
            // TODO: Get fresh access token (this one's from Leaflet demo)
            return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets'
            });
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
                // Central Bristol
                latLong = [51.45611, -2.5909];
                zoomLevel = 16.5;
            }

            map = L.map(elementId, {
                    scrollWheelZoom: false
                })
                .setView(latLong, zoomLevel);

            addCoordinatesPopup(map);

            return map;
        },
        // createValuationBuildingIconsLayer = function () {
        //     // 1910s Valuation building markers
        //     return new L.geoJson(null, {
        //             pointToLayer: function (feature, latlng) {
        //                 return getBuildingIcon(feature.properties.PropertyCategory, latlng);
        //             }
        //         })
        //         .bindPopup(function(e){
        //             return L.Util.template(valuationBuildingsPopupTemplate, e.feature.properties)
        //         });
        // },
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
        createBuildingOutlinesLayer = function (featurePropertyName, fillStyleFunc, popUpTextTemplate, buildingFillColourScale) {
            // Layer for building outlines. Coloured based on featurePropertyName and colour scale
            var fillOpacity = typeof fillStyleFunc.__fillOpacity === "undefined" ? 1.0 : fillStyleFunc.__fillOpacity;

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
        renameUnknownValue = function (val) {
            // Makes all the variations of unknown values (e.g. empty string and 'Unknown') look the same
            var unknownValue = "Unknown";
            // console.log("val before", val);
            if (typeof val === "undefined" || val === "") {
                val = unknownValue;
            }
            if (typeof val === "undefined") {
                console.log("HERE");
            }
            // console.log("val after", val);
            return val;
        },
        getDoomsday1910RecordValue = function (districtValuations, feature, valuationsColumn) {
            // Look up a value from a column in the valuations data for the specified geojson feature
            // var districtRecords = (districtValuations[feature.properties.District] || {}),
            //     streetRecords = (districtRecords || {})[feature.properties.Street],
            var streetRecords = (districtValuations[feature.properties.Street] || {}),
                assessmentRecords = (streetRecords || {})[feature.properties.AssessNum],
                val;

            if (assessmentRecords && assessmentRecords.length > 0) {
                val = assessmentRecords[0][valuationsColumn];
            }
            val = renameUnknownValue(val);

            return val;
        },
        getLeechRecordValue = function (indexedRecords, feature, spreadsheetColumn) {
            // Look up a value from a column in the Leech records for the specified geojson feature
            var streetRecords = (indexedRecords[feature.properties.StreetName] || {}),
                assessmentRecords = (streetRecords || {})[feature.properties.Ref],
                val;

            if (assessmentRecords && assessmentRecords.length > 0) {
                val = assessmentRecords[0][spreadsheetColumn];
            }
            val = renameUnknownValue(val);

            return val;
        },
        indexValuationsData = function (doomsday1910Records) {
            // Creates an nested index version of list of records
            return d3.nest()
                // .key(function (d) { return d.District; })
                .key(function (d) { return d.Street; })
                .key(function (d) { return d["Source: No. of Assessment"]; })
                .object(doomsday1910Records);
        },
        indexLeechData = function (leechRecords) {
            // Creates an nested index version of list of records
            return d3.nest()
                .key(function (d) { return d["Street name"]; })
                .key(function (d) { return d["Plot ref"]; })
                .object(leechRecords);
        },
        loadMapData = function (valuationBuildingPoints, valuationBuildingLayers,
            presentDayBuildingPoints, presentDayBuildingLayers, 
            leechBuildingLayers, ashmead1828BuildingsOwnershipLayer) {
            // Load data and apply it to map layers
            var deferred = $.Deferred();

            // Load data
            var districtValuations = {};

            // Load spreadsheet data files
            $.when($.get("./csv/Bristol_Valuation_Records_1910.csv"),
                $.get("./csv/Leech_topography_BRS.csv"))
                .done(function (doomsday1910Response, leechResponse) {
                    
                    // Just use the data argument of the response
                    var doomsday1910Data = doomsday1910Response[0],
                        leechData = leechResponse[0],

                        // Extract records from data
                        doomsday1910Records = d3.csvParse(doomsday1910Data),
                        leechRecords = d3.csvParse(leechData);

                    // Index the spreadsheet data (by district, street, ref number)
                    districtValuations = indexValuationsData(doomsday1910Records);
                    console.log(districtValuations);
                    indexedLeechRecords = indexLeechData(leechRecords);

                    // Load the GeoJSON data
                    $.when($.getJSON("./geojson/Valuations_1910_Building_Outline.geojson"),
                        $.getJSON("./geojson/Valuations_1910_Building_Centres.geojson"),
                        $.getJSON("./geojson/Buildings_Present_Day.geojson"),
                        $.getJSON("./geojson/Buildings_Present_Day_Centres.geojson"),
                        $.getJSON("./geojson/Leech_Topography.geojson"),
                        $.getJSON("./geojson/Ashmead_1828_Buildings.geojson"))
                        .done(function (valBuildingsGeoJsonResponse, 
                                valBuildingCentresGeoJsonResponse,
                                presentDayBuildingsGeoJsonResponse,
                                presentDayBuildingCentresGeoJsonResponse,
                                leechBuildingsGeoJsonResponse,
                                ashmeadBuildingsGeoJsonResponse) {

                            var valBuildingsGeoJson = valBuildingsGeoJsonResponse[0], 
                                valBuildingCentresGeoJson = valBuildingCentresGeoJsonResponse[0],
                                presentDayBuildingsGeoJson = presentDayBuildingsGeoJsonResponse[0],
                                presentDayBuildingCentresGeoJson = presentDayBuildingCentresGeoJsonResponse[0],
                                leechBuildingsGeoJson = leechBuildingsGeoJsonResponse[0],
                                ashmeadBuildingsGeoJson = ashmeadBuildingsGeoJsonResponse[0];

                            
                            var distinctBuildingTypesLookup = {},
                                //distinctBuildingCategoriesLookup = {},
                                distinctOwnershipLookup = {},
                                distinctAshmead1828CategoriesLookup = {},
                                buildingTypes = [],
                                //buildingCategories = [],
                                ownershipValues = [],
                                ashmead1828Categories = [],
                                allFeatures = [],
                                allValFeatures = [].concat(valBuildingsGeoJson.features).concat(valBuildingCentresGeoJson.features),
                                allPresentDayFeatures = [].concat(presentDayBuildingsGeoJson.features).concat(presentDayBuildingCentresGeoJson.features);
                            
                            // Extend the 1910 GeoJSON with building type from 1910 Doomsday data
                            $.each(allValFeatures, function (ind, feature) {
                                var buildingUse = getDoomsday1910RecordValue(districtValuations, feature, "Type of Property"),
                                    ownership = getDoomsday1910RecordValue(districtValuations, feature, "Ownership");
                                // console.log("buildingUse", buildingUse);
                                // console.log(feature.properties);
                                
                                // Match up feature property names with other layers
                                feature.properties["TypeOfProperty"] = buildingUse;
                                feature.properties["BuildingUse"] = buildingUse;
                                feature.properties["Ownership"] = ownership;
                            });

                            // Extend the 18th Century building GeoJSON with Leech spreadsheet
                            $.each(leechBuildingsGeoJson.features, function (ind, feature) {
                                var buildingUse = getLeechRecordValue(indexedLeechRecords, feature, "Building use (18th C)"),
                                    ownership = getLeechRecordValue(indexedLeechRecords, feature, "Ownership (18th C)");
                                
                                // Match up feature property names with other layers
                                feature.properties["BuildingUse"] = buildingUse;
                                feature.properties["Ownership"] = ownership;
                            });

                            $.each(allPresentDayFeatures, function (ind, feature) {
                                // Match up feature property names with other layers
                                var buildingUse = feature.properties["Category"],
                                    ownership = feature.properties["Ownership"];
                                buildingUse = renameUnknownValue(buildingUse);
                                ownership = renameUnknownValue(ownership);
                                feature.properties["BuildingUse"] = buildingUse;
                                feature.properties["Ownership"] = ownership;
                            });

                            // Get unique names of building use/ownership
                            allFeatures = [].concat(valBuildingsGeoJson.features)
                                .concat(valBuildingCentresGeoJson.features)
                                .concat(presentDayBuildingsGeoJson.features)
                                .concat(presentDayBuildingCentresGeoJson.features)
                                .concat(leechBuildingsGeoJson.features);
                            $.each(allFeatures, function (ind, feature) {
                                var buildingUse = feature.properties["BuildingUse"],
                                    ownership = feature.properties["Ownership"];

                                // Store the distinct values
                                distinctBuildingTypesLookup[buildingUse] = true;
                                distinctOwnershipLookup[ownership] = true;
                            });

                            // Get unique names of Ashmead 1828 categories
                            $.each(ashmeadBuildingsGeoJson.features, function (ind, feature) {
                                var category = feature.properties["Category"];

                                // Store the distinct values
                                distinctAshmead1828CategoriesLookup[category] = true;
                            });

                            // Add 1910 valuation building data to map layers
                            if (valuationBuildingLayers !== null) {
                                $.each(valuationBuildingLayers, function (ind, layer) {
                                    layer.addData(valBuildingsGeoJson);
                                });
                            }
                            if (valuationBuildingPoints !== null) {
                                valuationBuildingPoints.addData(valBuildingCentresGeoJson);
                            }
                            
                            // Add present day building data to map layers
                            if (presentDayBuildingLayers !== null) {
                                $.each(presentDayBuildingLayers, function (ind, layer) {
                                    layer.addData(presentDayBuildingsGeoJson);
                                });
                            }
                            if (presentDayBuildingPoints !== null) {
                                presentDayBuildingPoints.addData(presentDayBuildingCentresGeoJson);
                            }

                            // Add 18th Century (Leech) building data to map layers
                            if (leechBuildingLayers !== null) {
                                $.each(leechBuildingLayers, function (ind, layer) {
                                    layer.addData(leechBuildingsGeoJson);
                                });
                            }

                            // Add 1828 Ashmead data
                            ashmead1828BuildingsOwnershipLayer.addData(ashmeadBuildingsGeoJson);                            

                            buildingTypes = Object.keys(distinctBuildingTypesLookup);
                            //buildingCategories = Object.keys(distinctBuildingCategoriesLookup);
                            ownershipValues = Object.keys(distinctOwnershipLookup);
                            ashmead1828Categories = Object.keys(distinctAshmead1828CategoriesLookup);
                            deferred.resolve(buildingTypes, ownershipValues, ashmead1828Categories);
                        });
                })
                .fail(function () {
                    alert("Couldn't access spreadsheet data.");
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
        },
        drawAreaMap = function (elementId, areaId, tmpMapStyle) {
            // Note: tmpMapStyle is temporary - just to experiment with styles
            var mapOptions = tmpParseMapOptions(tmpMapStyle);

            var mymap = createMap(elementId, areaId),
                tileLayer = createTileLayer();

            var valuationBuildingOutlines = null,
                presentDayBuildingOutlines = null;

            // var valuationBuildingPoints = null,
            //     valuationBuildingOutlines = null,
            //     presentDayBuildingPoints = null,
            //     presentDayBuildingOutlines = null;

            // Set the fill style for buildings
            var getBuildingFillStyle;
            // Colour scale for building type
            var buildingTypesColourScale = d3.scaleOrdinal(d3.schemeCategory20);
            var buildingFillColourScale = buildingTypesColourScale;

            switch (mapOptions.fillMethod) {
                // case "buildingCategory":
                //     getBuildingFillStyle = PublicSpace.buildings.buildingCategoryFillStyle;
                //     break;
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
            /*
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
            */
            
            // Create the buildings map layer
            switch (mapOptions.fillMethod) {
                // case "buildingCategory":
                //     valuationBuildingOutlines = createBuildingOutlinesLayer("PropertyCategory", getBuildingFillStyle,
                //         valuationBuildingsPopupTemplate);
                //     presentDayBuildingOutlines = createBuildingOutlinesLayer("Category", getBuildingFillStyle, 
                //         presentDayBuildingsPopupTemplate);
                //     break;
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

            // Create the buildings layers (showing outlines of buildings on map)
            var buildingTypesColourScale = d3.scaleOrdinal(d3.schemeCategory20),
                buildingOwnershipColourScale = d3.scaleOrdinal(d3.schemeCategory20),
                ashmead1828CategoriesColourScale = d3.scaleOrdinal(d3.schemeCategory10);
            var valuationBuildingsTypeLayer = createBuildingOutlinesLayer("BuildingUse", 
                    PublicSpace.buildings.colourScaleFillStyle,
                    valuationBuildingsPopupTemplate, buildingTypesColourScale),
                presentDayBuildingsTypeLayer = createBuildingOutlinesLayer("BuildingUse", 
                    PublicSpace.buildings.colourScaleFillStyle, 
                    presentDayBuildingsPopupTemplate, buildingTypesColourScale),
                leechBuildingsTypeLayer = createBuildingOutlinesLayer("BuildingUse", 
                    PublicSpace.buildings.colourScaleFillStyle, 
                    leechBuildingsPopupTemplate, buildingTypesColourScale),
                valuationBuildingsOwnershipLayer = createBuildingOutlinesLayer("Ownership", 
                    PublicSpace.buildings.colourScaleFillStyle,
                    valuationBuildingsPopupTemplate, buildingOwnershipColourScale),
                presentDayBuildingsOwnershipLayer = createBuildingOutlinesLayer("Ownership", 
                    PublicSpace.buildings.colourScaleFillStyle, 
                    presentDayBuildingsPopupTemplate, buildingOwnershipColourScale),
                leechBuildingsOwnershipLayer = createBuildingOutlinesLayer("Ownership", 
                    PublicSpace.buildings.colourScaleFillStyle, 
                    leechBuildingsPopupTemplate, buildingOwnershipColourScale),
                ashmead1828BuildingsOwnershipLayer = createBuildingOutlinesLayer("Category", 
                    PublicSpace.buildings.colourScaleFillStyle, 
                    ashmead1828BuildingsPopupTemplate, ashmead1828CategoriesColourScale);

            // 1910 Valuation map image
            // Castle Park map
            var imageUrl = './images/maps/TNA_IR_128_3_231.png',
                southWest = L.latLng(51.4528832, -2.5951183),
                northEast = L.latLng(51.4558068, -2.5875938),
                bounds = L.latLngBounds(southWest, northEast),
                os1910Attribution = "TODO: Attribution";
            var castleParkOSMap = L.imageOverlay(imageUrl, bounds, {attribution: os1910Attribution});
            

            imageUrl = './images/maps/TNA_IR_128_3_226.png';
            southWest = L.latLng(51.45537649140026, -2.5951950172650142);
            northEast = L.latLng(51.45832123003571, -2.587687822822927);
            bounds = L.latLngBounds(southWest, northEast);
            var broadStreetOSMap = L.imageOverlay(imageUrl, bounds, {attribution: os1910Attribution});

            var os1910Layer = L.layerGroup([broadStreetOSMap, castleParkOSMap]);

            // Map layer groups
            var layerPrefixBuildingUse = "Building use: ",
                layerPrefixBuildingOwnership = "Building ownership: ",
                layerPrefixAshmead = "1828 public buildings";
            L.control.layers(
                    {
                        "Present day": tileLayer,
                        "1910 Doomsday (Ordnance Survey)": os1910Layer
                    }, 
                    null, 
                    { collapsed: false, position: 'topleft'})
                .addTo(mymap);

            L.control.layers(
                    {
                        // "Present day (2016)": presentDayLayer,
                        // "1910": valuations1910Layer,
                        "Building use: 18th Century": leechBuildingsTypeLayer,
                        "Building use: 1910": valuationBuildingsTypeLayer,
                        "Building use: 2016": presentDayBuildingsTypeLayer,
                        "Building ownership: 18th Century": leechBuildingsOwnershipLayer,
                        "Building ownership: 1910": valuationBuildingsOwnershipLayer,
                        "Building ownership: 2016": presentDayBuildingsOwnershipLayer,
                        "1828 public buildings (Ashmead)": ashmead1828BuildingsOwnershipLayer
                    }, 
                    null, 
                    { collapsed: false, position: 'topleft'})
                .addTo(mymap);

            

            // TODO: trying to add header to html element:
            // var testLayer = L.control.layers(
            //         {
            //             "Present day (2016)": presentDayLayer,
            //             "1910": valuations1910Layer,
            //             "18th Century Buildings Type": leechBuildingsTypeLayer,
            //             "1910 Buildings Type": valuationBuildingsTypeLayer,
            //             "2016 Buildings Type": presentDayBuildingsTypeLayer,
            //             "18th Century Ownership": leechBuildingsOwnershipLayer,
            //             "1910 Ownership": valuationBuildingsOwnershipLayer,
            //             "2016 Ownership": presentDayBuildingsOwnershipLayer
            //         }, 
            //         null, 
            //         { collapsed: false, position: 'topleft'});
            // var container = testLayer.getContainer();
            // testLayer.addTo(mymap);
            // console.log("container", container);
            
            
            // Set default layer to visible
            var defaultOverlayLayerName = layerPrefixBuildingUse + "1910";
            tileLayer.addTo(mymap);
            valuationBuildingsTypeLayer.addTo(mymap);

            var presentDayBuildingLayers = [presentDayBuildingOutlines,
                    presentDayBuildingsTypeLayer,
                    presentDayBuildingsOwnershipLayer],
                valuations1910BuildingLayers = [valuationBuildingOutlines, 
                    valuationBuildingsTypeLayer,
                    valuationBuildingsOwnershipLayer],
                leechBuildingLayers = [leechBuildingsTypeLayer,
                    leechBuildingsOwnershipLayer];

            // Load spreadsheet and geojson data and apply it to map layers
            // loadMapData(mapOptions["markers"] === "none" ? null : valuationBuildingPoints, 
            //     mapOptions.showBuildings === false ? null : valuations1910BuildingLayers,
            //     mapOptions["markers"] === "none" ? null : presentDayBuildingPoints, 
            //     mapOptions.showBuildings === false ? null : presentDayBuildingLayers,
            //     mapOptions.showBuildings === false ? null : leechBuildingLayers)
            loadMapData(null, 
                mapOptions.showBuildings === false ? null : valuations1910BuildingLayers,
                null, 
                mapOptions.showBuildings === false ? null : presentDayBuildingLayers,
                mapOptions.showBuildings === false ? null : leechBuildingLayers,
                ashmead1828BuildingsOwnershipLayer)
                .done (function (buildingTypes, ownershipValues, ashmead1828Categories) {
                    // Add map legend for property type colours
                    var legend = L.control({position: 'topright'});
                    legend.onAdd = function (map) {
                            var div = L.DomUtil.create('div', 'map-info map-legend');

                            // if (mapOptions["markers"] !== "none") {
                            //     // Add a legend entry for each Property Category
                            //     div.innerHTML += PublicSpace.mapLegends.categoryIconsLegendText();
                            // }
                            // Add entry for whether building is accessible to public
                            // switch (mapOptions.fillMethod) {
                            //     case "none":
                            //         break;
                            //     case "buildingCategory":
                            //         div.innerHTML += PublicSpace.mapLegends.categoryColoursLegendText();
                            //         break;
                            //     case "buildingType":
                            //         div.innerHTML += PublicSpace.mapLegends.colourScaleLegendText("Building type",
                            //             buildingTypes,
                            //             buildingTypesColourScale);
                            //         break;
                            //     case "ownership":
                            //         div.innerHTML += PublicSpace.mapLegends.colourScaleLegendText("Building ownership",
                            //             ownershipValues,
                            //             buildingTypesColourScale);
                            //         break;
                            //     default:
                            //         div.innerHTML += PublicSpace.mapLegends.publicAccessibilityLegendText();
                            //         break;
                            // }
                            // div.innerHTML += PublicSpace.mapLegends.colourScaleLegendText("Building type",
                            //     buildingTypes,
                            //     buildingTypesColourScale);
                            // div.innerHTML += PublicSpace.mapLegends.colourScaleLegendText("Building ownership",
                            //     ownershipValues,
                            //     buildingOwnershipColourScale);

                            function setLegendText(legendDiv, layerName) {
                                if (layerName.substring(0, layerPrefixBuildingUse.length) === layerPrefixBuildingUse) {
                                    legendDiv.innerHTML = PublicSpace.mapLegends.colourScaleLegendText("Building use",
                                        buildingTypes,
                                        buildingTypesColourScale);
                                } else if (layerName.substring(0, layerPrefixBuildingOwnership.length) === layerPrefixBuildingOwnership) {
                                    legendDiv.innerHTML = PublicSpace.mapLegends.colourScaleLegendText("Building ownership",
                                        ownershipValues,
                                        buildingOwnershipColourScale);
                                } else if (layerName.substring(0, layerPrefixAshmead.length) === layerPrefixAshmead) {
                                    // Assume Ashmead layer selected
                                    legendDiv.innerHTML = PublicSpace.mapLegends.colourScaleLegendText("Building categories",
                                        ashmead1828Categories,
                                        ashmead1828CategoriesColourScale);
                                } else {
                                    // Background layer change - leave legend the same
                                }
                            }

                            function onLayerChange(evnt) {
                                // Change the legend based on the active layer name
                                var layerName = evnt.name;
                                setLegendText(div, layerName);
                            }

                            // Draw the initial legend
                            setLegendText(div, defaultOverlayLayerName);

                            // Layer events - change legend text
                            mymap.on('baselayerchange', onLayerChange);

                            return div;
                        };
                    legend.addTo(mymap);
                });

            // Load the data for Ashmead layer
            // $.getJSON("./geojson/Ashmead_1828_Buildings.geojson")
            //     .done(function (ashmeadBuildingsGeoJsonResponse) {
            //         // var ashmeadBuildingsGeoJson = ashmeadBuildingsGeoJsonResponse[0];
            //         // console.log();
            //         ashmead1828BuildingsOwnershipLayer.addData(ashmeadBuildingsGeoJsonResponse);
            //     });

            return mymap;
        };

    

    // Public interface
    return {
        drawAreaMap: drawAreaMap
    };
}(jQuery, L));
