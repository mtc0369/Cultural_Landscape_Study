
//anonymous function to wrap script
(function(){   
    //variables for dates array and csv data    
    var attrArray = ["Early Holocene Period (10000-8501 BP)","Early Early Period (8500-5001 BP)","Late Early Period (5000-2601 BP)","Early Middle Period (2600-1301 BP)","Late Middle Period (1300-851 BP)","Early Late Period (850-501 BP)","Late Late Period (500-241 BP)","Mission Period (240-150 BP)"]
    var expressed = attrArray[0]; //initial attribute
    
    //var scaleArray = [1 = "Village", 2 = "Long-term residence", 3 = "Long-term residence, ideolgical", 4 = "Long-term residence, quarry", 5 = "Short=term residence", 6 = "Short-term residence, quarry", 7 = "Location(Chipping station/shell)", 8 = "Location(Chipping station)", 9 = "Unknown"]
    //var typology = scaleArray[0]

    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.82 
        chartHeight = 750,
        leftPadding = 40,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //creating a linear scale for the chart, setting ranges and domains for values
    var x = d3.scaleLinear()
        .range([60, chartInnerWidth-20])
        .domain([0, 40.5]);

    var y = d3.scaleLinear()        
        .range([chartInnerHeight -10, 50])
        .domain([-900, 10000]);    
        
    //begin script when window loads
    window.onload = setMap();

    //get Data
    function setMap(){         

        //use Promise.all to parallelize asynchronous data loading       
        var promises = [d3.csv("data/VSFB_C14_BubbleChart2.csv")];                    
                    Promise.all(promises).then(callback);        

        //data parameter - retrieves data as an array
        function callback(data){ 
            //loop through csv data        
            csvData = data[0];            

            //create the color scale
            var colorScale = makeColorScale(csvData);            

            //adding chart
            setChart(csvData, colorScale);

            //calling create dropdown
            createDropdown(csvData);

            //calling create legend function 
            createLegend(csvData, expressed, colorScale);

            //calling size legend 
            createSizeLegend(csvData, expressed, colorScale);            
        };
    };

        //function to create a DROPDOWN MENU for date attribute selection
        function createDropdown(csvData){
            //add select element
            var dropdown = d3
                .select("body")
                .append("select")
                .attr("class", "bubble_dropdown")
                .on("change", function(){
                    changeAttribute(this.value, csvData)                    
                });

            //add initial option
            var titleOption = dropdown
                .append("option")
                .attr("class", "bubble_titleOption")
                .attr("disabled", "true")
                .text("Select Time Period");

            //add attribute name options
            var attrOptions = dropdown
                .selectAll("attrOptions")
                .data(attrArray)                
                .enter()
                .append("option")                
                .attr("value", function(d){ 
                    return d;
                })
                .text(function(d){ 
                    return d;
                });
        };

        //dropdown change event handler
        function changeAttribute(attribute, csvData) {
            //change the expressed attribute
            expressed = attribute;

            //recreate the color scale
            var colorScale = makeColorScale(csvData);

            //variable for the circle markers        
            var circles = d3.selectAll(".circle")

            updateChart(circles, csvData.length, colorScale);                
        };

        //function to create coordinated chart - axis scale
        function setChart(csvData, colorScale){

            var chart = d3.select("body") //get the <body> HTML element from the DOM
                //method chaining
                .append("svg") //put a new svg in the body
                .attr("width", chartWidth)  
                .attr("height", chartHeight)                
                .attr("class", "bubble_chart")                                             

            //appending innerRect block to the container variable
            var innerRect = chart.append("rect")
                .datum(400) 
                .attr("width", chartInnerWidth - 60)
                .attr("height", chartInnerHeight - 60)                
                .attr("class", "bubble_innerRect") 
                .attr("x", 50) //position from left on the x (horizontal) axis
                .attr("y", 40) //position from top on the y (vertical) axis
                .style("fill", "rgb(150, 150, 150");        

            //appends a circle for every item in the csv data array
            var circles = chart.selectAll(".circle")                
                .data(csvData)
                .enter()
                .append("circle")
                .attr("class","circles")
                .attr("class", function(d){
                    return "circle " + d.Site_Num.replace("(", '').replace(')',"").replaceAll(/\s+/g, '');//removing charaters
                })

            //creating a y axis generator   
            var yAxis = d3.axisLeft(y);

            //creating an axis g element and adding it to the axis
            var axis = chart.append("g")
                .attr("class", "bubble_axis")
                .attr("transform", "translate(50, -10)")                
                .call(yAxis);
            
            //adding a title [class] to the chart
            var title = chart.append("text")
                .attr("class", "bubble_chartTitle")
                .attr("text-anchor", "middle")
                .attr("x", chartWidth / 2)//assigns horizontal position
                .attr("y", 27)//assign verticle position
                .text("Radiocarbon Dates for Sites from the " + expressed)//text content
                

            //adding a title [class] to the chart
            var notation = chart.append("text")
                .attr("class", "bubble_chartNotation")
                .attr("text-anchor", "middle")
                .attr("x", chartWidth / 2)//assigns horizontal position
                .attr("y", 740)//assign verticle position
                .text("* All Dates are in Years Before Present (BP)")//text content
                
            updateChart(circles, csvData.length, colorScale);
        };        

        //function to create color scale generator - MANUAL BREAKS
        function makeColorScale(data){
            
            //create color scale generator
            var colorScale = d3
                .scaleThreshold()            
                .domain(["Village", "Long-term residence (LTR)", "LTR, ideolgical", "LTR, quarry", "Short-term residence (STR)", "STR, quarry", "Loc(Chipping station/shell)", "Loc(Chipping station)", "Unknown"])
                .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#d9d9d9"]);
            return colorScale; 
        };

        //function for highlight on hover
        function highlight(props){
            //change stroke
            var selected = d3.selectAll("." + props.Site_Num.replace("(", '').replace(')',"").replaceAll(/\s+/g, ''))
                .style("stroke", "red")
                .style("stroke-width", "3")
                setLabel(props);//calling set label
        };

        //function for dehighlight after removing cursor
        function dehighlight(){ 
            var circles = d3.selectAll(".circle")
                .style("stroke", "#000")
                .style("stroke-width", "0.5")
                d3.select(".bubble_infolabel")
                    .remove();
        };        
            
        //function to create dynamic label
        function setLabel(props){
            //label content
            var labelAttribute = "<h2>" + "Site: "+ props.Site_Num;

            //create info label div and adding data to callout labels
            var infolabel = d3.select("body")
                .append("div")
                .attr("class", "bubble_infolabel")
                .attr("id", props.Site_Num + "_label")
                .html(labelAttribute);

            var siteAvg = infolabel.append("div")
                .attr("class", "bubble_labelname")
                .html("<b>" + "Average Years BP: "+ d3.format(',')(props[expressed]) + "</b>");

            var siteSize = infolabel.append("div")
                .attr("class", "bubble_labelname")
                .html("<b>" + "Site Size: "+ d3.format(',')(props.Site_Size) + " m²" + "</b>");

            var siteType = infolabel.append("div")
                .attr("class", "bubble_labelname")
                .html("<b>" + "Site Type: "+ props.Site_Type +"</b>");

            var countyName = infolabel.append("div")
                .attr("class", "bubble_labelname")
                .html("<b>" + "Number of Samples: "+ d3.format(',')(props.Num_Sample) + "</b>");

            var bpRange = infolabel.append("div")
                .attr("class", "bubble_labelname")
                .html("<b>" + "Date Range: "+ props.BP_Range +" years BP" + "</b>");
                
            var dateLabel = infolabel.append("div")
                .attr("class", "bubble_labelname")
                .html("<b>" + "Time Period: "+ expressed +"</b>");            
        };

        //function to move info label with mouse
        function moveLabel(){
            //get width of label
            var labelWidth = d3.select(".bubble_infolabel")
                .node()
                .getBoundingClientRect()
                .width;

            //use coordinates of mousemove event to set label coordinates
            var x1 = event.clientX + 10,
                y1 = event.clientY - 75,
                x2 = event.clientX - labelWidth - 10,
                y2 = event.clientY + 25;

            //horizontal label coordinate, testing for overflow
            var x = event.clientX > window.innerWidth - labelWidth - 50 ? x2 : x1; 
            //vertical label coordinate, testing for overflow
            var y = event.clientY < 25 ? y2 : y1; 

            d3.select(".bubble_infolabel")
                .style("left", x + "px")
                .style("top", y + "px");
        };

        //function to update chart circles and titles based on attribute slection
        function updateChart(circles, csvData, colorScale){
            //calling on the highlight functions on hover and setting timed transitions
            circles.on("mouseover", function(event, d){
                highlight(d)
            })
            .on("mouseout", function(event, d){
                dehighlight(d)
            })
            .on("mousemove", moveLabel)
            .attr("id", function(d){
                return d[expressed];
            })
            .transition()
            .delay(function(d,i){
                return i * 30
            })
            .duration(1000)            
            .attr("r",function(d){
                //calculate the circle radius based on GDP values in csv
                var area = Math.abs(d.Site_Size * .05);                
                    return Math.sqrt(area/Math.PI);//converts the area to the radius                                   
            })
            //sets circle x coordinate            
            .attr("cx", function(d, i){                
                return x(i) + 15;//spaces the circle width (horizontal axis) using x values
            })
            //sets circle y coordinate 
            .attr("cy", function(d){
                var value = d[expressed];
                if (value >= 0){
                    return y(parseFloat(d[expressed])) - 10;
                }
                else{
                    return Math.min(y(d[expressed])), Math.max(y(d[expressed])) - 10
                }
            })
            //applies style - color and stroke                        
            .style("fill", function(d){
                var value = colorScale(d.Site_Type);
                if (value !== 0){
                    return colorScale(d.Site_Type);
                }
                else{
                    return "#969696";
                }
            })
            .style("stroke", "#000")
            .style("stroke-width", "0.8")       
            //adds dynamic title
            var chartTitle = d3.select(".bubble_chartTitle")
                .text("Radiocarbon Dates for Sites from the " + expressed)        
        };

        //function to create legend based on manual breaks colorScale
        function createLegend(csvData, expressed, colorScale){
            d3.select("body")            
                .append("svg")
                .attr("class", "bubble_legendBox");                

            var legend = d3.select("svg.bubble_legendBox");

            legend.append("g")
                .attr("class", "bubble_legend")
                .attr("transform", "translate(15,15)");

            //adding legend title and style
            var colorLegend = d3.legendColor()                
                .orient("verticle")
                .ascending(false)
                .scale(colorScale)                
                .title("Site Typology")
                //.labelFormat(",.2r")                                
                //.labelFormat("0")
                //.shape("circle")
                //.shapeRadius(15)
                .shapeWidth(35)
                .shapeHeight(35)
                .labels(["Village", "Long-term residence (LTR)", "LTR, ideolgical", "LTR, quarry", "Short-term residence (STR)", "STR, quarry", "Loc(Chipping station/shell)", "Loc(Chipping station)", "Unknown"])                             
                .labelWrap(100)
                .labelAlign("start")  
                //.labels(d3.legendHelpers.thresholdLabels)

            legend.select(".bubble_legend")
                .call(colorLegend);//calling d3 colorlegend                           
        };

        //function to create a size legend
        function createSizeLegend(csvData){
            d3.select("body")            
                .append("svg")
                .attr("class", "size_legendBox");

            var legendSize = d3.select("svg.size_legendBox");
            var myFormat = d3.format(',');

            //setting the scale for bubble size in legend
            var size = d3.scaleSqrt()
                .domain([1, 85])  
                .range([1, 2])//Size in pixel

            //Add legend circles with manual breaks and position elements
            var valuesToShow = [10000, 50000, 150000, 300000]
            var xCircle = 75
            var xLabel = 165
            var yCircle = 170

            //creating and styling legend circles
            legendSize
            .selectAll("size_legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
                .attr("cx", xCircle)
                .attr("cy", function(d){ return yCircle - size(d) } )
                .attr("r", function(d){ 
                    var area = Math.abs(d * .05);                
                    return Math.sqrt(area/Math.PI);
                })
                .style("fill", "none")
                .attr("stroke", "black")            

            //Add legend dashed line segments
            legendSize
            .selectAll("size_legend")
            .data(valuesToShow)
            .enter()
            .append("line")
                .attr('x1', function(d){ return xCircle + size(d)/4 } )
                .attr('x2', xLabel-20)
                .attr('y1', function(d){ return yCircle - size(d)*2 } )
                .attr('y2', function(d){ return yCircle - size(d)*2 } )
                .attr('stroke', 'black')
                .style('stroke-dasharray', ('2,2'))

            //Add legend labels
            legendSize
            .selectAll("size_legend")
            .data(valuesToShow)
            .enter()
            .append("text")
                .attr('x', xLabel-20)
                .attr('y', function(d){ return yCircle - size(d)*2 } )
                .text( function(d){ return d } )
                .style("font-size", 14)
                .attr('alignment-baseline', 'middle')

            //adding legend title in segments
            legendSize.append("text")
                .attr("class", "sizeLegend_Title")
                .attr("text-anchor", "left")
                .attr("x", 15)//assigns horizontal position
                .text("Size = Site Size m²")//text content
                .attr("y", 15)//assign verticle position
                
            /*legendSize.append("text")
                .attr("class", "sizeLegend_Title")
                .attr("text-anchor", "left")
                .attr("x", 57)//assigns horizontal position
                .attr("y", 38)//assign verticle position
                .text("per capita (€)")//text content

            legendSize.append("text")
                .attr("class", "sizeLegend_Title")
                .attr("text-anchor", "left") 
                .attr("x", 57)//assigns horizontal position
                .attr("y", 55)//assign verticle position
                .text("2019 to 2022")//text content*/
        };
})();

    





