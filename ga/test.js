function testCrossover(){
    parent1 = new Genome();
    for(let i = 0; i < 3; i++){
        node = new NodeGene("INPUT", i);
        parent1.addNodeGene(node);
    }

    parent1.addNodeGene(new NodeGene("OUTPUT", 4));
    parent1.addNodeGene(new NodeGene("HIDDEN", 5));

    parent1.addConnectionGene(new ConnectionGene(1,4, true,1, 1))
    parent1.addConnectionGene(new ConnectionGene(2,4, false,1, 2))
    parent1.addConnectionGene(new ConnectionGene(3,4, true,1, 3))
    parent1.addConnectionGene(new ConnectionGene(2,5, true,1, 4))
    parent1.addConnectionGene(new ConnectionGene(5,4, true,1, 5))
    parent1.addConnectionGene(new ConnectionGene(1,5, true,1, 8))


    parent2 = new Genome();
    for(let i = 0; i < 3; i++){
        node = new NodeGene("INPUT", i+1);
        parent2.addNodeGene(node);
    }

    parent2.addNodeGene(new NodeGene("OUTPUT", 4));
    parent2.addNodeGene(new NodeGene("HIDDEN", 5));
    parent2.addNodeGene(new NodeGene("HIDDEN", 6));

    parent2.addConnectionGene(new ConnectionGene(1,4, true,1, 1))
    parent2.addConnectionGene(new ConnectionGene(2,4, false,1, 2))
    parent2.addConnectionGene(new ConnectionGene(3,4, true,1, 3))
    parent2.addConnectionGene(new ConnectionGene(2,5, true,1, 4))
    parent2.addConnectionGene(new ConnectionGene(5,4, false,1, 5))
    parent2.addConnectionGene(new ConnectionGene(5,6, true,1, 6))
    parent2.addConnectionGene(new ConnectionGene(6,4, true,1, 7))
    parent2.addConnectionGene(new ConnectionGene(3,5, true,1, 9))
    parent2.addConnectionGene(new ConnectionGene(1,6, true,1, 10))

    let child = Genome.crossover(parent2, parent1);
}

// function testNodeMutation(){}

// var NNcanvas = document.getElementById("NNcanvas");
// var NNctx = NNcanvas.getContext("2d");
// var NNw;
// var NNh;
// function setupNNCanvas(canvas) {
//     canvas.width = 250 * 2;
//     canvas.height = 250 * 2;
//     NNw = canvas.width;
//     NNh = canvas.height;
//     canvas.style.width = canvas.width / 2 + "px";
//     canvas.style.height = canvas.height / 2 + "px";
// };


// setupNNCanvas(NNcanvas);
// let i = new Counter();
// var innov = document.getElementById("innovation");

// parent1 = new Genome();
// for(let i = 0; i < 3; i++){
//     node = new NodeGene("INPUT", i);
//     parent1.addNodeGene(node);
// }

// parent1.addNodeGene(new NodeGene("OUTPUT", 4));
// parent1.addNodeGene(new NodeGene("HIDDEN", 5));

// parent1.addConnectionGene(new ConnectionGene(1,4,1, true,1))
// parent1.addConnectionGene(new ConnectionGene(2,4,1, false, 2))
// parent1.addConnectionGene(new ConnectionGene(3,4,1, true, 3))
// parent1.addConnectionGene(new ConnectionGene(2,5,1, true, 4))
// parent1.addConnectionGene(new ConnectionGene(5,4,1, true, 5))
// parent1.addConnectionGene(new ConnectionGene(1,5,1, true, 8))
// parent1.addConnectionGene(new ConnectionGene(3,5,1, true, 9))
// parent1.initialize(NNctx, NNw, NNh);
// parent1.draw()

// parent2 = new Genome();
// for(let i = 0; i < 3; i++){
//     node = new NodeGene("INPUT", i);
//     parent2.addNodeGene(node);
// }


// parent2.addNodeGene(new NodeGene("OUTPUT", 4));
// parent2.addNodeGene(new NodeGene("HIDDEN", 5));
// parent2.addNodeGene(new NodeGene("HIDDEN", 6));

// parent2.addConnectionGene(new ConnectionGene(1,4,1, true, 1))
// parent2.addConnectionGene(new ConnectionGene(2,4,1, false, 2))
// parent2.addConnectionGene(new ConnectionGene(3,4,1, true, 3))
// parent2.addConnectionGene(new ConnectionGene(2,5,1, true, 4))
// parent2.addConnectionGene(new ConnectionGene(5,4,1, false, 5))
// parent2.addConnectionGene(new ConnectionGene(5,6,1, true, 6))
// parent2.addConnectionGene(new ConnectionGene(6,4,1, true, 7))
// parent2.addConnectionGene(new ConnectionGene(3,5,1, true, 9))
// parent2.addConnectionGene(new ConnectionGene(1,6,1, true, 10))

// i.getInnovation()
// i.getInnovation()
// i.getInnovation()

// parent1.initialize(NNctx, NNw, NNh);
// parent1.draw()


// var NNcanvas2 = document.getElementById("NNcanvas2");
// var NNctx2 = NNcanvas2.getContext("2d");

// setupNNCanvas(NNcanvas2);

// parent2.initialize(NNctx2, NNw, NNh);
// parent2.draw()

// function addNodeMut(i){
//     parent1.addNodeMutation(i)
//     parent1.draw();

//     parent2.addNodeMutation(i)
//     parent2.draw();
//     innov.innerHTML = "";
//     innov.insertAdjacentHTML('beforeend', i.currentInnovation);
// }

// function addConMut(i){
//     parent1.addConnectionMutation(i)
//     parent1.draw();
// }