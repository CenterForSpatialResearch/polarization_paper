
var timelineUtil = {
    w:600,
    h:70,
    p:40,
    ml:60,
    mt:640
}

function drawTimeline(linksCount,threshold){
   // console.log(timelineRecorder)
    //console.log([linksCount,threshold])
    var w = timelineUtil.w
    var h = timelineUtil.h
    var p = timelineUtil.p
    var ml = timelineUtil.ml
    var mt = timelineUtil.mt
    
    var thresholdScale = d3.scaleLinear().domain([0,1]).range([0,h])
    var thresholdScaleR = d3.scaleLinear().domain([0,1]).range([h,0])
    
    var linksAddedScale = d3.scaleLinear().domain([0,1000]).range([0,w])    
    
    var timelineSvg = d3.select("#chart1 svg")
    
    
    var lastRecord = timelineRecorder[timelineRecorder.length-1].links
    
    for(var l = 0; l<linksCount-lastRecord;l++){
        timelineSvg.append("rect")
        .attr("x",linksAddedScale(lastRecord+l))
        .attr("y",thresholdScaleR(threshold))
        .attr("width",1)
        .attr("height",h-thresholdScaleR(threshold))
        .attr("class","timelineRect timeline_"+lastRecord)
        .attr("timelineLink",lastRecord)
        .attr("transform","translate("+ml+","+mt+")")
        .attr("fill",function(){
            if(triadicMode==false){
                return "#000"
            }else{
                return "red"
            }
        })
        .attr("opacity",function(){
            if(triadicMode==false){
                return .5
            }else{
                return .2
            }
        })
    }
    
}

function addTimelineMarker(linksCount){
    
    d3.selectAll(".timelineMarker").remove()
    var w = timelineUtil.w
    var h = timelineUtil.h
    var p = timelineUtil.p
    var ml = timelineUtil.ml
    var mt = timelineUtil.mt
    var thresholdScale = d3.scaleLinear().domain([0,1]).range([0,h])
    var linksAddedScale = d3.scaleLinear().domain([0,1000]).range([0,w])

    d3.select("#chart1 svg").append("circle")
    .attr("class","timelineMarker")
    .attr("r",5)
    .attr("fill","#000")
    .attr("cx",linksAddedScale(linksCount))
    .attr("cy",h-thresholdScale(threshold))
    .attr("transform","translate("+ml+","+mt+")")
}

function drawTimelineAxis(){
    var w = timelineUtil.w
    var h = timelineUtil.h
    var p = timelineUtil.p
    var ml = timelineUtil.ml
    var mt = timelineUtil.mt
    
    var thresholdScale = d3.scaleLinear().domain([0,1]).range([0,100])
    var linksAddedScale = d3.scaleLinear().domain([0,1000]).range([0,w])
    var thresholdScaleR = d3.scaleLinear().domain([0,1]).range([h,0])
    
    d3.select("#chart1 svg").append("text")
        .text("Network Growth Tracking Timeline")
        .attr("x",0)
        .attr("y",0)
        .attr("transform","translate("+ml+","+(mt-10)+")")
    
    
    d3.select("#chart1 svg").append("text")
        .text("Total Links")
        .attr("x",w/2-p)
        .attr("y",h+p)
        .attr("transform","translate("+ml+","+mt+")")

    d3.select("#chart1 svg").append("text")
        .text("Tolerance")
        .attr("x",0)
        .attr("y",h/2-p)
        .attr("transform","translate("+p/2+","+mt+")")
        .style("writing-mode","tb")
    
    var xAxis = d3.axisBottom()
                .scale(linksAddedScale)
                .tickSize(10)
                .ticks(9)
                .tickFormat(d3.format("d"))
    
    var yAxis = d3.axisLeft()
                .scale(thresholdScaleR)
                .tickSize(w)
                .ticks(6)
                .tickFormat(d3.format(",.0%"))
    
    var yGroup = d3.select("#chart1 svg").append("g")
        .attr("class", "yAxis")
        .call(yAxis)
        .attr("transform","translate("+(ml+w)+","+mt+")")
        .style("stroke-dasharray","1 3")
    
    yGroup.select(".domain").remove()
    
    var xGroup=d3.select("#chart1 svg")
        .append("g")
        .attr("class", "xAxis")
        .call(xAxis)
        .attr("transform","translate("+ml+","+(mt+h)+")")
}

drawTimelineAxis()
//drawTimeline(100,threshold)

addTimelineMarker(100)
