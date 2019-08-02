
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
      }
      
      if(sliderDiv=="linksAddedInput"){          
          if(sliderValue>links.length){
              addLink(sliderValue-links.length)
              drawTimeline(sliderValue,threshold)
          }else{
              for(var i = 0; i<links.length-sliderValue;i++){
                  links.pop()
                  strength +=.2
        simulation.force("charge", d3.forceManyBody().strength(strength))
        .force("link", d3.forceLink(links).distance(distance))
              }
          }
          
          restart()  
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