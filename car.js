const maxPower = 0.08;
const maxReverse = 0.0375;
const powerFactor = 0.001;
const reverseFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

let carStartCoords;
let carStartX = 0;
let carStartY = 0;

class Car {
    constructor() {
        this.x = carStartX;
        this.y = carStartY;

        this.xVelocity = 0,
        this.yVelocity =  0,
        this.power = 0,
        this.reverse = 0,
        this.angle = 0,
        this.angularVelocity = 0,
        this.isThrottling = true,
        this.isReversing = false
        this.rays = [];
        this.corners = [];
        this.width = 10;
        this.height = 20;
        this.borders = []
        let offset = -Math.PI/6;
        this.checkpoints = new Set();
        this.scoreHistory = [];
        this.lapCompleted = false;
        this.score = 0;
        
        this.fitness = 0;
        this.vision = []; //the input array fed into the neuralNet
        this.decision = []; //the out put of the NN
        this.unadjustedFitness;
        this.lifespan = 0; //how long the player lived for this.fitness
        this.bestScore = 0; //stores the this.score achieved used for replay
        this.dead = false;
        this.gen = 0;
        
        this.genomeInputs = 3;
        this.genomeOutputs = 4;
        this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
        
        for (let i = 0; i < 3; i++) {
            this.rays[i] = new Ray(createVector(this.x, this.y), this.angle-Math.PI/2+offset, 50);
            offset += Math.PI /6;
        }
    }
    
    addCheckpoint(i){
        this.checkpoints.add(i);
        if(this.lapCompleted)
            this.score = innerTrack.length
        else
            this.score = this.checkpoints.size;

        this.scoreHistory.push(this.score);
        if(this.scoreHistory.length > 500)
            this.scoreHistory.shift()
    }
    
    completedLap(){
        this.lapCompleted = true;
    }
    
    look(){
        this.computeRays();
        this.recomputeCorners();
        let boundaries = innerTrack.concat(outerTrack);
        
        for(let b of boundaries){
            for(let border of this.borders){
                if(Boundary.overlaps(border, b)){
                    this.dead = true;
                    break
                }
            }
            if(this.dead)
            break
        }
        
        for(let b of boundaries){
            for(let ray of this.rays){
                let int = ray.isHitting(b)
                let d = ray.maxlength;
                if(int != null)
                    d = dist(ray.tail.x, ray.tail.y, int.x, int.y);
                if(int && d < ray.maxlength)
                    ray.setLength(d);
            }
        }
        
        this.vision = this.rays.map(r => 1-r.length/r.maxlength);
        // console.log(this.vision);

        for(let i = 0; i < innerTrack.length; i++){
            let checkpoint = new Boundary(innerTrack[i].getPoint1(), outerTrack[i].getPoint1());
            // line(checkpoint.x1, checkpoint.y1, checkpoint.x2, checkpoint.y2);
            for(let border of this.borders){
                if(Boundary.overlaps(border, checkpoint)){
                    this.addCheckpoint(i);
                    if(this.checkpoints.size == innerTrack.length)
                        this.completedLap();
                    break
                }
            }
        }
    }

    getOuts(inps){
        return this.brain.feedForward(inps)
    }
    
    //gets the output of the this.brain then converts them to actions
    think() {
        
        // var max = 0;
        // var maxIndex = 0;
        //get the output of the neural network
        this.decision = this.brain.feedForward(this.vision);
        
        // for (var i = 0; i < this.decision.length; i++) {
        //     if (this.decision[i] > max) {
        //         max = this.decision[i];
        //         maxIndex = i;
        //     }
        // }
        
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns a clone of this player with the same brian
    clone() {
        var clone = new Car();
        clone.brain = this.brain.clone();
        clone.fitness = this.fitness;
        clone.brain.generateNetwork();
        clone.gen = this.gen;
        clone.bestScore = this.score;
        return clone;
    }
    
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
    //this fuction does that
    
    cloneForReplay() {
        var clone = new Car();
        clone.brain = this.brain.clone();
        clone.fitness = this.fitness;
        clone.brain.generateNetwork();
        clone.gen = this.gen;
        clone.bestScore = this.score;
        
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
        return clone;
    }
    
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //fot Genetic algorithm
    calculateFitness() {
        this.fitness = this.score/innerTrack.length;
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    }
    
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    crossover(parent2) {
        var child = new Car();
        child.brain = this.brain.crossover(parent2.brain);
        child.brain.generateNetwork();
        return child;
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
            this.borders[i] = new Boundary(this.corners[i], this.corners[i+1])
        }
        this.borders[this.corners.length-1] = new Boundary(this.corners[0], this.corners[this.corners.length-1])
    }
    
    update(){
        if(this.decision.length > 0){
            let move = this.decision.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            if(move == 0)
                this.isThrottling = true;
            else if(move == 1)
                this.isReversing = true;
            else if(move == 2)
                this.isTurningLeft = true;
            else if(move == 3)
                this.isTurningRight = true;
            // if(throttle > 0.75)
            //     this.isThrottling = true;
            // else if(throttle < 0.25)
            //     this.isReversing = true;

            // if(turn > 0.75)
            //     this.isTurningRight = true;
            // else if(turn < 0.25)
            //     this.isTurningLeft = true;
        }

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
    }

    drawRays(){
        for (let ray of this.rays) {
            let p2 = ray.getPoint2();
            line(this.x, this.y, p2.x, p2.y);
        }
        
    }
    
    show(color = [255,0,0]) {

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
        
        // stroke(255);
        // for(let b of this.borders){
        //     line(b.x1, b.y1, b.x2, b.y2);
        // }
        
    }
    
}