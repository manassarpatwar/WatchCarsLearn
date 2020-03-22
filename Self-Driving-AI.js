
var innovationCounter = new InnovationCounter(1);
let paths;
let innerTrack;
let outerTrack;
let tempInnerB;
let tempOuterB;
let tempPath;
let checkpoints;
let humanPlaying = true;
let localCar = null;
let zoomCar = null;
let carSettings;
let populationSize = 100;

const TRACKWIDTH = 20;
const maxPower = 0.08;
const maxReverse = 0.0375;
const powerFactor = 0.001;
const reverseFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

let population;

let startReplay = false;
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
    if(zoom == 3){
        zoom = 0;
    }else if(zoom > 3)
        zoom -= 1;
}

let initPos = null;
let startDrawingBoundary = false;
let clicks = 0;
let drawingTrack = false;

function getBoundaries(x1, y1, x2, y2){
    let alpha = Math.atan2(y2 - y1, x2 - x1);
    
    let innerB = new Boundary(x1-TRACKWIDTH*Math.sin(alpha), y1+TRACKWIDTH*Math.cos(alpha), x2-TRACKWIDTH*Math.sin(alpha), y2+TRACKWIDTH*Math.cos(alpha));
    let outerB = new Boundary(x1+TRACKWIDTH*Math.sin(alpha), y1-TRACKWIDTH*Math.cos(alpha), x2+TRACKWIDTH*Math.sin(alpha), y2-TRACKWIDTH*Math.cos(alpha));
    
    if(innerTrack.length > 0){
        let int = Boundary.getIntersection(innerB, innerTrack[innerTrack.length-1]);
        if(int == null)
            return;
        innerB.setStart(int);
        innerTrack[innerTrack.length-1].setEnd(int);
    }
    
    if(outerTrack.length > 0){
        let int = Boundary.getIntersection(outerB, outerTrack[outerTrack.length-1]);
        if(int == null)
            return;
        outerB.setStart(int);
        outerTrack[outerTrack.length-1].setEnd(int);
    }

    return {inner : innerB, outer : outerB, alpha : alpha};
}

function drawRandomTrack(){
    ellipse(noise(xOff)*windowWidth, noise(yOff)*windowHeight, 10, 10);
}

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
            diffAngle = Math.abs(Math.abs(t.getAngle()) - Math.abs(paths[paths.length-1].getAngle()));
            textAlpha = diffAngle;
        }


        let boundaryData = getBoundaries(initX, initY, newX, newY);
        let alpha = boundaryData['alpha'];

        
        let length = dist(newX, newY, initX, initY);
        
        let innerB = boundaryData['inner']
        let outerB = boundaryData['outer']
        tempInnerB = innerB;
        tempOuterB = outerB;
        tempPath = t;

        if(initPos != null && length > 20 && diffAngle < Math.PI/4){
            paths.push(t);
        
            innerTrack.push(innerB);
            outerTrack.push(outerB);
            
            addFillerCheckpoints(initX, initY, Math.max(tempInnerB.getLength(), tempOuterB.getLength()), alpha)

            initPos = createVector(newX, newY);
        }
    }
}

function addFillerCheckpoints(initX, initY, checkpointLength, alpha){
    let checkpointDist = 5;
    let fillerLength = checkpointDist;

    while(fillerLength < checkpointLength){
        checkpoints.push(new Boundary(initX-TRACKWIDTH*Math.sin(alpha), initY+TRACKWIDTH*Math.cos(alpha), initX+TRACKWIDTH*Math.sin(alpha), initY-TRACKWIDTH*Math.cos(alpha)));
        initX += checkpointDist*Math.cos(alpha);
        initY += checkpointDist*Math.sin(alpha);
        
        fillerLength += checkpointDist;
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
            innerTrack.push(tempInnerB);
            outerTrack.push(tempOuterB);

            let initX = paths[paths.length-1].x2;
            let initY = paths[paths.length-1].y2;
            
            let alpha = Math.atan2(tempPath.y2 - tempPath.y1, tempPath.x2 - tempPath.x1);
            addFillerCheckpoints(initX, initY, Math.max(tempInnerB.getLength(), tempOuterB.getLength()), alpha)

            tempInnerB = null;
            tempOuterB = null;
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
const step = 1 / 120;

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
        
        while (acc > step) {
            if(humanPlaying)
                localCar.updateMoves()

            if(startReplay && population.replayGenerations.length > 0){
                for(let replaySpecies of population.replayGenerations[population.replayGenerationNo].species){
                    replaySpecies.mascot.update();
                }
            }
            acc -= step;
        }
    }

    lastTime = ms;
}

let lastTimePopulation;
let accPopulation = 0;
const stepPopulation = 1 / 1200;

function updatePopulation(){
    const ms = Date.now();
    
    if (lastTimePopulation) {
        accPopulation += (ms - lastTimePopulation) / 1000;
        
        while (accPopulation > stepPopulation) {
            population.update();
            accPopulation -= stepPopulation;
        }
    }

    lastTimePopulation = ms;
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
    startReplay = true;
    humanPlaying = false;
}

function reset(){
    population = new Population(populationSize, raySlider.value(), 2);
    startReplay = false;
}

function displayTracks(){
    for (let t of innerTrack) {
        t.display();
    }
    if(tempInnerB)
        tempInnerB.display();

    for (let t of outerTrack) {
        t.display();
    }

    if(tempOuterB)
        tempOuterB.display();
}
