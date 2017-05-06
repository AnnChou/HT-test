// main1.js

d3.selectAll('select').on('change',function(){
  refreshShapes();
});

d3.selectAll('input').on('click', function(){
  refreshShapes();
})

// Global variables for "data"
var baseData = null;
var data = null;
var dataforCal = [];  
var HdataforCal = [];  
var TdataforCal = [];
var restored_data_id = [];
var lastRemove = [];


d3.csv("data/hellodata-7.csv", function(error, data) {
  data.forEach(function(d) {
    d.distance_km = +d.distance_km;
    d.out_of_hospital_time_minute = +d.out_of_hospital_time_minute;
    d.mode = d.mode;
    d.mode_long = d.mode_long;
    d.outcome = +d.outcome;
    d.diagnostic_smur = d.diagnostic_smur;
    d.id = d.id;
  });
  	baseData = data;
  	console.log(baseData[0]);
  	refreshShapes();
});     
    // console.log(baseData[0]);// ***** null  ****
// read = d3.csv("data/hellodata-6.csv", function(d) { // d is a common d3 variable for the data
// 	return {
// 	  distance_km: +d.distance_km, // for the most part, you can build an object using dot notation and column header value
// 	  out_of_hospital_time_minute: +d.out_of_hospital_time_minute, // you can convert types through a variety of ways. The '+' converts a string to a number
// 	  mode: d["mode"], // you can also use the bracket notation if the header values are funky
// 	  mode_long: d.mode_long,
// 	  diagnostic_smur: d.diagnostic_smur,
// 	  outcome_28day: d.outcome_28day,
// 	  id: d.id   
 
// 	};
// Global variables for "chart
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 570 - margin.left - margin.right,
    height = 570 - margin.top - margin.bottom;
var radius = 3.2

// var x = d3.scale.linear()
//     .range([0, width]).nice();

// var y = d3.scale.linear()
//     .range([height, 0]).nice();

// update scales
var xScale = d3.scale.linear().range([0, width]);
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var xMap = function(d) { return xScale(xVals(d));};

var yScale = d3.scale.linear().range([height, 0]);
var yAxis = d3.svg.axis().scale(yScale).orient("left");
var yMap = function(d) { return yScale(yVals(d));};
var zoomfactor = 1;
var zoom = d3.behavior.zoom()
	.scaleExtent([1, 5])
	.x(xScale)
	.y(yScale)
	// .on("zoom", zoomed);
	.on("zoom", function() {
		// the "zoom" event populates d3.event with an object that has
		// a "translate" property (a 2-element Array in the form [x, y])
		// and a numeric "scale" property
		  var e = d3.event,
		      // now, constrain the x and y components of the translation by the
		      // dimensions of the viewport
		      tx = Math.min(0, Math.max(e.translate[0], width - width * e.scale)),
		      ty = Math.min(0, Math.max(e.translate[1], height - height * e.scale));
		  // then, update the zoom behavior's internal translation, so that
		  // it knows how to properly manipulate it on the next movement
		  zoom.translate([tx, ty]);
		  // and finally, update the <g> element's transform attribute with the
		  // correct translation and scale (in reverse order)
		  container.attr("transform", [
		    "translate(" + [tx, ty] + ")",
		    "scale(" + e.scale + ")"
		  ].join(" "));
	});

