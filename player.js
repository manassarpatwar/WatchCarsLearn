class Player{
    constructor(inputs, outputs){
        this.fitness;
        this.dead = false;
        this.inputs = [];
        this.outputs = [];
        this.score = 0;
        if(inputs instanceof Genome){
            this.brain = inputs.clone();
        }else{
            this.brain = new Genome(inputs, outputs);
        }
    }

    look(inputs){
        this.inputs = inputs;
    }

    think(){
        this.outputs = this.brain.feedForward(this.inputs);
        this.outputs = this.outputs[0] > 0.5 ? 1 : 0;
        return this.outputs;
    }

    update(){

    }

    calculateFitness(){
        // this.fitness = (this.brain.nodes.size > 8 || this.brain.connections.size > 20) ? 0.01 : this.score/4 ;
        this.fitness = this.score/4;
    }

    clone(){
        return new Player(this.brain);
    }
}