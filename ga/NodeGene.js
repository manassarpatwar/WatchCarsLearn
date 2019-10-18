class NodeGene{
    type;
    innovation;

    constructor(type, innovation){
        this.type = type;
        this.innovation = innovation;
    }

    getType(){
        return this.type;
    }

    getInnovation(){
        return this.innovation;
    }

    copy(){
        return new NodeGene(this.type, this.innovation);
    }
}