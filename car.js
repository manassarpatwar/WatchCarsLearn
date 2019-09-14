var CAR = new Image;
CAR.src = "car.png";

function randn_bm() {
    var u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}


function mutate(x) {
    if (Math.random() < 0.1) {
        let offset = randn_bm() * 0.5;
        let newx = x + offset;
        return newx;
    } else {
        return x;
    }
}

class Car {
    constructor(brain) {
        this.x = carStartX;
        this.y = carStartY;
        this.alpha = -Math.PI / 2;
        this.rays = [];
        this.direction = 0;
        this.turn = 0;
        this.score = 0;
        this.fitness = 0;
        this.prevAngle = -1;
        this.vision = 100;
        this.width = 40;
        this.height = 20;
        this.speed = 4;
        this.laps = 0;

        if (brain instanceof NeuralNetwork) {
            this.brain = brain.copy();
            //            console.log("mutating");
            this.brain.mutate(mutate);
        } else {
            this.brain = new NeuralNetwork([3, 4, 3, 3]);
        }

        for (let i = -45; i <= 45; i += 45) {
            this.rays.push(new Ray(this.x, this.y, Math.PI * i / 180 + this.alpha));
        }
    }

    copyCar() {
        return new Car(this.brain);
    }

    rayTrace() {
        let i = -45;
        for (let ray of this.rays) {
            ray.x = this.x;
            ray.y = this.y;
            ray.setAngle(Math.PI * i / 180 + this.alpha);
            i += 45;
        }

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
            if (closestBoundary) {
                let tmp = getDist(ray.x, ray.y, closestBoundary.x, closestBoundary.y);
                if (tmp > this.vision) {
                    ray.distance = this.vision;
                } else {
                    ray.distance = getDist(ray.x, ray.y, closestBoundary.x, closestBoundary.y);
                }
            } else {
                ray.distance = this.vision;
            }

        }
    }

    goForward() {
        let newX = this.x + this.speed * Math.cos(this.alpha);
        let newY = this.y + this.speed * Math.sin(this.alpha);
        if (newX < w / 2 - this.width / 2 && newY < h / 2 - this.height / 2 && newX > -w / 2 + this.width / 2 && newY > -h / 2 + this.height / 2) {
            this.x = newX;
            this.y = newY;
        }
    }

    goBackward() {
        let newX = this.x - this.speed * Math.cos(this.alpha);
        let newY = this.y - this.speed * Math.sin(this.alpha);
        if (newX < w / 2 - this.width / 2 && newY < h / 2 - this.height / 2 && newX > -w / 2 + this.width / 2 && newY > -h / 2 + this.height / 2) {
            this.x = newX;
            this.y = newY;
        }
    }

    calculateScore() {
        let tmp = Math.atan2(this.y, this.x) - Math.PI;
        let crossed = false;
        let angle = tmp;
        if (this.prevAngle - angle >= Math.PI) {
            angle = angle + 2 * Math.PI;
        }
        if (angle >= Math.PI * 2 - 0.01) {
            this.laps++;
        }
        this.score = angle + Math.PI * 2 * this.laps;
        this.prevAngle = angle - 1 / 720;
    }


    moveCar(move) {
        switch (move) {
            case "F":
                this.goForward();
                break;
            case "B":
                this.goBackward();
                break;
            case "R":
                this.alpha += Math.PI / 45;
                break;
            case "L":
                this.alpha -= Math.PI / 45;
                break;
            case "":
                break;

        }
        this.calculateScore();
    }

    drawCar(style = "rgba(255, 0, 0, 0.4") {
        context.beginPath();
        context.translate(this.x, this.y);
        context.rotate(this.alpha);
        context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        //        context.drawImage(CAR, -this.width / 2, -this.height / 2, this.width, this.height);
        context.fillStyle = style;
        context.fill();
        context.rotate(-this.alpha);
        context.translate(-this.x, -this.y);
    }

    drawRays() {
        for (let ray of this.rays) {
            drawLine(ray.x, ray.y, ray.x + ray.distance * Math.cos(ray.angle), ray.y + ray.distance * Math.sin(ray.angle), 0.3, 3)
            context.beginPath();
            context.arc(ray.x + ray.distance * Math.cos(ray.angle), ray.y + ray.distance * Math.sin(ray.angle), 4, 0, Math.PI * 2);
            context.fillStyle = "lightblue";
            context.fill();
        }
    }
}
