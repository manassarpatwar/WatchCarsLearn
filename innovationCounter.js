class InnovationCounter{
    innovationNumber;
    constructor(innovationNumber){
        this.innovationNumber = innovationNumber;
    }

    getInnovation(){
        return this.innovationNumber++;
    }
}