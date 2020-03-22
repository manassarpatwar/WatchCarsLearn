class Boundary{
    x1;
    y1;
    x2;
    y2;
    
    constructor(x1, y1, x2, y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    getLength(){
        return dist(this.x1, this.y1, this.x2, this.y2);
    }
    
    setStart(p){
        this.x1 = p.x;
        this.y1 = p.y;
    }
    
    setEnd(p){
        this.x2 = p.x;
        this.y2 = p.y;
    }
    
    display(){
        push();
        stroke(100);
        strokeWeight(4);
        line(this.x1, this.y1, this.x2, this.y2); 
        pop();
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
        return createVector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
        
    }

    getAngle(){
        let a = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
        return a;
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
    
    static overlaps(boundary1, boundary2){
        const p0_x = boundary1.x1;
        const p0_y = boundary1.y1;
        const p1_x = boundary1.x2;
        const p1_y = boundary1.y2;
        const p2_x = boundary2.x1;
        const p2_y = boundary2.y1;
        const p3_x = boundary2.x2;
        const p3_y = boundary2.y2;
        
        
        
        var s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;
        s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;
        s2_y = p3_y - p2_y;
        
        var s, t;
        s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
        
        let m1 = s1_y/s1_x; 
        let m2 = s2_y/s2_x;
        
        //If they have the same slope check for the points to intersect
        if(m1 == m2)
        return ((p0_x - p2_x)*(p0_y - p3_y) - (p0_x - p3_x)*(p0_y - p2_y) == 0 || (p1_x - p2_x)*(p1_y - p3_y) - (p1_x - p3_x)*(p1_y - p2_y) == 0);
        
        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    }
    
}