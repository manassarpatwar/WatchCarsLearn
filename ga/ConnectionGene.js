class ConnectionGene{
    innode;
    outnode;
    weight;
    expressed;
    innovation;
    output = 0;

    constructor(innode, outnode, weight, expressed, innovation){
        this.innode = innode;
        this.outnode = outnode;
        this.weight = weight;
        this.expressed = expressed;
        this.innovation = innovation;
    }

    calculateOutput(nodeOutput){
        this.output = this.weight*nodeOutput;
    }

    getConnectionOutput(){
        return this.output;
    }

    getInNode(){
        return this.innode;
    }

    getOutNode(){
        return this.outnode;
    }

    getWeight(){
        return this.weight;
    }

    setWeight(weight){
        this.weight = weight;
    }

    disable(){
        this.expressed = false;
    }

    isExpressed(){
        return this.expressed;
    }

    getInnovation(){
        return this.innovation;
    }

    copy(){
        return new ConnectionGene(this.innode, this.outnode, this.weight, this.expressed, this.innovation)
    }


}