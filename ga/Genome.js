class Genome {

    constructor() {
        this.connections = new Map();
        this.nodes = new Map();
    }

    addNodeGene(gene){
        this.nodes.set(gene.getId(), gene);
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

    addConnectionMutation(){
        let node1 = nodes.get(Math.floor(Math.random()*this.nodes.size));
        let node2 = nodes.get(Math.floor(Math.random()*this.nodes.size));

        reversed = false;
        if(node1.getType() == "HIDDEN" && node2.getType() == "INPUT"){
            reversed = true;
        }else if(node1.getType() == "OUTPUT" && node2.getType() == "HIDDEN"){
            reversed = true;
        }else if(node1.getType() == "OUTPUT" && node2.getType() == "INPUT"){
            reversed = true;
        }

        connectionExists = false;
        for(let con of this.connections.values()){
            if(con.getInNode() == node1.getId() && con.getOutNode() == node2.getId()){
                connectionExists = true;
                break;
            }else if(con.getInNode() == node2.getId() && con.getOutNode() == node1.getId()){
                connectionExists = true;
                break;
            }
        }

        if(connectionExists)
            return

        let newCon = new ConnectionGene(reversed ? node2.getId() : node1.getId(), 
        reversed ? node1.getId() : node2.getId(), Math.random()*2-1, true, 0)

        this.connections.set(newCon.getInnovation(), newCon)

    }

    addNodeMutation(innovation){
        let con = this.connections.get(Math.floor(Math.random()*this.connections.size));
        if(con){
            console.log("mutated");
            let inNode = this.nodes.get(con.getInNode());
            let outNode = this.nodes.get(con.getOutNode());

            con.disable();

            let newNode = new NodeGene("HIDDEN", this.nodes.size)
            let inToNew = new ConnectionGene(inNode.getId(), newNode.getId(), 1, true, innovation.getInnovation());
            let newToOut = new ConnectionGene(newNode.getId(), outNode.getId(), con.getWeight(), true, innovation.getInnovation());

            this.addNodeGene(newNode);
            this.addConnectionGene(inToNew);
            this.addConnectionGene(newToOut);
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
}
