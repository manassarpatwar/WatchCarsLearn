var NNcanvas = document.getElementById("NNcanvas");
var NNctx = NNcanvas.getContext("2d");
var NNw;
var NNh;
function setupNNCanvas(canvas) {
    canvas.width = 250 * 2;
    canvas.height = 250 * 2;
    NNw = canvas.width;
    NNh = canvas.height;
    canvas.style.width = canvas.width / 2 + "px";
    canvas.style.height = canvas.height / 2 + "px";
};
setupNNCanvas(NNcanvas);

function clearNNCanvas(){
    NNctx.clearRect(0, 0, 500, 500);
}

function visualizeNN(car){
    clearNNCanvas();
    for(let con of car.getConnectionGenes().values()){
        let inNode = 0;
        let outNode= 0;
        for(let node of car.nodes.values()){
            if(node.getInnovation() == con.getInNode())
                inNode = node.pos;
            else if(node.getInnovation() == con.getOutNode())
                outNode = node.pos;
        }
        NNctx.beginPath()
        NNctx.moveTo(inNode.x, inNode.y);
        NNctx.lineTo(outNode.x, outNode.y);
        let wt = con.getWeight();
        NNctx.lineWidth = wt+2;
        if(!con.isExpressed())
            NNctx.strokeStyle = "grey";
        else{
            if(wt>0)
                NNctx.strokeStyle = "green";
            else
                NNctx.strokeStyle = "red";
        }
        NNctx.stroke();
    }

    for(let node of car.nodes.values()){
        NNctx.beginPath()
        NNctx.arc(node.pos.x,node.pos.y,10,0,Math.PI*2);
        NNctx.fillStyle = "white";
        NNctx.fill();

        // this.ctx.font = 25 + "px Arial";
        // this.ctx.fillStyle = 'black';
        // let id = node.node.getInnovation();
        // this.ctx.fillText(id,node.vector.x-5*Math.log(id), node.vector.y+10);
    }
}