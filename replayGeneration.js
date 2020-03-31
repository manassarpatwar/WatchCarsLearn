class ReplayGeneration{
    species;

    constructor(){
        this.species = [];
    }

    getMaxFitness(){
        return Math.max.apply(Math, this.species.map(x => x.bestFitness))
    }

    addSpecies(s){
        this.species.push(s);
    }

}