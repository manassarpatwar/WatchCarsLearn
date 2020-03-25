class Connection{
    inNode;
    outNode;
    weight;
    innovationNo;
    enabled;

    constructor(inNode, outNode, innovationNo, weight, enabled){
        this.inNode = inNode;
        this.outNode = outNode;
        this.innovationNo = innovationNo;
        this.enabled = enabled;
        this.weight = weight;
    }

    isEnabled(){
        return this.enabled;
    }

    isDisabled(){
        return !this.enabled;
    }

    enable(){
        this.enabled = true;
    }
    
    disable(){
        this.enabled = false;
    }

    getInnovationNo(){
        return this.innovationNo;
    }

    mutateWeight(){
        if(Math.random() < 0.1)
            this.weight = random(-1,1);
        else{
            this.weight += randomGaussian()/50;
            //keep this.weight between bounds
            if (this.weight > 1) {
                this.weight = 1;
            }
            if (this.weight < -1) {
                this.weight = -1;
            }
        }
    }

    setWeight(w){
        this.weight = w;
    }

    getWeight(){
        return this.weight;
    }

    copy(){
        return new Connection(this.inNode, this.outNode, this.innovationNo, this.weight, this.enabled);
    }


}