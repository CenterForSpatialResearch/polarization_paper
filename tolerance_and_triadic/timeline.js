
function drawTimeline(linksCount,threshold){
    //console.log([linksCount,threshold])
    var thresholdScale = d3.scaleLinear().domain([0,1]).range([0,100])
    var linksAddedScale = d3.scaleLinear().domain([0,1000]).range([0,600])
    
    var timelineSvg = d3.select("#chart1 svg")
    timelineSvg.append("rect")
        .attr("class","time_"+linksCount)
        .attr("width",1)
        .attr("height",2)
        .attr("x",linksCount/2)
        .attr("y",100-thresholdScale(threshold))
        .attr("transform","translate(50,150)")
}


function drawTimelineAxis(){

    var thresholdScale = d3.scaleLinear().domain([0,1]).range([0,100])
    var linksAddedScale = d3.scaleLinear().domain([0,1000]).range([0,600])
        
    var xAxis = d3.axisBottom()
                .scale(linksAddedScale)
                .tickSize(10)
                .ticks(6)
                .tickFormat(d3.format("d"))
    
    var yAxis = d3.axisLeft()
                .scale(thresholdScale)
                .tickSize(2)
    
    
        d3.select("#chart1 svg").append("g")
            .attr("class", "yAxisLong")
            .call(yAxis)
            .attr("transform","translate(50,150)")
        
        d3.select("#chart1 svg")
            .append("g")
            .attr("class", "xAxis")
            .call(xAxis)
        .attr("transform","translate(50,250)")
}

drawTimelineAxis()
for(var i =0; i<=100; i++){
    drawTimeline(i,threshold)
}