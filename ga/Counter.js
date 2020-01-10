class Counter{
    currentInnovation;
    constructor(start){
        this.currentInnovation = start;
    }
    getInnovation(){
        return this.currentInnovation++;
    }
}