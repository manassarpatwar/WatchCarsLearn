
var innovationCounter = new InnovationCounter(1);
let paths;
let innerTrack;
let outerTrack;

let tempPath;
let checkpoints;
let humanPlaying = true;

let localCar = null;
let zoomCar = null;
let carSettings;
let populationSize = 50;

const TRACKWIDTH = 10;
const maxPower = 0.08/2;
const maxReverse = 0.0375/2;
const powerFactor = 0.001/2;
const reverseFactor = 0.0005/2;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

let population;

let GLOBALSPEED = 120;

let startEvolution = false;
let raySlider;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let zoom = 0;
let maxZoom = 7;
function zoomInCanvas(){
    if(zoom == 0){
        zoom = 3;
    }else if(zoom < maxZoom)
        zoom += 1;
}

function zoomOutCanvas(){
    if(zoom == 2){
        zoom = 0;
    }else if(zoom > 2)
        zoom -= 1;
}

let initPos = null;
let initLeft = null;
let initRight = null;
let startDrawingBoundary = false;
let clicks = 0;
let drawingTrack = false;


let textAlpha = 0;
function drawTracks(){
    zoom = 0;
    if (startDrawingBoundary) {
        let mouseVector =  createVector(mouseX, mouseY);
        if (initPos == null)
            initPos = mouseVector;

        let newX = mouseX;
        let newY = mouseY;
        let initX = initPos.x;
        let initY = initPos.y;

        let t = new Boundary(initX, initY, newX, newY);
        let diffAngle = 0;
        if(paths.length > 0){
            diffAngle = Math.abs(t.getAngle() - paths[paths.length-1].getAngle());
            diffAngle = diffAngle > Math.PI ? Math.PI*2-diffAngle : diffAngle;
            textAlpha = diffAngle;
        }

        tempPath = t;
        let length = dist(newX, newY, initX, initY);

        if(initPos != null && length > 10 && diffAngle < Math.PI/4){
            paths.push(t);
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
            

            initPos = createVector(newX, newY);
        }
    }
}

function drawTrack(){
    innerTrack = [];
    outerTrack = [];
    paths = []
    checkpoints = [];
    localStorage.removeItem("innerTrack");
    localStorage.removeItem("outerTrack");
    localStorage.removeItem("paths");
    localStorage.removeItem("checkpoints");
    initPos = null;
    drawingTrack = true;
    let clicks = 0;
    window.addEventListener("click", function(){
        if(clicks > 0)
            startDrawingBoundary = !startDrawingBoundary;
        if(startDrawingBoundary == false && clicks > 0){
            paths.push(tempPath);
            tempPath = null;
            this.removeEventListener('click', arguments.callee, false);
            this.removeEventListener('mousemove', drawTracks);
            localStorage.setItem("innerTrack", JSON.stringify(innerTrack));
            localStorage.setItem("outerTrack", JSON.stringify(outerTrack));
            localStorage.setItem("paths", JSON.stringify(paths));
            for(let i = 0; i < innerTrack.length; i++){
                checkpoints.push(new Boundary(innerTrack[i].x1, innerTrack[i].y1, outerTrack[i].x1, outerTrack[i].y1));
            }

            localStorage.setItem("checkpoints", JSON.stringify(checkpoints));
        
        }
        clicks++;
    })
    window.addEventListener("mousemove", drawTracks);
}

const arrowKeys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39
};
const wasdKeys = {
    up: 87,
    down: 83,
    left: 65,
    right: 68
};

const keyActive = (key) => {
    return keysDown[arrowKeys[key]] || keysDown[wasdKeys[key]] || false;
};

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;


const keysDown = {};

let needResize;
let resizing;

window.addEventListener('keydown', e => {
    if(e.which == 80){
        humanPlaying = !humanPlaying;
    }
    keysDown[e.which] = true;
});

window.addEventListener('keyup', e => {
    keysDown[e.which] = false;
});

let lastTime;
let acc = 0;

function update(){
    if(humanPlaying){
        const canTurn = localCar.power > 0.0025 || localCar.reverse;
        
        localCar.isThrottling = keyActive('up');
        localCar.isReversing = keyActive('down');
        
        localCar.isTurningLeft = canTurn && keyActive('left');
        localCar.isTurningRight = canTurn && keyActive('right');

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
    }
    
    const ms = Date.now();
    
    if (lastTime) {
        acc += (ms - lastTime) / 1000;
        
        while (acc > 1/GLOBALSPEED) {
            if(humanPlaying){
                if(startEvolution)
                    localCar.checkHasCrashed();
                localCar.updateMoves()
            }

            if(startEvolution){
                for(let p of population.population){
                    p.checkHasCrashed();
                    p.update();
                }
            }
            
            if(runBest && bestCar){
                bestCar.checkHasCrashed();
                bestCar.update();
            }

            if(startEvolution && replayGen && population.replayGenerations.length > 0){
                for(let replaySpecies of population.replayGenerations[population.replayGenerationNo].species){
                    replaySpecies.mascot.checkHasCrashed();
                    replaySpecies.mascot.update();
                }
            }
            acc -= 1/GLOBALSPEED;
        }
    }

    lastTime = ms;
}

function checkOverlap(car){
    let boundaries = innerTrack.concat(outerTrack);
    let overlap = false;
    for(let b of boundaries){
        for(let border of car.borders){
            if(Boundary.overlaps(border, b)){
                overlap = true;
                break
            }
        }
        if(overlap)
            break
    }

    return overlap;
}

function calculateCheckpoints(car){
    let overlap = false;
    for(let i = 0; i < checkpoints.length; i++){
        for(let border of car.borders){
            if(Boundary.overlaps(border, checkpoints[i])){
                overlap = true;
                break
            }
        }
        if(overlap){
            car.addCheckpoint(i);
            break;
        }
    }
}

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
}

function displayTracks(){
    for (let t of innerTrack) {
        t.display();
    }

    for (let t of outerTrack) {
        t.display();
    }
}
