import { select, degrees, createButton } from "./utils";
import doPhysics from "./doPhysics";
import Track from "./Track";
import Config from "./Config";
import "Styles/main.css";
import SteeringWheel from "Images/SteeringWheel.png";
import RandomTrack from "Images/RandomTrack.png";
import EditTrack from "Images/EditTrack.png";
import Runner from "./Runner";
import User from "./User";
import Chart from "chart.js";

import { Neat } from "neataptic";

const track = new Track();
const { beziers: paths, curves } = track;

console.log(paths.length*100);

const neat = new Neat(5, 2, null, {
    popsize: Config.popsize,
    elitism: Config.elitism,
    mutationRate: Config.mutationRate,
    mutationAmount: Config.mutationAmount,
});

const [r, g, b] = Config.randomColor;
const chart = new Chart(
    (() => {
        const el = document.createElement("canvas");
        el.width = Config.windowWidth;
        el.height = Config.windowHeight * 0.98;
        el.id = "chart";
        el.style.zIndex = 2;
        select("main").appendChild(el);
        return el;
    })(),
    {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Min",
                    backgroundColor: `rgb(${r * 0.5}, ${g * 0.5}, ${b * 0.5})`,
                    borderColor: `rgb(${r * 0.5}, ${g * 0.5}, ${b * 0.5})`,
                    data: [],
                    fill: false,
                },
                {
                    label: "Average",
                    backgroundColor: `rgb(${r}, ${g}, ${b})`,
                    borderColor: `rgb(${r}, ${g}, ${b})`,
                    data: [],
                    fill: false,
                },
                {
                    label: "Max",
                    backgroundColor: `rgb(${r * 1.5}, ${g * 1.5}, ${b * 1.5})`,
                    borderColor: `rgb(${r * 1.5}, ${g * 1.5}, ${b * 1.5})`,
                    data: [],
                    fill: false,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: "Score Vs Generation Plot",
            },
            scales: {
                yAxes: [
                    {
                        display: true,
                        ticks: {
                            beginAtZero: true, // minimum value will be 0.
                        },
                    },
                ],
            },
        },
    }
);

const runner = new Runner(neat, track.start, ({ gen, max, min, avg }) => {
    chart.data.labels.push(gen);
    chart.data.datasets[0].data.push(min);
    chart.data.datasets[1].data.push(avg);
    chart.data.datasets[2].data.push(max);

    chart.update();
});
// const runner = new Runner(population, track.start, () => {});

doPhysics(runner, paths, curves);

const steerButton = createButton(SteeringWheel);

createButton(RandomTrack, {
    callback: () => {
        User.pause = true;
        track.randomTrack();
        runner.reset();
        runner.playerCar.reset();
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

const json = select("#json");
const fps = select("#fps");
function draw() {
    requestAnimationFrame(draw);
    const best = runner.cars.reduce((prev, current) =>
        prev.brain.score > current.brain.score ? prev : current
    );

    // json.textContent = JSON.stringify(runner.playerCar.json(), undefined, 2);
    steerButton.style.transform = "rotate(" + degrees(best.steer) * 6 + "deg)";
    runner.cars.forEach(c => c.display());

    runner.playerCar.display();
    fps.innerText = `Speed: ${(runner.getFps() / 60).toFixed(2)}X`;
}
requestAnimationFrame(draw);
