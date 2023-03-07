//575 Final Project Source Code
//declare map variable in global scope
var map;

var minValues = {};


//declare the variables in global scope 
var dataStats = {};
var attributes
var bordercrossings
var choroplethlayer
var pipelinejs
var expressed = "Y2019-01"
var expressedAdmin = "Germany"
var expressedChoro = "Y2019"
var attributesChoro = [];



//function to instantiate the leaflet map
function createMap(){

    
  
  
    var mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    var mbAttr = ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    var mbUrlgroov = 'https://api.mapbox.com/styles/v1/blinden/ckv0a1c4m0jqc14ofmm49yj72/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmxpbmRlbiIsImEiOiJja3RicnN2aXQxejJnMm9yNXJ5ODdnZnlzIn0.xxMkVduVt5ll-Trxg1qBPQ'
    var mbAttrgroov = ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
  
  
    var grayscale = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
    var streets = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
    // var groovy = L.tileLayer(mbUrlgroov, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttrgroov});
  



    map = L.map('map', {
        center: [50, 11],
        zoom: 4,
        minZoom: 3.5
        // maxZoom: 5,
        // maxBounds: [
        //    [55, 43],
        //    [18, 17],
        //    [40,52],
        //    [70,70]

        //    ]
    });

    makepipeline();
    makechoropleth(map);


    map.options.layers = [grayscale, bordercrossings, pipelinejs, choroplethlayer];
    
    bordercrossings.addTo(map)
    //Add custom base tilelayer
    var Stadia_AlidadeSmoothDark = L.tileLayer('https://api.mapbox.com/styles/v1/blinden/cl22cbrjy000o14l69xhpbm4r/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmxpbmRlbiIsImEiOiJja3RicnN2aXQxejJnMm9yNXJ5ODdnZnlzIn0.xxMkVduVt5ll-Trxg1qBPQ', {
        maxZoom: 14,
        minZoom: 3,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map)
        //call the getData function, but not when the data is too big! It won't load in time
    var baseLayers = {
        'Smooth Gray': Stadia_AlidadeSmoothDark,
        'Grayscale': grayscale, //when I move this line of code above 'Grayscale', the starting basemap is grayscale, but the legend is correct with smooth dark as the first option
        'Streets': streets,
        };
    
    map.scrollWheelZoom.disable(); //disables the scrolling wheel zoom capability

    var overlays = {
        'Border Crossings': bordercrossings,
        'Pipelines':pipelinejs,
        'Choropleth': choroplethlayer
    
            //'Cities' represents the text that you see for the button on the interface. cities (the blue one) is the variable in the code
           
        
        };
    console.log("this is border crossings", bordercrossings)
    var layerControl = L.control.layers(baseLayers,overlays).addTo(map); 
    var satellite = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
    layerControl.addBaseLayer(satellite, "Satellite");
    //getData(map); //add map at some point
};



function calcStats(data, attributes) {
   
  
    //loop through each city
   for (var attribute of attributes) {
        var allValues = [];
        for (var feature of data.features){
            //console.log(feature)
            if (feature.properties[attribute])
                allValues.push(feature.properties[attribute])

        }
       
        //minValues[attribute] = Math.min(...allValues)
        dataStats.min = Math.min(...allValues)
        dataStats.max = Math.max(...allValues);

        var sum = allValues.reduce(function (a,b) {
            return a + b;
        });
        dataStats.mean = sum /allValues.length; 
   

    } 
    //console.log(minValues)

};

//BEGIN CHOROPLETH! ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Function to make choropleth. Everything in this function is taken from the choropleth tutorial on leaflet. 
//I put it in a single function to make it easy to call everything at once
function makechoropleth(map){
    // control that shows state info on hover
	var info = L.control();
    

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (attributesChoro, props) { 

        var year = expressedChoro.split("Y")[1];

        this._div.innerHTML = '<h4>Net Import/Export</h4>' +  (attributesChoro ?
                '<b>' + attributesChoro.ADMIN + '</b><br/>' + attributesChoro[expressedChoro].toLocaleString("en-US") + ' Million Meters³ in: ' + year : 'Hover over a country!');
                //console.log("this is props:", props)
	};
	
	info.addTo(map); 


    //We had a problem here where we were setting the first color value equal to the top range of 95,000. Since the operator is 
    // variable >= value, you don't need the top value of 95,000. 
    function getColor(expressedChoro) {
		return expressedChoro >= 56000 ? '#b2182b' :
        expressedChoro >= 26000 ? '#ef8a62' :
        expressedChoro >= -4000 ? '#fddbc7' :
        expressedChoro >= -34000 ? '#f7f7f7' :
        expressedChoro >= -64000 ? '#d1e5f0' :
        expressedChoro >= -96000 ? '#67a9cf' :
        expressedChoro >= -100000 ? '#2166ac' : 
			'#fff5f0';
	}
    
    //this function controls the default stroke options for the choropleth
    //dashArray makes the stroke dashed
	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties[expressedChoro])
		};
	}

    //This function highlights the choropleth when you hover over it.
	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#FC4E2A',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			
		}
        info.update(layer.feature.properties);
	}

	
    //This function resets the highlight. It resets the choropleth layer by setting it equal to the function style which has the default stroke
	function resetHighlight(e) {
		choroplethlayer.setStyle(style);
		info.update();
	}

    //this function zooms the map when you click on a country
	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}


	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}

   
	//this pulls the data from the 17eurocountries_correct javascript. The script is already connected in html and alleuro is the variable set in the js
	choroplethlayer = L.geoJson(alleuro, {
		style: style,
		onEachFeature: onEachFeature,
        pane:"overlayPane" //overlay pane to make it above certain features but below others. This is important to set if you can't see the features
	}).addTo(map);
    
    
	

	map.attributionControl.addAttribution(' &copy; <a href="https://www.iea.org/data-and-statistics/data-product/gas-trade-flows">IEA Gas Data</a>');

    //builds the choropleth legend
	var legend = L.control({position: 'topleft'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend');
		
        var grades = [95000, 55000, 25000, -5000, -35000, -65000, -100000];
		var labels = ["Net Import/Exports of Gas per Year in Million Meters³"];
		var from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

            labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from.toLocaleString("en-US") + (to ? ' to ' + to.toLocaleString("en-US") : ' and below'));
		}
            

		div.innerHTML = labels.join('<br>');
		return div;
	};



    //This is the sequence control for the choropleth. It sequences through the 4 years 
    function createSequenceChoro(){
        var SequenceControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },

            onAdd: function () {
                //create the control container div with a particular class name 
                var container = L.DomUtil.create('div', 'sequence-control-container');

                //create range input element (slider)
                container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">');

                //add skip buttons
                container.insertAdjacentHTML('beforeend', '<button class ="step" id="reverse" title="Reverse"><img src="img/backwardarrow.png"></button>');

                container.insertAdjacentHTML('beforeend', '<button class ="step" id="forward" title="Forward"><img src="img/forwardarrow.png"></button>');

                L.DomEvent.disableClickPropagation(container);

                return container;

            }
        });

        map.addControl(new SequenceControl());
        //add listeners after adding control
        //set slider attributes
        document.querySelector(".range-slider").max = 3;
        document.querySelector(".range-slider").min = 0;
        document.querySelector(".range-slider").value = 0;
        document.querySelector(".range-slider").step = 1;

        var steps = document.querySelectorAll('.step');

        //add step buttons
        steps.forEach(function(step){
            step.addEventListener("click", function(){
                var index = document.querySelector('.range-slider').value;
                //console.log(index);
                //increment or decrement depending on button clicked
                if (step.id == 'forward'){
                    index++;
                    //if past the last attribute, wrap around to first attribute
                    index = index > 3 ? 0 : index;
                } else if (step.id == 'reverse'){
                    index--;
                    //if past the first attribute, wrap around to last attribute
                    index = index < 0 ? 3 : index;
                };

                //update slider
                document.querySelector('.range-slider').value = index;
                //pass new attribute to update symbols
                updateChoro(attributesChoro[index]);
                
                //makechoropleth();
            })
        })

        //input listener for slider
        document.querySelector('.range-slider').addEventListener('input', function(){
            var index = this.value;
        //    console.log(index);
            //makechoropleth();
            updateChoro(attributesChoro[index]);
            
        });
    };

    //This updates the choropleth when you change the sequence
    function updateChoro(attributeChoro){
        expressedChoro = attributeChoro;
        map.eachLayer(function(layer){
            if (layer.feature && layer.feature.properties[attributeChoro]){
                //access feature properties
                var props = layer.feature.properties;
    
                //update each feature's color based on new attribute values
                var color = getColor(props[attributeChoro]);
                layer.setStyle({fillColor:color});
    
            };
        });
    
        //updateLegend(attribute);
    };   

    //function to process the alleuro data, pulling the necessary attributes
    function processDataChoro(alleuro){
        //empty array to hold attributes
        console.log("this is choro data", alleuro)
        //properties of the first feature in the dataset
        var properties = alleuro.features[0].properties;
        console.log("Hello user",properties)
    
        //push each attribute name into the attribute array
        for (var attribute in properties){
            //console.log(attribute.indexOf("Y"))
            //only take attributes with gas values
            if (attribute.indexOf("Y") == 0){
                attributesChoro.push(attribute);
            };
        };
    
        return attributesChoro;
    }; 




	legend.addTo(map);
    createSequenceChoro();
    processDataChoro(alleuro);
    attributesChoro = processDataChoro(alleuro); //set attributesChoro
    
}

