var canvas = document.getElementById("canvas");
var pos = document.getElementById("pos");
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

function createWalls() {
    boundaries.push(new Boundary(-w / 2, -h / 2, -w / 2, h / 2));
    boundaries.push(new Boundary(-w / 2, -h / 2, w / 2, -h / 2));
    boundaries.push(new Boundary(w / 2, -h / 2, w / 2, h / 2));
    boundaries.push(new Boundary(-w / 2, h / 2, w / 2, h / 2));
}

createWalls();

var activeCars = [];
var allCars = [];

var totalCars = 30;

function createCars() {
    for (var j = 0; j < totalCars; j++) {
        let car = new Car();
        activeCars[j] = car;
        //        allCars[j] = car;
    }
}
createCars();

function drawCars() {
    for (let car of activeCars) {
        car.drawCar();
        car.rayTrace();
    }

}

function setup() {
    context.clearRect(-w / 2, -h / 2, w, h);
    drawBoundaries();
}

setup();
drawCars();
let startDraw = false;
let initX = 0;
let initY = 0;

function initBounds() {
    setup();
    canvas.addEventListener("click", function (e) {
        startDraw = true;
        initX = e.clientX - w / 2;
        initY = e.clientY - h / 2;
        this.removeEventListener('click', arguments.callee, false);
    });
}

function clearBounds() {
    localStorage.removeItem("boundaries");
}

canvas.addEventListener("mouseenter", function () {
    setup();
    drawCars();
})

window.addEventListener("mousemove", function (e) {
    if (startDraw) {
        //        console.log(e.clientX - w / 2, e.clientY - h / 2);
        boundaries.push(new Boundary(initX, initY, e.clientX - w / 2, e.clientY - h / 2));
        initX = e.clientX - w / 2;
        initY = e.clientY - h / 2;
        setup();
        drawCars();
    }
})

window.addEventListener("dblclick", function (e) {
    startDraw = false;
    setup();
    drawCars();
    localStorage.setItem("boundaries", JSON.stringify(boundaries));
})

let keyDown;
let keyUp;

//
//document.addEventListener("keyup", function (e) {
//    e = e || window.event;
//    keyUp = e.keyCode;
//    if (keyUp == '38' || keyUp == '40')
//        keyDown = 'stopFB';
//    if (keyUp == '37' || keyUp == '39')
//        keyDown = 'stopTurn';
//
//});
//let move = "";
//document.addEventListener("keydown", function (e) {
//    e = e || window.event;
//    console.log(e.keyCode)
//    switch (e.keyCode) {
//        case 38:
//            move = "F";
//            break;
//        case 40:
//            move = "B";
//            break;
//        case 37:
//            move = "L";
//            break;
//        case 39:
//            move = "R";
//            break;
//    }
//});
//
//document.addEventListener("keyup", function (e) {
//    e = e || window.event;
//    move = "";
//});


const MOVES = ["L", "R", ""];

let gen = 0;
let genText = document.getElementById("genText");
genText.innerHTML = "";
genText.insertAdjacentHTML('beforeend', gen);
var genSpeed = 1;
document.getElementById("slider").oninput = function () {
    genSpeed = this.value //gets the oninput value
}

var maxScore = 0;

function update() {

    context.clearRect(-w / 2, -h / 2, w, h);
    drawBoundaries();
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
                car.moveCar(MOVES[indexOfMaxValue]);
                car.rayTrace();
            }
            if (car.score > maxScore) {
                maxScore = car.score;
            }
        }
    }
    if (activeCars.length == 0) {
            nextGeneration();
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
