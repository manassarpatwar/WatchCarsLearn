import { select, createButton, degrees } from "./utils";
import doPhysics from "./doPhysics";
import Track from "./Track";
import Config, { mobile } from "./Config";
import "Styles/main.css";
import RandomTrack from "Images/RandomTrack.png";
import EditTrack from "Images/EditTrack.png";
import SteeringWheel from "Images/SteeringWheel.png";

import Runner from "./Runner";
import { Population, Config as NeatConfig } from "./neat/neat-lib.min";
import User from "./User";
import updateChart from "./chart";
import { graph, graphLabels } from "./graph";

const track = new Track();
const { beziers: paths, curves } = track;
const population = new Population(5, 2, Config.popsize, p => p.score, {
    excessCoefficient: 2,
    disjointCoefficient: 0.5,
    weightDifferenceCoefficient: 1,
});

const runner = new Runner(population, track.start, updateChart);

doPhysics(runner, paths, curves);
const steerButton = createButton(SteeringWheel, {
    callback: mobile
        ? false
        : () => {
              User.isPlaying = !User.isPlaying;
          },
});

createButton(RandomTrack, {
    callback: () => {
        User.pause = true;
        track.randomTrack();
        runner.reset();
        User.car.reset();
        runner.finished.forEach(c => c.display());
        User.pause = false;
    },
    title: "Generate random track",
});

createButton(EditTrack, {
    callback: track.editTrack.bind(track),
    title: "Edit current track",
});

const root = document.documentElement;
root.style.setProperty("--car-width", Config.carLength + "px");
root.style.setProperty("--car-height", Config.carBreadth + "px");
root.style.setProperty("--car-border-radius", Config.borderRadius + "px");
root.style.setProperty("--control-point-size", Config.controlPointSize + "px");

const fps = select("#fps");

graphLabels(population.champ, {
    inputs: ["Ray 1", "Ray 2", "Ray 3", "Ray 4", "Ray 5"],
    outputs: ["Throttle", "Turn"],
});

User.hovering = false;
for (const car of runner.cars) {
    car.el.addEventListener("mouseover", () => {
        graph(car.brain);
        User.hovering = true;
    });
    car.el.addEventListener("mouseleave", () => {
        User.hovering = false;
    });
}

function draw() {
    requestAnimationFrame(draw);
    runner.cars.forEach(c => c.display());

    User.car.display();

    steerButton.style.transform = `rotate(${degrees(population.activeChamp.car.steer) * 6}deg)`;

    fps.innerText = `Time: ${(runner.getFps() / 60).toFixed(2)}X`;
    if (!User.hovering) {
        graph(population.activeChamp);
    }
}
requestAnimationFrame(draw);
