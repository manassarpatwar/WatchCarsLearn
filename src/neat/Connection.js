const randomGaussian = (min, max, skew) => {
    let u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randomGaussian(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
};

export default class Connection {
    constructor(inNode, outNode, innovationNo, weight, enabled) {
        this.inNode = inNode;
        this.outNode = outNode;
        this.innovationNo = innovationNo;
        this.enabled = enabled;
        this.weight = weight;
    }

    isEnabled() {
        return this.enabled;
    }

    isDisabled() {
        return !this.enabled;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    getInnovationNo() {
        return this.innovationNo;
    }

    mutateWeight() {
        if (Math.random() < 0.1) this.weight = Math.random() * 2 - 1;
        else {
            this.weight += randomGaussian(-1, 1, 1) * this.weight;
            //keep this.weight between bounds
            if (this.weight > 1) {
                this.weight = 1;
            }
            if (this.weight < -1) {
                this.weight = -1;
            }
        }
    }

    setWeight(w) {
        this.weight = w;
    }

    getWeight() {
        return this.weight;
    }

    copy() {
        return new Connection(
            this.inNode,
            this.outNode,
            this.innovationNo,
            this.weight,
            this.enabled
        );
    }
}
