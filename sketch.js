var brain = null;
let runBest = false;
var bestCar = null;
let showNothing = false;
let replayGen = true;

var NNCanvas = function(can){
    can.setup = function(){
        canvas = can.createCanvas(Genome.drawDimensions, Genome.drawDimensions);
        canvas.position(windowWidth-Genome.drawDimensions, windowHeight-Genome.drawDimensions)
    }

    can.draw = function () {
        can.clear();

        if(brain != null){
            brain.computeDrawCoordinates();
            let xOffset = 0;
            let yOffset = 0;
            can.push();
            for(let c of brain.connections.values()){
                if(c.isEnabled()){
                    can.stroke(0,255,0)
                }else{
                    can.stroke(255, 0, 0);
                }
                can.line(brain.nodes.get(c.inNode).vector.x + xOffset, 
                brain.nodes.get(c.inNode).vector.y+yOffset, 
                brain.nodes.get(c.outNode).vector.x + xOffset, 
                brain.nodes.get(c.outNode).vector.y+yOffset)
            }
            can.pop();
            can.push();
            let i = 0;
            for(let n of brain.nodes.values()){
                can.fill(255,255,255);
                can.ellipse(n.vector.x + xOffset, n.vector.y+yOffset, n.radius,  n.radius);
            }
            can.pop();
        }
    };
}

var fitnessCanvas = function(can){
    var offset = 30;
    can.setup = function(){
        canvas = can.createCanvas(Species.drawWidth, Species.drawHeight);
        canvas.position(0, windowHeight-Species.drawHeight);
    }

    can.draw = function(){
        can.clear();

        if(population.gen > 0){
            can.fill(255);
            can.text("No. of Gen: "+population.gen, offset, Species.drawHeight-offset/2);
            push();
            can.strokeWeight(2);
            can.stroke(255);
            can.line(offset, offset, offset, Species.drawHeight-offset)
            can.line(offset, Species.drawHeight-offset, Species.drawWidth, Species.drawHeight-offset)
            pop();
            let genX = offset;
            let genOffset = 10;
            if(genX+population.replayGenerations.length*genOffset > Species.drawWidth){
                genOffset = (Species.drawWidth-offset)/population.replayGenerations.length;
            }

            for(let rg of population.replayGenerations){
                for(let s of rg.species){
                    push();
                    can.noStroke();
                    can.fill(s.color);
                    can.rect(genX, (Species.drawHeight-offset)-s.bestFitness*(Species.drawHeight-2*offset), genOffset, (s.bestFitness*(Species.drawHeight-2*offset)), 20, 20, 0, 0);
                    pop();
                }
                genX += genOffset;
            }
        }
    }
}

new p5(NNCanvas, "NNCanvas");
new p5(fitnessCanvas, "fitnessCanvas")


function createRandomTrack(){

    let points = [];
    let initLeft;
    let initRight;
    let initPoint;
    for(let i = 0; i < Math.PI*2; i+=0.01){
        let xoff = map(cos(i), -1, 1, 0, 2.5);
        let yoff = map(sin(i), -1, 1, 0, 2.5);

        let r = map(noise(xoff, yoff), 0, 1, 0.5, 1);
        let x = width/2 + width/2*r*Math.cos(i)
        let y = height/2 + height/2*r*Math.sin(i);

        if(initPoint == null){
            initPoint = createVector(x,y);
            continue
        }else{
            let t = new Boundary(initPoint.x, initPoint.y, x,y);
            paths.push(t)
            if(paths.length > 1){
                let p0 = paths[paths.length-2];
                let p1 = paths[paths.length-1];
                let a =Math.atan2(p1.y2-p0.y1, p1.x2-p0.x1);
                let leftPoint = createVector(p0.x2+TRACKWIDTH*Math.cos(a-Math.PI/2), p0.y2+TRACKWIDTH*Math.sin(a-Math.PI/2));
                let rightPoint = createVector(p0.x2+TRACKWIDTH*Math.cos(a+Math.PI/2), p0.y2+TRACKWIDTH*Math.sin(a+Math.PI/2));

                innerTrack.push(new Boundary(initLeft.x, initLeft.y, leftPoint.x, leftPoint.y));
                outerTrack.push(new Boundary(initRight.x, initRight.y, rightPoint.x, rightPoint.y));

                initLeft = leftPoint;
                initRight = rightPoint;
            }else{
                initLeft = t.getLeftPoint();
                initRight = t.getRightPoint();
            }
        }
        initPoint = createVector(x,y);
    }

    paths.push(new Boundary(initPoint.x, initPoint.y, paths[0].x1, paths[0].y1))
    innerTrack.push(new Boundary(initLeft.x, initLeft.y, paths[0].getLeftPoint().x, paths[0].getLeftPoint().y));
    outerTrack.push(new Boundary(initRight.x, initRight.y, paths[0].getRightPoint().x, paths[0].getRightPoint().y));

   

    for(let i = 0; i < innerTrack.length; i++){
        checkpoints.push(new Boundary(innerTrack[i].x1, innerTrack[i].y1, outerTrack[i].x1, outerTrack[i].y1));
    }

    //store
    localStorage.setItem("innerTrack", JSON.stringify(innerTrack));
    localStorage.setItem("outerTrack", JSON.stringify(outerTrack));
    localStorage.setItem("paths", JSON.stringify(paths));
    localStorage.setItem("checkpoints", JSON.stringify(checkpoints));
}


