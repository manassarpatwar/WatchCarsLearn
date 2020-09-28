import Car from "./Car";
import Config from "./Config";

export default class Runner {
    constructor(neat, start, onGenEnd) {
        this.neat = neat;
        this.cars = [];
        this.finished = [];
        this.playerCar = new Car(start);
        console.log(neat);
        for (let i = 0; i < this.neat.popsize; i++) {
            const car = new Car(start);
            this.finished.push(car);
        }
        this.onGenEnd = onGenEnd;
        this.startGeneration();
    }

    reset() {
        this.finished.forEach(car => car.reset());
        this.cars.forEach(car => car.reset());
    }

    getFps() {
        return Math.max(120, Config.step - this.cars.length);
    }

    getstep() {
        return 1 / this.getFps();
    }

    carFinished(i) {
        const [car] = this.cars.splice(i, 1);
        this.finished.push(car);
    }

    checkEnd() {
        if (this.finished.length === this.neat.popsize) {
            this.endGeneration();
        }
    }

    startGeneration() {
        this.cars = this.finished;
        this.finished = [];
        this.cars.forEach((car, i) => {
            car.brain = this.neat.population[i];
            car.brain.score = 0;
            car.reset();
        });
    }

    endGeneration() {
        this.neat.sort();

        this.onGenEnd({
            gen: this.neat.generation,
            max: this.neat.getFittest().score,
            avg: Math.round(this.neat.getAverage()),
            min: this.neat.population[this.neat.popsize - 1].score,
        });

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
