class Species{
    constructor(mascot){
        this.mascot = mascot;
        this.members = [];
        this.members.push(mascot);
        this.fitness = 0;
    }

    addFitness(f){
        this.fitness += f;
    }

    reset(){
        let newMascotIndex = this.members[Math.floor(Math.random()*this.members.length)];
        this.mascot = this.members[newMascotIndex];
        this.members = [];
        this.fitness = 0;

    }
}