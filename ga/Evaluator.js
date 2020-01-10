class Evaluator{
    constructor(population){
        this.c1 = 1.5;
        this.c2 = 0.8;
        this.N = 1;
        this.DT = 1;
        this.MUTATION_RATE = 0.8;
        this.ADD_CONNECTION_RATE = 0.05;
        this.ADD_NODE_RATE = 0.03;

        this.population = population;
        this.speciesMap = new Map();
        this.species = [];
        this.species.push(new Species(population[0]))
        this.speciesMap.set(population[0], this.species[0])
        this.populationSize = population.length;
        this.nextGen = [];
    }

    evaluate(){
        for(let i = 1; i < this.population.length; i++){
            let p = this.population[i];
            let foundSpecies = false;
            for(let s of this.species){
                let d = Genome.compatibilityDistance(p.genome, s.mascot.genome, this.c1,this.c2,this.N);
                // console.log(d);
                if(d < this.DT){
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
        speciesText.innerHTML = "";
        speciesText.insertAdjacentHTML('beforeend', this.species.length);
        console.log(this.species.length);
        //Put best individual of each species into next generation
        for(let s of this.species){
            s.members = s.members.sort((a, b) => (a.fitness > b.fitness))
            s.members = s.members.reverse();
            if(s.members.length > 1)
                s.members.pop();
            let fittestInSpecies = s.members[0];
            this.nextGen.push(new Car(fittestInSpecies.genome));
        }
        while(this.nextGen.length < this.populationSize){
            let species = this.poolSelection(this.species);
            let p1 = this.poolSelection(species.members);
            let p2 = this.poolSelection(species.members);
            let child;
            if(p1.fitness > p2.fitness){
                child = Genome.crossover(p1.genome, p2.genome);
            }else if(p1.fitness < p2.fitness){
                child = Genome.crossover(p2.genome, p1.genome);
            }
            this.nextGen.push(new Car(child));
        }
        this.population = this.nextGen;
        for(let p of this.population){
            if(Math.random() < this.ADD_CONNECTION_RATE){
                p.genome.addConnectionMutation(CONNECTIONINNOVATION);
            }
            if(Math.random() < this.ADD_NODE_RATE){
                p.genome.addNodeMutation(CONNECTIONINNOVATION);
            }
            if(Math.random() < this.MUTATION_RATE){
                p.genome.mutation();
            }
        }

        return this.population;
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
            if(arr[index] == undefined){
                break
            }
            r -= arr[index].fitness;
            // And move on to the next
            index += 1;
        }
    
        // Go back one
        index -= 1;

        return arr[index];
    }
    
}