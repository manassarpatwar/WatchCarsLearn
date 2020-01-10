function activation(input){
    return 1/(1+Math.exp(-input));
}

class NodeGene{
    type;
    innovation;
    output = null;
    pos;

    constructor(type, innovation, pos){
        this.type = type;
        this.innovation = innovation;
        this.pos = pos;
    }
    
    setPos(pos){
        this.pos = pos;
    }

    activate(input){
        this.output = activation(input);
    }

    setOutput(out){
        this.output = out;
    }

    getNodeOutput(){
        return this.output;
    }

    getType(){
        return this.type;
    }

    getInnovation(){
        return this.innovation;
    }

    copy(){
        return new NodeGene(this.type, this.innovation, this.pos);
    }
}