//this adds the pipeline layer built from the js file preconnected to the html
function makepipeline(style, onEachFeature){
    pipelinejs = L.geoJson(pipelinesL, {
		style: style,
		onEachFeature: onEachFeature,
        pane:"shadowPane" //set the pane so it is above the choropleth but below the prop symbols

	}).addTo(map); //add .addTo(map) to make the pipeline appear when you start the program
} 




//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    //use conditional if else statement if value 0, eg if attValue == 0 return else return all else
    var minRadius = .06;
    //flannery Appearance compensation formula
    var radius = 1.0083 * Math.pow(attValue/1,0.715) * minRadius;
    //console.log(radius)
    return radius;
    
};

//create popup content 
function PopupContent(properties, attribute){
    //add the city popup content string
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("-")[0].split("Y")[1]; // index for year 
    this.month = attribute.split("-")[1] // index for month
    this.gas = this.properties[attribute]; //this.gas is properties attribute
    

    this.formatted = "<p><b>Border Crossing:</b> " + this.properties.City + "</p><p><b>Imports & Exports of Gas for " + this.month+"/" + this.year + " (month/year)" + ": </b>" + this.gas.toLocaleString("en-US") + " Million Meters³</p>";

};


//Function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute value to visualize with proportional symbols
   // var attribute = attributes[0];
    //console.log(attribute)

    //create marker options
    var options = {
        fillColor: "#00bbff", //"#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        pane:"markerPane"
        
    };

    //For each feature, determine its value for the selected attribute 
    var attValue = Number(feature.properties[expressed]);
    //console.log(attValue)

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //Create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with city
    var popupContent = new PopupContent(feature.properties, expressed);

    
    //Bind the popup to the circle marker addin an offset to each circle marker as to not cover symbol
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0,-options.radius) 
    });

    //return the circle marker to the L.geojson pointToLayer option
    return layer;
};

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

