class connectionHistory {
    constructor(from, to, inno, innovationNos) {
      this.fromNode = from;
      this.toNode = to;
      this.innovationNumber = inno;
      this.innovationNos = []
      arrayCopy(innovationNos, this.innovationNos);
    }
  
    //----------------------------------------------------------------------------------------------------------------
    //returns whether the genome matches the original genome and the connection is between the same nodes
    matches(genome, from, to) {
      if(genome.connections.size == this.innovationNos.length){
        if (from === this.fromNode && to === this.toNode) {
          for(let c of genome.connections.values()){
            if(!this.innovationNos.includes(c.getInnovationNo())){
              return false;
            }
          }
          return true;
        }
      }
      return false;
    }
  }
  