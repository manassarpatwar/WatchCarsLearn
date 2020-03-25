var canvas = document.getElementById("canvas");
var program = document.getElementById("program");
var score = document.getElementById("score");
var context = canvas.getContext("2d");
var w = 0;
var h = 0;

let canvasFactor = 2;

function resizeCanvas(width, height) {
    canvas.width = width * canvasFactor;
    canvas.height = height * canvasFactor;
    w = canvas.width;
    h = canvas.height;
    canvas.style.width = w / canvasFactor + "px";
    canvas.style.height = h / canvasFactor + "px";
    context.translate(w / 2, h / 2);
};
resizeCanvas(window.innerWidth, window.innerHeight);

function drawLine(x1, y1, x2, y2, opacity, linewidth, color) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineWidth = linewidth;
    context.strokeStyle = "rgba("+color+", " + opacity + ")";
    context.stroke();
}

function getDist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

let storedBounds = JSON.parse(localStorage.getItem("boundaries"));
let storedPath = JSON.parse(localStorage.getItem("path"));
var boundaries = [];
var path = [];
var innerTrack = [];
var outerTrack = [];

if (storedBounds) {
    for (let b of storedBounds)
        boundaries.push(new Boundary(b.x1, b.y1, b.x2, b.y2));
}

if(storedPath){
    for (let b of storedPath)
        path.push(new Boundary(b.x1, b.y1, b.x2, b.y2));
}

function drawBoundaries() {
    for (let boundary of boundaries)
        boundary.drawBoundary();

    for (let boundary of innerTrack)
        boundary.drawBoundary();
    
    for (let boundary of outerTrack)
        boundary.drawBoundary();

    // for (let i = 0; i < path.length; i+=2)
    //     path[i].drawBoundary("255, 255, 0");
}

var activeCars = [];
var allCars = [];
var numRays = 3;
var totalCars = 20;
const MOVES = ["L", "reduceTurn", "R"];


function setNumRays(nrays) {
    numRays = nrays;
}

function createCars(numCars) {
    for (var j = 0; j < numCars; j++) {
        let car = new Car();
        activeCars[j] = car;
    }
}

let carStartCoords = [];
let carStartX = 0;
let carStartY = 0;

let storedCarCoords = JSON.parse(localStorage.getItem("storedCarStartCoords"));

if (storedCarCoords) {
    carStartX = storedCarCoords[0];
    carStartY = storedCarCoords[1];
}


createCars(totalCars);

function clearCanvas() {
    context.clearRect(-w, -h, 2 * w, 2 * h);
}

function setup() {
    clearCanvas();
    drawBoundaries();
    drawCars();
}

setup();

let startDraw = false;
let setCarPosition = false;
let startErase = false;
let initEraseX = 0;
let initEraseY = 0;
let initX = 0;
let initY = 0;

const TRACKWIDTH = 35;

function initBounds() {
    setup();
    clearBounds();
    canvas.addEventListener("click", function(e){
        startDraw = true;
        newX = canvasFactor * e.clientX - w / 2;
        newY = canvasFactor * e.clientY - h / 2;
        initX = newX;
        initY = newY;
        this.removeEventListener('click', arguments.callee, false);
    });
}

function clearBounds() {
    localStorage.removeItem("boundaries");
    localStorage.removeItem("path");
    startDraw = false;
    startErase = false;
    boundaries = [];
    innerTrack = [];
    outerTrack = [];
    path = [];
    setup();
}

canvas.addEventListener("mousedown", function(){
    canvas.addEventListener("mousemove", function (e) {
        let moveX = canvasFactor * e.clientX - w / 2;
        let moveY = canvasFactor * e.clientY - h / 2;
        if (startDraw) {
            let newX = moveX;
            let newY = moveY;
            if(initX != 0 && initY != 0 && getDist(newX, newY, initX, initY) > 50){
                let alpha = Math.atan2(newY - initY, newX - initX);
                let newPath = new Boundary(initX, initY, newX, newY);
                path.push(newPath);
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
                innerTrack.push(innerB);
                outerTrack.push(outerB);
                initX = newX;
                initY = newY;
            }
            setup();
        }
    })
})

