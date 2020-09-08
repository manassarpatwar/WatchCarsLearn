import Car from "./Car";
import Config from "./Config";

export default class Runner {
    constructor(neat, start) {
        this.neat = neat;
        this.cars = [];
        this.finished = [];
        this.playerCar = new Car(start);
        
        for (let i = 0; i < this.neat.populationSize; i++) {
            const car = new Car(start);
            this.finished.push(car);
        }
        this.startGeneration();
    }

    reset(){
        this.finished.forEach(car => car.reset());
        this.cars.forEach(car => car.reset());
    }

    getFps(){
        return Math.max(60, Config.step - this.cars.length);
    }

    getstep(){
        return 1/this.getFps();
    }

    carFinished(i){
        const [car] = this.cars.splice(i, 1);
        this.finished.push(car);
    }

    checkEnd() {
        if (this.finished.length === this.neat.populationSize) {
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
        })
    }

    endGeneration() {
        this.neat.naturalSelection();
        this.startGeneration();
    }
}
