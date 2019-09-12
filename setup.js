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

cars = [];
allCars = [];

function createCars() {
    for (var j = 0; j < 500; j++)
        cars.push(new Car());
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
})

window.addEventListener("mousemove", function (e) {
    if (startDraw) {
        //        console.log(e.clientX - w / 2, e.clientY - h / 2);
        boundaries.push(new Boundary(initX, initY, e.clientX - w / 2, e.clientY - h / 2));
        initX = e.clientX - w / 2;
        initY = e.clientY - h / 2;
        context.clearRect(-w / 2, -h / 2, w, h);
        drawBoundaries();
        setup();
    }
})

window.addEventListener("dblclick", function (e) {
    startDraw = false;
    setup();
    localStorage.setItem("boundaries", JSON.stringify(boundaries));
})

let keyDown;
let keyUp;
document.addEventListener("keydown", function (e) {
    e = e || window.event;
    keyDown = e.keyCode;
    //    console.log(keyDown)
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

const MOVES = ["F", "L", "R", "B"];

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
        for (let i = 0; i < cars.length; i++) {
            car = cars[i];
            //                        car.keyboardCar(keyDown, keyUp)
            let alive = true;
            let inputs = [];
            for (let ray of car.rays) {
                inputs.push(ray.distance);
                if (ray.distance < car.height / 2)
                    alive = false;
            }
            if (alive) {
                let predicts = car.brain.predict(inputs);
                let indexOfMaxValue = predicts.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
                //            console.log(MOVES[indexOfMaxValue]);
                car.moveCar(MOVES[Math.floor(Math.random() * MOVES.length)]);
                car.rayTrace();
            } else {
                allCars.push(cars[i]);
                cars.splice(i, 1);
            }
        }
        maxScore = Math.max.apply(Math, cars.map(function (o) {
            return o.score;
        }))
        pos.innerHTML = "";
        pos.insertAdjacentHTML('beforeend', maxScore);
        console.log(cars.length);
        if (cars.length == 0) {
            nextGeneration();
        }
    }
        for (let car of cars) {
            car.drawCar();
        }

    requestAnimationFrame(update);

}


let startAnim = false;

function start() {
    if (!startAnim) {
        startAnim = true;
        update();
    }
}


function nextGeneration() {
    maxScore = 0;
    gen++;
    genText.innerHTML = "";
    genText.insertAdjacentHTML('beforeend', gen);
    //    Normalize the fitness values 0 - 1
    normalizeFitness(allCars);
    //    console.log(allCars[0].copyCar());
    // Generate a new set of birds
    activeCars = generate(allCars);
    // Copy those birds to another array
    cars = activeCars.slice();
    allCars = [];
    setup();
}

// Normalize the fitness of all cars
function normalizeFitness(cars) {
    // Make score exponentially better?
    //    for (let i = 0; i < cars.length; i++) {
    //        cars[i].score = Math.pow(cars[i].score, 2);
    //    }

    // Add up all the scores
    let sum = 0;
    for (let i = 0; i < cars.length; i++) {
        sum += cars[i].score;
    }
    console.log(sum);
    // Divide by the sum
    for (let i = 0; i < cars.length; i++) {
        cars[i].fitness = cars[i].score / sum * 10;
    }
}

function generate(oldCars) {
    let newCars = [];
    for (let i = 0; i < oldCars.length; i++) {
        // Select a car based on fitness
        let car = poolSelection(oldCars);
        newCars[i] = car;
    }
    return newCars;
}

// An algorithm for picking one bird from an array
// based on fitness
function poolSelection(cars) {
    // Start at 0
    let index = 0;

    // Pick a random number between 0 and 1
    let r = Math.random();

    // Keep subtracting probabilities until you get less than zero
    // Higher probabilities will be more likely to be fixed since they will
    // subtract a larger number towards zero
    while (r > 0) {
        r -= cars[index].fitness;
        // And move on to the next
        index += 1;
    }

    // Go back one
    index -= 1;

    // Make sure it's a copy!
    // (this includes mutation)
    return cars[index].copyCar();
}
