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

function drawLine(x1, y1, x2, y2, opacity, linewidth) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineWidth = linewidth;
    context.strokeStyle = "rgba(255, 255, 255, " + opacity + ")";
    context.stroke();
}

function getDist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

let storedBounds = JSON.parse(localStorage.getItem("boundaries"));
var boundaries = [];
if (storedBounds) {
    for (let b of storedBounds)
        boundaries.push(new Boundary(b.x1, b.y1, b.x2, b.y2));
}

function drawBoundaries() {
    for (let boundary of boundaries)
        boundary.drawBoundary();
}

var activeCars = [];
var allCars = [];
var numRays = 3;
var totalCars = 20;
const MOVES = ["L", "R", "reduceTurn"];


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

function initBounds() {
    setup();
    canvas.addEventListener("click", function (e) {
        startDraw = true;
        initX = canvasFactor * e.clientX - w / 2;
        initY = canvasFactor * e.clientY - h / 2;
        this.removeEventListener('click', arguments.callee, false);
    });
}

function eraseBounds() {
    setup();
    canvas.addEventListener("click", function (e) {
        startErase = true;
        initEraseX = canvasFactor * e.clientX - w / 2;
        initEraseY = canvasFactor * e.clientY - h / 2;
        this.removeEventListener('click', arguments.callee, false);
    });
}

function clearBounds() {
    localStorage.removeItem("boundaries");
    startDraw = false;
    startErase = false;
    boundaries = [];
    setup();
}

//canvas.addEventListener("mouseenter", function () {
//    setup();
//})


canvas.addEventListener("mousemove", function (e) {
    let moveX = canvasFactor * e.clientX - w / 2;
    let moveY = canvasFactor * e.clientY - h / 2;
    if (startDraw) {
        boundaries.push(new Boundary(initX, initY, moveX, moveY));
        initX = moveX;
        initY = moveY;
        setup();
    } else if (startErase) {
        for (let i = 0; i < boundaries.length; i++) {
            let b = boundaries[i];
            if (b.x1 >= moveX - 40 && b.x1 <= moveX + 40 && b.y1 >= moveY - 40 && b.y1 <= moveY + 40)
                boundaries.splice(i, 1);
        }
        console.log(moveX + " " + moveY);
        setup();
    }
})

canvas.addEventListener("dblclick", function (e) {
    if (startDraw) {
        startDraw = false;
        localStorage.setItem("boundaries", JSON.stringify(boundaries));
        setup();
    } else if (startErase) {
        startErase = false;
        localStorage.setItem("boundaries", JSON.stringify(boundaries));
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
        canvas.style.zIndex = 1;
        
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
            if (testCar) {
                testCar.x = carStartX;
                testCar.y = carStartY;
            }
            canvas.style.zIndex = -1;
            setup();
            setCarPosition = false;
        });
    }

}

let keyDown;
let keyUp;


let pressedKeys = [];

let move = "";
document.addEventListener("keydown", function (e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 38:
            move = "F";
            break;
        case 40:
            move = "B";
            break;
        case 37:
            move = "L";
            break;
        case 39:
            move = "R";
            break;
        case 32:
            move = "reduceTurn";
            break;
    }
});

document.addEventListener("keyup", function (e) {
    move = "";

});

//document.addEventListener("keydown", function (e) {
//    e = e || window.event;
//    switch (e.keyCode) {
//        case 38:
//            pressedKeys = pressedKeys.filter(e => e !== "reduceSpeed");
//            pressedKeys.push("F");
//            break;
//        case 40:
//            pressedKeys = pressedKeys.filter(e => e !== "reduceSpeed");
//            pressedKeys.push("B");
//            break;
//        case 37:
//            pressedKeys = pressedKeys.filter(e => e !== "reduceTurn");
//            pressedKeys.push("L");
//            break;
//        case 39:
//            pressedKeys = pressedKeys.filter(e => e !== "reduceTurn");
//            pressedKeys.push("R");
//            break;
//    }
//});
//
//document.addEventListener("keyup", function (e) {
//    e = e || window.event;
//    switch (e.keyCode) {
//        case 38:
//            pressedKeys = pressedKeys.filter(e => e !== "F");
//            pressedKeys.push("reduceSpeed");
//            break;
//        case 40:
//            pressedKeys = pressedKeys.filter(e => e !== "B");
//            pressedKeys.push("reduceSpeed");
//            break;
//        case 37:
//            pressedKeys = pressedKeys.filter(e => e !== "L");
//            pressedKeys.push("reduceTurn");
//            break;
//        case 39:
//            pressedKeys = pressedKeys.filter(e => e !== "R");
//            pressedKeys.push("reduceTurn");
//            break;
//    }
//
//});

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
            if (moveType == "ackerman")
                car.drawTurn()
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


function update() {
    clearCanvas();

    for (let j = 0; j < genSpeed; j++) {
        maxScore = 0;
        for (let i = activeCars.length - 1; i >= 0; i--) {
            car = activeCars[i];
            car.moveCar("F");
            car.moveCar(move);
            let alive = true;
            let inputs = [];
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
                car.think(inputs);
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
            score.innerHTML = "";
            score.insertAdjacentHTML('beforeend', Math.floor(maxScore * 100) / 100);
        }
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

function reset(numCars = totalCars) {
    cancelMainAnim();
    cancelTestAnim();
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

let requestIdTestDrive;
let testDriveOn = false;
let testCar;


function cancelTestAnim() {
    if (requestIdTestDrive) {
        window.cancelAnimationFrame(requestIdTestDrive);
        testCar = null;
        testDriveOn = false;
        requestIdTestDrive = undefined;
        carStartX = carStartCoords[0];
        carStartY = carStartCoords[1];
    }
}

function start() {
    cancelTestAnim();
    if (!startAnim) {
        startAnim = true;
        update();
    }
}

function startTestDrive() {
    cancelMainAnim();
    if (!testDriveOn) {
        testCar = new Car();
        testDriveOn = true;
        testDrive()
    }
}

function testDrive() {
    clearCanvas();
    drawBoundaries();
    //    pressedKeys = uniq = [...new Set(pressedKeys)];
    //    for (let move of pressedKeys)
    //        testCar.moveCar(move);
    testCar.moveCar(move);
    testCar.rayTrace();
    for (let ray of testCar.rays) {
        if (ray.distance < 7*testCar.height / 8) {
            testCar = new Car();
            break;
        }
    }

    score.innerHTML = "";
    score.insertAdjacentHTML('beforeend', Math.floor(testCar.score * 100) / 100);

    testCar.drawTurn();
    testCar.drawCar();
    testCar.drawRays();
    requestIdTestDrive = window.requestAnimationFrame(testDrive);
}
