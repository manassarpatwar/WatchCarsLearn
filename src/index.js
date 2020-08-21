import Car from "./components/Car.js";
import { select, isFloat, degrees } from "./utils.js";
import doPhysics from "./doPhysics.js";
import drawTrack from "./drawTrack.js";
import Config from "./Config.js";
import Runner from "./components/Runner.js";


window.onload = setup;
let steerImg;
let runner;

function setup() {

    const main = select("main");

    const { curves, paths, start } = drawTrack();

    runner = new Runner(start, main);

    doPhysics(runner, curves, paths);

    steerImg = select("#steer");
    const root = document.documentElement;
    root.style.setProperty("--car-width", Config.width + "px");
    root.style.setProperty("--car-height", Config.height + "px");
    root.style.setProperty("--car-border-radius", Config.borderRadius + "px");
    draw();
}

function draw() {
    requestAnimationFrame(draw);
    const data = runner.cars[0].json();
    const keys = Object.keys(data).filter(x => isFloat(data[x]));
    keys.map(x => (data[x] = data[x].toFixed(2)));
    document.getElementById("json").textContent = JSON.stringify(
        data,
        undefined,
        2
    );
    steerImg.style.transform = "rotate(" + degrees(data.steer) * 6 + "deg)";
    runner.cars.forEach(c => c.display());
}
