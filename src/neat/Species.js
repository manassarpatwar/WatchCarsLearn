import Genome from "./Genome.js";

export default class Species {
    constructor(mascot) {
        this.members = [];

        this.bestFitness = mascot.fitness;
        this.averageFitness = 0;
        this.staleness = 0;

        this.c1 = 1;
        this.c2 = 0.4;
        this.D = 3;

        this.color = [
            50 + Math.random() * 150,
            50 + Math.random() * 150,
            50 + Math.random() * 150,
        ];

        this.addMember(mascot);
        this.mascot = mascot.clone();
    }

    addMember(member) {
        member.color = this.color;
        this.members.push(member);
    }

    getMascot() {
        return this.mascot;
    }

    sameSpecies(g) {
        const excessAndDisjoint = Genome.getExcessDisjoint(g, this.mascot); //get the number of excess and disjoint genes between this player and the current species this.rep
        const averageWeightDiff = Genome.averageWeightDiff(g, this.mascot); //get the average weight difference between matching genes

        let largeGenomeNormaliser = g.connections.size - 20;
        if (largeGenomeNormaliser < 1) {
            largeGenomeNormaliser = 1;
        }

        const compatibility =
            (this.c1 * excessAndDisjoint) / largeGenomeNormaliser +
            this.c2 * averageWeightDiff; //compatibility formula
        return this.D > compatibility;
    }

    cull() {
        if (this.members.length > 2) {
            for (
                let i = this.members.length / 2;
                i < this.members.length;
                i++
            ) {
                // this.members.remove(i);
                this.members.splice(i, 1);
                i--;
            }
        }
    }

    calculateAverage() {
        let sum = 0;
        for (const member of this.members) {
            sum += member.fitness;
        }
        this.averageFitness = sum / this.members.length;
    }

    fitnessSharing() {
        for (const member of this.members) {
            member.fitness /= this.members.length;
        }
    }

    sortSpecies() {
        if (this.members.length == 0) {
            this.staleness = 200;
            return;
        } else {
            this.members.sort((a, b) => (a.fitness > b.fitness ? -1 : 1));
        }
        //if new best player
        if (this.members[0].fitness > this.bestFitness) {
            this.staleness = 0;
            this.bestFitness = this.members[0].fitness;
            this.mascot = this.members[0].clone();
        } else {
            //if no new best player
            this.staleness++;
        }
    }

    crossover(innovationHistory) {
        let child;
        if (Math.random() < 0.25 || this.members.length == 1) {
            //25% of the time there is no crossover and the child is simply a clone of a random(ish) player
            child = this.members[this.selectPlayer()].clone();
        } else {
            let parent1Index = this.selectPlayer();
            let parent1 = this.members[parent1Index];

            let parent2 = this.members[this.selectPlayer(parent1Index)];
            if (parent1.fitness > parent2.fitness) {
                child = parent1.crossover(parent2);
            } else {
                child = parent2.crossover(parent1);
            }
        }
        child.mutate(innovationHistory);
        child.color = this.color;
        return child;
    }

    selectPlayer(skip) {
        let fitnessSum = 0;
        for (let i = 0; i < this.members.length; i++) {
            if (skip && skip === i) continue;
            fitnessSum += this.members[i].fitness;
        }
        const rand = Math.random() * fitnessSum;
        let runningSum = 0;

        for (let i = 0; i < this.members.length; i++) {
            if (skip && skip === i) continue;
            runningSum += this.members[i].fitness;
            if (runningSum > rand) {
                return i;
            }
        }
        //unreachable code to make the parser happy
        return 0;
    }
}
