class Car {
    pos;
    rays;

    constructor() {
        pos = new PVector(50, 50);
        rays = new PVector[360];
        let offset = 0;
        for (let i = 0; i < rays.length; i++) {
            rays[i] = new PVector(pos.x + Math.sin(offset), pos.y - Math.cos(offset));
            offset += Math.PI / 180;
        }
    }

    display() {
        //ellipse(pos.x, pos.y, 50, 50);
        for (let ray of this.rays) {
            line(pos.x, pos.y, 2 * ray.x, 2 * ray.y);
        }
    }
}