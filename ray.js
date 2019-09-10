var canvas = document.getElementById("canvas");

context = canvas.getContext("2d");
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

function Ray(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vector = new Vector(this.x + Math.cos(this.angle), this.y + Math.sin(this.angle));
    this.distance = 0;
}

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Ray.prototype.isHitting = function (boundary) {
    const x1 = boundary.x1;
    const x2 = boundary.x2;
    const y1 = boundary.y1;
    const y2 = boundary.y2;

    const x3 = this.x;
    const x4 = this.vector.x;
    const y3 = this.y;
    const y4 = this.vector.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0)
        return;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    //    console.log(t);
    if (t >= 0 && t <= 1 && u > 0) {
        const x = x1 + t * (x2 - x1);
        const y = y1 + t * (y2 - y1);
        return new Vector(x, y);
    } else {
        return false;
    }

}

function Boundary(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

Boundary.prototype.drawBoundary = function () {
    drawLine(this.x1, this.y1, this.x2, this.y2, 1, 1);
}

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

resizeCanvas();
const boundaries = [];

function drawBoundaries() {
    for (let boundary of boundaries)
        boundary.drawBoundary();
}

function createBoundaries() {
    for (let i = 0; i < 5; i++) {
        boundaries.push(new Boundary(Math.random() * w - w / 2, Math.random() * h - h / 2, Math.random() * w - w / 2, Math.random() * h - h / 2));
    }

}

function createWalls() {
    boundaries.push(new Boundary(-w / 2, -h / 2, -w / 2, h / 2));
    boundaries.push(new Boundary(-w / 2, -h / 2, w / 2, -h / 2));
    boundaries.push(new Boundary(w / 2, -h / 2, w / 2, h / 2));
    boundaries.push(new Boundary(-w / 2, h / 2, w / 2, h / 2));
}

createBoundaries();
createWalls();

function is_touch_device() {
    return 'ontouchstart' in window;
}
let touch_device = is_touch_device();

let offset = 0;
let moveOffsetX = 0;
let moveOffsetY = 0;
let lastMX, lastMY;

function Car(x, y, alpha, vision) {
    this.x = x;
    this.y = y;
    this.alpha = alpha;
    this.rays = [];
    this.vision = vision;
}

Car.prototype.rayTrace = function () {
    this.rays = [];
    let angle = Math.atan2(this.y, this.x);
    for (let i = -20; i < 30; i += 10) {
        this.rays.push(new Ray(this.x, this.y, Math.PI * i / 180 + this.alpha));
    }

    let out = ""
    for (let ray of this.rays) {
        let dist = Infinity;
        let closestBoundary = null;
        let ray_dist;
        for (let boundary of boundaries) {
            let hit = ray.isHitting(boundary);
            if (hit) {
                ray_dist = getDist(ray.x, ray.y, hit.x, hit.y);
                if (ray_dist < dist) {
                    closestBoundary = hit;
                    dist = ray_dist;
                }
            }
        }
        ray.distance = getDist(ray.x, ray.y, closestBoundary.x, closestBoundary.y);
        out += Math.round(ray.distance) + " ";

        if (closestBoundary) {
            if (ray.distance < this.vision)
                drawLine(ray.x, ray.y, closestBoundary.x, closestBoundary.y, 0.3, 3)
            else {
                drawLine(ray.x, ray.y, ray.x + this.vision * Math.cos(ray.angle), ray.y + this.vision * Math.sin(ray.angle), 0.3, 3)
            }
        }

    }
    //    console.log(out);
    this.drawCar();
}

Car.prototype.moveCar = function (key) {
    if (key == '38') {
        // up arrow
        let newX = this.x + 10 * Math.cos(this.alpha);
        let newY = this.y + 10 * Math.sin(this.alpha);
        let close = false;
        let out = ""
        for (let ray of this.rays) {
            if (ray.distance < 50)
                close = true;
            out += Math.round(ray.distance) + " ";
        }
        //        console.log(out);
        if (!close) {
            this.x = newX;
            this.y = newY;
        }
    } else if (key == '40') {
        // down arrow
        let newX = this.x - 10 * Math.cos(this.alpha);
        let newY = this.y - 10 * Math.sin(this.alpha);
        if (newX < w / 2 - 40 && newX > -w / 2 + 40 && newY < h / 2 - 40 && newY > -h / 2 + 40) {
            this.x = newX;
            this.y = newY;
        }
    } else if (key == '37') {
        // left arrow
        this.alpha -= Math.PI / 45;
    } else if (key == '39') {
        // right arrow
        this.alpha += Math.PI / 45;
    }
    this.rayTrace();
}

Car.prototype.drawCar = function () {
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.alpha);
    context.rect(-20, -10, 40, 20);
    //            context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    context.rotate(-this.alpha);
    context.translate(-this.x, -this.y);
}

cars = [];

function createCars() {
    for (let i = 0; i < 1; i++)
        cars.push(new Car(Math.random() * w - w / 2, Math.random() * h - h / 2, 0, 200));
}
createCars();

function drawCars() {
    for (let car of cars) {
        car.drawCar();
        car.rayTrace();
    }

}


context.clearRect(-w / 2, -h / 2, w, h);
drawBoundaries();
drawCars();

document.addEventListener("keydown", function (e) {
    e = e || window.event;
    context.clearRect(-w / 2, -h / 2, w, h);
    drawBoundaries();
    for (let car of cars)
        car.moveCar(e.keyCode);
});



const rand_keys = ["37","38","39"];
function random() {
    var key = rand_keys[Math.floor(Math.random()*rand_keys.length)];
    context.clearRect(-w / 2, -h / 2, w, h);
    drawBoundaries();
    for (let car of cars)
        car.moveCar(key);
    requestAnimationFrame(random);
}

//random();
