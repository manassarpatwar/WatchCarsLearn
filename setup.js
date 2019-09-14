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

var totalCars = 10;

let carCreation = false;

function createCars(numCars) {
    carCreation = true;
    activeCars = [];
    allCars = [];
    for (var j = 0; j < numCars; j++) {
        let car = new Car();
        activeCars[j] = car;
    }
}

let carStartCoords = [];
let carStartX;
let carStartY;

let storedCoords = JSON.parse(localStorage.getItem("storedCarStartCoords"));
if (storedCoords) {
    carStartX = storedCoords[0];
    carStartY = storedCoords[1];
}

createCars(totalCars);

function drawCars() {
    for (let car of activeCars) {
        if (car.score == maxScore) {
            car.drawCar("green");
            car.drawRays();
        } else
            car.drawCar();
        car.rayTrace();
    }

}

function clearCanvas() {
    context.clearRect(-w / 2, -h / 2, w, h);
}

function setup() {
    drawBoundaries();
}

setup();
drawCars();
let startDraw = false;
let setCarPosition = false;
let initX = 0;
let initY = 0;

function initBounds() {
    setup();
    if (!setCarPosition) {
        canvas.addEventListener("click", function (e) {
            startDraw = true;
            initX = (e.clientX - w / 2);
            initY = (e.clientY - h / 2);
            this.removeEventListener('click', arguments.callee, false);
        });
    }
}

function clearBounds() {
    localStorage.removeItem("boundaries");
}

canvas.addEventListener("mouseenter", function () {
    setup();
    drawCars();
})

window.addEventListener("mousemove", function (e) {
    if (startDraw && !setCarPosition) {
        boundaries.push(new Boundary(initX, initY, (e.clientX - w / 2), (e.clientY - h / 2)));
        initX = (e.clientX - w / 2);
        initY = (e.clientY - h / 2);
        clearCanvas();
        setup();
        drawCars();
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
            clearCanvas();
            drawBoundaries();
            for (let car of activeCars) {
                car.x = carStartX;
                car.y = carStartY;
                car.drawCar();
            }
            setCarPosition = false;
        });
    }

}

window.addEventListener("dblclick", function (e) {
    startDraw = false;
    setup();
    drawCars();
    localStorage.setItem("boundaries", JSON.stringify(boundaries));
})

let keyDown;
let keyUp;

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
    }
});

document.addEventListener("keyup", function (e) {
    e = e || window.event;
    keyUp = e.keyCode;
    move = ""

});

const MOVES = ["L", "R", ""];

let gen = 0;
let genText = document.getElementById("genText");
genText.innerHTML = "";
genText.insertAdjacentHTML('beforeend', gen);
var genSpeed = 1;
let nextGen = false;
document.getElementById("genslider").oninput = function () {
    genSpeed = this.value //gets the oninput value
}

var maxScore = -1;

function startNextGen() {
    nextGen = true;
}

function update() {
    clearCanvas();
    drawBoundaries();
    console.log(activeCars.length)
    for (let j = 0; j < genSpeed; j++) {
        maxScore = 0;

        for (let i = activeCars.length - 1; i >= 0; i--) {
            car = activeCars[i];
            car.moveCar("F");
            //            car.moveCar(move);
            let alive = true;
            let inputs = [];
            for (let ray of car.rays) {
                inputs.push(ray.distance);
                if (ray.distance < car.height / 2) {
                    alive = false;
                    allCars.push(car);
                    activeCars.splice(i, 1);
                    break;
                }
            }
            if (alive) {
                let predicts = car.brain.query(inputs);
                let indexOfMaxValue = predicts.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
                //                console.log(MOVES[indexOfMaxValue]);
                let carMove = MOVES[indexOfMaxValue];
                car.moveCar(MOVES[indexOfMaxValue]);
                car.rayTrace();

            }
            if (car.score > maxScore) {
                maxScore = car.score;
            }
            score.innerHTML = "";
            score.insertAdjacentHTML('beforeend', maxScore);
        }
    }
    if (activeCars.length == 0 || nextGen == true) {
        nextGeneration();
        nextGen = false;
    }
    drawCars();
    requestAnimationFrame(update);

}

let startAnim = false;

function start() {
    if (!startAnim) {
        startAnim = true;
        update();
    }
}
