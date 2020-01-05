class Boundary {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    drawBoundary(color = "255, 255, 255") {
        drawLine(this.x1, this.y1, this.x2, this.y2, 0.6, 4, color);
    }

    getLength(){
        return getDist(this.x1, this.x2, this.y1, this.y2);
    }

    setStart(p){
        this.x1 = p.x;
        this.y1 = p.y;
    }

    setEnd(p){
        this.x2 = p.x;
        this.y2 = p.y;
    }

    static getAngle(boundary1, boundary2){
        const x1 = boundary1.x1;
        const x2 = boundary1.x2;
        const y1 = boundary1.y1;
        const y2 = boundary1.y2;

        const x3 = boundary2.x1;
        const x4 = boundary2.x2;
        const y3 = boundary2.y1;
        const y4 = boundary2.y2;

        var dAx = x2 - x1;
        var dAy = y2 - y1;
        var dBx = x4 - x3;
        var dBy = y4 - y3;
        var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);

        return angle;
    }

    static getIntersection(boundary1, boundary2){
        const x1 = boundary1.x1;
        const x2 = boundary1.x2;
        const y1 = boundary1.y1;
        const y2 = boundary1.y2;

        const x3 = boundary2.x1;
        const x4 = boundary2.x2;
        const y3 = boundary2.y1;
        const y4 = boundary2.y2;
        var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
        if (denom == 0) {
            return null;
        }
        ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
        ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
        return new Vector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));

        // {
        //     x: x1 + ua * (x2 - x1),
        //     y: y1 + ua * (y2 - y1),
        //     seg1: ua >= 0 && ua <= 1,
        //     seg2: ub >= 0 && ub <= 1
        // };
    }

    static intersects(boundary1, boundary2) {
        const a = boundary1.x1;
        const b = boundary1.x2;
        const c = boundary1.y1;
        const d = boundary1.y2;

        const p = boundary2.x1;
        const q = boundary2.x2;
        const r = boundary2.y1;
        const s = boundary2.y2;
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
          return false;
        } else {
          lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
          gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
          return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };

    static distance(boundary, x0, y0) {
        const x1 = boundary.x1;
        const x2 = boundary.x2;
        const y1 = boundary.y1;
        const y2 = boundary.y2;

        return ((Math.abs((y2 - y1) * x0 - 
                         (x2 - x1) * y0 + 
                         x2 * y1 - 
                         y2 * y1)) /
                (Math.pow((Math.pow(y2 - y1, 2) + 
                           Math.pow(x2 - x1, 2)), 
                          0.5)));
    }
}
