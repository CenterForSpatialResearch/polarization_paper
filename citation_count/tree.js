var margin = {top: 100, right: 1200, bottom: 240, left: 100},
    width = 1800 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var orientations = {
    "left-to-right": {
        size: [height, width],
        x: function(d) { return d.y; },
        y: function(d) { return d.x; }
      }
};

var svg = d3.select("body").selectAll("svg")
    .data(d3.entries(orientations))
  .enter().append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
d3.json("temp_data.json").then(function(data) {

  svg.each(function(orientation) {
    var svg = d3.select(this),
        o = orientation.value;

   // Compute the layout.
        var treemap = d3.tree().size(o.size);
        
            var nodes = d3.hierarchy(data);
    
                nodes = treemap(nodes);
    
            var links = nodes.descendants().slice(1);
            
    // Create the link lines.
    svg.selectAll(".link")
            .data(links)
          .enter().append("path")
            .attr("class", "link")
            .attr("fill","none")
            .attr("stroke","black")
            .attr("opacity",1)
            .attr("d", function(d) {
     
           return "M" + d.y+ "," + d.x 
             + "C" + (d.y+d.parent.y)/2 + "," + d.x
             + " " + (d.y+d.parent.y)/2+ "," +  d.parent.x 
             + " " + d.parent.y+ "," + d.parent.x ;
           });
           
     var node = svg.selectAll(".node")
            .data(nodes.descendants())
            .enter()
            .append("g")
           
        node.append("circle")
            .attr("class", "node")
            .attr("r", 1)
            .attr("cx", o.x)
            .attr("cy", o.y);
    
       node .append("rect")
            .text(function (d) {return d.data.name;})
            .attr("x", o.x)
            .attr("y", o.y)
          //  .attr("y",function(d){console.log(d); return d.y/10})
            .attr("width",function(d){
                return d.data.name.length*9
            })
            .attr("height",20)
            .attr("fill","white")
            .attr("transform","translate(-32,-10)");
            
       node .append("text")
            .text(function (d) {return d.data.name;})
            .attr("y", o.y)
            .attr("x", o.x)
            .attr("dx", -30)
            .attr("dy", 5)
         //   .attr("text-anchor","middle")
  });
});