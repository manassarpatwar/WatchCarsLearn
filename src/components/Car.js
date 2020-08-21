import Vector from "./Vector.js";
import Ray from "./Ray.js";
import { create } from "../utils.js";
import Config from "../Config.js";

export default class Car {
    static getCar() {
        return this.cars++;
    }

    constructor(start, main) {
        this.p = new Vector(start.x, start.y);
        this.id = Car.getCar();
        this.el = create("div");
        this.el.classList.add("car");
        this.start = start;

        main.appendChild(this.el);

        this.velocity = 0;
        this.acceleration = 0;

        this.angle = -Math.PI / 2;
        this.steer = 0;
        this.steerAngle = 0;

        this.angularVelocity = 0;
        this.isThrottling = false;
        this.isReversing = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;

        this.rays = this.createRays();

        this.alive = true;

        this.checkpoints = {};
    }

    reset() {
        this.p.update(this.start.x, this.start.y);
        this.angle = -Math.PI / 2;
        this.velocity = 0;
        this.acceleration = 0;
        this.steer = 0;
        this.steerAngle = 0;

        this.angularVelocity = 0;
        this.isThrottling = false;
        this.isReversing = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.alive = true;
    }

    createRays() {
        const rays = [];
        let offset = -Math.PI / 6;
        for (let i = 0; i < 3; i++) {
            rays[i] = new Ray(this.p, this.angle, offset, 60);
            offset += Math.PI / 6;
        }
        return rays;
    }

    json() {
        return {
            id: this.id,
            x: this.p.x,
            y: this.p.y,
            velocity: this.velocity,
            acceleration: this.acceleration,
            angle: this.angle,
            steer: this.steer,
            steerAngle: this.steerAngle,
            angularVelocity: this.angularVelocity,
            isThrottling: this.isThrottling,
            isReversing: this.isReversing,
            isBraking: this.isBraking,
            isTurningLeft: this.isTurningLeft,
            isTurningRight: this.isTurningRight,
        };
    }

    display() {
        const translate = `translate(${this.p.x}px, ${this.p.y}px)`;
        const rotate = `rotate(${this.angle}rad)`;
        this.el.style.transform = translate + " " + rotate;
        this.el.style.background = this.alive ? "green" : "red";
    }

    update(dt = 0.01) {
        const throttle = this.isThrottling * Config.engineForce;
        const reverse = this.isReversing * Config.reverseForce;
        const braking =
            (Math.abs(this.velocity) < 0.5 ? 0 : this.velocity > 0 ? 1 : -1) *
            this.isBraking *
            Config.brakingForce;

        const steerInput = 1 * this.isTurningRight - 1 * this.isTurningLeft;

        if (Math.abs(steerInput) > 0.001) {
            //  Move toward steering input
            this.steer = Math.min(
                Math.max(this.steer + steerInput * dt * 1.0, -1.0),
                1.0
            ); // -inp.right, inp.left);
        } else {
            //  No steer input - move toward centre (0)
            if (this.steer > 0) {
                this.steer = Math.max(this.steer - dt * 0.1, 0);
            } else if (this.steer < 0) {
                this.steer = Math.min(this.steer + dt * 0.1, 0);
            }
        }

        const avel = Math.min(Math.abs(this.velocity) / Config.scale, 240.0); // m/s
        this.steer = this.steer * (1.0 - avel / 280.0);

        this.steerAngle = this.steer * Config.maxSteer * Config.scale;

        const Ftraction = throttle - reverse - braking;

        const Fdrag = -Config.Cdrag * Math.abs(this.velocity) * this.velocity;

        const Flong = (Ftraction + Fdrag) * Config.scale;

        this.acceleration = Flong / Config.mass;
        this.velocity += this.acceleration * dt;
        if (
            Math.abs(this.velocity) < 0.5 &&
            !this.isThrottling &&
            !this.isReversing
        ) {
            this.velocity = 0;
        }
        const dist = this.velocity * dt;
        this.p = Vector.fromAngle(this.angle).mult(dist).add(this.p);

        const R = Config.L / Math.sin(this.steerAngle);
        this.angularVelocity = this.velocity / R;
        this.angle += this.angularVelocity * dt;
        this.angle = this.angle % (Math.PI * 2);

        this.p.x +=
            Config.windowWidth * (this.p.x < 0) -
            Config.windowWidth * (this.p.x > Config.windowWidth);

        this.p.y +=
            Config.windowHeight * (this.p.y < 0) -
            Config.windowHeight * (this.p.y > Config.windowHeight);

        this.rays.forEach(ray => ray.update(this.p, this.angle));
    }

    checkRays(curves) {
        this.rays.forEach(ray => {
            ray.reset();
            curves.forEach(curve => {
                const [t] = curve.intersects(ray.getLine());
                if (t) {
                    ray.updateLength(curve.get(t));
                }
            });
        });

        // const [throttle, turn] = this.brain.activate(
        //     this.rays.map(r => (1-r.length/r.maxlength))
        // );
        // this.isThrottling = throttle >= 0.5;
        // this.isReversing = throttle < 0.5;
        // this.isTurningRight = turn >= 0.5;
        // this.isTurningLeft = turn < 0.5;
    }

    isOnTrack(paths) {
        const TRACKWIDTH = Config.TRACKWIDTH / 2 - Config.width / 4;
        const a = this.angle;
        const lines = [
            {
                p1: {
                    x: this.p.x - Math.cos(a) * TRACKWIDTH,
                    y: this.p.y - Math.sin(a) * TRACKWIDTH,
                },
                p2: {
                    x: this.p.x + Math.cos(a) * TRACKWIDTH,
                    y: this.p.y + Math.sin(a) * TRACKWIDTH,
                },
            },
            {
                p1: {
                    x: this.p.x - Math.cos(a + Math.PI / 2) * TRACKWIDTH,
                    y: this.p.y - Math.sin(a + Math.PI / 2) * TRACKWIDTH,
                },
                p2: {
                    x: this.p.x + Math.cos(a + Math.PI / 2) * TRACKWIDTH,
                    y: this.p.y + Math.sin(a + Math.PI / 2) * TRACKWIDTH,
                },
            },
        ];

        const previousScore = Object.values(this.checkpoints).reduce(
            (a, b) => a + b,
            0
        );

        this.alive = false;
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            let intersect = false;
            for (const line of lines) {
                const [t] = path.intersects(line);
                if (t) {
                    intersect = true;
                    this.checkpoints[i] = t;
                    break;
                }
            }
            if (intersect) {
                this.alive = true;
                break;
            }
        }

        // this.brain.score = Object.values(this.checkpoints).reduce(
        //     (a, b) => a + b,
        //     0
        // );
    }
}

Car.cars = 0;
