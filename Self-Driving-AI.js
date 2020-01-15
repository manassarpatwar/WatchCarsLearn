let paths;
let innerTrack;
let outerTrack;

var nextConnectionNo = 1000;
var population;
var speed = 60;


var showBest = false; //true if only show the best of the previous generation
var runBest = false; //true if replaying the best ever game
var humanPlaying = false; //true if the user is playing

var humanPlayer;


var showBrain = false;
var showBestEachGen = false;
var upToGen = 0;
var genPlayerTemp; //player

var showNothing = false;


function setup() {
    paths = [];
    innerTrack = [];
    outerTrack = [];
    carStartCoords = [];
    let storedCarCoords = JSON.parse(localStorage.getItem("storedCarStartCoords"));
    
    if (storedCarCoords) {
        carStartX = storedCarCoords[0];
        carStartY = storedCarCoords[1];
    }
    
    let storedInnerTrack = JSON.parse(localStorage.getItem("innerTrack"));
    let storedOuterTrack = JSON.parse(localStorage.getItem("outerTrack"));
    let storedPaths = JSON.parse(localStorage.getItem("paths"));
    if(storedInnerTrack){
        for (let b of storedInnerTrack)
        innerTrack.push(new Boundary(createVector(b.x1, b.y1), createVector(b.x2, b.y2)));
    }
    
    if(storedOuterTrack){
        for (let b of storedOuterTrack)
        outerTrack.push(new Boundary(createVector(b.x1, b.y1), createVector(b.x2, b.y2)));
    }
    
    if(storedPaths){
        for (let p of storedPaths)
        paths.push(new Boundary(createVector(p.x1, p.y1), createVector(p.x2, p.y2)));
    }
    createCanvas(windowWidth, windowHeight);
    
    population = new Population(200);
    humanPlayer = new Car();
}

