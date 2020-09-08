import User from "./User";

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

const keyChanged = car => {
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
};

export default (runner, paths, curves) => {
    let lastTime;
    let acc = 0;

    setInterval(() => {
        const ms = Date.now();
        if (lastTime) {
            acc += (ms - lastTime) / 1000;
            while (acc > runner.getstep()) {
                if (!User.isDragging && !User.pause) {
                    if (runner.playerCar.alive) {
                        runner.playerCar.update();
                        runner.playerCar.isOnTrack(paths);
                    } else {
                        runner.playerCar.reset();
                    }
                    for (let i = 0; i < runner.cars.length; i++) {
                        const car = runner.cars[i];
                        car.update();
                        car.isOnTrack(paths, curves);
                        if (!car.alive) {
                            runner.carFinished(i);
                            i--;
                        }
                    }
                    runner.checkEnd();
                }
                acc -= runner.getstep();
            }
        }

        lastTime = ms;
    }, 1000 / 60);

    window.addEventListener("keydown", e => {
        keysDown[e.which] = true;
        keyChanged(runner.playerCar);
    });

    window.addEventListener("keyup", e => {
        keysDown[e.which] = false;
        keyChanged(runner.playerCar);
    });
};
