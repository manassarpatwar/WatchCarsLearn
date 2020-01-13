let paths;
let innerTrack;
let outerTrack;
let localCar = null;
const TRACKWIDTH = 15;

const maxPower = 0.08;
const maxReverse = 0.0375;
const powerFactor = 0.001;
const reverseFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

function setup() {
    paths = [];
    innerTrack = [];
    outerTrack = [];
    createCanvas(windowWidth, windowHeight);
    localCar = new Car();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let initPos = null;
let startDrawingBoundary = false;
let clicks = 0;
let drawingTrack = false;

function drawTracks(){
    console.log("drawing");
    if (startDrawingBoundary) {
        console.log("drawing");
        let mouseVector =  createVector(mouseX, mouseY);
        if (initPos == null)
        initPos = mouseVector;
        let newX = mouseX;
        let newY = mouseY;
        let initX = initPos.x;
        let initY = initPos.y;
        if(initPos != null && dist(newX, newY, initX, initY) > 50){
            let alpha = Math.atan2(newY - initY, newX - initX);
            
            let t = new Boundary(initPos, mouseVector);
            paths.push(t);
            
            let innerB = new Boundary(createVector(initX-TRACKWIDTH*Math.sin(alpha), initY+TRACKWIDTH*Math.cos(alpha)), createVector(newX-TRACKWIDTH*Math.sin(alpha), newY+TRACKWIDTH*Math.cos(alpha)));
            let outerB = new Boundary(createVector(initX+TRACKWIDTH*Math.sin(alpha), initY-TRACKWIDTH*Math.cos(alpha)), createVector(newX+TRACKWIDTH*Math.sin(alpha), newY-TRACKWIDTH*Math.cos(alpha)));
            
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
            initPos = createVector(newX, newY);
        }
    }
}

function drawTrack(){
    drawingTrack = true;
    let clicks = 0;
    window.addEventListener("click", function(){
        if(clicks > 0)
            startDrawingBoundary = !startDrawingBoundary;
        if(startDrawingBoundary == false && clicks > 0){
            this.removeEventListener('click', arguments.callee, false);
            this.removeEventListener('mousemove', drawTracks);
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

setInterval(() => {
    if(localCar != null){
        const canTurn = localCar.power > 0.0025 || localCar.reverse;
        
        const pressingUp = keyActive('up');
        const pressingDown = keyActive('down');
        
        if (localCar.isThrottling !== pressingUp || localCar.isReversing !== pressingDown) {
            localCar.isThrottling = pressingUp;
            localCar.isReversing = pressingDown;
        }
        
        const turnLeft = canTurn && keyActive('left');
        const turnRight = canTurn && keyActive('right');
        
        if (localCar.isTurningLeft !== turnLeft) {
            localCar.isTurningLeft = turnLeft;
        }
        if (localCar.isTurningRight !== turnRight) {
            localCar.isTurningRight = turnRight;
        }
        
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
        
        const ms = Date.now();
        if (lastTime) {
            acc += (ms - lastTime) / 1000;
            
            while (acc > step) {
                //   update();
                updateCar(localCar);
                acc -= step;
            }
        }
        
        lastTime = ms;
    }
}, 1000 / 60);

function updateCar (car, i) {
    if (car.isThrottling) {
        car.power += powerFactor * car.isThrottling;
    } else {
        car.power -= powerFactor;
    }
    if (car.isReversing) {
        car.reverse += reverseFactor;
    } else {
        car.reverse -= reverseFactor;
    }
    
    car.power = Math.max(0, Math.min(maxPower, car.power));
    car.reverse = Math.max(0, Math.min(maxReverse, car.reverse));
    
    const direction = car.power > car.reverse ? 1 : -1;
    
    if (car.isTurningLeft) {
        car.angularVelocity -= direction * turnSpeed * car.isTurningLeft;
    }
    if (car.isTurningRight) {
        car.angularVelocity += direction * turnSpeed * car.isTurningRight;
    }
    
    car.xVelocity += Math.sin(car.angle) * (car.power - car.reverse);
    car.yVelocity += Math.cos(car.angle) * (car.power - car.reverse);
    
    car.x += car.xVelocity;
    car.y -= car.yVelocity;
    car.xVelocity *= drag;
    car.yVelocity *= drag;
    car.angle += car.angularVelocity;
    car.angularVelocity *= angularDrag;
}


function draw() {
    background(0);
    stroke(255);


    let boundaries = innerTrack.concat(outerTrack);
    for(let b of boundaries){
        for(let ray of localCar.rays){
            let int = ray.isHitting(b)
            let d = dist(ray.tail.x, ray.tail.y, int.x, int.y);
            if(int && d < ray.maxlength)
                ray.setLength(d);
        }
    }

    let overlap = false;
    for(let b of boundaries){
        for(let border of localCar.borders){
            if(Boundary.overlaps(border, b)){
                overlap = true;
                break
            }
        }
        if(overlap)
            break
    }

    if(overlap)
        localCar.display([0,255,0]);
    else
        localCar.display();
    
    // for (let path of paths) {
    //     path.display();
    // }
    
    for (let t of innerTrack) {
        t.display();
    }
    
    for (let t of outerTrack) {
        t.display();
    }
    
}
