class InnovationCounter {
    constructor(innovationNumber=1) {
        this.innovationNumber = innovationNumber;
    }

    getInnovation() {
        return this.innovationNumber++;
    }
}

const innovationCounter = new InnovationCounter(1);

export default innovationCounter;
