    var className = "A"

//var simulation = d3.forceSimulation(nodes)
//    .force("charge", d3.forceManyBody().strength(strength))
//    .force("link", d3.forceLink(links).distance(distance))
//    .force("x", d3.forceX())
//    .force("y", d3.forceY())
//    .alphaTarget(1)
//    .on("tick", ticked);
    
var simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(strength))
            .force("link", d3.forceLink(links).distance(distance))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            //.alphaTarget(1)
            .on("tick", ticked);

    
    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    var link = g.append("g").attr("stroke", strokeColor).attr("stroke-width", strokeWidth).attr("class","link"+className).selectAll(".link"+className)
    var node = g.append("g")
        .attr("stroke", strokeColor).attr("stroke-width", strokeWidth).attr("stroke-opacity",.2)
        .attr("class","node"+className).selectAll(".node"+className);

        restart();
        

   // restart();
    var sources
    var sourcesMap
    var targets
    var targetsMap
    updateLinks()

    function updateLinks(){
        sources = d3.nest()
                    .key(function(d){
                        return d.source.id
                    })
                    .entries(links)
        sourcesMap = d3.map(sources,function(d){return d.key})

        targets = d3.nest()
                    .key(function(d){return d.target.id})
                    .entries(links)
        targetsMap = d3.map(targets,function(d){return d.key})
    }


       
    
    function addMostCommonFriend(time,count){
        
        //select random node as source
        //get all friends of friends
        //tally
        //get top friend of friend that's not already a friend
        //add as new link
        d3.timeout(function(){
            strength -=.2
            simulation.force("charge", d3.forceManyBody().strength(strength))
            .force("link", d3.forceLink(links).distance(distance))
        
            var randomSource = nodes[Math.round(Math.random()*(nodes.length-1))]
            var neighbors = getNeighbors(randomSource.id)
            //console.log([count,neighbors.length,links.length])
            var nIds = []
            for(var j in neighbors){
                nIds.push(neighbors[j].id)
            }
            
            var nOfNAll = []
            for(var n in neighbors){
                var nId = neighbors[n].id
                var nOfN = getNeighbors(nId)
                nOfNAll = nOfNAll.concat(nOfN)
            }
             
            nOfNCount = {}
            
            for(var k in nOfNAll){
                var id = nOfNAll[k].id
                //if it is not a friend already
                if(nIds.indexOf(id)==-1 && id!=randomSource.id){
                    //if it is in the count
                    if(Object.keys(nOfNCount).indexOf(id)>-1){
                        nOfNCount[id]+=1
                    }else{
                        nOfNCount[id]=1
                    }
                }else{
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
            var newLink = {source: randomSource, target: mostInCommonNode}
            links.push({source: randomSource, target: mostInCommonNode})
            restart()
            updateLinks()
           // console.log(randomSource)
           // console.log(mostInCommonNode)
            relationshipTable(links,count)
            d3.select(".tolerance").text("Triadic")
            document.title = thresholdStart+"triadic"+"_friends_"+count
            
           // if(count==1){
           //     downloadSVG()
           // }
           // if(count%downloadInterval==0){
           //     console.log(threshold+"_"+count)
           //     downloadSVG()
           //     //download(JSON.stringify(nodes), "nodes"+threshold+"_"+count+".txt", 'text/plain');
           //     //download(JSON.stringify(links), "links"+threshold+"_"+count+".txt", 'text/plain');
           // }
            
        },time)
        
    }
    function getNodeById(id){
        for(var n in nodes){
            if(nodes[n].id==id){
                return nodes[n]
            }
        }
    }
    
    function addFriend(time,count){
        var allTime = time
        //https://bl.ocks.org/mbostock/aba1a8d1a484f5c5f294eebd353842da
   //     distance +=.5
        
        d3.timeout(function(){
            strength -=.2
        
        //    simulation.force("charge", d3.forceManyBody().strength(strength))
        //    .force("link", d3.forceLink(links).distance(distance))
        //
        //
            
            console.log(threshold)
            
            d3.select("#friendCount").html("new friends: "+ count)
            document.title = thresholdStart+"th_"+threshold+"_friends_"+count
            
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
          //  restart()
          //  d3.select("."+randomSource.id+"_"+target.id)
          //              .attr("opacity",1).attr("stroke","red").attr("stroke-width",2)
          //              .transition().delay(interval)
          //              .attr("stroke","#000000").attr("stroke-width",1).attr("stroke-opacity",.2)
           // relationshipTable(links,count)
           // if(count==1){
           //     downloadSVG()
           // }
           // if(count%downloadInterval==0){
           //     console.log(threshold+"_"+count)
           //     downloadSVG()
           //   //  download(JSON.stringify(nodes), "nodes"+threshold+"_"+count+".txt", 'text/plain');
           //   //  download(JSON.stringify(links), "links"+threshold+"_"+count+".txt", 'text/plain');
           // }
        },time)
    }
    function relationshipTable(links,count){
        var table = {}
        var tally = {}
        tally["homophily"]=0
        tally["heterophily"]=0
        
        for(var l in links){
            var link = links[l]
            var sg = link.source.group
            var tg = link.target.group
            var key = sg+"x"+tg
            
            if(Object.keys(table).indexOf(sg)>-1){
                if(Object.keys(table[sg]).indexOf(tg)>-1){
                    table[sg][tg]+=1
                }else{
                    table[sg][tg]=1
                }
            }else{
                table[sg]={}
                if(Object.keys(table[sg]).indexOf(tg)>-1){
                    table[sg][tg]+=1
                }else{
                    table[sg][tg]=1
                }
            }
            
            if(sg ==tg){
                tally["homophily"]+=1
            }else{
                tally["heterophily"]+=1
            }
        }
        var total = tally["heterophily"]+tally["homophily"]
        
        var tableString = ""
                
        d3.selectAll(".setup").remove()
        d3.selectAll(".tally").remove()
        d3.selectAll(".friendshipTable").remove()
        var padding =20
        
        
        var setupSvg = d3.select("#chart1 svg").append("g").attr("class","setup")
        .attr("transform","translate(20,460)")
        
        setupSvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",1)
        setupSvg.append("text").text("Tolerance: "+Math.round(threshold*100)/100).attr("x",padding).attr("y",padding*2).attr("class","tolerance")
        setupSvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",padding*3)
        setupSvg.append("text").text("Links Added: "+count).attr("x",padding).attr("y",padding*5)
        
        var tableSvg= d3.select("#chart1 svg").append("g").attr("class","friendshipTable")
        .attr("transform","translate(20,580)")
        
        
        tableSvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",1)
        tableSvg.append("text").text("Links Formed").attr("x",padding).attr("y",30)
        var row = 1
        for(var t in table){
            for(var c in table[t]){
                row+=1
                tableSvg.append("rect").attr("height",strokeWidth).attr("width",padding*2).attr("x",padding*2)
                .attr("y",row*30-nodeRadius-1).attr("fill",strokeColor)
                tableSvg.append("circle").attr("r",nodeRadius).attr("fill",groupColor[t]).attr("cx",padding*2).attr("cy",row*30-nodeRadius)
                .attr("stroke",strokeColor).attr("stroke-width",strokeWidth)
                tableSvg.append("circle").attr("r",nodeRadius).attr("fill",groupColor[c]).attr("cx",padding*4).attr("cy",row*30-nodeRadius)
                .attr("stroke",strokeColor).attr("stroke-width",strokeWidth)
                tableSvg.append("text").text(table[t][c]).attr("x",padding*5).attr("y",row*30+2)
            }
        }



        var tallySvg= d3.select("#chart1 svg").append("g").attr("class","tally")
        .attr("transform","translate(20,750)")
        
        tallySvg.append("rect").attr("width",200).attr("height",1).attr("x",padding/2).attr("y",1)
        
        tallySvg.append("text")
        .text("Homophily: ")
        .attr("x",padding).attr("y",padding*2)
        tallySvg.append("text")
        .text(Math.round(tally["homophily"]/total*100)+"%")
        .attr("x",padding*7).attr("y",padding*2)
        tallySvg.append("text")
        .text(tally["homophily"])
        .attr("x",padding*7).attr("y",padding*3)
        .attr("fill","#888")
        
        tallySvg.append("text")
        .text("Heterophily: ")
        .attr("x",padding).attr("y",padding*5)
        tallySvg.append("text")
        .text(Math.round(tally["heterophily"]/total*100)+"%")
        .attr("x",padding*7).attr("y",padding*5)
        tallySvg.append("text")
        .text(tally["heterophily"])
        .attr("x",padding*7).attr("y",padding*6)
        .attr("fill","#888")
        
        d3.selectAll(".setup").style("font-family","helvetica").style("font-size",20)
        d3.selectAll(".friendshipTable").style("font-family","helvetica").style("font-size",20)
        d3.selectAll(".tally").style("font-family","helvetica").style("font-size",20)
        
    }

   

    //https://bl.ocks.org/emeeks/9915de8989e2a5c34652

    function getNeighbors(id){
        var linkedNodes = []
        if(targetsMap.get(id)!=undefined){
            for(var t in targetsMap.get(id).values){
                var nid = targetsMap.get(id).values[t].source//.id
               // d3.select("."+nid).attr("fill","blue")
                //d3.select("."+nid+"_"+id).attr("stroke","orange")
                linkedNodes.push(nid)
            }
        }
    
        if(sourcesMap.get(id)!=undefined){
            for(var t in sourcesMap.get(id).values){
                var nid = sourcesMap.get(id).values[t].target//.id
              //  d3.select("."+nid).attr("fill","blue")
             //   d3.select("."+id+"_"+nid).attr("stroke","orange")
                linkedNodes.push(nid)
            }
        }   
    
        return linkedNodes
    }

    function restart() {
      // Apply the general update pattern to the nodes.
      node = node.data(nodes, function(d) { return d.id;});
      node.exit().remove();
      node = node.enter()
          .append("circle")
          .attr("fill",function(d){
              return groupColor[d.group]
          })
          .attr("class",function(d){return d.id+" networkCircle"})
          .attr("r", nodeRadius)
          .merge(node)
          .on("mouseover",function(d){
              d3.select(this).attr("fill",function(d){
                  return groupColor[d.group]
              })
          })
        //added below to update color
        d3.selectAll(".networkCircle")
          .each(function(d){
              d3.select(this).attr("fill",groupColor[d.group])
          })

      // Apply the general update pattern to the links.
      link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
      link.exit().remove();
      link = link.enter()
      .append("line")
      .attr("class",function(d){
          return d.source.id + "_" + d.target.id;
      })
      .attr("stroke", strokeColor).attr("stroke-width",strokeWidth)
      .attr("opacity",.2)
      .merge(link);
    //  // Update and restart the simulation.
      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }