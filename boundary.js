class Boundary{
    
    constructor(p1, p2) {
        this.x1 = p1.x;
        this.y1 = p1.y;
        this.x2 = p2.x;
        this.y2 = p2.y;
    }

    getPoint1(){
        return createVector(this.x1, this.y1)
    }

    getPoint2(){
        return createVector(this.x2, this.y2)
    }

    display(){
        line(this.x1, this.y1, this.x2, this.y2); 
    }

    getLength(){
        return getDist(this.x1, this.y2, this.x1, this.y2);
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
        return createVector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));

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

const TRACKWIDTH = 20;
let initPos = null;
let startDrawingBoundary = false;
let clicks = 0;

function drawTracks(){
    zoom = 0;
    if (startDrawingBoundary) {
        let mouseVector =  createVector(mouseX, mouseY);
        if (initPos == null)
        initPos = mouseVector;
        let newX = mouseX;
        let newY = mouseY;
        let initX = initPos.x;
        let initY = initPos.y;
        let d = dist(newX, newY, initX, initY);
        if(initPos != null && d > 15 && d < 25){
            let alpha = Math.atan2(newY - initY, newX - initX);
            
            let t = new Boundary(initPos, mouseVector);
            if(paths.length > 0){
                let noDraw = Math.abs(Boundary.getAngle(t, paths[paths.length-1])) > 1
                console.log(noDraw)
                if(noDraw)
                    return;
            }
            paths.push(t);
            
            let innerB = new Boundary(createVector(initX-TRACKWIDTH*Math.sin(alpha), initY+TRACKWIDTH*Math.cos(alpha)), createVector(newX-TRACKWIDTH*Math.sin(alpha), newY+TRACKWIDTH*Math.cos(alpha)));
            let outerB = new Boundary(createVector(initX+TRACKWIDTH*Math.sin(alpha), initY-TRACKWIDTH*Math.cos(alpha)), createVector(newX+TRACKWIDTH*Math.sin(alpha), newY-TRACKWIDTH*Math.cos(alpha)));
            
            if(innerTrack.length > 0){
                let int = Boundary.getIntersection(innerB, innerTrack[innerTrack.length-1]);
                if(int == null)
                    return;
                innerB.setStart(int);
                innerTrack[innerTrack.length-1].setEnd(int);
            }
            
            if(outerTrack.length > 0){
                let int = Boundary.getIntersection(outerB, outerTrack[outerTrack.length-1]);
                if(int == null)
                    return;
                outerB.setStart(int);
                outerTrack[outerTrack.length-1].setEnd(int);
            }
            innerTrack.push(innerB);
            outerTrack.push(outerB);
            initPos = createVector(newX, newY);
        }
    }
}

function clearTrack(){
    innerTrack = [];
    outerTrack = [];
    paths = [];
    localStorage.removeItem("innerTrack");
    localStorage.removeItem("outerTrack");
    localStorage.removeItem("paths");
}

function drawTrack(){
    clearTrack();
    let clicks = 0;
    window.addEventListener("click", function(){
        if(clicks > 0)
            startDrawingBoundary = !startDrawingBoundary;
        if(startDrawingBoundary == false && clicks > 0){
            innerTrack.push(new Boundary(innerTrack[innerTrack.length-1].getPoint2(), innerTrack[0].getPoint1()));
            outerTrack.push(new Boundary(outerTrack[outerTrack.length-1].getPoint2(), outerTrack[0].getPoint1()));
            paths.push(new Boundary(paths[paths.length-1].getPoint2(), paths[0].getPoint1()))

            localStorage.setItem("innerTrack", JSON.stringify(innerTrack));
            localStorage.setItem("outerTrack", JSON.stringify(outerTrack));
            localStorage.setItem("paths", JSON.stringify(paths));
            initPos = null;
            this.removeEventListener('click', arguments.callee, false);
            this.removeEventListener('mousemove', drawTracks);
        }
        clicks++;
    })
    window.addEventListener("mousemove", drawTracks);
}