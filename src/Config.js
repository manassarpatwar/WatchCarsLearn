const scale = 5;
const carLength = 4 * scale;
const carBreadth = 2 * scale;
const popsize = 50;

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
    maxRayLength: 50,
    backgroundColor: "#000",
    trackColor: "#515F6F",
    trackBorder: 3,
    flagSquares: 5,
    checkpointInterval: 5,

    randomColor: [50 + Math.random() * 150, 50 + Math.random() * 150, 50 + Math.random() * 150],

    borderRadius: carLength / 8,
    L: carLength / 2,
    trackWidth: 40,

    controlPointSize: 15,
    step: 360,

    popsize,
    mutationRate: 0.5,
    mutationAmount: 3,
    elitism: Math.round(0.2 * popsize),
};

export default Config;