function setCarPos() {
    setCarPosition = true;
    zoom = 0;
    zoomOutCanvas();
    let clicks = 0;
    
    cursor('img/placeCursor.png', 32, 64);
    
    window.addEventListener("click", function (e) {
        if(clicks > 0){
            carStartX = mouseX;
            carStartY = mouseY;
            this.removeEventListener('click', arguments.callee, false);
            carStartCoords = [];
            carStartCoords.push(carStartX);
            carStartCoords.push(carStartY);
            localStorage.setItem("storedCarStartCoords", JSON.stringify(carStartCoords));
            for(let p of population.players){
                p.x = carStartX;
                p.y = carStartY;
            }
            humanPlayer.x = carStartX;
            humanPlayer.y = carStartY;
            cursor(ARROW);
        }
        clicks++;
    });
    
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

let zoom = 0;
let maxZoom = 7;
function zoomInCanvas(){
    if(zoom < maxZoom)
    zoom += 1;
}

function zoomOutCanvas(){
    if(zoom > 0)
    zoom -= 1;
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

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

const cars = [humanPlayer];
const carsById = {};

const keysDown = {};

let needResize;
let resizing;

window.addEventListener('keydown', e => {
    keysDown[e.which] = true;
});

window.addEventListener('keyup', e => {
    keysDown[e.which] = false;
});

let lastTime;
let acc = 0;
const step = 1 / 120;

setInterval(() => {
    if(humanPlayer != null){
        const canTurn = humanPlayer.power > 0.0025 || humanPlayer.reverse;
        
        const pressingUp = keyActive('up');
        const pressingDown = keyActive('down');
        
        if (humanPlayer.isThrottling !== pressingUp || humanPlayer.isReversing !== pressingDown) {
            humanPlayer.isThrottling = pressingUp;
            humanPlayer.isReversing = pressingDown;
        }
        
        const turnLeft = canTurn && keyActive('left');
        const turnRight = canTurn && keyActive('right');
        
        if (humanPlayer.isTurningLeft !== turnLeft) {
            humanPlayer.isTurningLeft = turnLeft;
        }
        if (humanPlayer.isTurningRight !== turnRight) {
            humanPlayer.isTurningRight = turnRight;
        }
        
        if (humanPlayer.x > windowWidth) {
            humanPlayer.x -= windowWidth;
        } else if (humanPlayer.x < 0) {
            humanPlayer.x += windowWidth;
        }
        
        if (humanPlayer.y > windowHeight) {
            humanPlayer.y -= windowHeight;
        } else if (humanPlayer.y < 0) {
            humanPlayer.y += windowHeight;
        }
        
        const ms = Date.now();
        if (lastTime) {
            acc += (ms - lastTime) / 1000;
            
            while (acc > step) {
                // if(humanPlaying)
                // humanPlayer.update();
                // else
                // update();
                acc -= step;
            }
        }
        
        lastTime = ms;
    }
}, 10 / 60);

function showHumanPlaying() {
    if (!humanPlayer.dead) { //if the player isnt dead then move and show the player based on input
        humanPlayer.look();
        humanPlayer.update();
        humanPlayer.show();
    } else { //once done return to ai
        humanPlayer = new Car();
    }
}

function showBestPlayersForEachGeneration() {
    if (!genPlayerTemp.dead) { //if current gen player is not dead then update it
        
        genPlayerTemp.look();
        genPlayerTemp.think();
        genPlayerTemp.update();
        genPlayerTemp.show([0,255,0]);
    } else { //if dead move on to the next generation
        upToGen++;
        if (upToGen >= population.genPlayers.length) { //if at the end then return to the start and stop doing it
            upToGen = 0;
            showBestEachGen = false;
        } else { //if not at the end then get the next generation
            genPlayerTemp = population.genPlayers[upToGen].cloneForReplay();
        }
    }
}

function drawBrain() { //show the brain of whatever genome is currently showing
    var startX = 500; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    var startY = 0;
    var w = 1000;
    var h = 500;
    
    if (runBest) {
        population.bestPlayer.brain.drawGenome(startX, startY, w, h);
    } else
    if (humanPlaying) {
        showBrain = false;
    } else if (showBestEachGen) {
        genPlayerTemp.brain.drawGenome(startX, startY, w, h);
    } else {
        population.players[0].brain.drawGenome(startX, startY, w, h);
    }
}

function draw() {
    background(0);
    stroke(255);
    
    if(zoom > 0){
        if(population.bestPlayer){
            translate(-zoom * population.bestPlayer.x+width/2, -zoom * population.bestPlayer.y+height/2);
            scale(zoom);
        }
        
    }
    push();
    drawBrain();
    pop();
    push()
    noStroke();
    fill(50,50,50);
    beginShape();
    for(let b of innerTrack){
        vertex(b.x1, b.y1);
    }
    endShape(CLOSE);
    pop();
    
    // fill(255);
    // textSize(16);
    // text(frameRate(), 50, 500);
    
    for(let t of innerTrack){
        t.display();
    }
    
    for(let t of outerTrack){
        t.display();
    }
    if (showBestEachGen) { //show the best of each gen
        showBestPlayersForEachGeneration();
    } else if (humanPlaying) { //if the user is controling the ship[
        showHumanPlaying();
    } else if (runBest) { // if replaying the best ever game
        showBestEverPlayer();
    } else { //if just evolving normally
        if (!population.done()) { //if any players are alive then update them
            population.updateAlive();
          } else { //all dead
            //genetic algorithm
            population.naturalSelection();
          }
    }
    
    
}

function keyPressed() {
    switch (key) {
        case ' ':
        //toggle showBest
        showBest = !showBest;
        break;
        case 'B': //run the best
        runBest = !runBest;
        break;
        case 'G': //show generations
        showBestEachGen = !showBestEachGen;
        upToGen = 0;
        genPlayerTemp = population.genPlayers[upToGen].clone();
        break;
        case 'N': //show absolutely nothing in order to speed up computation
        showNothing = !showNothing;
        break;
        case 'P': //play
        humanPlaying = !humanPlaying;
        humanPlayer = new Car();
        break;
    }
}
