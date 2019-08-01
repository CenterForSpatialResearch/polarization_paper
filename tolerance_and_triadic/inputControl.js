
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
          }else{
              for(var i = 0; i<links.length-sliderValue;i++){
                  links.pop()
              }
          }
          
          restart()  
      }
      
    }
    
   // sliderStart.onstop = function() {console.log("stop")}
    

    //START HERE - MAKE SLIDER STOP TO GET STARTING NETWORK
    return sliderValue
}




updateSlider("startingInput","startValue", thresholdStart)
updateSlider("growthInput","growthValue", threshold)

updateSlider("linksAddedInput","linksAddedValue", threshold)



function addLink(quantity){
            console.log(threshold)
    
    for(var i =0; i<quantity; i++){
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
        links.push({source: randomSource, target: target})
        updateLinks()
    }
}