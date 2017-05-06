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

d3.csv("data/hellodata-6.csv", function(error, csv) {
  csv.forEach(function(d) {
    d.distance_km = +d.distance_km;
    d.out_of_hospital_time_minute = +d.out_of_hospital_time_minute;
    d.mode = d.mode;
    d.mode_long = d.mode_long;
    d.outcome_28day = +d.outcome_28day;
    d.diagnostic_smur = d.diagnostic_smur;
    d.id = d.id;
  });
  	baseData = csv;
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

	// dataforCal = data;
	HdataforCal = data.filter(function(e) { return e.mode == "H"});
	TdataforCal = data.filter(function(e) { return e.mode == "T"});
	// console.log("data - # " + data.length);
	// console.log("baseDataL - # " + baseData.length);
	console.log("x range" + d3.extent(data, function(d) { return d.x; }));

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


    // define the function with the data-manipulation code
    // shapes =    container.selectAll(".dots")    //binding shape to data
    // //  .data(data).enter();
    // .data(dataforCal).enter();
    // //.data(data.filter(function(d){ return (d.mode == "H") }))               .enter().append("rect")

    // var refreshSquares = addSquare_for_H(shapes, mode_type, radius, xMap, yMap, data);
    // var refreshCircles = addCircles_for_T(shapes, mode_type, radius, xMap, yMap, data);
    // console.log("colorscale " + colorscale);
   // circles.attr("groupid", "GroupT");
  // on enter
// var cValue = function(d) { return d["diagnostic_smur"];},   // d3 does color magics
// color = d3.scale.category20();
// // var colorscale = d3.select('input[type=radio]:checked').node().value;
// // var colorscale = d3.select('input[name="colorscale"]:checked').node().value;
// console.log("colorscale" + colorscale);
    //var mode_type = d3.set(data.map(function(d) { return d.mode; }));
	var colorscale = d3.select('input[type=radio]:checked').node().value;
	var color = d3.scale.category10();
	var color2 = d3.scale.category20();

	var cValue_m = function(d) { return d["mode"];},
        color2 = d3.scale.category20();

    var cValue_d = function(d) { return d["diagnostic_smur"];},   // d3 does color magics
       color = d3.scale.category10();        

    var circles;
    var radius = 2.1
	if (checks["T"] == true){
		console.log("T == true");
		console.log(TdataforCal.length);
		circles = container.selectAll(".dot")
	    	// .data(modeData["T"]);
	    	.data(TdataforCal);
	    circles.enter()
		    .append("circle")
		   .filter(function(d){ return (d.mode =="T");})//mode_type[1] == T   
		    .attr("class", "dot");

		circles.exit().remove();

		circles
	    .attr("cx", function(d) { return xScale(d.x); })
	    .attr("cy", function(d) { return yScale(d.y); })
	    //.style("fill", function(d) { return color(d.mode); })
	    //.attr("r", function(d){ return d[radAttr]; });
	    .style("fill", function(d){
	           //get the value of the checked
	       if(colorscale =="diagnostic_smur"){
	         return color2(d.diagnostic_smur);
	          // return cValue_d;
	       } else {
	         return color(d.mode); 
	         // return cValue_m;
	       }
		})
	    .attr("r", radius*2)
	    .style("opacity", .8)
	}
	// console.log("T "+checks["T"]);
	// console.log("H "+checks["H"]);

	// var circles = container.selectAll(".dot")
	//     .data(data);
	// var circles = container.selectAll(".dot")
	//     .data(TdataforCal);

	 // var squares = container.selectAll(".dot")
	 //    .data(HdataforCal);

	 var squares = container.selectAll(".dot")
	    .data(data);
	    
	//shapes.enter();  // will follow with exit remove

  
  	squares.enter()
	    // .append("squares")
	    .append("rect")
	    .filter(function(d){ return (d.mode =="H");})//mode_type[1] == T   
	    .attr("class", "dot");

	squares.exit().remove();
   
	// circles
	//     .attr("cx", function(d) { return xScale(d.x); })
	//     .attr("cy", function(d) { return yScale(d.y); })
	//     //.style("fill", function(d) { return color(d.mode); })
	//     //.attr("r", function(d){ return d[radAttr]; });
	//     .style("fill", function(d){
	//            //get the value of the checked
	//        if(colorscale =="diagnostic_smur"){
	//           return color2(d.diagnostic_smur);
	//        } else {
	//           return color(d.mode); 
	//        }
	// 	})
	//     .attr("r", radius *2)
	//     .style("opacity", .8)	    

	// // *******Square for H

	var radius = 3; 
	squares
		// .attr("width", radius*2)
		// .attr("height", radius*2)
		.attr("width", 5)
		.attr("height", 5)
		// .attr("x", xMap - radius)
		// .attr("y", yMap + radius)
		.attr("x", function(d) { return xScale(d.x)- radius; })
		.attr("y", function(d) { return yScale(d.y)+ radius; })
		.attr("r", radius *2)
    	.style("fill", "#FFFFFF")
		.style("opacity", .7)

	// squares.on("mouseover", function(d) {   //BEGIN mouseover on H
	// 		// Use D3 to select element, change color and size
	// 		d3.select(this).transition()
	// 		.style("opacity", 1)
	// 		.attr({
	// 		// fill: "orange", orange appears after set opacity =0!
	// 		"width": radius * 3,
	// 		"height": radius * 3,
	// 		// "stroke-width": 3
	// 		});
	// 		// Show Tooltip on mouseOver
	// 		tooltip.transition()
	// 		.duration(200)
	// 		.style("opacity", .8);
	// 		tooltip.html( "D: <b>" + d.distance_km + "</b> T:<b>" + d.out_of_hospital_time_minute + 
	// 		"</b><br/><b>" + d.mode_long + "</b><br/> SMUR for:" + d.diagnostic_smur 
	// 		+ "<br/> Outcome: <b>" + d.outcome_28day)
	// 		.style("left", (d3.event.pageX + 5) + "px")
	// 		.style("top", (d3.event.pageY - 28) + "px");
	// 	})  // END mouseover

	// squares.on("mouseout", function(d) {
	// 		d3.select(this).transition()
	// 		.style("opacity", 0.8)
	// 		.attr({
	// 		// fill: "orange", orange appears after set opacity =0!
	// 		"width": radius * 2,
	// 		"height": radius * 2,
	// 		// "stroke-width": 3
	// 		});
	// 		tooltip.transition()
	// 		.duration(500)
	// 		.style("opacity", 0);
	// 		//tooltip.remove();
	// 	}) 

	// //********** circle for T




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
   