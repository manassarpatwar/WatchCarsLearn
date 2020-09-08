import InnovationCounter from "./InnovationCounter.js";
import Connection from "./Connection.js";
import Node from "./Node.js";
import ConnectionHistory from "./ConnectionHistory.js";

export default class Genome {
    constructor(numInputs, numOutputs) {
        this.nodes = new Map();
        this.connections = new Map();
        this.numberOfNodes = 0;

        this.score = 0;
        this.fitness = 0;

        this.numInputs = numInputs;
        this.numOutputs = numOutputs;

        this.layers = 2;
        this.biasNode = new Node(0, "BIAS");
        this.biasNode.layer = 0;
        this.addNode(this.biasNode);

        if (numInputs != null && numOutputs != null) {
            const inputs = [];
            const outputs = [];
            for (let i = 0; i < numInputs; i++) {
                const inputNode = new Node(this.numberOfNodes, "INPUT");
                inputs[i] = inputNode;
                inputNode.layer = 0;
                this.addNode(inputNode);
            }

            for (let j = 0; j < numOutputs; j++) {
                const outputNode = new Node(this.numberOfNodes, "OUTPUT");
                outputs[j] = outputNode;
                this.addNode(outputNode);
                outputNode.layer = 1;
            }
        }
    }

    fullyConnect(innovationHistory) {
        for (const n1 of this.nodes.values()) {
            for (const n2 of this.nodes.values()) {
                if (n2.layer == n1.layer + 1) {
                    const innovationNumber = this.getInnovationNumber(
                        innovationHistory,
                        n1.getNodeNumber(),
                        n2.getNodeNumber()
                    );
                    this.addConnection(
                        new Connection(
                            n1.getNodeNumber(),
                            n2.getNodeNumber(),
                            innovationNumber,
                            Math.random() * 2 - 1,
                            true
                        )
                    );
                }
            }
        }
    }

    clone() {
        const g = new Genome();
        for (const n of this.nodes.values()) {
            g.addNode(n.copy());
        }
        for (const c of this.connections.values()) {
            g.addConnection(c.copy());
        }

        g.numInputs = this.numInputs;
        g.numOutputs = this.numOutputs;
        g.numberOfNodes = this.numberOfNodes;
        g.layers = this.layers;
        g.color = this.color;
        return g;
    }

    feedForward(inputs) {
        this.nodes.get(0).setOutput(1);

        for (let i = 0; i < this.numInputs; i++) {
            this.nodes.get(i + 1).setOutput(inputs[i]);
        }

        //for each layer add the node in that layer, since layers cannot connect to themselves there is no need to order the this.nodes within a layer

        for (let i = 1; i < this.layers; i++) {
            for (const n of this.nodes.values()) {
                if (n.layer == i) {
                    for (const c of this.connections.values()) {
                        if (c.outNode == n.getNodeNumber()) {
                            // console.log(c.inNode + " "+ c.weight);
                            n.inputSum +=
                                this.nodes.get(c.inNode).outputValue * c.weight;
                        }
                    }
                    n.activate();
                }
            }
        }

        const outputs = [];
        for (
            let i = this.numInputs + 1;
            i < this.numInputs + this.numOutputs + 1;
            i++
        ) {
            outputs.push(this.nodes.get(i).outputValue);
        }

        for (const n of this.nodes.values()) {
            n.reset();
        }

        return outputs;
    }

    computeNodeCoordinates(size) {
        const layers = [];
        for (const n of this.nodes.values()) {
            layers[n.layer] = [];
        }
        for (const n of this.nodes.values()) {
            layers[n.layer].push(n);
        }
        const maxNodesPerLayer = Math.max(...layers.map(l => l.length));
        let x = size / (layers.length + 1);

        for (const l of layers) {
            let y = size / (l.length + 1);
            for (const n of l) {
                n.vector = { x, y };
                n.radius = size / (maxNodesPerLayer * 10);
                y += size / (l.length + 1);
            }
            x += size / (layers.length + 1);
        }
    }

    addNode(node) {
        this.nodes.set(node.getNodeNumber(), node);
        this.numberOfNodes++;
    }

    addConnection(con) {
        this.connections.set(con.getInnovationNo(), con);
    }

    getInnovationNumber(innovationHistory, from, to) {
        let isNew = true;
        let connectionInnovationNumber = InnovationCounter.innovationNumber;
        for (let i = 0; i < innovationHistory.length; i++) {
            //for each previous mutation
            if (innovationHistory[i].matches(this, from, to)) {
                //if match found
                isNew = false; //its not a new mutation
                connectionInnovationNumber =
                    innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
                break;
            }
        }

        if (isNew) {
            //if the mutation is new then create an arrayList of varegers representing the current state of the genome
            const innoNumbers = [];
            for (const c of this.connections.values()) {
                //set the innovation numbers
                innoNumbers.push(c.getInnovationNo());
            }

            //then add this mutation to the innovationHistory
            innovationHistory.push(
                new ConnectionHistory(
                    from,
                    to,
                    connectionInnovationNumber,
                    innoNumbers
                )
            );
            InnovationCounter.getInnovation();
        }
        return connectionInnovationNumber;
    }

