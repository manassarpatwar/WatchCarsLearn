class Ray{

    constructor(tail, heading, length){
        this.tail = tail;
        this.heading = heading;
        this.length = length;
        this.maxlength = length;
    }

    setLength(l){
        this.length = l
    }

    resetLength(){
        this.length = this.maxlength;
    }

    getPoint2(len = this.length){
        return createVector(this.tail.x+len*Math.cos(this.heading), this.tail.y+len*Math.sin(this.heading));
    }

    isHitting(boundary) {
        const x1 = boundary.x1;
        const x2 = boundary.x2;
        const y1 = boundary.y1;
        const y2 = boundary.y2;
        
        let point2 = this.getPoint2(this.maxlength)
        const x3 = this.tail.x;
        const x4 = point2.x;
        const y3 = this.tail.y;
        const y4 = point2.y;
        
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0)
        return;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        //    console.log(t);
        if (t >= 0 && t <= 1 && u > 0) {
            const x = x1 + t * (x2 - x1);
            const y = y1 + t * (y2 - y1);
            return createVector(x, y);
        } else {
            return false;
        }
    }
}