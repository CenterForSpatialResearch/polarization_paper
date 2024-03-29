/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
function bubbleChart() {
  // Constants for sizing
  var width = 1000;
  var height = 600;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
 // var center = { x: width / 2, y: height / 2 };
  var center = { x: width / 3, y: height / 2 };


  var yearCenters = {}
  var yearsTitleX ={}
  
  var startYear = 1962
  var endYear = 2020
  var padding = 200
  for(var py = startYear; py<endYear; py++){
      yearCenters[py]={x:Math.round((width-padding)/(endYear-startYear+4)*(py-startYear+1)+padding/3),y:height/2}
      yearsTitleX[py]={x:Math.round((width)/(endYear-startYear)*(py-startYear))+10}
  }
  //var yearCenters = {
  //  2005: { x: width / 3, y: height / 2 },
  //  2006: { x: width / 3, y: height / 2 },
  //  2008: { x: width / 3, y: height / 2 },
  //  2009: { x: width / 2, y: height / 2 },
  //  2010: { x: 2 * width / 3, y: height / 2 }
  //};

 // X locations of the year titles.
 //var yearsTitleX = {
 //  2008: 160,
 //  2009: width / 2,
 //  2010: width - 160
 //};
  // @v4 strength to apply to the position forces
  var forceStrength = 0.3;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // Charge function that is called for each node.
  // As part of the ManyBody force.
  // This is what creates the repulsion between nodes.
  //
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  //
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  //
  // Charge is negative because we want nodes to repel.
  // @v4 Before the charge was a stand-alone attribute
  //  of the force layout. Now we can use it as a separate force!
  function charge(d) {
    return -Math.pow(d.radius, 2.1) * forceStrength;
  }

  // Here we create a force layout and
  // @v4 We create a force simulation now and
  //  add forces to it.
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  // @v4 Force starts up automatically,
  //  which we don't want as there aren't any nodes yet.
  simulation.stop();

  // Nice looking colors - no reason to buck the trend
  // @v4 scales now have a flattened naming scheme
  var fillColor = d3.scaleOrdinal()
    .domain(['common', 'citing', 'subject'])
    .range(["#fff200", "#ec008c", "#00aeef"]);


  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    var maxAmount = d3.max(rawData, function (d) { return +d.Count; });

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    var radiusScale = d3.scalePow()
      .exponent(0.6)
      .range([4, 50])
      .domain([1, maxAmount]);

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
        
        if(isNaN(d.Count)==true){
            var radius = 2
        }else{
            var radius = radiusScale(+d.Count)
        }
        
      return {
        id: d.Id,
        radius: radius,
        value: +d.Count,
        decade:d.Year.slice(0,2),
        name: d.Title,
        org: d.Author,
        group: d.Group,
        year: d.Year,
        abs:d.Abstract,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.Id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transtition to below.
    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { 
          if(d.value == ""||d.value==0){
              return "#fff"
          }
          return fillColor(d.group); 
      })
      .attr("class",function(d){
          return "bubble year_"+d.year+" cGroup_"+Math.floor(d.value/100)
      })
      
      .attr('stroke', function (d) { 
          if(d.value == ""||d.value==0){
              return  fillColor(d.group)
          }
          return "#ffffff";  
      })//d3.rgb(fillColor(d.Group)).darker(); })
      .attr('stroke-width', 1)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);
     
      
    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; })

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */
  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  /*
   * Provides a x value for each node to be used with the split by year
   * x force.
   */
  function nodeYearPos(d) {
      if(yearCenters[d.year]!=undefined){
          return yearCenters[d.year].x;
      }else{
          return 0
      }
  }

  function nodeGroupPos(d){
    var group = d3.scaleOrdinal()
      .domain(['common', 'citing', 'subject'])
      .range([width/2,width/4,width/4*3]);
      
  }

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideYearTitles();

    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }


  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitBubbles() {
    //showYearTitles();
    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(.5).x(nodeYearPos));
    console.log(forceStrength)
showYearTitles() 
    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
    
    
    
    //showKeyYears()
  }
  function gridBubbles(){
          simulation.stop()
      var column = 0
      for(var year = 1959; year<2020; year++ ) {
          column+=1
          
          svg.append("text")
          .text(year)
          .attr("class","gridYears")
          .attr("x",0)
          .attr("y",column*12+6)
          
          d3.selectAll(".year_"+year)
          .each(function(d,i){
              d3.select(this)
              .transition()
              .duration(1000)
              .delay(i*5)
              .attr("cy",column*12)
              .attr("cx",i*3+40)
          })
         
      }
  }
  
  function citationCount(){
      d3.selectAll(".gridYears").remove()
      
          simulation.stop()
      var spacing = 30
      var groupOrder = 0
      
      for(var group=100; group>=0; group=group-1){
          var gSize = d3.selectAll(".cGroup_"+group).size()
          
          if(gSize>0){
              groupOrder+=1
              d3.selectAll(".cGroup_"+group)
              .each(function(d,i){
                  d3.select(this)
                  .transition()
                  .attr("cx",i%50*10+100)
                  .attr("cy",groupOrder*30+Math.floor(i/50)*10+100)
              })
          }
      }
  }

  /*
   * Hides Year title displays.
   */
  function hideYearTitles() {
    svg.selectAll('.year').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showYearTitles() {
      console.log("show")
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    //var yearsData = d3.keys(yearsTitleX);
    var years = svg
        .append("text")
        .attr('class', 'year')
        .text("1960")
        .attr("x",20)
        .attr("y",height/2)
        .style("font-size","24px")
        .style('fill',"#000")
    
svg.append("text")
        .attr('class', 'year')
        .text("2019")
        .attr("x",width-50)
        .attr("y",height/2)
        .style("font-size","24px")
        .style('fill',"#000")
    //.style("writing-mode","vertical-rl");
        
        
//        .data(yearsData);
//
//        years.enter().append('text')
//        .attr('class', 'year')
//        .attr('x', function (d,i) {return yearsTitleX[d].x; })
//        .attr('y', 400)
//        .attr('text-anchor', 'middle')
//        .text(function (d) {
//        if(d%10==0){
//          return d; 
//
//        }
//        })
//        .style("font-size","10px")
//        .style("fill","black")
//        .style("writing-mode","vertical-rl");
  }
  function showKeyYears(){
      d3.selectAll(".bubble")
      .each(function(d){
          if(d.value>200){
          //    console.log(d)
              svg.append("text")
              .text(d.year)
              .attr("x",d.x)
              .attr("y",d.y)
          }
      })
  }

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Title: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Author: </span><span class="value">' +
                  addCommas(d.org) +
                  '</span><br/>' +
                  '<span class="name">Year: </span><span class="value">' +
                  d.year +
                  '</span><br/>'+
                  '<span class="name">Citation Count: </span><span class="value">' +
                  d.value +
                  '</span><br/>'+
                  '<span class="name">Abstract: </span><span class="value">' +
                  d.abs +
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.Group)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubbles();
    } else if(displayName==="all") {
      groupBubbles();
    }else if(displayName ==="grid"){
        gridBubbles()
    }else if(displayName =="citation"){
        citationCount()
    }
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// Load the data.
d3.csv('data/merge.csv', display);

// setup the buttons.
setupButtons();
