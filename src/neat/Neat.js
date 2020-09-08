import Genome from "./Genome.js";
import Species from "./Species.js";

export default class Neat {
    constructor(size, inputs, outputs, fitnessFunction = null) {
        this.populationSize = size;
        this.population = [];

        this.bestScore = 0;
        this.previousBest;
        this.innovationHistory = [];
        this.species = [];
        this.gen = 0;
        this.best = null;
        for (let i = 0; i < this.populationSize; i++) {
            this.population[i] = new Genome(inputs, outputs);
            // this.population[this.population.length - 1].fullyConnect(
            //     this.innovationHistory
            // );
            this.population[this.population.length - 1].mutate(
                this.innovationHistory
            );
        }
        this.getFitness = fitnessFunction;
        this.speciate();
    }

    setBestPlayer() {
        const tempBest = this.species[0].members[0];
        tempBest.gen = this.gen;

        if (tempBest.score >= this.bestScore) {
            this.bestScore = tempBest.score;
            this.best = tempBest.clone();
        }
    }

    naturalSelection() {
        this.calculateFitness();
        this.speciate();

        this.sortSpecies();

        this.cullSpecies();

        this.setBestPlayer();
        this.killStaleSpecies();

        this.killBadSpecies();
        console.log(
            "Gen: " +
                this.gen +
                "  Number of Species: " +
                this.species.length +
                " Best Score: " +
                this.population.reduce((max, p) =>
                    max.score > p.score ? max : p
                ).score
        );

        const averageSum = this.getAvgFitnessSum();
        const children = [];

        for (const s of this.species) {
            children.push(s.mascot.clone());
            const noOfChildren =
                Math.floor(
                    (s.averageFitness / averageSum) * this.population.length
                ) - 1;

            for (let i = 0; i < noOfChildren; i++) {
                children.push(s.crossover(this.innovationHistory));
            }
        }

        while (children.length < this.populationSize) {
            children.push(this.species[0].crossover(this.innovationHistory));
        }
        this.population = [...children];

        this.gen++;
        return this.population;
    }

    cullSpecies() {
        for (const s of this.species) {
            s.cull();
            s.fitnessSharing();
            s.calculateAverage();
        }
    }

    killBadSpecies() {
        const averageSum = this.getAvgFitnessSum();

        for (let i = 1; i < this.species.length; i++) {
            if (
                (this.species[i].averageFitness / averageSum) *
                    this.populationSize <
                1
            ) {
                this.species.splice(i, 1);
                i--;
            }
        }
    }

    noOfChildren(species) {
        const averageSum = this.getAvgFitnessSum();
        return (species.averageFitness / averageSum) * this.population.length;
    }

    killStaleSpecies() {
        for (let i = 2; i < this.species.length; i++) {
            if (this.species[i].staleness >= 20) {
                this.species.splice(i, 1);
                i--;
            }
        }
    }

    calculateFitness() {
        for (const p of this.population) {
            p.fitness = this.getFitness(p);
        }
    }

    getAvgFitnessSum() {
        let averageSum = 0;
        for (const s of this.species) {
            averageSum += s.averageFitness;
        }
        return averageSum;
    }

    sortSpecies() {
        for (const s of this.species) {
            s.sortSpecies();
        }

        this.species.sort((a, b) => (a.bestFitness > b.bestFitness ? -1 : 1));
    }

    speciate() {
        for (const s of this.species) {
            s.members = [];
        }
        for (const p of this.population) {
            let createNewSpecies = true;
            for (const s of this.species) {
                if (s.sameSpecies(p)) {
                    createNewSpecies = false;
                    s.addMember(p);
                }
            }
            if (createNewSpecies) {
                this.species.push(new Species(p));
            }
        }
    }
}
