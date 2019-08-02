    var timelineRecorder = [{threshold:.1,links:0}]

function updateSlider(sliderDiv,displayDiv, thresholdVariable){
    var sliderStart = document.getElementById(sliderDiv);
    var outputStart = document.getElementById(displayDiv);
    
    var sliderValue = sliderStart.value
    
    
    if(sliderDiv=="linksAddedInput"){
        outputStart.innerHTML = sliderValue;
        
    }else{
        outputStart.innerHTML = sliderValue+"%";
        
    }    
    sliderStart.oninput = function() {
      sliderValue  = this.value
        if(sliderDiv=="linksAddedInput"){
            outputStart.innerHTML = sliderValue;
            
        }else{
            outputStart.innerHTML = sliderValue+"%";
            
        }
      thresholdVariable = sliderValue
      
      
      if(sliderDiv=="startingInput"){
          makeNetworkData(sliderValue/100)
          simulation.nodes(nodes);
          simulation.force("link").links(links);
          simulation.alpha(1).restart();
          restart()
          
          var linksAddedValue = document.getElementById("linksAddedInput")
          linksAddedValue.value = 100
          var linksAddedDisplay = document.getElementById("linksAddedValue")
          linksAddedDisplay = 100
      }
      
      if(sliderDiv=="growthInput"){
          threshold = sliderValue/100
          addTimelineMarker(links.length)          
          //timelineRecorder.push([threshold,links.length])
      }
      
      if(sliderDiv=="linksAddedInput"){          
          if(sliderValue>links.length){
              //addLink(sliderValue-links.length)
           //    addTriadicLink(sliderValue-links.length)
              if(triadicMode==true){
                  addMostCommonLink(sliderValue-links.length)
              }else{
                    addLink(sliderValue-links.length)
              }
              drawTimeline(sliderValue,threshold)
          }else{
              for(var i = 0; i<links.length-sliderValue;i++){
                  links.pop()
                  strength +=.2
                  
                simulation.force("charge", d3.forceManyBody().strength(strength))
                .force("link", d3.forceLink(links).distance(distance))
                  
              }
               for(var t = 1000-links.length; t>0; t=t-1){
                   d3.select(".timeline_"+(1000-t)).remove()
               }
          }
          
          restart()  
          addTimelineMarker(links.length)
          if(threshold != timelineRecorder[timelineRecorder.length-1].threshold || links.length!=timelineRecorder[timelineRecorder.length-1].links){
              timelineRecorder.push({threshold:threshold,links:links.length})
          }
          
      }
      
    }
    
   // sliderStart.onstop = function() {console.log("stop")}
    

    //START HERE - MAKE SLIDER STOP TO GET STARTING NETWORK
    return sliderValue
}




/*
updateSlider("startingInput","startValue", thresholdStart)
*/
updateSlider("growthInput","growthValue", threshold)

updateSlider("linksAddedInput","linksAddedValue", threshold)



function addLink(quantity){
    var linksTracker = []
    
    simulation.force("charge", d3.forceManyBody().strength(strength))
    .force("link", d3.forceLink(links).distance(distance))
    var linksMade = 0
    while(linksMade<quantity){
        var randomSource = nodes[Math.round(Math.random()*(nodes.length-1))]
        var target = nodes[Math.round(Math.random()*(nodes.length-1))]
        var existingTargets = getNeighbors(randomSource.id)
        while(randomSource==target && existingTargets.indexOf(target)>-1){
                target = nodes[Math.round(Math.random()*(nodes.length-1))]
        }
        if(Math.random()<threshold){
            while(target.group == randomSource.group ){
                target = nodes[Math.round(Math.random()*(nodes.length-1))]
            }
        }else{
            while(target.group != randomSource.group){
                target = nodes[Math.round(Math.random()*(nodes.length-1))]
            }
        }
        
        if(parseInt(randomSource.id.split("_")[1])<parseInt(target.id.split("_")[1])){
            var link = {source:randomSource, target:target}
        }else{
            var link = {source:target, target:randomSource}
        }
        
        var currentLinkIds = link.source.id+"_"+link.target.id
        
        if(linksTracker.indexOf(currentLinkIds)==-1){
            links.push(link)
            linksTracker.push(currentLinkIds)
            linksMade+=1
        }
        updateLinks()
    }
    for(var i =0; i<quantity; i++){
        strength -=.2
        
    }
}

