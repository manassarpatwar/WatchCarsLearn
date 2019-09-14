// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy bird implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&


// This file includes functions for creating a new generation
// of Cars.


// Create the next generation
function nextGeneration() {
    for(let c of activeCars){
        allCars.unshift(c);
    }
    gen++;
    genText.innerHTML = "";
    genText.insertAdjacentHTML('beforeend', gen);
    // Normalize the fitness values 0-1
    normalizeFitness(allCars);
    // Generate a new set of Cars
    activeCars = generate(allCars);
    // Copy those Cars to another array
    allCars = [];
}

// Generate a new population of Cars
function generate(oldCars) {
    let newCars = [];
    for (let i = 0; i < oldCars.length-5; i++) {
        // Select a car based on fitness
        let car = poolSelection(oldCars);
        newCars[i] = car;
    }
    let top1 = allCars.pop();
    let top2 = allCars.pop();
    for(let i = 0; i < 5; i++){
        let babyBrain = top1.brain.merge(top2.brain);
        newCars.push(new Car(babyBrain));
    }
    return newCars;
}

// Normalize the fitness of all Cars
function normalizeFitness(cars) {
    // Make score exponentially better?

    // Add up all the scores
    let sum = 0;
    for (let i = 0; i < cars.length; i++) {
        sum += cars[i].score;
    }
    // Divide by the sum
    for (let i = 0; i < cars.length; i++) {
        cars[i].fitness = cars[i].score / sum;
    }
}


// An algorithm for picking one car from an array
// based on fitness
function poolSelection(cars) {
    // Start at 0
    let index = 0;

    // Pick a random number between 0 and 1
    let r = Math.random(1);

    // Keep subtracting probabilities until you get less than zero
    // Higher probabilities will be more likely to be fixed since they will
    // subtract a larger number towards zero
    while (r > 0) {
        r -= cars[index].fitness;
        // And move on to the next
        index += 1;
    }

    // Go back one
    index -= 1;
    //    pos.insertAdjacentHTML('beforeend', cars[index].fitness + " ");
    // Make sure it's a copy!
    // (this includes mutation)
    return cars[index].copyCar();
}
