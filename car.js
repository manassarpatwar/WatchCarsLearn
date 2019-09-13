var CAR = new Image;
CAR.src = "car.png";

class Car {
    constructor(brain) {
        this.x = -w / 3;
        this.y = 0;
        this.alpha = -Math.PI / 2;
        this.rays = [];
        this.direction = 0;
        this.turn = 0;
        this.score = 0;
        this.fitness = 0;
        this.prevAngle = -1;
        this.vision = Infinity;
        this.width = 40;
        this.height = 20;
        this.speed = 4;

        if (brain instanceof NeuralNetwork) {
            this.brain = brain.copy();
            console.log("mutating");
            this.brain.mutate(x => x * 0.1);
        } else {
            this.brain = new NeuralNetwork([8, 4, 4]);
        }

        for (let i = -180; i < 180; i += 45) {
            this.rays.push(new Ray(this.x, this.y, Math.PI * i / 180 + this.alpha));
        }
    }

    copyCar() {
        return new Car(this.brain);
    }

    rayTrace() {
        let i = -180;
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
            let tmp = getDist(ray.x, ray.y, closestBoundary.x, closestBoundary.y);
            if (tmp > this.vision)
                ray.distance = Infinity;
            else
                ray.distance = getDist(ray.x, ray.y, closestBoundary.x, closestBoundary.y);

            //            if (closestBoundary) {
            //                drawLine(ray.x, ray.y, closestBoundary.x, closestBoundary.y, 0.3, 3)
            //                context.beginPath();
            //                context.arc(closestBoundary.x, closestBoundary.y, 4, 0, Math.PI * 2);
            //                context.fillStyle = "white";
            //                context.fill();
            //            }

        }
    }

    goForward() {
        let newX = this.x + this.speed * Math.cos(this.alpha);
        let newY = this.y + this.speed * Math.sin(this.alpha);
        if (newX < w / 2-this.width/2 && newY < h / 2-this.height/2 && newX > -w / 2+this.width/2 && newY > -h / 2+this.height/2) {
            this.x = newX;
            this.y = newY;
        }
    }

    goBackward() {
        let newX = this.x - this.speed * Math.cos(this.alpha);
        let newY = this.y - this.speed * Math.sin(this.alpha);
        if (newX < w / 2-this.width/2 && newY < h / 2-this.height/2 && newX > -w / 2+this.width/2 && newY > -h / 2+this.height/2) {
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
            crossed = true;
        }
        this.score = angle;
        this.prevAngle = angle;
    }


    moveCar(move) {
        switch (move) {
            case "F":
                this.direction = 1;
                break;
            case "B":
                this.direction = -1;
                break;
            case "R":
                this.turn = 1;
                break;
            case "L":
                this.turn = -1;
                break;
            default:
                this.direction = 0;
                this.turn = 0;
        }
        if (this.direction == 1) {
            this.goForward();
        } else if (this.direction == -1) {
            this.goBackward();
        }

        if (this.turn == 1) {
            this.alpha += this.direction * Math.PI / 90;
            if (this.alpha > Math.PI * 2) {
                this.alpha = 0;
            }
        } else if (this.turn == -1) {
            this.alpha -= this.direction * Math.PI / 90;
            if (this.alpha < -Math.PI * 2) {
                this.alpha = 0;
            }
        }
        //        this.calculateScore();
    }

    drawCar() {
        context.beginPath();
        context.translate(this.x, this.y);
        context.rotate(this.alpha);
        context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        //        context.drawImage(CAR, -this.width / 2, -this.height / 2, this.width, this.height);
        context.fillStyle = "green";
        context.fill();
        context.rotate(-this.alpha);
        context.translate(-this.x, -this.y);
        this.calculateScore();
    }
    //
    //    drawFrontWheels() {
    //        context.beginPath();
    //        context.translate(this.x + this.width / 4, this.y - this.height / 2);
    //        context.rotate(this.alpha);
    //        //        context.arc(0,0,5,0,Math.PI*2);
    //        context.rect(-20 + 10, -10 + 5, 20, 10);
    //        //        context.drawImage(CAR, -this.width / 2, -this.height / 2, this.width, this.height);
    //        context.fillStyle = "blue";
    //        context.fill();
    //        context.rotate(-this.alpha);
    //        context.translate(-(this.x + this.width / 4), -(this.y - this.height / 2));
    //
    //        context.beginPath();
    //        context.translate(this.x + this.width / 4, this.y + this.height / 2);
    //        context.rotate(this.alpha);
    //        //        context.arc(0,0,5,0,Math.PI*2);
    //        context.rect(-20 + 10, -10 + 5, 20, 10);
    //        //        context.drawImage(CAR, -this.width / 2, -this.height / 2, this.width, this.height);
    //        context.fillStyle = "blue";
    //        context.fill();
    //        context.rotate(-this.alpha);
    //        context.translate(-(this.x + this.width / 4), -(this.y + this.height / 2));
    //
    //    }

    drawBackWheels() {

    }


    keyboardCar(keyDown, keyUp) {

        if (keyDown == '38') {
            // up arrow
            this.direction = 1;
        }

        if (keyUp == '38') {
            this.direction = 0;
        }


        if (keyDown == '40') {
            // down arrow
            this.direction = -1;
        }

        if (keyUp == '40') {
            this.direction = 0;
        }

        if (keyDown == '37') {
            // left arrow
            this.turn = -1;
        }

        if (keyUp == '37') {
            this.turn = 0;
        }

        if (keyDown == '39') {
            // right arrow
            this.turn = 1;
        }

        if (keyUp == '39') {
            this.turn = 0;
        }

        if (keyDown == 'stopFB') {
            this.direction = 0;
        }

        if (this.direction == 1) {
            this.goForward();
        } else if (this.direction == -1) {
            this.goBackward();
        }

        if (this.turn == 1) {
            this.alpha += this.direction * Math.PI / 90+Math.PI/45;
            if (this.alpha > Math.PI * 2) {
                this.alpha = 0;
            }
        } else if (this.turn == -1) {
            this.alpha -= this.direction * Math.PI / 90+Math.PI/45;
            if (this.alpha < -Math.PI * 2) {
                this.alpha = 0;
            }
        }

        for (let ray of this.rays) {
            if (ray.distance < this.height / 2)
                this.alive = false;
        }
        //        this.calculateScore();
    }

}
