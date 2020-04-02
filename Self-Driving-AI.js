
var innovationCounter = new InnovationCounter(1);
let paths;
let innerTrack;
let outerTrack;

let tempPath;
let tempInner1;
let tempOuter1;
let tempInner2;
let tempOuter2;

let checkpoints;
let humanPlaying = true;

let localCar = null;
let carSettings;
let populationSize = 100;

const TRACKWIDTH = 16;

const maxPower = 0.075*2;
const maxReverse = 0.0375*2;
const powerFactor = 0.001*2;
const reverseFactor = 0.0005*2;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

let initPos = null;
let initLeft = null;
let initRight = null;
let startDrawingBoundary = false;
let clicks = 0;
let drawingTrack = false;

function addFillerCheckpoints(initX, initY, checkpointLength, alpha){
    let checkpointDist = 15;
    let fillerLength = checkpointDist;

    while(fillerLength < checkpointLength){
        checkpoints.push(new Boundary(initX-TRACKWIDTH*Math.sin(alpha), initY+TRACKWIDTH*Math.cos(alpha), initX+TRACKWIDTH*Math.sin(alpha), initY-TRACKWIDTH*Math.cos(alpha)));
        initX += checkpointDist*Math.cos(alpha);
        initY += checkpointDist*Math.sin(alpha);
        
        fillerLength += checkpointDist;
    }
}


function drawTracks(){

    if (startDrawingBoundary) {
        let mouseVector =  createVector(mouseX, mouseY);
        if (initPos == null)
            initPos = mouseVector;

        let newX = mouseX;
        let newY = mouseY;
        let initX = initPos.x;
        let initY = initPos.y;

        let t = new Boundary(initX, initY, newX, newY);
        let diffAngle = 0;
        if(paths.length > 0){
            diffAngle = Math.abs(t.getAngle() - paths[paths.length-1].getAngle());
            diffAngle = diffAngle > Math.PI ? Math.PI*2-diffAngle : diffAngle;
            textAlpha = diffAngle;
        }

        tempPath = t;
        let length = dist(newX, newY, initX, initY);


        if(innerTrack.length > 0 && outerTrack.length > 0){
            tempInner1 = new Boundary(innerTrack[innerTrack.length-1].x2, innerTrack[innerTrack.length-1].y2,t.getLeftPoint().x, t.getLeftPoint().y);
            tempOuter1 = new Boundary(outerTrack[outerTrack.length-1].x2, outerTrack[outerTrack.length-1].y2, t.getRightPoint().x, t.getRightPoint().y);
            tempInner2 = new Boundary(tempInner1.x2, tempInner1.y2, t.getLeftPoint("END").x, t.getLeftPoint("END").y);
            tempOuter2 = new Boundary(tempOuter1.x2, tempOuter1.y2, t.getRightPoint("END").x, t.getRightPoint("END").y);
        }
        if(initPos != null && length > 30){
            paths.push(t);
            if(paths.length > 1){
                let p0 = paths[paths.length-2];
                let p1 = paths[paths.length-1];
                let a =Math.atan2(p1.y2-p0.y1, p1.x2-p0.x1);
                let leftPoint = createVector(p0.x2+TRACKWIDTH*Math.cos(a-Math.PI/2), p0.y2+TRACKWIDTH*Math.sin(a-Math.PI/2));
                let rightPoint = createVector(p0.x2+TRACKWIDTH*Math.cos(a+Math.PI/2), p0.y2+TRACKWIDTH*Math.sin(a+Math.PI/2));

                innerTrack.push(new Boundary(initLeft.x, initLeft.y, leftPoint.x, leftPoint.y));
                outerTrack.push(new Boundary(initRight.x, initRight.y, rightPoint.x, rightPoint.y));

               
                initLeft = leftPoint;
                initRight = rightPoint;
            }else{
                initLeft = t.getLeftPoint();
                initRight = t.getRightPoint();
            }

            // addFillerCheckpoints(t.x1, t.y1, t.getLength(), t.getAngle());

            

            initPos = createVector(newX, newY);
        }
    }
}

function drawTrack(){
    innerTrack = [];
    outerTrack = [];
    paths = []
    checkpoints = [];
    localStorage.removeItem("innerTrack");
    localStorage.removeItem("outerTrack");
    localStorage.removeItem("paths");
    localStorage.removeItem("checkpoints");
    initPos = null;
    drawingTrack = true;
    let clicks = 0;
    window.addEventListener("click", function(){
        if(clicks > 0)
            startDrawingBoundary = !startDrawingBoundary;
        if(startDrawingBoundary == false && clicks > 0){
            paths.push(tempPath);
            innerTrack.push(tempInner1);
            innerTrack.push(tempInner2);
            outerTrack.push(tempOuter1);
            outerTrack.push(tempOuter2);

            tempPath = null;
            tempInner1 = null;
            tempInner2 = null;
            tempOuter1 = null;
            tempOuter2 = null;
            this.removeEventListener('click', arguments.callee, false);
            this.removeEventListener('mousemove', drawTracks);
            localStorage.setItem("innerTrack", JSON.stringify(innerTrack));
            localStorage.setItem("outerTrack", JSON.stringify(outerTrack));
            localStorage.setItem("paths", JSON.stringify(paths));
            for(let i = 0; i < innerTrack.length; i++){
                checkpoints.push(new Boundary(innerTrack[i].x1, innerTrack[i].y1, outerTrack[i].x1, outerTrack[i].y1));
            }

            localStorage.setItem("checkpoints", JSON.stringify(checkpoints));
        
        }
        clicks++;
    })
    window.addEventListener("mousemove", drawTracks);
}

const arrowKeys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39
};
const wasdKeys = {
    up: 87,
    down: 83,
    left: 65,
    right: 68
};

const keyActive = (key) => {
    return keysDown[arrowKeys[key]] || keysDown[wasdKeys[key]] || false;
};


const keysDown = {};

window.addEventListener('keydown', e => {
    keysDown[e.which] = true;
});

window.addEventListener('keyup', e => {
    keysDown[e.which] = false;
});

function checkOverlap(car){
    let boundaries = innerTrack.concat(outerTrack);
    let overlap = false;
    for(let b of boundaries){
        for(let border of car.borders){
            if(Boundary.overlaps(border, b)){
                overlap = true;
                break
            }
        }
        if(overlap)
            break
    }

    return overlap;
}

function calculateCheckpoints(car){
    let overlap = false;
    for(let i = 0; i < checkpoints.length; i++){
        for(let border of car.borders){
            if(Boundary.overlaps(border, checkpoints[i])){
                overlap = true;
                break
            }
        }
        if(overlap){
            car.addCheckpoint(i);
            break;
        }
    }
}

function displayTracks(){
    for (let t of innerTrack) {
        t.display();
    }

    // for(let t of paths){
    //     t.display();
    // }

    // if(tempPath)
    //     tempPath.display();

    // for(let c of checkpoints){
    //     c.display();
    // }
    
    if(tempInner1 && tempInner2 && tempOuter1 && tempOuter2){
        tempInner1.display();
        tempInner2.display();
        tempOuter1.display();
        tempOuter2.display();
    }

    for (let t of outerTrack) {
        t.display();
    }
}
