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

function is_touch_device() {
    return 'ontouchstart' in window;
}
let touch_device = is_touch_device();

let offset = 0;
let moveOffsetX = 0;
let moveOffsetY = 0;
let lastMX, lastMY;

cars = [];

function createCars() {
    for (let i = 0; i < 1; i++)
        cars.push(new Car(i, Infinity, 40, 20, 4));
}
createCars();

function drawCars() {
    for (let car of cars) {
        car.drawCar();
        car.rayTrace();
    }

}

function setup() {
    context.clearRect(-w / 2, -h / 2, w, h);
    drawBoundaries();
    drawCars();
}

setup();

let start = false;
let initX = 0;
let initY = 0;

function initBounds() {
    canvas.addEventListener("click", function (e) {
        start = true;
        initX = e.clientX - w / 2;
        initY = e.clientY - h / 2;
    });
}

function clearBounds() {
    console.log("henlo")
    localStorage.removeItem("boundaries");
}

window.addEventListener("mousemove", function (e) {
    if (start) {
        console.log(e.clientX - w / 2, e.clientY - h / 2);
        boundaries.push(new Boundary(initX, initY, e.clientX - w / 2, e.clientY - h / 2));
        initX = e.clientX - w / 2;
        initY = e.clientY - h / 2;
        context.clearRect(-w / 2, -h / 2, w, h);
        drawBoundaries();
    }
})

window.addEventListener("dblclick", function (e) {
    start = false;
    localStorage.setItem("boundaries", JSON.stringify(boundaries));
    window.removeEventListener("click", function () {});
})

let keyDown;
let keyUp;
document.addEventListener("keydown", function (e) {
    e = e || window.event;
    keyDown = e.keyCode;
    console.log(keyDown)
    if (keyDown == '38' || keyDown == '40')
        keyUp = null;
    if (keyDown == '37' || keyDown == '39')
        keyUp = null;
});

document.addEventListener("keyup", function (e) {
    e = e || window.event;
    keyUp = e.keyCode;
    if (keyUp == '38' || keyUp == '40')
        keyDown = 'stopFB';
    if (keyUp == '37' || keyUp == '39')
        keyDown = 'stopTurn';

});

const MOVES = ["F", "B", "L", "R", ""];

function random() {

    context.clearRect(-w / 2, -h / 2, w, h);
    drawBoundaries();

    for (let car of cars) {
        car.keyboardCar(keyDown, keyUp)
        //        car.moveCar(MOVES[Math.floor(Math.random() * MOVES.length)]);
        car.rayTrace();
        car.drawCar();
    }
    requestAnimationFrame(random);
}

random();
