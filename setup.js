var canvas = document.getElementById("canvas");
var score = document.getElementById("score");
var context = canvas.getContext("2d");
var w = 0;
var h = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    w = canvas.width;
    h = canvas.height;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    context.translate(w / 2, h / 2);
};
resizeCanvas();

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


function setNumRays(nrays){
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

let storedCoords = JSON.parse(localStorage.getItem("storedCarStartCoords"));
if (storedCoords) {
    carStartX = storedCoords[0];
    carStartY = storedCoords[1];
}

createCars(totalCars);

function clearCanvas() {
    context.clearRect(-w / 2, -h / 2, w, h);
}

function setup() {
    clearCanvas();
    drawBoundaries();
    drawCars();
}

setup();

let startDraw = false;
let setCarPosition = false;
let initX = 0;
let initY = 0;

function initBounds() {
    setup();
    canvas.addEventListener("click", function (e) {
        startDraw = true;
        initX = (e.clientX - w / 2);
        initY = (e.clientY - h / 2);
        this.removeEventListener('click', arguments.callee, false);
    });
}

function clearBounds() {
    localStorage.removeItem("boundaries");
    boundaries = [];
    setup();
}

canvas.addEventListener("mouseenter", function () {
    setup();
})

window.addEventListener("mousemove", function (e) {
    if (startDraw) {
        boundaries.push(new Boundary(initX, initY, (e.clientX - w / 2), (e.clientY - h / 2)));
        initX = (e.clientX - w / 2);
        initY = (e.clientY - h / 2);
        setup();
    }
})


function setCarPos() {
    if (!startDraw) {
        setCarPosition = true;
        canvas.addEventListener("click", function (e) {
            carStartX = (e.clientX - w / 2);
            carStartY = (e.clientY - h / 2);
            this.removeEventListener('click', arguments.callee, false);
            carStartCoords.push(carStartX);
            carStartCoords.push(carStartY);
            localStorage.setItem("storedCarStartCoords", JSON.stringify(carStartCoords));
            for (let car of activeCars) {
                car.x = carStartX;
                car.y = carStartY;
            }
            setup();
        });
        setCarPosition = false;
    }

}

window.addEventListener("dblclick", function (e) {
    startDraw = false;
    setup();
    localStorage.setItem("boundaries", JSON.stringify(boundaries));
})

let keyDown;
let keyUp;


let pressedKeys = [];
document.addEventListener("keydown", function (e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 38:
            pressedKeys.push("F");
            break;
        case 40:
            pressedKeys.push("B");
            break;
        case 37:
            pressedKeys.push("L");
            break;
        case 39:
            pressedKeys.push("R");
            break;
        case 32:
            pressedKeys.push("reduceSpeed");
            break;
    }
});

document.addEventListener("keyup", function (e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 38:
            pressedKeys = pressedKeys.filter(e => e !== "F");
            break;
        case 40:
            pressedKeys = pressedKeys.filter(e => e !== "B");
            break;
        case 37:
            pressedKeys = pressedKeys.filter(e => e !== "L");
            break;
        case 39:
            pressedKeys = pressedKeys.filter(e => e !== "R");
            break;
        case 32:
            pressedKeys = pressedKeys.filter(e => e !== "reduceSpeed");
            break;
    }

});

const MOVES = ["L", "R", ""];

let gen = 0;
let genText = document.getElementById("genText");
let genSpeedText = document.getElementById("genSpeedText");
let carNumsText = document.getElementById("carNumsText");
let numRaysText = document.getElementById("numRaysText");
let genSpeed = 1;
genText.insertAdjacentHTML('beforeend', gen);
genSpeedText.insertAdjacentHTML('beforeend', genSpeed);
carNumsText.insertAdjacentHTML('beforeend', totalCars);
numRaysText.insertAdjacentHTML('beforeend', numRays);
let nextGen = false;


document.getElementById("carNumsSlider").oninput = function () {
    totalCars = this.value //gets the oninput value
    carNumsText.innerHTML = "";
    carNumsText.insertAdjacentHTML('beforeend', totalCars);
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
    for (let car of activeCars) {
        if (car.score == maxScore) {
            car.drawCar("green");
            if (moveType == "ackerman")
                car.drawTurn()
            car.drawRays();
        } else
            car.drawCar();
        car.rayTrace();
    }

}

let requestId;

function update() {
    clearCanvas();
    drawBoundaries();
    for (let j = 0; j < genSpeed; j++) {
        maxScore = 0;

        for (let i = activeCars.length - 1; i >= 0; i--) {
            car = activeCars[i];
            car.moveCar("F");
            pressedKeys = uniq = [...new Set(pressedKeys)];
            for (let move of pressedKeys)
                car.moveCar(move);
            let alive = true;
            let inputs = [];
            for (let ray of car.rays) {
                inputs.push(1 - ray.distance / car.vision);
                if (ray.distance < car.height / 2) {
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
            }
            score.innerHTML = "";
            score.insertAdjacentHTML('beforeend', Math.floor(maxScore * 100) / 100);
        }
    }
    if (activeCars.length == 0 || nextGen == true) {
        nextGeneration();
        nextGen = false;
    }
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

function setTurnType(type) {
    moveType = type.value;
    if (type.value == "ackerman") {
        type.innerHTML = "Turn type: Tank";
        type.value = "tank";

    } else {
        type.innerHTML = "Turn type: Ackerman";
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
    pressedKeys = uniq = [...new Set(pressedKeys)];
    for (let move of pressedKeys)
        testCar.moveCar(move);

    testCar.rayTrace();
    for (let ray of testCar.rays) {
        if (ray.distance < testCar.height / 2) {
            testCar = null;
            break;
        }
    }

    score.innerHTML = "";
    score.insertAdjacentHTML('beforeend', Math.floor(maxScore * 100) / 100);

    testCar.drawTurn();
    testCar.drawCar();
    testCar.drawRays();
    requestIdTestDrive = window.requestAnimationFrame(testDrive);
}
