export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static len(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    update(x, y) {
        this.x = x;
        this.y = y;
    }

    mult(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    add(value) {
        if (value instanceof Vector) {
            this.x += value.x;
            this.y += value.y;
        } else if (value instanceof Number) {
            this.x += value;
            this.y += value;
        }
        return this;
    }

    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
}
