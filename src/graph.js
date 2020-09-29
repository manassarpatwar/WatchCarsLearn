import { mobile } from "./Config";
import { text, select, create } from "./utils";

const canvas = document.getElementById("network");
canvas.width = mobile ? window.innerWidth * 0.5 : window.innerWidth * 0.25;
canvas.height = mobile ? window.innerHeight * 0.33 : window.innerHeight * 0.5;

const pad = {
    x: mobile ? 0.05 : 0.2,
    y: 0,
};
const ctx = canvas.getContext("2d");

const nodeRadius = 7.5;

const outputLabels = [];

export const graphLabels = (genome, { inputs, outputs }) => {
    inputs = ["BIAS", ...inputs];
    outputs = [...outputs];
    const network = genome.graph(canvas.width, canvas.height, pad);
    const visualization = select("#visualization");


    for (const node of network.shift()) {
        const { x, y } = node.vector;
        const el = text(inputs.shift().toUpperCase(), visualization, {
            x: x + canvas.offsetLeft - nodeRadius * 2,
            y: y + canvas.offsetTop,
        });
        el.style.transform = `translate(-100%, -50%)`;
    }

    for (const node of network.pop()) {
        const { x, y } = node.vector;
        const el = text(outputs.shift().toUpperCase(), visualization, {
            x: x + canvas.offsetLeft,
            y: y + canvas.offsetTop,
        });
        outputLabels.push(el);
        el.style.transform = `translate(${nodeRadius * 2}px, -50%)`;
    }
};

export const graph = genome => {
    const [r, g, b] = genome.species.color;
    const network = genome.graph(canvas.width, canvas.height, pad);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const layer of network) {
        for (const node of layer) {
            for (const con of node.out) {
                const { x: x1, y: y1 } = con.from.vector;
                const { x: x2, y: y2 } = con.to.vector;
                ctx.beginPath();
                ctx.lineWidth = Math.abs(con.weight);
                ctx.strokeStyle = con.enabled ? (con.weight > 0 ? "green" : "blue") : "red";
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.closePath();
            }
            const { x, y } = node.vector;
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${r},${g},${b}, ${node.output})`;
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
    }
    const outputs = network.pop();
    outputLabels[0].innerText =
        outputs[0].output > 0.66 ? "THROTTLING" : outputs[0].output < 0.33 ? "BRAKING" : "-";
    outputLabels[1].innerText =
        outputs[1].output > 0.66 ? "RIGHT" : outputs[1].output < 0.33 ? "LEFT" : "-";
};
