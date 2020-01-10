class ConnectionGene{
    innode;
    outnode;
    weight;
    enabled;
    innovation;
    output = 0;

    constructor(innode, outnode, weight, enabled, innovation){
        this.innode = innode;
        this.outnode = outnode;
        this.weight = weight;
        this.enabled = enabled;
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
        this.enabled = false;
    }

    isEnabled(){
        return this.enabled == true;
    }

    getInnovation(){
        return this.innovation;
    }

    copy(){
        return new ConnectionGene(this.innode, this.outnode, this.weight, this.disabled, this.innovation)
    }


}