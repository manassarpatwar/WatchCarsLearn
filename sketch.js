var brain = null;
let runBest = false;
var bestCar = null;
let showNothing = false;
let replayGen = true;
let drawRays = false;

var numRaysPara;
var speedPara;
var genPara;
var showEvolutionPara;
var showBestPara;
var humanPlayingPara;

var raySlider;
var speedSlider;

var NNCanvas = function(can){
    let canvas;
    can.setup = function(){
        canvas = can.createCanvas(Genome.drawDimensions, Genome.drawDimensions);
        canvas.position(windowWidth-Genome.drawDimensions, windowHeight-Genome.drawDimensions)
        let canvasPara = createP('');
        canvasPara.position(windowWidth-Genome.drawDimensions, windowHeight-Genome.drawDimensions/2)
        canvasPara.attribute('aria-label', "Visualisation of the Neural Network of the best player");
        canvasPara.attribute('data-balloon-pos', "left");
        canvasPara.addClass('tutorialImages');
    }

    can.draw = function () {
        can.clear();

        if(brain != null){
            brain.computeDrawCoordinates();
            let xOffset = 0;
            let yOffset = 0;
            can.push();
            for(let c of brain.connections.values()){
                can.push();
                can.strokeWeight(c.weight*3)
                if(c.isEnabled()){
                    can.stroke(0,255,0)
                }else{
                    can.stroke(255, 0, 0);
                }
                can.line(brain.nodes.get(c.inNode).vector.x + xOffset, 
                brain.nodes.get(c.inNode).vector.y+yOffset, 
                brain.nodes.get(c.outNode).vector.x + xOffset, 
                brain.nodes.get(c.outNode).vector.y+yOffset)
                can.pop();
            }
            can.pop();
            can.push();

            can.stroke(255);
            can.strokeWeight(0.1);
            for(let n of brain.nodes.values()){
                can.push();
                can.translate(n.vector.x + xOffset, n.vector.y+yOffset)
                can.fill(0)
                can.ellipse(0,0, n.radius,  n.radius);
                can.fill(255, 255, 255, n.outputValue*255);
                can.ellipse(0,0, n.radius,  n.radius);
                can.pop();
            }
            can.pop();

        }
    };
}

