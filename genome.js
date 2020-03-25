class Genome{
    constructor(numInputs, numOutputs){
        this.nodes = new Map();
        this.connections = new Map();
        this.numberOfNodes = 0;

        this.numInputs = numInputs;
        this.numOutputs = numOutputs;

        this.layers = 2;
        this.biasNode = new Node(0, "BIAS");
        this.biasNode.layer = 0;
        this.addNode(this.biasNode);

        if(numInputs != null && numOutputs != null){
            let inputs = [];
            let outputs = [];
            for(let i = 0; i < numInputs; i++){
                let inputNode = new Node(this.numberOfNodes, "INPUT");
                inputs[i] = inputNode;
                inputNode.layer = 0;
                this.addNode(inputNode);
            }

            
            for(let j = 0; j < numOutputs; j++){
                let outputNode = new Node(this.numberOfNodes, "OUTPUT");
                outputs[j] = outputNode;
                this.addNode(outputNode);
                outputNode.layer = 1;
            }
        }
    }

    fullyConnect(innovationHistory){
        for(let n1 of this.nodes.values()){
            for(let n2 of this.nodes.values()){
                if(n2.layer == n1.layer+1){
                    let innovationNumber = this.getInnovationNumber(innovationHistory, n1.getNodeNumber(), n2.getNodeNumber());
                    this.addConnection(new Connection(n1.getNodeNumber(), n2.getNodeNumber(), innovationNumber, random(-1,1), true));
                }
            }
        }
    }

    clone(){
        let g = new Genome(this.numInputs, this.numOutputs, true);

        for(let n of this.nodes.values()){
            g.addNode(n.copy());
        }
        for(let c of this.connections.values()){
            g.addConnection(c.copy());
        }

        g.numInputs = this.numInputs;
        g.numOutputs = this.numOutputs;
        g.numberOfNodes = this.numberOfNodes;
        g.layers = this.layers;
        return g;

    }

    feedForward(inputs){
        
        this.nodes.get(0).outputValue = 1;

        for(let i = 0; i < this.numInputs; i++){
            this.nodes.get(i+1).outputValue = inputs[i];
        }


        //for each layer add the node in that layer, since layers cannot connect to themselves there is no need to order the this.nodes within a layer

        for(let i = 1; i < this.layers; i++){
            for(let n of this.nodes.values()){
                if(n.layer == i){
                    for(let c of this.connections.values()){
                        if(c.outNode == n.getNodeNumber()){
                            // console.log(c.inNode + " "+ c.weight);
                            n.inputSum += this.nodes.get(c.inNode).outputValue * c.weight;

                        }
                    }
                    n.activate();
                }
            }
        }

        let outputs = [];
        for(let i = this.numInputs+1; i < this.numInputs+this.numOutputs+1; i++){
            outputs.push(this.nodes.get(i).outputValue);
        }

        for(let n of this.nodes.values()){
            n.reset();
        }

        return outputs;
    }

    computeDrawCoordinates(){
        this.drawLayers = [];
        for(let n of this.nodes.values()){
            this.drawLayers[n.layer] = [];
        }
        for(let n of this.nodes.values()){
            this.drawLayers[n.layer].push(n);
        }
    
        let x = Genome.drawDimensions/(this.drawLayers.length+1);

        for(let l of this.drawLayers){
            let y = Genome.drawDimensions/(l.length+1);
            for(let n of l){
                n.vector = createVector(x,y);
                n.radius = 12 - this.numInputs*this.numInputs/100;
                y += Genome.drawDimensions/(l.length+1);
            }
            x += Genome.drawDimensions/(this.drawLayers.length+1);
        }
    }

    // getConnectionsTo(node){
    //     let conns = Array.from(this.connections.values()).filter(x => x.outNode == node.getNodeNumber() && x.enabled)
    //     return conns;
    // }

    addNode(node){
        this.nodes.set(node.getNodeNumber(), node);
        this.numberOfNodes++;
    }

    addConnection(con){
        this.connections.set(con.getInnovationNo(), con);
    }

    getInnovationNumber(innovationHistory, from, to) {
        var isNew = true;
        var connectionInnovationNumber = innovationCounter.innovationNumber;
        for (var i = 0; i < innovationHistory.length; i++) { //for each previous mutation
            if (innovationHistory[i].matches(this, from, to)) { //if match found
                isNew = false; //its not a new mutation
                connectionInnovationNumber = innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
                break;
            }
        }
  
        if (isNew) { //if the mutation is new then create an arrayList of varegers representing the current state of the genome
            var innoNumbers = [];
            for (let c of this.connections.values()) { //set the innovation numbers
                innoNumbers.push(c.getInnovationNo());
            }
  
            //then add this mutation to the innovationHistory
            innovationHistory.push(new connectionHistory(from, to, connectionInnovationNumber, innoNumbers));
            innovationCounter.getInnovation();
        }
        return connectionInnovationNumber;
    }

    mutateNode(innovationHistory){
        let keys = Array.from(this.connections.keys());
        if(keys.length == 0)
            return;
        let randCon = this.connections.get(keys[Math.floor(Math.random()*keys.length)])

        let newNode = new Node(this.numberOfNodes, "HIDDEN");

        var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, randCon.inNode, newNode.getNodeNumber());

        let toNodeCon = new Connection(randCon.inNode, newNode.getNodeNumber(), connectionInnovationNumber, random(-1,1), true);

        connectionInnovationNumber = this.getInnovationNumber(innovationHistory, newNode.getNodeNumber(), randCon.outNode);
        let fromNodeCon = new Connection(newNode.getNodeNumber(), randCon.outNode, connectionInnovationNumber, random(-1,1), true);
        newNode.layer = this.nodes.get(randCon.inNode).layer+1;

        this.addConnection(toNodeCon);
        this.addConnection(fromNodeCon);

        connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.biasNode.getNodeNumber(), newNode.getNodeNumber());
        this.addConnection(new Connection(this.biasNode.getNodeNumber(), newNode.getNodeNumber(), connectionInnovationNumber, 0, true));

        if (newNode.layer == this.nodes.get(randCon.outNode).layer) {
            for (let n of this.nodes.values()) { //dont include this newest node
                if (n.layer >= newNode.layer) {
                    n.layer++;
                }
            }
            this.layers++;
        }

        this.addNode(newNode);
        randCon.disable();

    }

    mutateConnection(innovationHistory){
        let keys = Array.from(this.nodes.keys());
        let n1 = this.nodes.get(keys[Math.floor(Math.random()*keys.length)]);
        let n2 = this.nodes.get(keys[Math.floor(Math.random()*keys.length)]);

        while(n1.layer == n2.layer){
            n1 = this.nodes.get(keys[Math.floor(Math.random()*keys.length)]);
            n2 = this.nodes.get(keys[Math.floor(Math.random()*keys.length)]);
        }

        if(n1.layer > n2.layer){
            let temp = n1;
            n1 = n2;
            n2 = temp;
        }

        for(let c of this.connections.values()){
            if(c.inNode== n1.getNodeNumber() && c.outNode == n2.getNodeNumber()){
                return
            }
        }

        var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, n1.getNodeNumber(), n2.getNodeNumber());
        let newCon = new Connection(n1.getNodeNumber(), n2.getNodeNumber(), connectionInnovationNumber, random(-1, 1), true);

        this.addConnection(newCon);
    }

    mutateWeights(){
        for(let c of this.connections.values()){
            c.mutateWeight();
        }
    }

    mutate(innovationHistory){
        if(this.connections.size == 0){
            this.mutateConnection(innovationHistory)
        }

        let rand1 = Math.random();

        if(rand1 < 0.8){
            this.mutateWeights();
        }
        let rand2 = Math.random();
        if(rand2 < 0.05){
            this.mutateConnection(innovationHistory);
        }

       
        let rand3 = Math.random();
        if(rand3 < 0.01){
            this.mutateNode(innovationHistory);
        }

    }

    crossover(parent2){
        //Assume parent1 is more fit than parent2
        let child = new Genome();
      
        for(let n of this.nodes.values()){
            child.addNode(n.copy());
        }

        for(let con1 of this.connections.values()){
            let con = null;
            let setEnabled = true;
            //if both parents have matching genes, then inheritence is random
            let con2 = this.matchingGene(parent2, con1);
            if(con2){
                if (con1.isDisabled() || con2.isDisabled()) { //if either of the matching genes are disabled
                    if (random(1) < 0.75) { //75% of the time disabel the childs gene
                      setEnabled = false;
                    }
                }
                var rand = random(1);
                if (rand < 0.5) {
                    con = con1.copy();

                } else {

                    con = con2.copy();
                }
            }else{
                con = con1.copy();

            }
            con.enabled = setEnabled;
            child.addConnection(con);
        }
        child.numInputs = this.numInputs;
        child.numOutputs = this.numOutputs;
        child.numberOfNodes = this.numberOfNodes;
        child.layers = this.layers;
        return child;
    }

    matchingGene(parent2, c2){
        for(let c1 of parent2.connections.values()){
            if(c1.getInnovationNo() == c2.getInnovationNo())
                return c1;
        }
        return false
    }

    static getExcessDisjoint(parent1, parent2) {
        var matching = 0;
        for (let c1 of parent1.connections.values()) {
            for (let c2 of parent2.connections.values()) {
                if (c1.getInnovationNo() == c2.getInnovationNo()) {
                    matching++;
                    break;
                }
            }
        }
        return (parent1.connections.size + parent2.connections.size - 2 * (matching)); //return no of excess and disjoint genes
    }

    static averageWeightDiff(parent1, parent2) {
        if (parent1.connections.size == 0 || parent2.connections.size == 0) {
          return 0;
        }
  
  
        var matching = 0;
        var totalDiff = 0;
        for (let c1 of parent1.connections.values()) {
            for (let c2 of parent2.connections.values()) {
                if (c1.getInnovationNo() == c2.getInnovationNo()) {
                    matching++;
                    totalDiff += abs(c1.weight - c2.weight);
                    break;
                }
            }
        }
        if (matching == 0) { //divide by 0 error
          return 100;
        }
        return totalDiff / matching;
    }
}

Genome.drawDimensions = 300;