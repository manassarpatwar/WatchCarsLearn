class Node{
    number;
    type;
    layer;
    inputSum;
    outputValue;
    vector;
    radius;

    constructor(n, type){
        this.number = n;
        this.type = type;
        this.layer = 0;
        this.inputSum = 0;
        this.outputValue = 0;
    }

    reset(){
        this.inputSum = 0;
        this.outputValue = 0;
    }

    activate(){
        this.outputValue = this.activationFunction(this.inputSum);
    }

    activationFunction(x){
        return 1/(1+Math.exp(-4.9*x))
    }

    getNodeNumber(){
        return this.number;
    }

    copy(){
        let n = new Node(this.number, this.type);
        n.layer = this.layer;
        return n;
    }
}