canvas.addEventListener("dblclick", function (e) {
    if (startDraw) {
        startDraw = false;
        let moveX = canvasFactor * e.clientX - w / 2;
        let moveY = canvasFactor * e.clientY - h / 2;
        initX = null;
        initY = null;
        if(innerTrack.length > 0){
            let int = Boundary.getIntersection(innerTrack[0], innerTrack[innerTrack.length-1]);
            if(int != null){
                innerTrack[0].setStart(int);
                innerTrack[innerTrack.length-1].setEnd(int);
            }
        }

        if(outerTrack.length > 0){
            let int = Boundary.getIntersection(outerTrack[0], outerTrack[outerTrack.length-1]);
            if(int != null){
                outerTrack[0].setStart(int);
                outerTrack[outerTrack.length-1].setEnd(int);
            }
        }
        let int = Boundary.getIntersection(path[0], path[path.length-1]);
        if(int != null){
            path[0].setStart(int);
            path[path.length-1].setEnd(int);
        }
        boundaries = boundaries.concat(innerTrack.concat(outerTrack));
        innerTrack = [];
        outerTrack = [];
        localStorage.setItem("boundaries", JSON.stringify(boundaries));
        localStorage.setItem("path", JSON.stringify(path));
        setup();
    } 
})


let zoom = 1;

function zoomInCanvas() {
    if (zoom < 6) {
        zoom++;
        resizeCanvas(window.innerWidth, window.innerHeight);
        context.translate(-zoom * carStartX, -zoom * carStartY);
        context.scale(zoom, zoom);
        setup();
    }
}

function zoomOutCanvas() {
    if (zoom > 1) {
        zoom--;
    }
    if (zoom == 1) {
        resizeCanvas(window.innerWidth, window.innerHeight);
        setup();
    } else if (zoom > 1) {
        resizeCanvas(window.innerWidth, window.innerHeight);
        context.translate(-zoom * carStartX, -zoom * carStartY);
        context.scale(zoom, zoom);
        setup();
    }
}



function setCarPos() {
    if (!startDraw) {
        setCarPosition = true;
        zoom = 1;
        zoomOutCanvas();
        
        canvas.addEventListener("mousemove", function(e){
            if(!setCarPosition)
                this.removeEventListener('mousemove', arguments.callee, false);
            else{
                moveX = canvasFactor * e.clientX - w / 2;
                moveY = canvasFactor * e.clientY - h / 2;
                let car = new Car();
                car.x = moveX;
                car.y = moveY;
                setup();
                car.drawCar("red");
                car.rayTrace();
            }
        });
        
        canvas.addEventListener("click", function (e) {
            carStartX = canvasFactor * e.clientX - w / 2;
            carStartY = canvasFactor * e.clientY - h / 2;
            this.removeEventListener('click', arguments.callee, false);
            console.log(carStartX + " " +  carStartY);
            carStartCoords = [];
            carStartCoords.push(carStartX);
            carStartCoords.push(carStartY);
            localStorage.setItem("storedCarStartCoords", JSON.stringify(carStartCoords));
            for (let car of activeCars) {
                car.x = carStartX;
                car.y = carStartY;
                car.rayTrace();
            }
            setup();
            setCarPosition = false;
        });
    }

}

let gen = 0;
let genText = document.getElementById("genText");
let genSpeedText = document.getElementById("genSpeedText");
let numRaysText = document.getElementById("numRaysText");
let genSpeed = 1;
genText.insertAdjacentHTML('beforeend', gen);
genSpeedText.insertAdjacentHTML('beforeend', genSpeed);
numRaysText.insertAdjacentHTML('beforeend', numRays);
let nextGen = false;


let carNumsInput = document.getElementById("carNumsInput")
carNumsInput.oninput = function () {
    totalCars = this.value //gets the oninput value
    reset(totalCars);
}

document.getElementById("numRaysSlider").oninput = function () {
    numRays = this.value;
    numRaysText.innerHTML = "";
    numRaysText.insertAdjacentHTML('beforeend', numRays);
    reset(totalCars);
}


