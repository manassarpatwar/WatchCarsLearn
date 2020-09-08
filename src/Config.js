const scale = 5;
const carLength = 4 * scale;
const carBreadth = 2 * scale;
const populationSize = 250;

const Config = {
    scale,
    carLength,
    carBreadth,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    Cdrag: 0.99,
    Crr: 0,
    mass: 1200,
    inertiaScale: 1,
    maxSteer: 0.6,
    engineForce: 8000 * scale,
    reverseForce: 12000 * scale,
    brakingForce: 16800,
    maxRayLength: 80,
    backgroundColor: "#000",
    trackColor: "#515F6F",
    trackBorder: 3,
    flagSquares: 5,

    borderRadius: carLength / 8,
    L: carLength / 2,
    trackWidth: 40,

    controlPointSize: 15,
    step: 240,

    populationSize,
    mutationRate: 0.5,
    mutationAmount: 3,
    elitism: populationSize * 0.2,
};

export default Config;
