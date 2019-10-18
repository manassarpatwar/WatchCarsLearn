function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function VisualNode(vector, node){
    this.vector = vector;
    this.node = node;
}

class Genome {
    constructor(numInputs, numOutputs) {
        this.connections = new Map();
        this.nodes = new Map();
        this.visible = false;
        this.PROBABILITY_MUTATION = 0.9;

        this.numInputs = numInputs;
        this.numOutputs = numOutputs;

        this.inputs = [];
        this.outputs = [];
        this.hidden = [];

        for(let i = 0; i < numInputs; i++){
            let node = new NodeGene("INPUT", i);
            this.addNodeGene(node);
            this.inputs.push(node);
        }

        for(let i = 0; i < numOutputs; i++){
            let node = new NodeGene("OUTPUT", i+numInputs);
            this.addNodeGene(node);
            this.outputs.push(node);
        }

        this.addConnectionGene(new ConnectionGene(this.inputs[Math.floor(Math.random()*this.inputs.length)].getInnovation(), this.outputs[Math.floor(Math.random()*this.outputs.length)].getInnovation(), 1, true, numInputs+numOutputs+1))
    }

    copy(){
        let copy = new Genome();
        copy.nodes = new Map(this.nodes);
        copy.connections = new Map(this.connections);

        return copy;
    }

    think(inputs){
        for(let con of this.connections.values()){
            
        }
    }

    addNodeGene(gene){
        this.nodes.set(gene.getInnovation(), gene);
    }

    addConnectionGene(gene){
        this.connections.set(gene.getInnovation(), gene);
        this.innovation++;
    }

    getNodeGenes(){
        return this.nodes;
    }

    getConnectionGenes(){
        return this.connections;
    }

    mutatation(){
        for(let con of this.connections.values()){
            if(Math.random() < this.PROBABILITY_MUTATION){
                con.setWeight(con.getWeight()*(Math.random()*4-2))
            }else{
                con.setWeight(Math.random()*4-2);
            }
        }
    }

    addConnectionMutation(innovation){
        let nodes = Array.from(this.nodes.values())
        let node1 = nodes[Math.floor(Math.random()*nodes.length)];
        let node2 = nodes[Math.floor(Math.random()*nodes.length)];

        let reversed = false;
        if(node1.getType() == "HIDDEN" && node2.getType() == "INPUT"){
            reversed = true;
        }else if(node1.getType() == "OUTPUT" && node2.getType() == "HIDDEN"){
            reversed = true;
        }else if(node1.getType() == "OUTPUT" && node2.getType() == "INPUT"){
            reversed = true;
        }

        let connectionExists = false;
        for(let con of this.connections.values()){
            if(con.getInNode() == node1.getInnovation() && con.getOutNode() == node2.getInnovation()){
                connectionExists = true;
                break;
            }else if(con.getInNode() == node2.getInnovation() && con.getOutNode() == node1.getInnovation()){
                connectionExists = true;
                break;
            }
        }

        if(connectionExists)
            return

        let newCon = new ConnectionGene(reversed ? node2.getInnovation() : node1.getInnovation(), 
        reversed ? node1.getInnovation() : node2.getInnovation(), Math.random()*2-1, true, innovation.getInnovation())

        this.connections.set(newCon.getInnovation(), newCon)

    }

    addNodeMutation(connectionInnovation, nodeInnovation){
        let cons = Array.from(this.connections.values())
        let con = cons[Math.floor(Math.random()*cons.length)];
        console.log("mutated");
        let inNode = this.nodes.get(con.getInNode());
        let outNode = this.nodes.get(con.getOutNode());

        con.disable();

        let newNode = new NodeGene("HIDDEN", nodeInnovation.getInnovation())
        let inToNew = new ConnectionGene(inNode.getInnovation(), newNode.getInnovation(), 1, true, connectionInnovation.getInnovation());
        let newToOut = new ConnectionGene(newNode.getInnovation(), outNode.getInnovation(), con.getWeight(), true, connectionInnovation.getInnovation());

        this.addNodeGene(newNode);
        this.addConnectionGene(inToNew);
        this.addConnectionGene(newToOut);

        this.hidden.push(newNode);

        //Drawing
        if(this.visible){
            let x = Math.random()*this.w/2+this.w/4;
            let y = Math.random()*this.h/2+this.h/4;
            this.vNodes.push(new VisualNode(new Vector(x, y), newNode));
        }

    }

    /*Parent 1 is more fit than parent 2*/
    static crossover(parent1, parent2){
        let child = new Genome();

        for(let parent1Node of parent1.getNodeGenes().values()){
            child.addNodeGene(parent1Node.copy())
        }

        for(let parent1Node of parent1.getConnectionGenes().values()){
            if(parent2.getConnectionGenes().has(parent1Node.getInnovation())){
                let childConGene = Math.random() >= 0.5 ? parent1Node.copy() : parent2.getConnectionGenes().get(parent1Node.getInnovation()).copy();
                child.addConnectionGene(childConGene);
            }else{
                let childConGene = parent1Node.copy();
                child.addConnectionGene(childConGene);
            }
        }

        return child;
    }