function setup() {
    raySlider = createSlider(1, 16, 3);
    raySlider.position(10, 150);
    raySlider.style('width', '80px');

    let storedCarSettings = JSON.parse(localStorage.getItem("carSettings"))
    carSettings = storedCarSettings == null ? [windowWidth/4, windowHeight/2, 0] : [storedCarSettings[0], storedCarSettings[1], storedCarSettings[2]];

    let storedPaths = JSON.parse(localStorage.getItem("paths"));
    paths = storedPaths == null ? [] : storedPaths.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));

    let storedInnerTrack = JSON.parse(localStorage.getItem("innerTrack"));
    innerTrack = storedInnerTrack == null ? [] : storedInnerTrack.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));

    let storedOuterTrack = JSON.parse(localStorage.getItem("outerTrack"));
    outerTrack = storedOuterTrack == null ? [] : storedOuterTrack.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));

    let storedCheckpoints = JSON.parse(localStorage.getItem("checkpoints"));
    checkpoints = storedCheckpoints == null ? [] : storedCheckpoints.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));

    population = new Population(populationSize, raySlider.value(), 2);

    createCanvas(windowWidth, windowHeight);

    if(storedPaths == null && storedInnerTrack == null && storedOuterTrack == null && storedCheckpoints == null){
        createRandomTrack();
    }


    localCar = new Car(raySlider.value(), 2);
    zoomCar = localCar;

    raySlider.changed(function(){
        raySlider.elt.blur();
        reset();
    });


    setInterval(update, 1000/60);
    setInterval(updateLogic, 1000/60);

}

let speed = 60;

function updateLogic(){
    if(humanPlaying && localCar){
        zoomCar = localCar
        localCar.look();
        if(localCar.dead){
            localCar = new Car(raySlider.value(), 2);
        }
    }

    if(startEvolution && population.gen < 1000){
        for(let car of population.population){
            calculateCheckpoints(car);

            if(!car.dead){
                car.look();
                car.think();
                car.checkStaleness();
            }
        }
        if(population.done()){
            population.naturalSelection();
            bestCar = population.best.clone();
        }
    }

    if(runBest && bestCar){
        zoomCar = bestCar;
        calculateCheckpoints(bestCar);
        if(!bestCar.dead){
            bestCar.look();
            bestCar.think();
            bestCar.checkStaleness();
        }else{
            
        }
    }

    if(startEvolution && replayGen && population.replayGenerations.length > 0){
        let replayGeneration = population.replayGenerations[population.replayGenerationNo];
        if(!humanPlaying)
            zoomCar = replayGeneration.species[0].mascot;

        for(let replaySpecies of replayGeneration.species){
            if(!replaySpecies.mascot.dead){
                calculateCheckpoints(replaySpecies.mascot);
                replaySpecies.mascot.look();
                replaySpecies.mascot.think();
                replaySpecies.mascot.checkStaleness();

            }
        }

        let replayDone = true;
        for(let replaySpecies of replayGeneration.species){
            if(!replaySpecies.mascot.dead){
                replayDone = false;
                break;
            }
        }
        if(replayDone){
            for(let replaySpecies of replayGeneration.species){
                replaySpecies.mascot.reset();
            }
            if(population.replayGenerations.length > population.replayGenerationNo+1)
                population.replayGenerationNo++;
        }
        brain = replayGeneration.species[0].mascot.brain;
    }

}



let noiseMax = 0;

function draw() {
    clear();
    background(0);
    stroke(255);

    fill(255);

    if(keyIsDown(187) && GLOBALSPEED < 240){
        GLOBALSPEED += 10;
    }

    if(keyIsDown(189) && GLOBALSPEED > 120){
        GLOBALSPEED -= 10;
    }

    if(zoom > 0 && zoomCar){
        translate(-zoom * zoomCar.x+width/2, -zoom * zoomCar.y+height/2);
        scale(zoom);
    }

    displayTracks();


    raySlider.input(function(){
        localCar.changeNumRays(raySlider.value());
    });

    if(startEvolution && !showNothing){
        for(let p of population.population){
            p.display(p.color);
        }
    }

    if(runBest && bestCar){
        bestCar.display(bestCar.color);
    }
    
    if(startEvolution && replayGen && population.replayGenerations.length > 0){
        for(let replaySpecies of population.replayGenerations[population.replayGenerationNo].species){
            if(zoom > 1 && replaySpecies.mascot.isPointInside(Math.floor((mouseX-width/2+zoomCar.x*zoom)/zoom), Math.floor((mouseY-height/2+zoomCar.y*zoom)/zoom)))
                brain = replaySpecies.mascot.brain;
            else if(replaySpecies.mascot.isPointInside(mouseX, mouseY))
                brain = replaySpecies.mascot.brain;
            replaySpecies.mascot.display(replaySpecies.color);
        }
    }

    if(humanPlaying && localCar){
        localCar.display([255, 0, 0]);
    }
}

function keyPressed(e) {
    switch (e.keyCode) {
        case 71:
            replayGen = !replayGen;
            break;
        case 78:
            showNothing = !showNothing;
            break;
        case 66: 
            if(bestCar){
                startEvolution = !startEvolution;
                runBest = !runBest;
                if(runBest){
                    zoomCar = bestCar;
                    bestCar.reset();
                    brain = bestCar.brain;
                }
            }
            break;
    }
}