document.getElementById("genslider").oninput = function () {
    genSpeed = this.value //gets the oninput value
    genSpeedText.innerHTML = "";
    genSpeedText.insertAdjacentHTML('beforeend', genSpeed);
}

var maxScore = -1;

function startNextGen() {
    nextGen = true;
}

var moveType = "tank";

function drawCars() {
    let bestCarDrawn = false;
    for (let car of activeCars) {
        if (car.score == maxScore && !bestCarDrawn) {
            car.drawCar("green");
            // if (moveType == "ackerman")
            //     car.drawTurn()
            car.drawRays();
            bestCarDrawn = true;
        } else
            car.drawCar();
        car.rayTrace();
    }

}

let requestId;

let bestBrain;
let prevBest;

function getPerpendicularDist(boundary, m, n){
    const x1 = boundary.x1;
    const x2 = boundary.x2;
    const y1 = boundary.y1;
    const y2 = boundary.y2;

    let A = y1 - y2;
    let B = x2 - x1;
    let C = x1*(y2-y1)-y1*(x2-x1);

    let d = Math.abs(A*m+B*n+C)/Math.sqrt(A*A+B*B);
    return d;
}

function update() {
    clearCanvas();

    for (let j = 0; j < genSpeed; j++) {
        maxScore = 0;
        for (let i = activeCars.length - 1; i >= 0; i--) {
            car = activeCars[i];
            let alive = true;
            let inputs = [];
            if(moveType == "tank")
                car.moveCar("F");
            car.rayTrace()
            for (let ray of car.rays) {
                inputs.push(1 - ray.distance / car.vision);
                if (ray.distance < car.height/2) {
                    alive = false;
                    allCars.push(car);
                    activeCars.splice(i, 1);
                    break;
                }
            }
            
            if (alive) {
                let move = car.think(inputs);
                car.moveCar(move);
                car.rayTrace();
            }
            if (car.score > maxScore) {
                maxScore = car.score;
                if (zoom > 1) {
                    resizeCanvas(window.innerWidth, window.innerHeight);
                    context.translate(-zoom * car.x, -zoom * car.y);
            
                    context.scale(zoom, zoom);
                }
                bestBrain = car.brain.copy();
            }

        }
        score.innerHTML = "";
        score.insertAdjacentHTML('beforeend', Math.floor(maxScore * 100) / 100);
        
    }
    if (activeCars.length == 0 || nextGen == true) {
        if (bestBrain) {
            visualizeBrain(bestBrain, prevBest);
            prevBest = bestBrain.copy();
        }
        nextGeneration();
        nextGen = false;
    }
    drawBoundaries();
    drawCars();
    requestId = window.requestAnimationFrame(update);

}

let startAnim = false;

function cancelMainAnim() {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
    startAnim = false;
}

function reset(numCars) {
    cancelMainAnim();
    zoom = 1;
    zoomOutCanvas();
    score.innerHTML = "";
    gen = 0;
    genText.innerHTML = "";
    genText.insertAdjacentHTML('beforeend', gen);
    maxScore = 0;
    activeCars = [];
    allCars = [];
    createCars(numCars);
    setup();
}

function changeCars(offset){
    totalCars += offset;
    reset(totalCars);
    console.log(offset)
    carNumsInput.value = totalCars;
    
}

function setTurnType(type) {
    moveType = type.value;
    type.classList.toggle("turntype");
    if (type.value == "ackerman") {
        type.value = "tank";
    } else {
        type.value = "ackerman";
    }
}

function start() {
    if (!startAnim) {
        startAnim = true;
        let bestP = 0;
        let bestD = Infinity;
        for(let i = 0; i < path.length; i++){
            let p = path[i];
            let d = getPerpendicularDist(p, carStartX, carStartY)+getDist((p.x1+p.x2)/2, (p.y1+p.y2)/2, carStartX, carStartY);
            if(d < bestD){
                bestD = d;
                bestP = i;
            }
        }
        path = path.concat(path.splice(0,bestP));
        update();
    }
}