    mutateNode(innovationHistory) {
        const keys = Array.from(this.connections.keys());
        if (keys.length == 0) return;
        const randCon = this.connections.get(
            keys[Math.floor(Math.random() * keys.length)]
        );

        const newNode = new Node(this.numberOfNodes, "HIDDEN");

        let connectionInnovationNumber = this.getInnovationNumber(
            innovationHistory,
            randCon.inNode,
            newNode.getNodeNumber()
        );

        const toNodeCon = new Connection(
            randCon.inNode,
            newNode.getNodeNumber(),
            connectionInnovationNumber,
            Math.random() * 2 - 1,
            true
        );

        connectionInnovationNumber = this.getInnovationNumber(
            innovationHistory,
            newNode.getNodeNumber(),
            randCon.outNode
        );
        const fromNodeCon = new Connection(
            newNode.getNodeNumber(),
            randCon.outNode,
            connectionInnovationNumber,
            Math.random() * 2 - 1,
            true
        );
        newNode.layer = this.nodes.get(randCon.inNode).layer + 1;

        this.addConnection(toNodeCon);
        this.addConnection(fromNodeCon);

        connectionInnovationNumber = this.getInnovationNumber(
            innovationHistory,
            this.biasNode.getNodeNumber(),
            newNode.getNodeNumber()
        );
        this.addConnection(
            new Connection(
                this.biasNode.getNodeNumber(),
                newNode.getNodeNumber(),
                connectionInnovationNumber,
                0,
                true
            )
        );

        if (newNode.layer == this.nodes.get(randCon.outNode).layer) {
            for (const n of this.nodes.values()) {
                //dont include this newest node
                if (n.layer >= newNode.layer) {
                    n.layer++;
                }
            }
            this.layers++;
        }

        this.addNode(newNode);
        randCon.disable();
    }

    mutateConnection(innovationHistory) {
        const keys = Array.from(this.nodes.keys());
        let n1 = this.nodes.get(keys[Math.floor(Math.random() * keys.length)]);
        let n2 = this.nodes.get(keys[Math.floor(Math.random() * keys.length)]);

        while (n1.layer == n2.layer) {
            n1 = this.nodes.get(keys[Math.floor(Math.random() * keys.length)]);
            n2 = this.nodes.get(keys[Math.floor(Math.random() * keys.length)]);
        }

        if (n1.layer > n2.layer) {
            const temp = n1;
            n1 = n2;
            n2 = temp;
        }

        for (const c of this.connections.values()) {
            if (
                c.inNode == n1.getNodeNumber() &&
                c.outNode == n2.getNodeNumber()
            ) {
                return;
            }
        }

        const connectionInnovationNumber = this.getInnovationNumber(
            innovationHistory,
            n1.getNodeNumber(),
            n2.getNodeNumber()
        );
        const newCon = new Connection(
            n1.getNodeNumber(),
            n2.getNodeNumber(),
            connectionInnovationNumber,
            Math.random() * 2 - 1,
            true
        );

        this.addConnection(newCon);
    }

    mutateWeights() {
        for (const c of this.connections.values()) {
            c.mutateWeight();
        }
    }

    mutate(innovationHistory) {
        if (this.connections.size == 0) {
            this.mutateConnection(innovationHistory);
        }

        const rand1 = Math.random();

        if (rand1 < 0.8) {
            this.mutateWeights();
        }
        const rand2 = Math.random();
        if (rand2 < 0.05) {
            this.mutateConnection(innovationHistory);
        }

        const rand3 = Math.random();
        if (rand3 < 0.03) {
            this.mutateNode(innovationHistory);
        }
    }

    crossover(parent2) {
        //Assume parent1 is more fit than parent2
        const child = new Genome();

        for (const n of this.nodes.values()) {
            child.addNode(n.copy());
        }

        for (const con1 of this.connections.values()) {
            let con = null;
            let setEnabled = true;
            //if both parents have matching genes, then inheritence is random
            const con2 = this.matchingGene(parent2, con1);
            if (con2) {
                if (con1.isDisabled() || con2.isDisabled()) {
                    //if either of the matching genes are disabled
                    if (Math.random() < 0.75) {
                        //75% of the time disable the childs gene
                        setEnabled = false;
                    }
                }
                const rand = Math.random();
                if (rand < 0.5) {
                    con = con1.copy();
                } else {
                    con = con2.copy();
                }
            } else {
                con = con1.copy();
            }
            con.enabled = setEnabled;
            child.addConnection(con);
        }
        child.numInputs = this.numInputs;
        child.numOutputs = this.numOutputs;
        child.numberOfNodes = this.numberOfNodes;
        child.layers = this.layers;
        child.color = this.color;
        return child;
    }

    matchingGene(parent2, c2) {
        for (const c1 of parent2.connections.values()) {
            if (c1.getInnovationNo() == c2.getInnovationNo()) {
                return c1;
            }
        }
        return false;
    }

    static getExcessDisjoint(parent1, parent2) {
        let matching = 0;
        for (const c1 of parent1.connections.values()) {
            for (const c2 of parent2.connections.values()) {
                if (c1.getInnovationNo() == c2.getInnovationNo()) {
                    matching++;
                    break;
                }
            }
        }
        return (
            parent1.connections.size + parent2.connections.size - 2 * matching
        );
    }

    static averageWeightDiff(parent1, parent2) {
        if (parent1.connections.size == 0 || parent2.connections.size == 0) {
            return 0;
        }

        let matching = 0;
        let totalDiff = 0;
        for (const c1 of parent1.connections.values()) {
            for (const c2 of parent2.connections.values()) {
                if (c1.getInnovationNo() == c2.getInnovationNo()) {
                    matching++;
                    totalDiff += Math.abs(c1.weight - c2.weight);
                    break;
                }
            }
        }
        if (matching == 0) {
            //divide by 0 error
            return 100;
        }
        return totalDiff / matching;
    }
}
