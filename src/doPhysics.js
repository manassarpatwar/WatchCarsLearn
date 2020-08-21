const arrowKeys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    brake: 32,
};
const wasdKeys = {
    up: 87,
    down: 83,
    left: 65,
    right: 68,
    brake: 32,
};

const keysDown = {};

const keyActive = key => {
    return keysDown[arrowKeys[key]] || keysDown[wasdKeys[key]] || false;
};

const keyChanged = cars => {
    cars.forEach(car => {
        const pressingUp = keyActive("up");
        const pressingDown = keyActive("down");

        car.isThrottling = pressingUp;
        car.isReversing = pressingDown;

        const braking = keyActive("brake");

        const turnLeft = keyActive("left");
        const turnRight = keyActive("right");

        car.isTurningLeft = turnLeft;
        car.isTurningRight = turnRight;
        car.isBraking = braking;
    });
};

export default (runner, curves, paths) => {
    let lastTime;
    let acc = 0;
    const step = 1 / 60;
    setInterval(() => {
        const ms = Date.now();
        if (lastTime) {
            acc += (ms - lastTime) / 1000;
            while (acc > step) {
                runner.cars.forEach(car => {
                    if (car.alive) {
                        car.update();
                        car.checkRays(curves);
                        car.isOnTrack(paths);
                    }
                });
                // runner.checkAlive();
                acc -= step;
            }
        }
        lastTime = ms;
    }, 1000 / 60);

    window.addEventListener("keydown", e => {
        keysDown[e.which] = true;
        keyChanged(runner.cars);
    });

    window.addEventListener("keyup", e => {
        keysDown[e.which] = false;
        keyChanged(runner.cars);
    });
};