//var svg = d3.select("body")
var svg = d3.select("H3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom)
   // .call(zoomBeh)
    ;
var rect = svg.append("rect")  //for zoom/drag
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");

var container = svg.append("g"); //for zoom/drag: note: only the data point, the line, the axes are inside the container. legend and buttons stay

// update x-axis
//svg.append("g")
var xg = container.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
 // .call(xAxis) // do it later after setting domain
xg.append("text")
  .classed("label", true)
  .attr("class", "label")
  .attr("x", width)
  .attr("y", -6)
  .style("text-anchor", "end")
  .text("Distance: from patient's site to hospital (km)");

// update y-axis
//svg.append("g")
var yg = container.append("g")
  .attr("class", "y axis")
//  .call(yAxis)  // do it later after setting domain
yg.append("text")
  .classed("label", true)
  .attr("class", "label")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Time: from first-contact to arrival (mins)");    

function refreshShapes() {
    console.log("In refreshShape");
    console.log(baseData[0]);  // basedata is passed properly

	var checks = {};
	var modeData = {}
	d3.selectAll('input[type=checkbox]').each(function(){
		checks[this.value] = this.checked; //true/False
		// if (this.checked){
		// 	console.log(this.value + " checked");
		// 	modeData[this.value]  = baseData.filter(function(e) { return e.mode == this.value});//not working
		// }
		// else {
		// 	console.log(this.value + " unchecked");
		// 	modeData[this.value]  = {};
		// }
	});
	console.log("T "+checks["T"]);
	console.log("H "+checks["H"]);
		
	var data = baseData.filter(function(d,i){
		d.x = d.distance_km;
		d.y = d.out_of_hospital_time_minute;
	    return checks[d.mode];
	  });

	dataforCal = data;
	HdataforCal = data.filter(function(e) { return e.mode == "H"});
	TdataforCal = data.filter(function(e) { return e.mode == "T"});
	console.log("data - # " + data.length);
	console.log("baseDataL - # " + baseData.length);
	console.log("x range" + d3.extent(data, function(d) { return d.x; }));
	console.log("data.lenght" + data.length);

	var xVals = function(d){ return d.distance_km;}; //d.x
	var yVals = function(d){ return d.out_of_hospital_time_minute;};  //d.y
	console.log(data[0].x);
	var xMap = function(d) { return xScale(xVals(d));};
	var yMap = function(d) { return yScale(yVals(d));};

	xScale.domain([d3.min(data, xVals)-1, (d3.max(data, xVals)+1)/zoomfactor]);
	// yScale.domain([d3.min(data, yVals)-1, (d3.max(data, yVals)+1)/zoomfactor]);
	//yScale.domain([0, (d3.max(data, yVals)+1)/zoomfactor]);
	// console.log([d3.min(data, xVals)-1, (d3.max(data, xVals)+1)/zoomfactor]); //[11,133]

	// set domains & redraw axis
	// xScale.domain(d3.extent(data, function(d) { return d.x; })).nice();  //[12, 132]
	 yScale.domain(d3.extent(data, function(d) { return d.y; })).nice();

	 xg.call(xAxis);
  	 yg.call(yAxis);

    var mode_type = d3.set(data.map(function(d) { return d.mode; }));

	// **** BEIGN Set up regression line ****
	d3.selectAll('.line').remove()   // to prevent ghost line

	if (checks["T"] == true){
		console.log("T == true");
	            // ***** BEGIN draw regression line-T        
        TregLineData = calculateRegression(TdataforCal);
        var TlineFunction = d3.svg.line()    //the accessor function / path generator
            .x(function(d) { return xScale(d.x); })
            .y(function(d) { return yScale(d.y); })
            .interpolate("linear");
    
        //svg.selectAll('path.line')
        var Tline = container.selectAll('path.Tline')
            .data(TregLineData);
         
        Tline.enter().append("svg:path");

        Tline.attr("d", TlineFunction(TregLineData)) 
            .attr("class", "line")
            .attr("stroke-width", 2)
            .style("stroke", "#eee")
             .style("fill", "#FFA500")
            .attr('id', 'TregLine')

        Tline.on("mouseover", function(d) {   //BEGIN mouseover on Tline
            // Show Tooltip on mouseOver
             tooltip.transition()
                .duration(200)
                .style("opacity", .8);
             tooltip.html("mode ground trend line")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
                })  // END mouseover
             .on("mouseout", function(d) {
                 d3.select(this).attr('stroke-width',1)
                 tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                 //tooltip.remove();
              }) 
     		 ; 
        // END   draw regression line - T 
	}
	if (checks["H"] == true){
		console.log("H == true");
	             // ***** BEGIN draw regression line-H        
        HregLineData = calculateRegression(HdataforCal);
        var HlineFunction = d3.svg.line()    //the accessor function / path generator
            .x(function(d) { return xScale(d.x); })
            .y(function(d) { return yScale(d.y); })
            .interpolate("linear");
    
        //svg.selectAll('path.line')
        var HLine = container.selectAll('path.Hline')
            .data(HregLineData);

        HLine.enter()
            .append("svg:path");

        HLine.attr("d", HlineFunction(HregLineData)) 
            .attr("class", "line")
            .attr("stroke-width", 2)
            .style("fill", "#ADD8E6")
            .style("stroke", "#ddd")
            .style("stroke-dasharray", ("2, 2"))
            .attr('id', 'HregLine');

        HLine.on("mouseover", function(d) {   //BEGIN mouseover on Hline
            // Show Tooltip on mouseOver
             tooltip.transition()
                .duration(200)
                .style("opacity", .8);
             tooltip.html("mode helicopter trend line")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
                })  // END mouseover
             .on("mouseout", function(d) {
                 d3.select(this).attr('stroke-width',1)
                 tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                 //tooltip.remove();
              }) ; 
        // END   draw regression line - H   
	}
          
    function calculateRegression (my_dataforCal){
        // Need to calculate the regression before
        var m = 1;
        var b = 0; 
//                console.log("calculate regression" + my_dataforCal.length);
        var regression = ss.linearRegression(my_dataforCal.map(function(d) {
            return [+d.distance_km, +d.out_of_hospital_time_minute];
        }));  // output scole (m) and y -intercept (b)
        m = regression["m"];
        b = regression["b"];
//            var yHats = function(d){return xVals * m + b;};  //not used

        var xMax = d3.max(my_dataforCal, xVals);
        var yhMax = xMax * m +b ;
        var xMin = d3.min(my_dataforCal, xVals);
        // var xMin = 100;
        var yhMin = xMin * m +b ;
        my_regLineData =  [ 
            { "x": xMin,   "y": yhMin}, 
            { "x": xMax,   "y": yhMax}, 
            ];
        return my_regLineData;
    }
	// **** END Set up regression line ****
     
    // **** Add Tooltip area to webpage ******
    //  var tooltip = d3.select("body").append("div")
    var tooltip = d3.select("H3").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "#FFDFE0");

	// **** BEIGN Set up dots for data ****
	d3.selectAll('.dots').remove();   // to prevent ghost dots

	var shapes =    container.selectAll(".dots")    //binding shape to data
		//  .data(data).enter();
		.data(dataforCal).enter();

	var colorscale = d3.select('input[type=radio]:checked').node().value;
    var cValueD = function(d) { return d["diagnostic_smur"];},   // d3 does color magics
       color = d3.scale.category20();
    var cValueM = function(d) { return d["mode"];},   // d3 does color magics
       color = d3.scale.category20();
    var radius = 3;

	if (checks["T"] == true){ //BEGIN   draw dots (circles) - T
		        //svg.selectAll('path.line')
		console.log(TdataforCal.length);
		// addCircles_for_T(TdataforCal);
        // END   draw dots - T 
	}
	if (checks["H"] == true){  //BEGIN   draw dots - H
		console.log("H == true");
		addSquare_for_H(HdataforCal);

        // END   draw dots - H   
	}

function addSquare_for_H(myData) {
    // Start Square for Mode H
    console.log(radius, cValueD, myData.length);
    var squares = shapes.append("rect")
        .filter(function(d){ return (d.mode == "H") }) //H
        //  .attr("id", mode_type[0])
		.attr("class", "dots")
		.attr("id", function(d) { return d.diagnostic_smur})
		.attr("width", radius*2)
		.attr("height", radius*2)
		.attr("x", xMap)
		.attr("y", yMap)
		.style("fill", function(d) { return color(cValueD(d));})//if commnented  Now all H are black
		.style("opacity", .7);

    squares.on("mouseover", function(d) {   //BEGIN mouseover on H
                // Use D3 to select element, change color and size
		d3.select(this).transition()
			.style("opacity", 1)
			.attr({
			// fill: "orange", orange appears after set opacity =0!
			"width": radius * 3,
			"height": radius * 3,
			// "stroke-width": 3
			});
       
            // Show Tooltip on mouseOver
             tooltip.transition()
                .duration(200)
                .style("opacity", .8);
             tooltip.html( "D: <b>" + d.distance_km + "</b> T:<b>" + d.out_of_hospital_time_minute + 
                          "</b><br/><b>" + d.mode_long + "</b><br/> SMUR for:" + d.diagnostic_smur 
                          + "<br/> Outcome: <b>" + d.outcome_28day)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
                })  // END mouseover
    squares.on("mouseout", function(d) {
        d3.select(this).transition()
        .style("opacity", 0.8)
        .attr({
         // fill: "orange", orange appears after set opacity =0!
          "width": radius * 2,
          "height": radius * 2,
         // "stroke-width": 3
        });
		tooltip.transition()
			.duration(500)
			.style("opacity", 0);
         });

    squares.on("click",function(d) {  // this is H set
              // use confirm instead of alert
              confirm("You double-click a data point. \n This action will hide this data point (ID #" + d.id + ")\n\n" +
                    "Transport mode: " + d.mode_long + "\n SMUR for:" + d.diagnostic_smur 
                              + "\n 28D: " + d.outcome_28day);
              d3.select(this).attr({
                 // style: ("opacity", 0),   // making the selected shape transparent and white
                  style: ("opacity", 0), 
                  fill: "#FFFFFF",
                  // "width": 0,
                  // "height": 0                     
              });
             d3.select(this).active = 0;    
            // console.log("before" + data.length + " " + removed_data.length);
           //  dataforCal, lastRemove, removed_data = removeData(dataforCal, d.id);
            // thisID =removeData(dataforCal, d.id);
            // removed_data_id.push(thisID.id);
            //  // removed_data_id.push(removeData(dataforCal, d.id));
            // // HremoveData();
            // //    data = removeData(data, d.id);
            //  console.log("last remove[0] H Set" + lastRemove);
            //  console.log(removed_data_id);
            // // console.log("after" + data.length + " " + removed_data.length);
            //  d3.select(this).remove(); // remove from D3 selection (.data and visual)
            //  tooltip.transition()
            //     .duration(500)
            //     .style("opacity", 0);
             //updateChart(dataforCal);
           // updateChart(HdataforCal, "path#HregLine");
             //tooltip.remove();
         }) // end on click // end Square for mode H
    return lastRemove, lastRemove.id, data, squares;
}//END function addSquare_for_H
    
            // Shape Part 2: square  (circle) for T
            //function addCircles_for_T( shapes, mode_type, radius, xMap, yMap, data) {
            function addCircles_for_T(myData) {                
                    var circles = shapes.append("circle")
    //                .filter(function(d){ return (d.mode != "H") })
                      .filter(function(d){ return (d.mode != mode_type[0]) })  //mode_type[1] == T
                     // .attr("id", mode_type[1])
					.attr("class", "dots")
                      .attr("id", function(d) { return d.diagnostic_smur})
                     .attr("r", radius)
                      .attr("cx", xMap)
                      .attr("cy", yMap)
                      .style("fill", function(d) { return color(cValueD(d));})
                        .style("opacity", .7)
                       .on("mouseover", function(d) {   //BEGIN mouseover on T
                            // Use D3 to select element, change color and size
                            //d3.select(this).transition()
                            d3.select(this)
                            .style("opacity", 1)
                            .attr({
                             // fill: "orange",
                              r: radius * 1.5
                            });
                            // Show Tooltip on mouseOver
                             tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);
                             tooltip.html( "D: <b>" + d.distance_km + "</b> T:<b>" + d.out_of_hospital_time_minute + 
                                          "</b><br/><b>" + d.mode_long + "</b><br/> SMUR for:" + d.diagnostic_smur 
                                          + "<br/> Outcome: <b>" + d.outcome_28day)
                                .style("left", (d3.event.pageX + 5) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                                })

                          // END mouseover T
                     .on("mouseout", function(d) {
                         d3.select(this).transition()
                            .style("opacity", 0.8)
                             .attr({
                             // fill: "orange",
                              r: radius
                            });
                         tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                         //tooltip.remove();
                      }) 
//                      .on("click",function(d) {  //remove on click  (T set)
//                           confirm("You double-click a data point. \n This action will hide this data point (#" + d.id + ")\n\n" +
//                                 "Transport mode: " + d.mode_long + "\n SMUR for:" + d.diagnostic_smur 
//                                           + "\n 28D: " + d.outcome_28day);
//                           d3.select(this).attr({          // making the selected shape transparent/opague and white
//                             //  style: ("opacity", 0),
//                               style: ("opacity", 1),
//                               fill: "#FFFFFF"

//                           });
//                           d3.select(this).active = 0;
//                          //console.log("before" + data.length + " " + removed_data.length);
//                        //  dataforCal, lastRemove, removed_data = removeData(dataforCal, d.id);
//                        // dataforCal, lastRemove, removed_data = removeData(dataforCal, d.id);
//                         thisID =removeData(dataforCal, d.id);
//                         removed_data_id.push(thisID.id);
//                         // removed_data_id.push(removeData(dataforCal, d.id));
//                         //TremoveData();
//                         // console.log("after" + data.length + " " + removed_data.length);
//                          console.log("lastRemove[0] T set" + lastRemove);
//                          console.log(removed_data_id);
//                          d3.select(this).remove();   // remove from D3 selection (.data and visual)
//                          tooltip.transition()
//                             .duration(500)
//                             .style("opacity", 0);
// //                         updateChart(dataforCal);
//                          updateChart(TdataforCal, "path#TregLine");
//                          //tooltip.remove();  // this remove all tooltips
//                      }) // end on click   //  // end Circles for mode T
                return lastRemove, lastRemove.id, data, circles;  // lastRemove, lastRemove.id is available on console
            }//END function addSquare_for_H
 
	drawLine();
 }  // END refreshShapes

function drawLine() {
	console.log("In drawLine");
    console.log(baseData[0]);  // basedata is passed properly
    // console.log(data[0]);  // *** data is NOT passed properly***
    console.log(dataforCal[0]);  // dataforCal is passed properly
    console.log(TdataforCal[0]);  // TdataforCal is passed properly
}
// call the function once
   