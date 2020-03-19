class Car {
    
    constructor(inputs, outputs) {
        this.x = 225;
        this.y = 510;
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
        this.borders = [];
        this.dead = false;
        this.oldScore = 0;
        this.score = 0;
        this.staleness = 0;
        this.checkpoints = new Set();
        this.inputs = [];
        let offset = -Math.PI/6;
        for (let i = 0; i < 3; i++) {
            this.rays[i] = new Ray(createVector(this.x, this.y), this.angle-Math.PI/2+offset, 50);
            offset += Math.PI /6;
        }
        
        if(inputs instanceof Genome){
            this.brain = inputs.clone();
        }else{
            this.genomeInputs = inputs;
            this.genomeOutputs = outputs;
            this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
        }

    }

    reset(){
        this.x = 210;
        this.y = 500;
        this.el = document.getElementsByClassName('car')[0];
        this.xVelocity = 0,
        this.yVelocity =  0,
        this.power = 0,
        this.reverse = 0,
        this.angle = 0,
        this.angularVelocity = 0,
        this.corners = [];
        this.width = 10;
        this.height = 20;
        this.borders = [];
        this.dead = false;
        this.oldScore = 0;
        this.score = 0;
        this.staleness = 0;
        this.checkpoints = new Set();
        this.inputs = [];
    }

    died(){
        this.power = 0;
        this.reverse = 0;
        this.angularVelocity = 0;
        this.isThrottling = false;
        this.isReversing = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.dead = true;
    }

    look(){
        if(this.staleness%10 == 0)
            this.oldScore = this.checkpoints.size;
        let boundaries = innerTrack.concat(outerTrack);
        for(let b of boundaries){
            for(let ray of this.rays){
                let int = ray.isHitting(b)
                let d = Infinity;
                if(int != null)
                    d = dist(ray.tail.x, ray.tail.y, int.x, int.y);
                if(int && d < ray.maxlength)
                    ray.setLength(d);
            }
        }
        this.inputs = this.rays.map(x => x.length/x.maxlength);
    }

    think() {

        if(!this.dead){
            const canTurn = this.power > 0.0025 || this.reverse;

            let outputs = this.brain.feedForward(this.inputs);
            this.isThrottling = outputs[0] >= 0.66;
            this.isReversing = outputs[0] < 0.33;
            
            this.isTurningLeft = canTurn && outputs[1] >= 0.33;
            this.isTurningRight = canTurn && outputs[1] < 0.33;
        }
    }

    clone() {
        var clone = new Car();
        clone.brain = this.brain.clone();
        clone.fitness = this.fitness;
        clone.bestScore = this.score;
        return clone;
    }

    calculateFitness() {
        this.fitness = this.checkpoints.size/checkpoints.length;;
    }

    addCheckpoint(c){
        this.checkpoints.add(c);
        this.score = this.checkpoints.size;
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
        for(let i = 0; i < this.corners.length-1; i++){
            this.borders[i] = new Boundary(this.corners[i].x, this.corners[i].y, this.corners[i+1].x, this.corners[i+1].y)
        }
        this.borders[this.corners.length-1] = new Boundary(this.corners[0].x, this.corners[0].y, this.corners[this.corners.length-1].x, this.corners[this.corners.length-1].y)

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

    
        // fill(255)
        // for(let c of this.corners)
        //     ellipse(c.x, c.y, 5, 5);
       
    }

    update() {

        if (this.isThrottling) {
            this.power += powerFactor * this.isThrottling;
        } else {
            this.power -= powerFactor;
        }
        if (this.isReversing) {
            this.reverse += reverseFactor;
        } else {
            this.reverse -= reverseFactor;
        }
        
        this.power = Math.max(0, Math.min(maxPower, this.power));
        this.reverse = Math.max(0, Math.min(maxReverse, this.reverse));
        
        const direction = this.power > this.reverse ? 1 : -1;
        
        if (this.isTurningLeft) {
            this.angularVelocity -= direction * turnSpeed * this.isTurningLeft;
        }
        if (this.isTurningRight) {
            this.angularVelocity += direction * turnSpeed * this.isTurningRight;
        }
        
        this.xVelocity += Math.sin(this.angle) * (this.power - this.reverse);
        this.yVelocity += Math.cos(this.angle) * (this.power - this.reverse);
        
        this.x += this.xVelocity;
        this.y -= this.yVelocity;
        this.xVelocity *= drag;
        this.yVelocity *= drag;
        this.angle += this.angularVelocity;
        this.angularVelocity *= angularDrag;
        this.computeRays();
        this.recomputeCorners();
    }

    checkStaleness(){
        if(this.oldScore == this.score){
            this.staleness++;
        }else{
            this.staleness = 0;
        }

        if(this.staleness > 1000){
            this.died();
        }
    }

}