import Config from "../Config.js";
import Car from "./Car.js";

export default class Runner {
    constructor(start, main) {
        this.cars = [];
        this.carsFinished = 0;
        for (let i = 0; i < Config.POP_SIZE; i++) {
            const car = new Car(start, main);
            this.cars.push(car);
        }
    }

    checkAlive() {
        this.carsFinished = this.cars
            .map(c => !c.alive)
            .reduce((a, b) => (b ? a + 1 : a), 0);
        if (this.carsFinished === this.cars.length) {
            this.endGeneration();
        }
    }

    startGeneration() {
        this.carsFinished = 0;

        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].brain = this.neat.population[i];
            this.cars[i].brain.score = 0;
            this.cars[i].reset();
        }
    }

    endGeneration() {
        if (this.carsFinished + 1 < this.cars.length) {
            this.carsFinished++;
            return;
        }

        this.neat.sort();

        // this.onEndGeneration({
        //     generation: this.neat.generation,
        //     max: this.neat.getFittest().score,
        //     avg: Math.round(this.neat.getAverage()),
        //     min: this.neat.population[this.neat.popsize - 1].score,
        // });

        const newGeneration = [];

        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i]);
        }

        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newGeneration.push(this.neat.getOffspring());
        }

        this.neat.population = newGeneration;
        this.neat.mutate();
        this.neat.generation++;
        this.startGeneration();
    }
}