    static compatibilityDistance(genome1, genome2, c1, c2,c3, N){
        let genes = this.countGenes(genome1, genome2);
        let excessGenes = genes.excessGenes;
        let disjointGenes = genes.disjointGenes;
        let avgWeightDifference = genes.avgWeightDifference;

        return excessGenes*c1/N+disjointGenes*c2/N+avgWeightDifference*c3
    }

    static countGenes(genome1, genome2){
        let matchingGenes = 0;
        let disjointGenes = 0;
        let excessGenes = 0;
        let weightDifference = 0;

        let nodeKeys1 = Array.from(genome1.nodes.keys()).sort((a, b) => a - b);
        let nodeKeys2 = Array.from(genome2.nodes.keys()).sort((a, b) => a - b);

        let highestInnovation1 = nodeKeys1[nodeKeys1.length-1];
        let highestInnovation2 = nodeKeys2[nodeKeys2.length-1];
        let indices = Math.max(highestInnovation1, highestInnovation2);
        
        for(let i = 0; i < indices; i++){
            let node1 = genome1.getNodeGenes().get(i);
            let node2 = genome2.getNodeGenes().get(i);

            if(node1 != null && node2 != null)
                matchingGenes++;

            if(node1 == null && highestInnovation1 > i && node2 != null)
                disjointGenes++;
            else if(node2 == null && highestInnovation2 > i && node1 != null)
                disjointGenes++;

            if(node1 == null && highestInnovation1 < i && node2 != null)
                excessGenes++;
            if(node2 == null && highestInnovation2 < i && node1 != null)
                excessGenes++;
        }
        let conKeys1 = Array.from(genome1.connections.keys()).sort((a, b) => a - b);
        let conKeys2 = Array.from(genome2.connections.keys()).sort((a, b) => a - b);

        highestInnovation1 = conKeys1[conKeys1.length-1];
        highestInnovation2 = conKeys2[conKeys2.length-1];
        indices = Math.max(highestInnovation1, highestInnovation2);
        console.log(indices+" "+conKeys1+" "+conKeys2);
        for(let i = 1; i <= indices; i++){
            let con1 = genome1.getConnectionGenes().get(i);
            let con2 = genome2.getConnectionGenes().get(i);

            if(con1 != null && con2 != null){
                matchingGenes++;
                weightDifference += Math.abs(con1.getWeight() - con2.getWeight());
            }

            if(con1 == null && highestInnovation1 > i && con2 != null)
                disjointGenes++;
            else if(con2 == null && highestInnovation2 > i && con1 != null)
                disjointGenes++;
                
            if(con1 == null && highestInnovation1 < i && con2 != null)
                excessGenes++;
            else if(con2 == null && highestInnovation2 < i && con1 != null)
                excessGenes++;
        }
        let avgWeightDifference = weightDifference/matchingGenes;
        return {disjointGenes: disjointGenes, excessGenes: excessGenes, avgWeightDifference: avgWeightDifference};
    }


    //Drawing on canvas
    initialize(ctx, w, h){
        this.visible = true;
        this.w = w;
        this.h = h;
        this.ctx = ctx;
        this.vNodes = []
        this.inputs = [];
        this.outputs = [];
        this.hidden = [];
        for (let n of this.getNodeGenes().values()) {
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
            this.vNodes.push(new VisualNode(new Vector(x, y), this.inputs[i]));
        }

        for(let i = 0; i < this.hidden.length; i++){
            let x = Math.random()*w/4+w/2;
            let y = Math.random()*h/4+h/2;
            this.vNodes.push(new VisualNode(new Vector(x, y), this.hidden[i]));
        }

        for(let i = 0; i < this.outputs.length; i++){
            let x = 7*w/8;
            let y = h/(this.outputs.length*2)+h/this.outputs.length * i;
            this.vNodes.push(new VisualNode(new Vector(x, y), this.outputs[i]));
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, 500, 500);
    }

    drawNodes(){
        for(let node of this.vNodes){
            this.ctx.beginPath()
            this.ctx.arc(node.vector.x,node.vector.y,10,0,Math.PI*2);
            this.ctx.fillStyle = "white";
            this.ctx.fill();

            this.ctx.font = 25 + "px Arial";
            this.ctx.fillStyle = 'black';
            let id = node.node.getInnovation();
            this.ctx.fillText(id,node.vector.x-5*Math.log(id), node.vector.y+10);
        }
    }

    drawConnections(){
        for(let con of this.getConnectionGenes().values()){
            let inNode = 0;
            let outNode= 0;
            for(let i = 0; i < this.vNodes.length; i++){
                if(this.vNodes[i].node.getInnovation() == con.getInNode())
                    inNode = this.vNodes[i].vector;
                else if(this.vNodes[i].node.getInnovation() == con.getOutNode())
                    outNode = this.vNodes[i].vector;;
            }
            this.ctx.beginPath()
            this.ctx.moveTo(inNode.x, inNode.y);
            this.ctx.lineTo(outNode.x, outNode.y);
            let wt = con.getWeight();
            this.ctx.lineWidth = wt+2;
            if(!con.isExpressed())
                this.ctx.strokeStyle = "grey";
            else{
                if(wt>0)
                    this.ctx.strokeStyle = "green";
                else
                    this.ctx.strokeStyle = "red";
            }
            this.ctx.stroke();

        }
    }

    draw(){
        this.clearCanvas();
        this.drawConnections();
        this.drawNodes();
    }
}
