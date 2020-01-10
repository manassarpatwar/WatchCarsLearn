function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function VisualNode(vector, node){
    this.vector = vector;
    this.node = node;
}

function randn_bm() {
    var u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
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
        this.nextNode = 0;

        for(let i = 0; i < numInputs; i++){
            let x = NNw/8;
            let y = NNh/(numInputs*2)+NNh/numInputs * i;
            let node = new NodeGene("INPUT", i, new Vector(x,y));
            this.addNodeGene(node);
            this.inputs.push(i);
            this.nextNode++;
        }
        for(let i = 0; i < numOutputs; i++){
            let x = 7*NNw/8;
            let y = NNh/(numOutputs*2)+NNh/numOutputs * i;
            let node = new NodeGene("OUTPUT", i+numInputs, new Vector(x, y));
            this.addNodeGene(node);
            this.outputs.push(i+numInputs);
            this.nextNode++;
        }
        let conInnov = 0;
        for(let input of this.inputs){
            for(let output of this.outputs){
                this.addConnectionGene(new ConnectionGene(input, output, Math.random()*2-1, true, conInnov++))
            }
        }
    }

    clearNodes(){
        this.nodes = new Map();
    }

    clearConnections(){
        this.connections = new Map();
    }

    clear(){
        this.clearNodes();
        this.clearConnections();
    }

    copy(){
        let copy = new Genome(this.numInputs, this.numOutputs);
        copy.nodes = new Map(this.nodes);
        copy.connections = new Map(this.connections);
        return copy;
    }

    think(query_inputs){
        //calculate output of input nodes

        //calculate output of all connections from input nodes

        //while hidden nodes not having output > 0
        //  loop over all nodes, 
        //      find all the connections for each node
        //      if all the connections have output
        //          calculate output of the node

        //calculate output of all connections to output nodes

        //calculate output of output nodes
        if(query_inputs.length != this.inputs.length){
            console.log(this.inputs.length+" NOOOOOO OK");
            return;
        }
        for(let i = 0; i < query_inputs.length; i++){
            this.nodes.get(this.inputs[i]).activate(query_inputs[i]);
        }
        for(let input of this.inputs){
            for(let con of this.connections.values()){
                if(!con.isEnabled())
                    continue;
                if(con.getInNode() == input){
                    con.calculateOutput(this.nodes.get(input).getNodeOutput());
                }
            }
        }
        if(this.hidden.length > 0){
            let hiddenNodes = this.hidden.map(h => this.nodes.get(h)).filter(n => n.getNodeOutput() == null);
            for(let i = 0; i < 100; i++){
                for(let node of hiddenNodes){
                    let connectionsToNode = this.getAllConnectionsTo(node.getInnovation())
                    let sum = connectionsToNode.map(c => c.getConnectionOutput()).reduce((a, b) => a + b, 0)
                    node.activate(sum);
                    for(let con of this.connections.values()){
                        if(!con.isEnabled())
                            continue;
                        if(con.getInNode() == node.getInnovation()){
                            con.calculateOutput(this.nodes.get(node.getInnovation()).getNodeOutput());
                        }
                    }
                }
            }
        }

        let predicts = [];
        for(let output of this.outputs){
            let connectionsToNode = this.getAllConnectionsTo(output);
            if(connectionsToNode.length == 0){
                this.nodes.get(output).setOutput(0)
                predicts.push(0);
                continue;
            }
            let sum = connectionsToNode.map(c => c.getConnectionOutput()).reduce((a, b) => a + b, 0)
            this.nodes.get(output).activate(sum);
            predicts.push(this.nodes.get(output).getNodeOutput());
        }

        return predicts;


    }

    getAllConnectionsTo(node){
        let connectionsToNode = []
        for(let con of this.connections.values()){
            if(con.getOutNode() == node)
                connectionsToNode.push(con);
        }
        return connectionsToNode;
    }

    addNodeGene(gene){
        this.nodes.set(gene.getInnovation(), gene);
    }

    addConnectionGene(gene){
        this.connections.set(gene.getInnovation(), gene);
    }

    getNodeGenes(){
        return this.nodes;
    }

    getConnectionGenes(){
        return this.connections;
    }

    mutation(){
        for(let con of this.connections.values()){
            if(Math.random() < this.PROBABILITY_MUTATION){//otherwise slightly change it
                let weight = con.getWeight() + randn_bm();
                //keep weight between bounds
                if(weight > 1){
                    weight = 1;
                }
                if(weight < -1){
                    weight = -1;        
                }
                con.setWeight(weight);
            }else{
                con.setWeight(Math.random()*2-1);
            }
        }
    }

    addConnectionMutation(connectionInnovation){
        let nodes = Array.from(this.nodes.values())
        let node1 = nodes[Math.floor(Math.random()*nodes.length)];
        if(node1.getType() == "INPUT")
            nodes = nodes.filter(n => n.getType() != "INPUT");
        if(node1.getType() == "OUTPUT")
            nodes = nodes.filter(n => n.getType() != "OUTPUT");
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
        reversed ? node1.getInnovation() : node2.getInnovation(), Math.random()*2-1, true, connectionInnovation.getInnovation())

        this.connections.set(newCon.getInnovation(), newCon)

    }

    addNodeMutation(connectionInnovation){
        let cons = Array.from(this.connections.values())
        cons = cons.filter(c => c.isEnabled());
        let con = cons[Math.floor(Math.random()*cons.length)];
        if(cons.length == 0)
            return
        let inNode = this.nodes.get(con.getInNode());
        let outNode = this.nodes.get(con.getOutNode());

        if(outNode == undefined)
            console.log("OUTNODE IS UNDEFINED");

        con.disable();

        let newNodeInnovation = this.nextNode++;

        let newNode = new NodeGene("HIDDEN", newNodeInnovation, null)
        let inToNew = new ConnectionGene(inNode.getInnovation(), newNode.getInnovation(), 1, true, connectionInnovation.getInnovation());
        let newToOut = new ConnectionGene(newNode.getInnovation(), outNode.getInnovation(), con.getWeight(), true, connectionInnovation.getInnovation());

        this.addNodeGene(newNode);
        this.addConnectionGene(inToNew);
        this.addConnectionGene(newToOut);

        //drawing
        let alpha = Math.atan2(outNode.pos.y-inNode.pos.y, outNode.pos.x - inNode.pos.x)
        let x = (inNode.pos.x+outNode.pos.x)/2+15*Math.sin(alpha);
        let y = (inNode.pos.y+outNode.pos.y)/2-15*Math.cos(alpha);
        newNode.setPos(new Vector(x, y));
        this.hidden.push(newNodeInnovation);

    }

    /*Parent 1 is more fit than parent 2*/
    static crossover(parent1, parent2){
        let child = new Genome(numRays, MOVES.length)
        child.clear();
        for(let parent1Node of parent1.getNodeGenes().values()){
            child.addNodeGene(parent1Node.copy())
        }

        for(let parent1Con of parent1.getConnectionGenes().values()){
            if(parent2.getConnectionGenes().has(parent1Con.getInnovation())){
                let parent2Con = parent2.getConnectionGenes().get(parent1Con.getInnovation());
                let childConGene = Math.random() >= 0.5 ? parent1Con.copy() : parent2Con.copy();
                if(parent1Con.isEnabled() || parent2Con.isEnabled()){
                    if(Math.random() < 0.75){
                        childConGene.disable();
                    }
                }
                child.addConnectionGene(childConGene);
            }else{
                let childConGene = parent1Con.copy();
                child.addConnectionGene(childConGene);
            }
        }

        return child;
    }

    static compatibilityDistance(genome1, genome2, c1, c2, N){
        let genes = this.countGenes(genome1, genome2);
        let excessGenes = genes.excessGenes;
        let disjointGenes = genes.disjointGenes;
        let avgWeightDifference = genes.avgWeightDifference;

        return (excessGenes+disjointGenes)*c1/N+avgWeightDifference*c2;
    }

    static countGenes(genome1, genome2){
        let matchingGenes = 0;
        let disjointGenes = 0;
        let excessGenes = 0;
        let weightDifference = 0;

        let conKeys1 = Array.from(genome1.connections.keys()).sort((a, b) => a - b);
        let conKeys2 = Array.from(genome2.connections.keys()).sort((a, b) => a - b);

        let highestInnovation1 = conKeys1[conKeys1.length-1];
        let highestInnovation2 = conKeys2[conKeys2.length-1];
        let indices = Math.max(highestInnovation1, highestInnovation2);
        // console.log(indices+" "+conKeys1+" "+conKeys2);
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

}