//add circle markers or point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON Layer and add it to map 
    bordercrossings = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    });
};




function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity, 
    max = -Infinity;

    map.eachLayer(function (layer) {
        //get the attribute value
        if (layer.feature) {
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min) {
                min = attributeValue;
            }

            //Test for max
            if (attributeValue > max) {
                max = attributeValue;
            }
        
        }
    });

        //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min,
    };

};

//update the borderpoint gas flow legend
function updateLegend(attribute) {
    //create content for legend 
    var year = attribute.split("-")[0].split("Y")[1];
    var month = attribute.split("-")[1]
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
    document.querySelector("span.month").innerHTML = month;
    
    //get the max, mean and min values as an object
    var circleValues = getCircleValues(attribute);

    for (var key in circleValues) {
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        document.querySelector("#" + key).setAttribute("cy", 54 - radius);
        document.querySelector("#" + key).setAttribute("r", radius)

        document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100) / 100 + " million meters³";
    }
};   


//updates the size of the prop symbols
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add ski area  to popup content string
            var popupContent =  new PopupContent(props, attribute);

            

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();
        };
    });

    updateLegend(attribute);
};   

//Create an array of the sequential attributes
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    console.log("this is data", data)
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into the attribute array
    for (var attribute in properties){
        //console.log(attribute.indexOf("Y"))
        //only take attributes with gas values
        if (attribute.indexOf("Y") == 0){
            attributes.push(attribute); //push the chosen attributes into the empty array created above
        };
    };

    //check the result
    //console.log(attributes);

    return attributes;
}; 




    var months = { // This is a utility object to make it easier to work the particular format that our data requires
        "January":"01"
        ,"February":"02"
        ,"March":"03"
        ,"April":"04"
        ,"May":"05"
        ,"June":"06"
        ,"July":"07"
        ,"August":"08"
        ,"September":"09"
        ,"October":"10"
        ,"November":"11"
        ,"December":"12"
    };


    var monthsIndex = { // This is a set of key:value pairs that maps the particular label for each data item/index to the 0 to 36 index values that the update function requires
        "Y2019-01": 0,
    "Y2019-02": 1,
    "Y2019-03": 2,
    "Y2019-04": 3,
    "Y2019-05": 4,
    "Y2019-06": 5,
    "Y2019-07": 6, 
    "Y2019-08": 7,
    "Y2019-09": 8,
    "Y2019-10": 9,
    "Y2019-11": 10,
    "Y2019-12": 11,
    "Y2020-01": 12,
    "Y2020-02": 13,
    "Y2020-03": 14,
    "Y2020-04": 15,
    "Y2020-05": 16,
    "Y2020-06": 17,
    "Y2020-07": 18,
    "Y2020-08": 19,
    "Y2020-09": 20,
    "Y2020-10": 21,
    "Y2020-11": 22,
    "Y2020-12": 23,
    "Y2021-01": 24,
    "Y2021-02": 25,
    "Y2021-03": 26,
    "Y2021-04": 27,
    "Y2021-05": 28,
    "Y2021-06": 29,
    "Y2021-07": 30,
    "Y2021-08": 31,
    "Y2021-09": 32,
    "Y2021-10": 33,
    "Y2021-11": 34,
    "Y2021-12": 35,
    "Y2022-01": 36,
    "Y2022-02": 37
    }

