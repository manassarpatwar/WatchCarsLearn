var population;
var inputs = [[0,0], [0,1], [1,0], [1,1]]
var outputs = [0, 1, 1, 0]
var p;
var layers;
var innovationCounter = new InnovationCounter(1);


function setup(){
    createCanvas(windowWidth, windowHeight);
    population = new Population(100, 2, 1);
}

function draw(){
    background(0);
    fill(255);

    if(population.gen < 10000 && population.bestScore < 4){
        for(let p of population.population){
            for(let i = 0; i < inputs.length; i++){
                p.look(inputs[i]);
                if(p.think() == outputs[i])
                    p.score++;

                // console.log(p.think() + " "+ outputs[i]+" "+p.score);
            }
            p.dead = true;
        }
        if(population.done()){
            population.naturalSelection();
            drawBest(population.best);
        }
    }

    if(population.bestScore == 4){
        drawBest(population.best);
    }
}

function drawBest(p){
    p.brain.computeDrawCoordinates();
    let xOffset = 20;
    push();
    for(let c of p.brain.connections.values()){
        if(c.isEnabled()){
            stroke(0,255,0)
        }else{
            stroke(255, 0, 0);
        }
        line(p.brain.nodes.get(c.inNode).vector.x + xOffset, p.brain.nodes.get(c.inNode).vector.y, p.brain.nodes.get(c.outNode).vector.x + xOffset, p.brain.nodes.get(c.outNode).vector.y)
    }
    pop();
    push();
    for(let n of p.brain.nodes.values()){
        if(n.type == "INPUT"){
            text("INPUT", xOffset-10, n.vector.y+ n.radius/2);
        }
        else if(n.type == "BIAS"){
            text("BIAS", xOffset-10, n.vector.y+ n.radius/2);
        }
        fill(255,255,255);
        ellipse(n.vector.x + xOffset, n.vector.y, n.radius,  n.radius);
    }
    pop();
}