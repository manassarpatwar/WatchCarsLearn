export default class Node{
    constructor(n, type){
        this.number = n;
        this.type = type;
        this.layer = 0;
        this.inputSum = 0;
        this.outputValue = 0;
        this.vector = null;
        this.persistantOutput = 0;
    }

    reset(){
        this.inputSum = 0;
        this.outputValue = 0;
    }

    setOutput(out){
        this.outputValue = out;
        this.persistantOutput = this.outputValue;
    }

    activate(){
        this.outputValue = this.activationFunction(this.inputSum);
        this.persistantOutput = this.outputValue;
    }

    activationFunction(x){
        return 1/(1+Math.exp(-4.9*x))
    }

    getNodeNumber(){
        return this.number;
    }

    copy(){
        const n = new Node(this.number, this.type);
        n.layer = this.layer;
        return n;
    }
}