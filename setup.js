window.mobilecheck = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

var canvas = document.getElementById("canvas");
var program = document.getElementById("program");
var score = document.getElementById("score");
var context = canvas.getContext("2d");
var w = 0;
var h = 0;

if (mobilecheck()) {
    canvas.remove();
    document.getElementById("program").remove();
    document.getElementById("buttons").remove();
    let main = document.getElementsByTagName("main")[0];
    let h1 = document.createElement("h1");
    let node = document.createTextNode("Please view this on a laptop/desktop");
    h1.appendChild(node);
    main.appendChild(h1);
}
console.log(mobilecheck());

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
        canvas.style.zIndex = 1;
        canvas.addEventListener("click", function (e) {
            carStartX = canvasFactor * e.clientX - w / 2;
            carStartY = canvasFactor * e.clientY - h / 2;
            this.removeEventListener('click', arguments.callee, false);
            carStartCoords = [];
            carStartCoords.push(carStartX);
            carStartCoords.push(carStartY);
            localStorage.setItem("storedCarStartCoords", JSON.stringify(carStartCoords));
            for (let car of activeCars) {
                car.x = carStartX;
                car.y = carStartY;
            }
            if (testCar) {
                testCar.x = carStartX;
                testCar.y = carStartY;
            }
            canvas.style.zIndex = -1;
            setup();
        });
        setCarPosition = false;
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


document.getElementById("carNumsInput").oninput = function () {
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
        if (ray.distance < testCar.height / 2) {
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
