class Config {
    constructor() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.scale = 5;
        this.Cdrag = 0.99;
        this.Crr = 0;
        this.mass = 1200;
        this.inertiaScale = 1;
        this.maxSteer = 0.6;
        this.angularDrag = 0.95;
        this.width = 4 * this.scale;
        this.height = 2 * this.scale;
        this.engineForce = 8000 * this.scale;
        this.reverseForce = 12000 * this.scale;
        this.brakingForce = (this.reverseForce * 3.5) / 2.5;
        this.inertia = this.mass * this.inertiaScale;

        this.borderRadius = this.width / 8;
        this.L = this.width / 2;
        this.TRACKWIDTH = 40;

        this.POP_SIZE = 100;
        // neural network settings

        this.MUTATION_RATE = 0.5;
        this.MUTATION_AMOUNT = 3;
        this.ELITISM = Math.round(0.2 * this.POP_SIZE);
    }
}

export default new Config();
