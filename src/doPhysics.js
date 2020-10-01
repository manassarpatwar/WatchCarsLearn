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
    User.isPlaying = User.isPlaying || pressingUp || pressingDown || turnLeft || turnRight;
    if (User.isPlaying) {
        User.car.el.style.zIndex = 10;
    }
};

export default async (runner, paths, curves) => {
    let lastTime;
    let acc = 0;

    const step = async ms => {
        return new Promise(async resolve => {
            if (lastTime) {
                acc += (ms - lastTime) / 1000;
                while (acc > runner.getStep()) {
                    if (!User.isDragging && !User.pause) {
                        if (User.car.alive && User.isPlaying) {
                            User.car.update();
                            User.car.isOnTrack(paths);
                        } else {
                            User.car.reset();
                            User.car.el.style.zIndex = -1;
                            User.isPlaying = false;
                        }
                        if (runner.champ.alive) {
                            runner.champ.update();
                            runner.champ.isOnTrack(paths, curves);
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
                    acc -= runner.getStep();
                }
            }

            return resolve();
        });
    };

    setInterval(async () => {
        const ms = performance.now();
        if (!document.hidden) {
            await step(ms);
        }
        lastTime = ms;
    }, 1000 / 60);

    window.addEventListener("keydown", e => {
        keysDown[e.which] = true;
        keyChanged(User.car);
    });

    window.addEventListener("keyup", e => {
        keysDown[e.which] = false;
        keyChanged(User.car);
    });
};
