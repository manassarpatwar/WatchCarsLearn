var NNcanvas = document.getElementById("NNcanvas");
var NNcontext = NNcanvas.getContext("2d");
var NNw = 250;
var NNh = 250;
function setupNNCanvas(canvas, context) {
    NNcanvas.width = 250 * 2;
    NNcanvas.height = 250 * 2;
    NNcanvas.style.width = NNcanvas.width / 2 + "px";
    NNcanvas.style.height = NNcanvas.height / 2 + "px";
    //    context.translate(w / 2, h / 2);
};


setupNNCanvas();

function visualizeBrain(brain, prevBrain) {
    NNcontext.clearRect(0, 0, 500, 500);
    let brainVisualization = [];
    let max = Math.max.apply(null, brain.nodes)

    function VisualLayer() {
        this.visualNodes = []
    }

    function VisualNode(x, y) {
        this.x = x;
        this.y = y;
    }

    for (let j = 0; j < brain.nodes.length; j++) {
        brainVisualization[j] = new VisualLayer();
        for (let i = 0; i < brain.nodes[j]; i++) {
            let x = NNw/max + 500/(brain.nodes.length) * j;
            let y = NNh + NNh/max*2 * i - brain.nodes[j] / max * NNh+max+8;
            brainVisualization[j].visualNodes[i] = new VisualNode(x, y);
        }
    }

    for (let j = 0; j < brain.nodes.length - 1; j++) {
        for (let i = 0; i < brain.nodes[j]; i++) {
            let x = brainVisualization[j].visualNodes[i].x;
            let y = brainVisualization[j].visualNodes[i].y;
            for (let k = 0; k < brain.nodes[j + 1]; k++) {
                let weight = brain.weights[j].data[k][i];
                NNcontext.beginPath();
                NNcontext.moveTo(x, y);
                NNcontext.lineTo(brainVisualization[j + 1].visualNodes[k].x, brainVisualization[j + 1].visualNodes[k].y)
                NNcontext.lineWidth = weight * 2;
                 NNcontext.strokeStyle = "grey";
                if (prevBrain) {
                    let prevWeight = prevBrain.weights[j].data[k][i];
                    if (weight > prevWeight)
                        NNcontext.strokeStyle = "green";
                    else if (weight < prevWeight)
                        NNcontext.strokeStyle = "red";
                }
                NNcontext.stroke();
            }
        }
    }

    for (let j = 0; j < brain.nodes.length; j++) {
        for (let i = 0; i < brain.nodes[j]; i++) {
            let x = brainVisualization[j].visualNodes[i].x;
            let y = brainVisualization[j].visualNodes[i].y;
            NNcontext.beginPath();
            NNcontext.arc(x, y, 12, 0, Math.PI * 2);
            NNcontext.fillStyle = "white";
            NNcontext.fill();
        }
    }
}
