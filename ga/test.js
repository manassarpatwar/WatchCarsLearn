function testCrossover(){
    parent1 = new Genome();
    for(let i = 0; i < 3; i++){
        node = new NodeGene("INPUT", i+1);
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

function testNodeMutation(){}

var NNcanvas = document.getElementById("NNcanvas");
var NNctx = NNcanvas.getContext("2d");
var NNw;
var NNh;
function setupNNCanvas(canvas, NNctx) {
    NNcanvas.width = 250 * 2;
    NNcanvas.height = 250 * 2;
    NNw = canvas.width;
    NNh = canvas.height;
    NNcanvas.style.width = NNcanvas.width / 2 + "px";
    NNcanvas.style.height = NNcanvas.height / 2 + "px";
};


setupNNCanvas(NNcanvas, NNctx);

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function VisualNode(vector, node){
    this.vector = vector;
    this.node = node;
}

class VisualizeGenome{
    w;
    h;
    ctx;
    constructor(genome, ctx, w, h){
        this.genome = genome;
        this.ctx = ctx;
        this.w = w;
        this.h = h;
        this.nodes = []
        this.inputs = [];
        this.outputs = [];
        this.hidden = [];
        for (let n of this.genome.getNodeGenes().values()) {
            if(n.getType() == "INPUT")
                this.inputs.push(n);
            else if(n.getType() == "OUTPUT")
                this.outputs.push(n);
            else if(n.getType() == "HIDDEN")
                this.hidden.push(n);
        }

        for(let i = 0; i < this.inputs.length; i++){
            let x = w/8;
            let y = h/(this.inputs.length*2)+h/this.inputs.length * i;
            this.nodes.push(new VisualNode(new Vector(x, y), this.inputs[i]));
        }

        for(let i = 0; i < this.hidden.length; i++){
            let x = Math.random()*6*w/8+w/8;
            let y = Math.random()*6*h/8+h/8;
            this.nodes.push(new VisualNode(new Vector(x, y), this.hidden[i]));
        }

        for(let i = 0; i < this.outputs.length; i++){
            let x = 7*w/8;
            let y = h/(this.outputs.length*2)+h/this.outputs.length * i;
            this.nodes.push(new VisualNode(new Vector(x, y), this.outputs[i]));
        }

        this.drawConnections();
        this.drawNodes();
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, 500, 500);
    }

    drawNodes(){
        for(let node of this.nodes){
            this.ctx.beginPath()
            this.ctx.arc(node.vector.x,node.vector.y,15,0,Math.PI*2);
            this.ctx.fillStyle = "white";
            this.ctx.fill();

            this.ctx.font = 25 + "px Arial";
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(node.node.getId(),node.vector.x-5, node.vector.y+10);
        }
    }

    drawConnections(){
        for(let con of this.genome.getConnectionGenes().values()){
            let inNode = 0;
            let outNode= 0;
            for(let i = 0; i < this.nodes.length; i++){
                if(this.nodes[i].node.getId() == con.getInNode())
                    inNode = this.nodes[i].vector;
                else if(this.nodes[i].node.getId() == con.getOutNode())
                    outNode = this.nodes[i].vector;;
            }
            this.ctx.beginPath()
            this.ctx.moveTo(inNode.x, inNode.y);
            this.ctx.lineTo(outNode.x, outNode.y);
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = "white";
            this.ctx.stroke();

        }
    }
}

parent1 = new Genome();
for(let i = 0; i < 3; i++){
    node = new NodeGene("INPUT", i+1);
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

v = new VisualizeGenome(parent1, NNctx, NNw, NNh);