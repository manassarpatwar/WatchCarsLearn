class ConnectionGene{
    innode;
    outnode;
    weight;
    expressed;
    innovation;

    constructor(innode, outnode, weight, expressed, innovation){
        this.innode = innode;
        this.outnode = outnode;
        this.weight = weight;
        this.expressed = expressed;
        this.innovation = innovation;
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