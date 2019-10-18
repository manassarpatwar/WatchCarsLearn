class Evaluator{
    constructor(population, numInputs, numOutputs){
        this.c1 = 1;
        this.c2 = 1;
        this.c3 = 0.4;
        this.N = 1;
        this.DT = 10;
        this.MUTATION_RATE = 0.5;
        this.ADD_CONNECTION_RATE = 0.1;
        this.ADD_NODE_RATE = 0.1;

        this.population = population;
        this.speciesMap = new Map();
        this.species = [];
        this.species.push(new Species(population[0]))
        this.populationSize = population.length;
        this.nextGen = [];

        this.connectionInnovation = new Counter(numInputs+numOutputs);
        this.nodeInnovation = new Counter(numInputs+numOutputs);
    }

    evaluate(){
        for(let p of this.population){
            let foundSpecies = false;
            for(let s of this.species){
                if(Genome.compatibilityDistance(p.genome, s.mascot.genome, this.c1,this.c2,this.c3, this.N) < this.DT){
                    s.members.push(p);
                    this.speciesMap.set(p, s);
                    foundSpecies = true;
                    break;
                }
            }
            //Make a new species if not found
            if(!foundSpecies){
                let newSpecies = new Species(p);
                this.species.push(newSpecies);
                this.speciesMap.set(p, newSpecies);
            }
        }

        //Delete species with no members
        this.species = this.species.filter(x => x.members.length > 0)

        //Evaluate genome and assign fitness
        for(let p of this.population){
            let species = this.speciesMap.get(p);
            let adjustedScore = p.score/species.members.length
            p.fitness = adjustedScore;
            species.addFitness(adjustedScore);
        }

        //Put best individual of each species into next generation
        for(let s of this.species){
            s.members.sort((a, b) => (a.fitness > b.fitness) ? 1 : (a.fitness < b.fitness) ? -1 : 0)
            s.members.reverse();
            let fittestInSpecies = s.members[0];
            this.nextGen.push(fittestInSpecies);
        }

        while(this.nextGen.length < this.populationSize){
            let species = poolSelection(this.species);
            let p1 = this.poolSelection(species.members);
            let p2 = this.poolSelection(species.members);
            let child;
            if(p1.fitness > p2.fitness){
                child = Genome.crossover(p1.genome, p2.genome);
            }else{
                child = Genome.crossover(p2.genome, p1.genome);
            }
            this.nextGen.push(p1.copy(child));
        }

        this.population = this.nextGen;
        for(let p of this.population){
            if(Math.random() < this.ADD_CONNECTION_RATE){
                p.genome.addConnectionMutation(this.connectionInnovation);
            }
            if(Math.random() < this.ADD_NODE_RATE){
                p.genome.addNodeMutation(this.connectionInnovation, this.nodeInnovation);
            }
            if(Math.random() < this.MUTATION_RATE){
                p.genome.mutation();
            }
        }
        this.nextGen = [];
        this.species = [];
        this.speciesMap = new Map();
    }

    poolSelection(arr) {
        // Start at 0
        let index = 0;
    
        // Pick a random number between 0 and 1
        let r = Math.random(1);
    
        // Keep subtracting probabilities until you get less than zero
        // Higher probabilities will be more likely to be fixed since they will
        // subtract a larger number towards zero
        while (r > 0) {
            r -= arr[index].fitness;
            // And move on to the next
            index += 1;
        }
    
        // Go back one
        index -= 1;

        return arr[index];
    }
    
}