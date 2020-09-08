export default function GraphNN(ctx, {size, backgroundColor}, genome) {
    try{
        genome.computeNodeCoordinates(size);
    }catch{
        console.log(genome);
    }
    ctx.clearRect(0, 0, size, size);

    for (const c of genome.connections.values()) {
        ctx.beginPath();
        if (c.isEnabled()) {
            ctx.strokeStyle = "rgb(0, 255, 0)";
        } else {
            ctx.strokeStyle = "rgb(255, 0, 0)";
        }
        ctx.moveTo(
            genome.nodes.get(c.inNode).vector.x,
            genome.nodes.get(c.inNode).vector.y
        );
        ctx.lineTo(
            genome.nodes.get(c.outNode).vector.x,
            genome.nodes.get(c.outNode).vector.y
        );
        ctx.stroke();
    }

    for (const n of genome.nodes.values()) {
        ctx.beginPath();
        ctx.fillStyle = backgroundColor;
        ctx.arc(n.vector.x, n.vector.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${n.persistantOutput})`;
        ctx.arc(n.vector.x, n.vector.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.arc(n.vector.x, n.vector.y, n.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}
