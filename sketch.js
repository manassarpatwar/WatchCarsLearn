var brain = null;

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
            push();
            can.strokeWeight(2);
            can.stroke(255);
            can.line(offset, offset, offset, Species.drawHeight-offset)
            can.line(offset, Species.drawHeight-offset, Species.drawWidth-offset, Species.drawHeight-offset)
            pop();
            let genX = offset+2;
            let genOffset = Math.min(10, (Species.drawHeight-offset)/population.replayGenerations.length);

            for(let rg of population.replayGenerations){
                for(let s of rg.species){
                    push();
                    can.strokeWeight(0);
                    can.fill(s.color);
                    can.rect(genX, (Species.drawHeight-offset)-s.bestFitness*(Species.drawHeight-offset), genOffset, (s.bestFitness*(Species.drawHeight-offset)-2));
                    pop();
                }
                genX += genOffset;
            }
        }
    }
}

new p5(NNCanvas, "NNCanvas");
new p5(fitnessCanvas, "fitnessCanvas")

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
    localCar = new Car(raySlider.value(), 2);

    raySlider.changed(function(){
        raySlider.elt.blur();
        reset();
    });

    setInterval(update, 1000/60);
    setInterval(updatePopulation, 1)
}

setInterval(() => {
    if(startReplay && population.gen < 1000){
        for(let car of population.population){
            calculateCheckpoints(car);

            if(!car.dead){
                if(!checkOverlap(car)){
                    car.look();
                    car.think();
                    car.checkStaleness();
                }
                else{
                    car.died();
                };
            }
        }
        if(population.done()){
            population.naturalSelection();
        }
    }
}, 1);

let speed = 60;

function updateLogic(){
    if(humanPlaying && localCar){
        zoomCar = localCar
        localCar.look();
        if(startReplay && checkOverlap(localCar)){
            localCar = new Car(raySlider.value(), 2);
        }
    }

     if(startReplay && population.replayGenerations.length > 0){
        let replayGeneration = population.replayGenerations[population.replayGenerationNo];
        if(!humanPlaying)
            zoomCar = replayGeneration.species[0].mascot;

        for(let replaySpecies of replayGeneration.species){
            if(!replaySpecies.mascot.dead){
                calculateCheckpoints(replaySpecies.mascot);
                if(!checkOverlap(replaySpecies.mascot)){
                    replaySpecies.mascot.look();
                    replaySpecies.mascot.think();
                    replaySpecies.mascot.checkStaleness();
                }
                else{
                    replaySpecies.mascot.died();
                };
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

setInterval(updateLogic, 1/60);

function draw() {
    clear();
    background(0);
    stroke(255);


    // premadeTrack.map(p => ellipse(p.x, p.y, 4, 4))
    text(textAlpha, 400, 100);

    fill(255);
    if(zoom > 0 && zoomCar){
        translate(-zoom * zoomCar.x+width/2, -zoom * zoomCar.y+height/2);
        scale(zoom);
    }

    displayTracks();


    raySlider.input(function(){
        localCar.changeNumRays(raySlider.value());
    });

    if(startReplay && population.replayGenerations.length > 0){
        text(population.replayGenerationNo, 100, 400)
        for(let replaySpecies of population.replayGenerations[population.replayGenerationNo].species){
            replaySpecies.mascot.display(replaySpecies.color);
        }
    }

    if(humanPlaying && localCar){
        localCar.display();
    }
}

// function keyPressed() {
//     switch (key) {
//         case '»': //speed up frame rate
//             if(speed > 1)
//                 speed -= 10;
//             else
//                 speed = 1;
//             break;
//         case '½': //slow down frame rate
//             if(speed < 240)
//                 speed += 10;
//             else
//                 speed = 240;
//             break;
//         case 'B': //run the best
//             runBest = !runBest;
//             break;
//         }
// }