function Vector(x, y) {
    this.x = x;
    this.y = y;
}

class Ray {
    distance = 0;
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.vector = new Vector(this.x + Math.cos(this.angle), this.y + Math.sin(this.angle));
    }

    setAngle(a) {
        this.angle = a;
        this.vector.x = this.x + Math.cos(this.angle);
        this.vector.y = this.y + Math.sin(this.angle);
    }

    isHitting(boundary) {
        const x1 = boundary.x1;
        const x2 = boundary.x2;
        const y1 = boundary.y1;
        const y2 = boundary.y2;

        const x3 = this.x;
        const x4 = this.vector.x;
        const y3 = this.y;
        const y4 = this.vector.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0)
            return;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        //    console.log(t);
        if (t >= 0 && t <= 1 && u > 0) {
            const x = x1 + t * (x2 - x1);
            const y = y1 + t * (y2 - y1);
            return new Vector(x, y);
        } else {
            return false;
        }

    }

}
