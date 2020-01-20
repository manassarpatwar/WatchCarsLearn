class Boundary{
    point1;
    point2;
    
    constructor(p1, p2){
        this.point1 = p1;
        this.point2 = p2;
    }
    
    setStart(p){
        this.point1 = p;
    }
    
    setEnd(p){
        this.point2 = p;
    }
    
    display(){
        line(this.point1.x, this.point1.y, this.point2.x, this.point2.y); 
    }
    
    static getIntersection(boundary1, boundary2){
        const x1 = boundary1.point1.x;
        const x2 = boundary1.point2.x;
        const y1 = boundary1.point1.y;
        const y2 = boundary1.point2.y;
        
        const x3 = boundary2.point1.x;
        const x4 = boundary2.point2.x;
        const y3 = boundary2.point1.y;
        const y4 = boundary2.point2.y;
        var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
        if (denom == 0) {
            return null;
        }
        ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
        ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
        return createVector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
        
    }
    
    static intersects(boundary1, boundary2) {
        const a = boundary1.point1.x;
        const b = boundary1.point2.x;
        const c = boundary1.point1.y;
        const d = boundary1.point2.y;
        
        const p = boundary2.point1.x;
        const q = boundary2.point2.x;
        const r = boundary2.point1.y;
        const s = boundary2.point2.y;
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
        const p0_x = boundary1.point1.x;
        const p0_y = boundary1.point1.y;
        const p1_x = boundary1.point2.x;
        const p1_y = boundary1.point2.y;
        const p2_x = boundary2.point1.x;
        const p2_y = boundary2.point1.y;
        const p3_x = boundary2.point2.x;
        const p3_y = boundary2.point2.y;
        
        
        
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