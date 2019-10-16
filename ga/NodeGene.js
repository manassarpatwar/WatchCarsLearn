class NodeGene{
    type;
    id;

    constructor(type, id){
        this.type = type;
        this.id = id;
    }

    getType(){
        return this.type;
    }

    getId(){
        return this.id;
    }

    copy(){
        return new NodeGene(this.type, this.id);
    }
}