function addMostCommonLink(quantity){
    var linksTracker = []
    var linksMade = 0
     while(linksMade<quantity){
         //get random node
        var randomSource = nodes[Math.round(Math.random()*(nodes.length-1))]
         
         //get its neighbors
        var neighbors = getNeighbors(randomSource.id)
         var nIds = []
         for(var j in neighbors){
             nIds.push(neighbors[j].id)
         }
         //get its neibhors' neighbors
         var nOfNs = []
         for(var i in neighbors){
             var neighbor = neighbors[i]
             var nOfN = getNeighbors(neighbor.id)
             nOfNs=nOfNs.concat(nOfN)
         }
         var nOfNCount = {}
         for(var k in nOfNs){
             var id = nOfNs[k].id
             if(nIds.indexOf(id)==-1 && id!=randomSource.id){
                 if(Object.keys(nOfNCount).indexOf(id)>-1){
                     nOfNCount[id]+=1
                 }else{
                     nOfNCount[id]=1
                 }
             }
         }
         var nOfNCountArray = Object.keys(nOfNCount).map(function(key) {
           return [key, nOfNCount[key]];
         });
         nOfNCountArray.sort(function(first, second) {
           return second[1] - first[1];
         });
        var mostInCommonId = nOfNCountArray[0][0]
        var mostInCommonNode = getNodeById(mostInCommonId)
        
         if(parseInt(randomSource.id.split("_")[1])<parseInt(mostInCommonNode.id.split("_")[1])){
             var link = {source:randomSource, target:mostInCommonNode}
         }else{
             var link = {source:mostInCommonNode, target:randomSource}
         }
         var currentLinkIds = link.source.id+"_"+link.target.id
         
         if(linksTracker.indexOf(currentLinkIds)==-1){
             links.push(link)
             linksTracker.push(currentLinkIds)
             linksMade+=1
            updateLinks()
        strength -=.2
             
            simulation.force("charge", d3.forceManyBody().strength(strength))
            .force("link", d3.forceLink(links).distance(distance))
         }
       
     }
}
function addTriadicLink(quantity){
    var linksTracker = []
    var linksMade = 0
    while(linksMade<quantity){
        var randomSource = nodes[Math.round(Math.random()*(nodes.length-1))]
        var neighbors = getNeighbors(randomSource.id)

        var nOfAll = []
        var mostInCommonCount = 0
        var mostInCommonNode = null
       
        for(var n in nodes){
            var currentInCommonCount = 0
            var nId = nodes[n].id
            var nOfN = getNeighbors(nId)
            for(var l in nOfN){
                if(neighbors.indexOf(nOfN[l])>-1){
                    //console.log("in common"+nOfN[l].id)
                    
                    if(parseInt(randomSource.id.split("_").id)>parseInt(nodes[n].id.split("_")[1])){
                        var currentLinkIds=nodes[n].id+"_"+randomSource.id
                    }else{
                         var currentLinkIds = randomSource.id+"_"+nodes[n].id
                    }
                    
                    if(neighbors.indexOf(nodes[n])==-1){
                        if(linksTracker.indexOf(currentLinkIds)==-1){
                            var newLink = {source: randomSource, target: nodes[n]}
                            links.push({source: randomSource, target: nodes[n]})
                            linksMade+=1
                            restart()
                            updateLinks()
                            strength -=.2
                            simulation.force("charge", d3.forceManyBody().strength(strength))
                            .force("link", d3.forceLink(links).distance(distance))
                            
                            nodes = nodes.sort(function (a,b){
           
                                  a["tempIndex"]=Math.random()
                                  b["tempIndex"]=Math.random()
                                  return a.tempIndex-b.tempIndex
                              })
                              
                            console.log(nodes)
                              
                        }
                    }
                }
            }
        }   
        return
            
        
        if(linksTracker.indexOf(currentLinkIds)==-1){
                console.log("ok")
                links.push({source: randomSource, target: mostInCommonNode})
                linksMade+=1
                restart()
                updateLinks()
                linksTracker.push(currentLinkIds)
        }else{
            console.log("repeat")
        }            
    }
}
