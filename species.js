class Species{
    constructor(p){
        this.members = [];
        this.members.push(p);

        this.color = [50+Math.random()*150, 50+Math.random()*150,50+Math.random()*150]
        this.champ = p.clone();
        this.champ.color = this.color;

        this.rep = p.brain.clone();

        this.bestFitness = p.fitness;
        this.averageFitness = 0;
        this.staleness = 0;

        this.c1 = 1;
        this.c2 = 0.5;
        this.D = 3;
    }

    addMember(member){
        member.color = this.color;
        this.members.push(member);
    }

    sameSpecies(g){
        var compatibility;

        var excessAndDisjoint = Genome.getExcessDisjoint(g, this.rep); //get the number of excess and disjoint genes between this player and the current species this.rep
        var averageWeightDiff = Genome.averageWeightDiff(g, this.rep); //get the average weight difference between matching genes
    
        var largeGenomeNormaliser = g.connections.size - 20;
        if (largeGenomeNormaliser < 1) {
          largeGenomeNormaliser = 1;
        }
    
        compatibility = (this.c1 * excessAndDisjoint / largeGenomeNormaliser) + (this.c2 * averageWeightDiff); //compatibility formula
        return (this.D > compatibility);

        
    }


    cull() {
        if (this.members.length > 2) {
            for (var i = this.members.length/2; i < this.members.length; i++) {
                // this.members.remove(i);
                this.members.splice(i, 1);
                i--;
            }
        }
    }

    calculateAverage(){
        var sum = 0;
        for (var i = 0; i < this.members.length; i++) {
            sum += this.members[i].fitness;
        }
        this.averageFitness = sum/this.members.length;
    }


    fitnessSharing() {
        for (var i = 0; i < this.members.length; i++) {
            this.members[i].fitness = this.members[i].fitness/this.members.length;
        }
    }

    sortSpecies(){

        if (this.members.length == 0) {
            this.staleness = 200;
            return;
        }else{
            this.members.sort((a,b) => a.fitness > b.fitness ? -1 : 1);
        }
        //if new best player
        if (this.members[0].fitness > this.bestFitness) {
            this.staleness = 0;
            this.bestFitness = this.members[0].fitness;
            this.rep = this.members[0].brain.clone();
            this.champ = this.members[0].clone();
        } else { //if no new best player
            this.staleness++;
        }
    }

    crossover(innovationHistory){
        let child;
        if (random(1) < 0.25 || this.members.length == 1) { //25% of the time there is no crossover and the child is simply a clone of a random(ish) player
            child = this.members[this.selectPlayer()].clone();
        }else{
            let parent1Index = this.selectPlayer();
            let parent1 = this.members[parent1Index];

            let parent2 = this.members[this.selectPlayer()];
            if(parent1.fitness > parent2.fitness){
                child = parent1.crossover(parent2);
            }else{
                child = parent2.crossover(parent1);
            };
        }
        child.brain.mutate(innovationHistory);
        return child;
    }

    selectPlayer() {
        var fitnessSum = 0;
        for (var i = 0; i < this.members.length; i++) {
            fitnessSum += this.members[i].fitness;
        }
        var rand = random(fitnessSum);
        var runningSum = 0;
  
        for (var i = 0; i < this.members.length; i++) {

            runningSum += this.members[i].fitness;
            if (runningSum > rand) {
                return i;
            }
        }
        //unreachable code to make the parser happy
        return 0;
    }

    clone(){
        let s = new Species(this.champ);
        s.bestFitness = this.bestFitness;
        s.averageFitness = this.averageFitness;
        s.color = this.color;
        s.staleness = this.staleness;
        return s;
    }


}
Species.drawWidth = 150;
Species.drawHeight = 300;