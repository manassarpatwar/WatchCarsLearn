function nextGeneration() {
    maxScore = 0;
    gen++;
    genText.innerHTML = "";
    genText.insertAdjacentHTML('beforeend', gen);
    //    Normalize the fitness values 0 - 1
    normalizeFitness(allCars);

    // Generate a new set of birds
    cars = generate(allCars);
    allCars = [];
    setup();
}


// Normalize the fitness of all cars
function normalizeFitness(c) {
    // Add up all the scores
    let sum = 0;
    for (let i = 0; i < c.length; i++) {
        sum += c[i].score;
    }

    // Divide by the sum
    for (let i = 0; i < c.length; i++) {
        c[i].fitness = c[i].score / sum;
        console.log(c[i].fitness);
    }
}

// Generate a new population of car
function generate(oldCars) {
    let newCars = [];

    for (let i = 0; i < 20; i++) {
        newCars.push(poolSelection(oldCars));
    }

    for (let z = 0; z < 4; z++) {

        let top1 = oldCars.reduce(function (prev, current) {
            return (prev.fitness > current.fitness) ? prev : current
        })

        for (let j = 0; j < oldCars.length; j++)
            if (oldCars[j] == top1)
                oldCars.splice(j, 1);
        let top2 = oldCars.reduce(function (prev, current) {
            return (prev.fitness > current.fitness) ? prev : current
        })

        for (let j = 0; j < oldCars.length; j++)
            if (oldCars[j] == top2)
                oldCars.splice(j, 1);
        
        for (let i = 0; i < 20; i++) {
            let car = new Car(top1.brain.merge(top2.brain));
            newCars.push(car);
        }
    }

    return newCars;
}

// An algorithm for picking one car from an array
// based on fitness
function poolSelection(cars) {
    // Start at 0
    let index = 0;

    // Pick a random number between 0 and 1
    let r = Math.random();

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

    // Make sure it's a copy!
    // (this includes mutation)
    return cars[index].copyCar();
}
