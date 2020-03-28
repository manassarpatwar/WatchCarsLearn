class Car {
    
    constructor(inputs, outputs, elClass = "car") {
        this.x = carSettings[0];
        this.y = carSettings[1];

        this.xVelocity = 0,
        this.yVelocity =  0,
        this.power = 0,
        this.reverse = 0,
        this.angle = carSettings[2],
        this.angularVelocity = 0,
        this.isThrottling = false,
        this.isReversing = false
        this.rays = [];
        this.corners = [];
        this.width = 16;
        this.height = 8;
        this.borderRadius = 2;

        this.borders = [];
        this.dead = false;
        this.oldScore = 0;
        this.score = 0;
        this.bestScore = 0;
        this.staleness = 0;
        this.checkpoints = new Set();
        this.inputs = [];
        this.laps = 0;
        this.gen = 0;
        this.moves = 0;
        this.fitness = 0;
        this.color = [70,70,70];


        if(inputs instanceof Genome){
            this.genomeInputs = inputs.numInputs;
            this.genomeOutputs = inputs.numOutputs;
            this.brain = inputs.clone();
        }else{
            this.genomeInputs = inputs;
            this.genomeOutputs = outputs;
            this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
        }

        this.numRays = this.genomeInputs;
        this.computeRays();

    }

    setUpDiv(){
        this.el.style('width', this.width+'px');
        this.el.style('height', this.height+'px');
        this.el.style('top', -this.height/2+'px');
        this.el.style('left', -this.width/2+'px')
        this.el.style('border-radius', 2+'px');
    }

    isPointInside(x, y){
        let rectArea = this.width*this.height;
        let triangleAreas = 0;
        for(let b of this.borders){
            triangleAreas += Boundary.getAreaWithPoint(b, x, y);
        }
        return rectArea == triangleAreas;
    }

    crossover(parent2){
        let child = new Car(this.brain.crossover(parent2.brain));
        child.bestScore = Math.max(this.bestScore, parent2.bestScore);
        child.color = this.color;
        return child;
    }

    reset(){
        this.x = carSettings[0];
        this.y = carSettings[1];
        this.xVelocity = 0,
        this.yVelocity =  0,
        this.power = 0,
        this.reverse = 0,
        this.angle = carSettings[2],
        this.angularVelocity = 0,
        this.corners = [];
        this.borders = [];
        this.dead = false;
        this.oldScore = 0;
        this.score = 0;
        this.staleness = 0;
        this.checkpoints = new Set();
        this.inputs = [];
        this.gen = 0;
        this.laps = 0;
        this.moves = 0;

    }

    died(){
        this.dead = true;
    }

    look(){
        if(this.moves > 100){
            this.oldScore = this.checkpoints.size;
            this.moves = 0;
        }

        let boundaries = innerTrack.concat(outerTrack);
        for(let ray of this.rays){
            ray.reset();
        }
        
        let overlap = false;
        for(let b of boundaries){
            for(let border of this.borders){
                if(Boundary.overlaps(border, b)){
                    overlap = true;
                    break
                }
            }
            if(overlap){
                this.died();
                break;
            }
            for(let ray of this.rays){
                if(ray.done){
                    continue;
                }
                let int = ray.isHitting(b)
                let d = Infinity;
                if(int != null)
                    d = dist(ray.tail.x, ray.tail.y, int.x, int.y);
                if(int && d < ray.maxlength){
                    ray.setLength(d);
                    ray.done = true;
                }
            }
        }
        this.inputs = this.rays.map(x => 1-x.length/x.maxlength);
    }

    think() {

        if(!this.dead){
            let outputs = this.brain.feedForward(this.inputs);

            const canTurn = this.power > 0.0025 || this.reverse;

            this.isThrottling = outputs[0] >= 0.66;
            this.isReversing = outputs[0] < 0.33;
            
            this.isTurningLeft = canTurn && outputs[1] >= 0.66;
            this.isTurningRight = canTurn && outputs[1] < 0.33;
            this.moves++;
        }
    }

    clone() {
        var clone = new Car(this.brain);
        clone.fitness = this.fitness;
        clone.bestScore = this.score;
        clone.color = this.color;
        return clone;
    }

    cloneForReplay(elClass) {
        var clone = new Car(this.brain, null, elClass);
        clone.fitness = this.fitness;
        clone.bestScore = this.score;
        clone.color = this.color;
        return clone;
    }

    calculateFitness() {
        this.fitness = this.laps > 0 ? 1 : this.checkpoints.size/checkpoints.length;;
    }

    addCheckpoint(c){
        this.checkpoints.add(c);
        if(this.checkpoints.size == checkpoints.length){
            this.checkpoints = new Set();
            this.laps++;
            this.oldScore = 0;
        }
        this.score = this.checkpoints.size + this.laps*checkpoints.length;
    }

    computeRays(){
        let offsetAdd = this.numRays > 8 ? Math.PI/((this.numRays/8)*(4%this.numRays)) : Math.PI/4;
        let offset = this.numRays%2 == 0 ? -(this.numRays-1)*(offsetAdd/2) : -((this.numRays-1)/2)*offsetAdd;
        for (let i = 0; i < this.numRays; i++) {
            this.rays[i] = new Ray(createVector(this.x, this.y), this.angle+offset, 50);
            offset += offsetAdd;
        }
    }

    recomputeRays(){
        let offsetAdd = this.numRays > 8 ? Math.PI/((this.numRays/8)*(4%this.numRays)) : Math.PI/4;
        let offset = this.numRays%2 == 0 ? -(this.numRays-1)*(offsetAdd/2) : -((this.numRays-1)/2)*offsetAdd;
        for (let i = 0; i < this.numRays; i++) {
            this.rays[i].setTailAndHeading(this.x, this.y, this.angle+offset);
            offset += offsetAdd;
        }
    }

    changeNumRays(newNumRays){
        this.rays = [];
        this.numRays = newNumRays;
        this.computeRays();
    }
    
    recomputeCorners(){
         //top right
         let x = this.x + this.width/2 * Math.cos(this.angle) - this.height/2 * Math.sin(this.angle)
         let y = this.y + this.width/2 * Math.sin(this.angle) + this.height/2 * Math.cos(this.angle)
         this.corners[0] = createVector(x,y)
 
         //bottom right
         x = this.x - this.width/2 * Math.cos(this.angle) - this.height/2 * Math.sin(this.angle)
         y = this.y - this.width/2 * Math.sin(this.angle) + this.height/2 * Math.cos(this.angle)
         this.corners[1] = createVector(x,y)
 
         //bottom left
         x = this.x - this.width/2 * Math.cos(this.angle) + this.height/2 * Math.sin(this.angle)
         y = this.y - this.width/2 * Math.sin(this.angle) - this.height/2 * Math.cos(this.angle)
         this.corners[2] = createVector(x,y)
 
         //top left
         x = this.x + this.width/2 * Math.cos(this.angle) + this.height/2 * Math.sin(this.angle)
         y = this.y + this.width/2 * Math.sin(this.angle) - this.height/2 * Math.cos(this.angle)
         this.corners[3] = createVector(x,y)
 
        for(let i = 0; i < this.corners.length-1; i++){
            this.borders[i] = new Boundary(this.corners[i].x, this.corners[i].y, this.corners[i+1].x, this.corners[i+1].y)
        }
        this.borders[this.corners.length-1] = new Boundary(this.corners[0].x, this.corners[0].y, this.corners[this.corners.length-1].x, this.corners[this.corners.length-1].y)

    }

    display(color = [70,70,70], driftTracks = false) {

        this.el.style('transform', `translate(${this.x}px, ${this.y}px) rotate(${this.angle * 180 / Math.PI}deg)`);
        this.el.style('background', "rgb("+color[0]+", "+color[1]+", "+color[2]+")");
        this.el.style('opacity', 1);

        if(driftTracks){
            push();
            if ((this.power > 0.005) || this.reverse) {
                if (((maxReverse === this.reverse) || (maxPower === this.power)) && Math.abs(this.angularVelocity) < 0.002) {
                return;
                }
                stroke(150);
                push();
                translate(this.corners[1].x, this.corners[1].y);
                rotate(this.angle);
                rect(3, -2, 0.1, 0.1);
                pop();
                push();
                translate(this.corners[2].x, this.corners[2].y);
                rotate(this.angle);
                rect(3, +2, 0.1, 0.1);
                pop();
            }
            pop();
        }
    }

    noShow(){
        if(this.el.elt.style.opacity != 0);
            this.el.style('opacity', 0);
    }


    update() {
        if(this.dead){
            return;
        }

        if (this.isThrottling) {
            this.power += powerFactor * this.isThrottling;
        } else {
            this.power -= powerFactor/2;
        }
        if (this.isReversing) {
            this.reverse += reverseFactor;
        } else {
            this.reverse -= reverseFactor/2;
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
    
        this.xVelocity += Math.cos(this.angle) * (this.power - this.reverse);
        this.yVelocity += Math.sin(this.angle) * (this.power - this.reverse);
    
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.xVelocity *= drag;
        this.yVelocity *= drag;
        this.angle += this.angularVelocity;
        this.angularVelocity *= angularDrag;
        this.recomputeRays();
        this.recomputeCorners();
    }

    checkStaleness(){
        if(this.oldScore == this.score){
            this.staleness++;
        }else{
            this.staleness = 0;
        }

        if(this.staleness > 100){
            this.died();
        }
    }

}