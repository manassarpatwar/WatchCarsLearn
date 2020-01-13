class Car {
    
    constructor() {
        this.x = 500;
        this.y = 500;
        this.el = document.getElementsByClassName('car')[0];
        this.xVelocity = 0,
        this.yVelocity =  0,
        this.power = 0,
        this.reverse = 0,
        this.angle = 0,
        this.angularVelocity = 0,
        this.isThrottling = false,
        this.isReversing = false
        this.rays = [];
        this.corners = [];
        this.width = 10;
        this.height = 20;
        this.borders = []
        let offset = -Math.PI/6;
        for (let i = 0; i < 3; i++) {
            this.rays[i] = new Ray(createVector(this.x, this.y), this.angle-Math.PI/2+offset, 50);
            offset += Math.PI /6;
        }
    }

    computeRays(){
        let offset = -Math.PI/6;
        for (let i = 0; i < 3; i++) {
            this.rays[i] = new Ray(createVector(this.x, this.y), this.angle-Math.PI/2+offset, 50);
            offset += Math.PI /6;
        }
    }

    changeNumRays(numRays){

    }
    
    recomputeCorners(){
        let x = this.x + this.width/2 * Math.cos(this.angle) - this.height/2 * Math.sin(this.angle)
        let y = this.y + this.width/2 * Math.sin(this.angle) + this.height/2 * Math.cos(this.angle)
        this.corners[0] = createVector(x,y)

        x = this.x - this.width/2 * Math.cos(this.angle) - this.height/2 * Math.sin(this.angle)
        y = this.y - this.width/2 * Math.sin(this.angle) + this.height/2 * Math.cos(this.angle)
        this.corners[1] = createVector(x,y)

        x = this.x - this.width/2 * Math.cos(this.angle) + this.height/2 * Math.sin(this.angle)
        y = this.y - this.width/2 * Math.sin(this.angle) - this.height/2 * Math.cos(this.angle)
        this.corners[2] = createVector(x,y)

        x = this.x + this.width/2 * Math.cos(this.angle) + this.height/2 * Math.sin(this.angle)
        y = this.y + this.width/2 * Math.sin(this.angle) - this.height/2 * Math.cos(this.angle)
        this.corners[3] = createVector(x,y)

    }

    display(color = [255,0,0]) {
        for (let ray of this.rays) {
            let p2 = ray.getPoint2();
            line(this.x, this.y, p2.x, p2.y);
            // push()
            // noStroke()
            // fill(60, 50, 90);
            // ellipse(p2.x, p2.y ,6 , 6);
            // pop()
        }

        push();
        noStroke();
        translate(this.x, this.y)
        rotate(this.angle);

        fill(color[0], color[1], color[2]);
        rect(-this.width/2, -this.height/2, this.width, this.height, 2);
        pop();

        this.recomputeCorners()
        this.computeRays();
        // fill(255)
        // for(let c of this.corners)
        //     ellipse(c.x, c.y, 5, 5);

        for(let i = 0; i < this.corners.length-1; i++){
            this.borders[i] = new Boundary(this.corners[i], this.corners[i+1])
        }
        this.borders[this.corners.length-1] = new Boundary(this.corners[0], this.corners[this.corners.length-1])
       
    }

}