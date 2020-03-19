
var innovationCounter = new InnovationCounter(1);
let paths;
let innerTrack;
let outerTrack;
let tempInnerB;
let tempOuterB;
let checkpoints;
let localCar = null;
const TRACKWIDTH = 20;

const maxPower = 0.08;
const maxReverse = 0.0375;
const powerFactor = 0.001;
const reverseFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

let population;
let bestCars = [];
let startReplay = false;

function setup() {
    let storedInnerTrack = JSON.parse(localStorage.getItem("innerTrack"));
    let storedOuterTrack = JSON.parse(localStorage.getItem("outerTrack"));
    let storedPaths = JSON.parse(localStorage.getItem("paths"));
    paths = storedPaths == null ? [] : storedPaths.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));
    innerTrack = storedInnerTrack == null ? [] : storedInnerTrack.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));
    outerTrack = storedOuterTrack == null ? [] : storedOuterTrack.map(x => new Boundary(x.x1, x.y1, x.x2, x.y2));
    population = [];
    checkpoints = [];
    if(innerTrack != [] && outerTrack != []){
        for(let i = 0; i < innerTrack.length; i++){
            checkpoints.push(new Boundary(innerTrack[i].x1, innerTrack[i].y1, outerTrack[i].x1, outerTrack[i].y1));
        }
    }
    
    population = new Population(100, 3, 2);

    createCanvas(windowWidth, windowHeight);
    localCar = new Car();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let zoom = 0;
let maxZoom = 7;
function zoomInCanvas(){
    if(zoom < maxZoom)
        zoom += 1;
}

function zoomOutCanvas(){
    if(zoom > 0)
        zoom -= 1;
}

let initPos = null;
let startDrawingBoundary = false;
let clicks = 0;
let drawingTrack = false;

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
        let alpha = Math.atan2(newY - initY, newX - initX);
        
        let innerB = new Boundary(initX-TRACKWIDTH*Math.sin(alpha), initY+TRACKWIDTH*Math.cos(alpha), newX-TRACKWIDTH*Math.sin(alpha), newY+TRACKWIDTH*Math.cos(alpha));
        let outerB = new Boundary(initX+TRACKWIDTH*Math.sin(alpha), initY-TRACKWIDTH*Math.cos(alpha), newX+TRACKWIDTH*Math.sin(alpha), newY-TRACKWIDTH*Math.cos(alpha));
        
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
        tempInnerB = innerB;
        tempOuterB = outerB;

        if(initPos != null && dist(newX, newY, initX, initY) > 30){
            let t = new Boundary(initX, initY, mouseX, mouseY);
            paths.push(t);
        
            innerTrack.push(innerB);
            outerTrack.push(outerB);
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
    initPos = null;
    drawingTrack = true;
    let clicks = 0;
    window.addEventListener("click", function(){
        if(clicks > 0)
            startDrawingBoundary = !startDrawingBoundary;
        if(startDrawingBoundary == false && clicks > 0){
            innerTrack.push(tempInnerB);
            outerTrack.push(tempOuterB);
            this.removeEventListener('click', arguments.callee, false);
            this.removeEventListener('mousemove', drawTracks);
            localStorage.setItem("innerTrack", JSON.stringify(innerTrack));
            localStorage.setItem("outerTrack", JSON.stringify(outerTrack));
            localStorage.setItem("paths", JSON.stringify(paths));
            for(let i = 0; i < innerTrack.length; i++){
                checkpoints[i] = new Boundary(innerTrack[i].x1, innerTrack[i].y1, outerTrack[i].x1, outerTrack[i].y1);
            }
        
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

const cars = [localCar];
const carsById = {};

const keysDown = {};

let needResize;
let resizing;

window.addEventListener('keydown', e => {
    keysDown[e.which] = true;
});

window.addEventListener('keyup', e => {
    keysDown[e.which] = false;
});

let lastTime;
let acc = 0;
const step = 1 / 120;

function update(){
    const canTurn = localCar.power > 0.0025 || localCar.reverse;
    
    localCar.isThrottling = keyActive('up');
    localCar.isReversing = keyActive('down');
    
    localCar.isTurningLeft = canTurn && keyActive('left');
    localCar.isTurningRight = canTurn && keyActive('right');

    const ms = Date.now();
    if (lastTime) {
        acc += (ms - lastTime) / 1000;
        
        while (acc > step) {
            population.update();
            localCar.update();

            if(bestCars.length > 0){
                bestCars[bestCars.length-1].update();
            }
            acc -= step;
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
    startReplay = true;
}

function reset(){
    setup();
    startReplay = false;
}

function draw() {
    update();
    background(0);
    stroke(255);

    fill(255);
    // localCar.display();
    // if(checkOverlap(localCar)){
    //     localCar = new Car();
    // }
    if(startReplay && population.gen < 1000){
        for(let car of population.population){
            calculateCheckpoints(car);

            if(!car.dead){
                if(!checkOverlap(car)){
                    car.look();
                    car.think();
                    car.display();
                    car.checkStaleness();
                }
                else{
                    car.died();
                    // car.display([0,255,0]);
                };
            }else{
                // car.display([0,255,0]);
            }
        }
        if(population.done()){
            population.naturalSelection();
            bestCars.push(population.best.clone());
        }
    }

    if(startReplay && bestCars.length > 0){
        let bestCar = bestCars[bestCars.length-1];

        if(zoom > 0){
            translate(-zoom * bestCar.x+width/2, -zoom * bestCar.y+height/2);
            scale(zoom);
        }

        calculateCheckpoints(bestCar);
        if(!checkOverlap(bestCar)){
            bestCar.look();
            bestCar.think();
            bestCar.display([0,255,0]);
            bestCar.checkStaleness();
        }
        else{
            bestCar.died();
            bestCar.reset();
        };
        drawBest(bestCar);
    }
    
    for (let t of innerTrack) {
        t.display();
    }
    if(tempInnerB)
        tempInnerB.display();

    for (let t of outerTrack) {
        t.display();
    }

    // for(let c of checkpoints){
    //     c.display();
    // }

    if(tempOuterB)
        tempOuterB.display();
    
}

let inputNames = ["RAY 1", "RAY 2", "RAY 3"]
function drawBest(p){
    p.brain.computeDrawCoordinates();
    let xOffset = windowWidth - p.brain.drawDimensions + 20;
    let yOffset = windowHeight - p.brain.drawDimensions;
    push();
    for(let c of p.brain.connections.values()){
        if(c.isEnabled()){
            stroke(0,255,0)
        }else{
            stroke(255, 0, 0);
        }
        line(p.brain.nodes.get(c.inNode).vector.x + xOffset, p.brain.nodes.get(c.inNode).vector.y+yOffset, p.brain.nodes.get(c.outNode).vector.x + xOffset, p.brain.nodes.get(c.outNode).vector.y+yOffset)
    }
    pop();
    push();
    let i = 0;
    for(let n of p.brain.nodes.values()){
        if(n.type == "INPUT"){
            text(inputNames[i], xOffset-10, n.vector.y+ n.radius/2+yOffset);
            i++;
        }
        else if(n.type == "BIAS"){
            text("BIAS", xOffset-10, n.vector.y+ n.radius/2+yOffset);
        }
        fill(255,255,255);
        ellipse(n.vector.x + xOffset, n.vector.y+yOffset, n.radius,  n.radius);
    }
    pop();
}