var fitnessCanvas = function(can){
    var offset = 50;
    var canvas;
    var currentGen = 0;
    can.setup = function(){
        canvas = can.createCanvas(Species.drawWidth, Species.drawHeight);
        canvas.position(0, windowHeight-Species.drawHeight);

        let canvasPara = createP('');
        canvasPara.position(Species.drawWidth/2, windowHeight-Species.drawHeight/2);
        canvasPara.attribute('aria-label', "Graph of fitness over generations");
        canvasPara.attribute('data-balloon-pos', "right");
        canvasPara.addClass('tutorialImages');
    }

    can.draw = function(){

        if(population.gen > 0 && population.gen != currentGen){
            can.clear();
            currentGen = population.gen;
            can.textSize(15);
            can.fill(255);
            can.text("Generations", Species.drawWidth/2-offset/2, Species.drawHeight-offset/4);
            can.push()
            can.translate(3*offset/8, Species.drawHeight/2+3*offset/4);
            can.rotate(-Math.PI/2);
            can.text("Fitness", 0,0);
            can.pop();

            can.push();
            can.textSize(12);
            can.textAlign(RIGHT);
            for(let i = Species.drawHeight-offset+10; i >= offset; i-=(Species.drawHeight-2*offset)/10){
                can.push();
                can.text((Species.drawHeight-offset+10-i)/(Species.drawHeight-2*offset), offset-5, i);
                can.pop();
            }
            can.pop();

            can.push();
            can.strokeWeight(2);
            can.stroke(255);
            can.line(offset-1, offset+1, offset-1, Species.drawHeight-offset+1)
            can.line(offset-1, Species.drawHeight-offset+1, Species.drawWidth-1, Species.drawHeight-offset+1)
            can.pop();
            let genX = offset;
            let genOffset = 15;
            let genLimit = (Species.drawWidth-offset)/genOffset;
            let start = Math.round(population.replayGenerations.length-genLimit)
            start = start < 0 ? 0 : start;
            for(let i = start; i < population.replayGenerations.length; i++){
                can.push();
                can.fill(255);
                can.textAlign(CENTER);
                can.textSize(12);
                can.text((i+1), genX+genOffset/2, Species.drawHeight-(5*offset/8));
                can.pop();
                for(let s of population.replayGenerations[i].species){
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

new p5(fitnessCanvas, "fitnessCanvas")
new p5(NNCanvas, "NNCanvas");


function start(){
    carSettings = [localCar.x, localCar.y, localCar.angle];
    localStorage.setItem("carSettings", JSON.stringify([localCar.x, localCar.y, localCar.angle]));
    if(!startEvolution){
        for(let p of population.population){
            p.reset();
        }
    }
    startEvolution = true;
    humanPlaying = false;
}

function reset(){
    population = new Population(populationSize, raySlider.value(), 2);
    startEvolution = false;
    humanPlaying = true;
    brain = null;
}


function setup() {
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


    createCanvas(window.innerWidth, windowHeight);

    raySlider = createSlider(1, 8, 3);
    raySlider.position(10, 190);
    raySlider.style('width', '80px');


    humanPlayingPara = createP('');
    humanPlayingPara.style('width', '20px');
    humanPlayingPara.style('height', '20px');
    humanPlayingPara.style('padding', '0px');
    humanPlayingPara.style('margin', '0px');
    humanPlayingPara.style('z-index', '2');
    humanPlayingPara.style('transform', 'translate(-10px, -10px)');

    humanPlayingPara.attribute('aria-label', "This is YOU. Toggle control by pressing P. Control your car with WASD or arrow keys. Control the start position of evolution by driving around.");
    humanPlayingPara.attribute('data-balloon-length', "xlarge");
    humanPlayingPara.attribute('data-balloon-pos', "down-left");
    humanPlayingPara.addClass('tutorial');

    genPara = createP("Replaying Gen: -");
    genPara.position(10, 120);
    genPara.attribute('aria-label', "The generation no. being replayed \n (Press G to toggle best players of species)");
    genPara.attribute('data-balloon-pos', "down-left");
    genPara.attribute('data-balloon-length', "xlarge");
    genPara.addClass('tutorial');

    numRaysPara = createP("Inputs: "+raySlider.value());
    numRaysPara.position(10, 160);
    numRaysPara.attribute('aria-label', "Change number of inputs");
    numRaysPara.attribute('data-balloon-pos', "down-left");
    numRaysPara.addClass('tutorial');

    speedSlider = createSlider(1, 20, 1);
    speedSlider.position(10, 260)
    speedSlider.style('width', '80px');

    speedPara = createP("Speed: "+GLOBALSPEED);
    speedPara.position(10, 230);
    speedPara.attribute('aria-label', "Change speed of evolution");
    speedPara.attribute('data-balloon-pos', "down-left");
    speedPara.addClass('tutorial');

    showEvolutionPara = createP("Current Gen: -");
    showEvolutionPara.position(10, 300);
    showEvolutionPara.attribute('aria-label', "The current generation evolving. Press N to not show evolution & speed computation");
    showEvolutionPara.attribute('data-balloon-pos', "down-left");
    showEvolutionPara.attribute('data-balloon-length', "xlarge");
    showEvolutionPara.addClass('tutorial');

    showBestPara = createP("Best Player Gen: -");
    showBestPara.position(10, 340);
    showBestPara.attribute('aria-label', "The generation of the best ever player. Press B to toggle the best player");
    showBestPara.attribute('data-balloon-pos', "down-left");
    showBestPara.attribute('data-balloon-length', "xlarge");
    showBestPara.addClass('tutorial');

    raySlider.changed(function(){
        raySlider.elt.blur();
        drawRays = false;
        reset();
    });

    speedSlider.changed(function(){
        speedSlider.elt.blur();
    });

    population = new Population(populationSize, raySlider.value(), 2);
    localCar = new Car(raySlider.value(), 2);
    localCar.el.id("localCar");
    localCar.el.removeClass('car')


    zoomCar = localCar;

    background(0);
    displayTracks();
    setInterval(update, 1);

}

function update(){
    if(humanPlaying && localCar){
        
        localCar.isThrottling = keyActive('up');
        localCar.isReversing = keyActive('down');
        
        localCar.isTurningLeft = keyActive('left');
        localCar.isTurningRight = keyActive('right');

        if (localCar.x > windowWidth) {
            localCar.x -= windowWidth;
        } else if (localCar.x < 0) {
            localCar.x += windowWidth;
        }
        
        if (localCar.y > windowHeight) {
            localCar.y -= windowHeight;
        } else if (localCar.y < 0) {
            localCar.y += windowHeight;
        }

        zoomCar = localCar
        if(startEvolution){
            localCar.look();
        }
        localCar.update();

        if(localCar.dead)
            localCar.reset();
    }
    for(let i = 0; i < GLOBALSPEED; i++){
        if(startEvolution && population.gen < 1000){
            for(let car of population.population){
                if(!car.dead){
                    calculateCheckpoints(car);
                    car.look();
                    car.think();
                    car.update();
                    car.checkStaleness();
                }
            }
            if(population.done()){
                let cars = document.getElementsByClassName('car');
                for(let i = 0; i < cars.length; i++){
                    cars[i].remove();
                    i--;
                }
                population.naturalSelection();
                bestCar = population.best.clone();
                showEvolutionPara.html("Current Gen: "+population.gen);
                showBestPara.html("Best Player Gen: "+population.bestGen);
            }
        }

        if(runBest && bestCar){
            zoomCar = bestCar;
            if(!bestCar.dead){
                calculateCheckpoints(bestCar);
                bestCar.look();
                bestCar.think();
                bestCar.update();
                bestCar.checkStaleness();
            }
        }

        if(startEvolution && replayGen && population.replayGenerations.length > 0){
            genPara.html("Replaying Gen: "+(population.replayGenerationNo+1));
            let replayGeneration = population.replayGenerations[population.replayGenerationNo];
            if(!humanPlaying)
                zoomCar = replayGeneration.species[0].mascot;

            for(let replaySpecies of replayGeneration.species){
                if(!replaySpecies.mascot.dead){
                    calculateCheckpoints(replaySpecies.mascot);
                    replaySpecies.mascot.look();
                    replaySpecies.mascot.think();
                    replaySpecies.mascot.update();
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
        }else{
            genPara.html("Replaying Gen: -");
        }

    }
}


function draw() {
    if(drawingTrack){
        clear();
        background(0);
        displayTracks();
    }

    if(keyIsDown(187) && GLOBALSPEED < 20){
        GLOBALSPEED += 1;
        speedPara.html("Speed: "+GLOBALSPEED);
        speedSlider.value(GLOBALSPEED);
    }

    if(keyIsDown(189) && GLOBALSPEED > 1){
        GLOBALSPEED -= 1;
        speedPara.html("Speed: "+GLOBALSPEED);
        speedSlider.value(GLOBALSPEED);
    }

    if(zoom > 0 && zoomCar){
        translate(-zoom * zoomCar.x+width/2, -zoom * zoomCar.y+height/2);
        scale(zoom);
    }



    raySlider.input(() => {
        humanPlaying = true;
        numRaysPara.html("Inputs: "+raySlider.value());
        localCar.changeNumRays(raySlider.value());
        drawRays = true;
    });

    speedSlider.input(() => {
        GLOBALSPEED = speedSlider.value();
        speedPara.html("Speed: "+speedSlider.value());
    })

    if(startEvolution && !showNothing){
        for(let p of population.population){
            p.display(p.color);
        }
    }else{
        for(let p of population.population){
            p.noShow();
        }
    }

    if(bestCar){
        if(runBest){
            bestCar.display(bestCar.color);
        }else{
            bestCar.noShow();
        }
    }
    
    if(population.replayGenerations.length > 0){
        if(startEvolution && replayGen){
            for(let replaySpecies of population.replayGenerations[population.replayGenerationNo].species){
                // if(zoom > 1 && replaySpecies.mascot.isPointInside(Math.floor((mouseX-width/2+zoomCar.x*zoom)/zoom), Math.floor((mouseY-height/2+zoomCar.y*zoom)/zoom)))
                //     brain = replaySpecies.mascot.brain;
                if(replaySpecies.mascot.isPointInside(mouseX, mouseY))
                    brain = replaySpecies.mascot.brain;
                replaySpecies.mascot.display(replaySpecies.color);
            }
        }else{
            for(let replaySpecies of population.replayGenerations[population.replayGenerationNo].species)
                replaySpecies.mascot.noShow();
        }
    }

    if(humanPlaying && localCar){
         let x = localCar.y < windowHeight/2 ? "down" : "up";
        let y = localCar.x < windowWidth/2 ? "left" : "right";
        humanPlayingPara.attribute('data-balloon-pos', x+"-"+y);
        humanPlayingPara.position(localCar.x, localCar.y);
        localCar.display([230, 109, 100], drawRays);
    }else{
        localCar.noShow();
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
            }
            break;
        case 13:
            population.nextGen()
            break;
        case 80:
            humanPlaying = !humanPlaying;
            break;
    }
}