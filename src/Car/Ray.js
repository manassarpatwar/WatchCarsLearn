export default class Ray {
    constructor(tail, heading, length) {
        this.tail = tail;
        this.heading = heading;
        this.length = length;
        this.maxlength = length;
    }

    setLength(l) {
        this.length = l;
    }

    reset() {
        this.length = this.maxlength;
    }

    updateLength({ x, y }) {
        const newLength = Math.sqrt(
            Math.pow(this.tail.x - x, 2) + Math.pow(this.tail.y - y, 2)
        );
        this.setLength(newLength > this.maxlength ? this.maxlength : newLength);
    }

    getLine(len = this.length) {
        return {
            p1: {
                x: this.tail.x,
                y: this.tail.y,
            },
            p2: {
                x: this.tail.x + len * Math.cos(this.tail.angle + this.heading),
                y: this.tail.y + len * Math.sin(this.tail.angle + this.heading),
            }
        };
    }
}
