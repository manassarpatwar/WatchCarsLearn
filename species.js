class Species{
    constructor(mascot){
        this.members = [];
        this.members.push(mascot);
        this.mascot = mascot.clone();

        this.bestFitness = 0;
        this.averageFitness = 0;
        this.staleness = 0;

        this.c1 = 1;
        this.c2 = 0.5;
        this.D = 3;
    }

    reset(){
        this.bestFitness = 0;
        this.averageFitness = 0;
        this.staleness = 0;
    }

    addMember(member){
        this.members.push(member);
    }

    getMascot(){
        return this.mascot;
    }

    sameSpecies(g){
        var largeGenomeNormaliser = g.connections.size - 20;
        if (largeGenomeNormaliser < 1) {
            largeGenomeNormaliser = 1;
        }
        return Genome.compatibilityDistance(g, this.getMascot().brain, largeGenomeNormaliser, this.c1, this.c2) < this.D
        
    }


    cull() {
        if (this.members.length > 2) {
            for (var i = this.members.length / 2; i < this.members.length; i++) {
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
            this.members[i].fitness /= this.members.length;
        }
    }

    sortSpecies(){
        this.members = this.members.sort((a, b) => (a.fitness < b.fitness) ? 1 : -1)

        if (this.members.length == 0) {
            this.staleness = 200;
            return;
        }
        //if new best player
        if (this.members[0].fitness > this.bestFitness) {
            this.staleness = 0;
            this.bestFitness = this.members[0].fitness;
            this.mascot = this.members[0].clone();
        } else { //if no new best player
            this.staleness++;
        }
    }

    crossover(innovationHistory){
        let child;
        let childBrain;
        if (random(1) < 0.25 || this.members.length == 1) { //25% of the time there is no crossover and the child is simply a clone of a random(ish) player
            child = this.members[this.selectPlayer()].clone();
        }else{
            let parent1Index = this.selectPlayer();
            let parent1 = this.members[parent1Index];

            let parent2 = this.members[this.selectPlayer(parent1Index)];
            if(parent1.fitness > parent2.fitness){
                childBrain = parent1.brain.crossover(parent2.brain);
            }else{
                childBrain = parent2.brain.crossover(parent1.brain);
            }
            child = new Car(childBrain);
        }
        child.brain.mutate(innovationHistory);
        return child;
    }

    selectPlayer(skip) {
        var fitnessSum = 0;
        for (var i = 0; i < this.members.length; i++) {
            if(skip && skip == i)
                continue
            fitnessSum += this.members[i].fitness;
        }
        var rand = random(fitnessSum);
        var runningSum = 0;
  
        for (var i = 0; i < this.members.length; i++) {
            if(skip && skip == i)
                continue

            runningSum += this.members[i].fitness;
            if (runningSum > rand) {
                return i;
            }
        }
        //unreachable code to make the parser happy
        return 0;
    }


}