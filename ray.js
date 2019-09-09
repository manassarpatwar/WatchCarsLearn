var canvas = document.getElementById("canvas");

context = canvas.getContext("2d");
var w = 0;
var h = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    w = canvas.width;
    h = canvas.height;
    canvas.style.width = w / 2 + "px";
    canvas.style.height = h / 2 + "px";
    context.translate(w / 2, h / 2);
};


function Ray(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vector = new Vector(this.x + Math.cos(this.angle), this.y + Math.sin(this.angle));
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
    drawLine(this.x1, this.y1, this.x2, this.y2, 1);
}

function drawLine(x1, y1, x2, y2, opacity) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineWidth = 5;
    context.strokeStyle = "rgba(255, 255, 255, " + opacity + ")";
    context.stroke();
    context.moveTo(0, 0);
}

function getDist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

resizeCanvas();
const boundaries = [];
for (let i = 0; i < 5; i++) {
    boundaries.push(new Boundary(Math.random() * w - w / 2, Math.random() * h - h / 2, Math.random() * w - w / 2, Math.random() * h - h / 2));
}
boundaries.push(new Boundary(-w / 2, -h / 2, -w / 2, h / 2));
boundaries.push(new Boundary(-w / 2, -h / 2, w / 2, -h / 2));
boundaries.push(new Boundary(w / 2, -h / 2, w / 2, h / 2));
boundaries.push(new Boundary(-w / 2, h / 2, w / 2, h / 2));

function is_touch_device() {
    return 'ontouchstart' in window;
}
let touch_device = is_touch_device();

rayTrace()
function rayTrace(e) {
    context.clearRect(-w / 2, -h / 2, w, h);
    let rays = [];

    let event_x;
    let event_y;
    
    if(e){
        event_x = (e.clientX - w / 4) * 2;
        event_y = (e.clientY - h / 4) * 2;
    }else{
        event_x = Math.random() * w - w / 2;
        event_y= Math.random() * h - h / 2;
    }

    let angle = Math.atan2(event_y, event_x);
    for (let i = 0; i < 360; i += 1) {
        rays.push(new Ray(event_x, event_y, angle + Math.PI * i / 180));
    }

    context.beginPath();
    context.arc(event_x, event_y, 40, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();

    for (let ray of rays) {
        let dist = Infinity;
        let closestBoundary = null;
        for (let boundary of boundaries) {
            boundary.drawBoundary();
            let hit = ray.isHitting(boundary);
            if (hit) {
                let ray_dist = getDist(ray.x, ray.y, hit.x, hit.y);
                if (ray_dist < dist) {
                    closestBoundary = hit;
                    dist = ray_dist;
                }
            }
        }
        if (closestBoundary) {
            drawLine(ray.x, ray.y, closestBoundary.x, closestBoundary.y, 0.3)
        }

    }
}

ontouchstart = function (e) {
    rayTrace(e);
}

ontouchmove = function (e) {
    rayTrace(e);
}

onmousemove = function (e) {
    rayTrace(e);
}
