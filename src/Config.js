export const mobile = window.innerWidth < 600;

const scale = mobile ? 2.5 : 5;
const carLength = 4 * scale;
const carBreadth = 2 * scale;
const popsize = 150;
const Config = {
    scale,
    carLength,
    carBreadth,
    canvasWidth: mobile ? window.innerWidth : window.innerWidth * 0.75,
    canvasHeight: mobile ? window.innerHeight * 0.33 : window.innerHeight,
    Cdrag: 0.99,
    Crr: 0,
    mass: 1200,
    inertiaScale: 1,
    maxSteer: mobile ? 1.2 : 0.6,
    engineForce: 8000 * scale,
    reverseForce: 12000 * scale,
    brakingForce: 16800,
    maxRayLength: 10 * scale,
    backgroundColor: "#000",
    trackColor: "#515F6F",
    trackBorder: mobile ? 2 : 3,
    flagSquares: 5,
    checkpointInterval: scale,

    randomColor: [50 + Math.random() * 150, 50 + Math.random() * 150, 50 + Math.random() * 150],

    borderRadius: carLength / 8,
    L: carLength / 2,
    trackWidth: mobile ? 20 : 40,

    controlPointSize: 15,
    step: mobile ? 150 : 240,

    popsize,
};

export default Config;