var yearSet = document.querySelector('#year-select') // Select the dropdown with the years so we can grab the value to make the index that will update the map

console.log(monthSet); // Confirm it's the right element

var monthSet = document.querySelector("#month-select"); // Same, but for months



var changeButton = document.querySelector("#updateSymbolsButton") // Select the HTML element to receive an event listener and perform a function

.addEventListener('click',function(){ // Add the event listener for the event 'click', and run a function (which we haven't given a specific name to b/c it is only getting called here and we don't need a human-friendly name for it)
    console.log(monthSet.value); // double-check that it's the correct value.
    var updateIndexString; // Create a variable to eventually fill with the string we'll use to grab the right index from our data
    updateIndexString = "Y"+yearSet.value+"-"+months[monthSet.value]; // Actually build the string of text that we'll use to grab the right data index from our object above
    console.log(updateIndexString); // Confirm it looks correct
    var useThisIndex; // Create index to hold the value that we get from our months index
    console.log(monthsIndex[updateIndexString]); // Confirm that using the string we built can accurately spit out the index we need
    useThisIndex = monthsIndex[updateIndexString]; 
    updatePropSymbols(globalAttributes[useThisIndex]) // The Leaflet magic that actually updates the map, using the index built from our dropdown-menu values, and the Attributes that the code generates
});



function createDropDownFilter(attributes){
//loop to get year/month list
//var htmlToAdd = '';
var year = ["2019", "2020", "2021", "2022"]
//var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
year.forEach(function(item){
    document.querySelector('#year-select').insertAdjacentHTML('beforeend','<option value="'+ item +'">' + item + '</option>');

} )

document.querySelector('#year-select').addEventListener("change", function(elem){ //look into what event is for dropdown menu ,, may be change
    console.log(elem.target.options[elem.target.options.selectedIndex].value)
    //return elem.target.options[elem.target.options.selectedIndex].value;
                //store as global variable as well as month
})
month.forEach(function(item){
    document.querySelector('#month-select').insertAdjacentHTML('beforeend','<option value="'+ item +'">' + item + '</option>');
})
document.querySelector('#month-select').addEventListener("change", function(elem){ //look into what event is for dropdown menu ,, may be change
    console.log(elem.target.options[elem.target.options.selectedIndex].value)
    //return elem.target.options[elem.target.options.selectedIndex].value;
            //store as global variable as well as month
})



};


//function to create legend 
function createLegend(attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: "bottomright",
        },

        onAdd: function () {
            //create the control container with a particular class name 
            var container = L.DomUtil.create("div", "legend-control-container");

            container.innerHTML = '<p class="temporalLegend">Gas Border Crossing <span class="month">01</span>/<span class="year">2019</span></p>';

            //Start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="260px" height="60px">';

            //array of circle names to base loop on 
            var circles = ["max", "mean", "min"];
            
            //Loop to add each circle and text to svg string
            for (var i = 0; i < circles.length; i++) {
                //calculate r and cy
                var radius = calcPropRadius(dataStats[circles[i]]);
                //console.log(radius);
                var cy = 54 - radius;
                //console.log(cy);

                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '" cy="' + cy + '" fill="#00bbff" fill-opacity="0.8" stroke="#000000" cx="30"/>';

                //evenly space out labels
                var textY = i * 20 + 10;

                //round the number
                var round_number = Math.round(dataStats[circles[i]] *100) / 100
               
                round_number === Math.round(round_number)
                console.log("this is round number", round_number)

                //text string 
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + round_number.toLocaleString("en-US") + " million meters³" + "</text>";
            }

            //close svg string
            svg += "</svg>";

            //add attribute legend to container
            container.insertAdjacentHTML('beforeend',svg);

            return container;
        },
    });//minValues[attribute] = Math.min(...allValues)

    map.addControl(new LegendControl());
}    


//function to retrieve the data and place it on the map
function getData(){ //add map to parantheses at some point
    //load the data
    fetch("data/NetBorderX.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            console.log("This is function getData:" , json)
            //createPropSymbols(json);
            attributes = processData(json);
            globalAttributes = processData(json);
            //console.log(attributes)
            calcStats(json,attributes)
        
            createDropDownFilter(attributes);
            createPropSymbols(json, attributes);
            createMap();
          
            createLegend(attributes);
           
            
        })
    
};




document.addEventListener('DOMContentLoaded', getData)

