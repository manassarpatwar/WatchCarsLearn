class connectionHistory {
    constructor(from, to, inno) {
      this.fromNode = from;
      this.toNode = to;
      this.innovationNumber = inno;
    }
  
    //----------------------------------------------------------------------------------------------------------------
    //returns whether the genome matches the original genome and the connection is between the same nodes
    matches(from, to) {
      if (from === this.fromNode && to === this.toNode) {
        return true;
      }
      return false;
    }
  }
  