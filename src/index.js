import { select, degrees, createButton } from "./utils";
import doPhysics from "./doPhysics";
import Track from "./Track";
import Config from "./Config";
import "Styles/main.css";
import SteeringWheel from "Images/SteeringWheel.png";
import RandomTrack from "Images/RandomTrack.png";
import EditTrack from "Images/EditTrack.png";
import Runner from "./Runner";
import Neat from "./neat/Neat";
import User from "./User";
import GraphNN from "./neat/GraphNN";

const track = new Track();
const { beziers: paths, curves} = track;
const trackLength = paths.length;
const neat = new Neat(Config.populationSize, 4, 2, p => p.score / (trackLength * 10));
const runner = new Runner(neat, track.start);

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

// const NNCanvas = document.getElementById("NN");
// NNCanvas.width = 200;
// NNCanvas.height = 200;
// const NNctx = NNCanvas.getContext("2d");
const json = select("#json");
const fps = select("#fps");
function draw() {
    requestAnimationFrame(draw);
    const best = runner.cars.reduce((prev, current) =>
        prev.brain.score > current.brain.score ? prev : current
    );

    // GraphNN(NNctx, { size: 200, backgroundColor: Config.backgroundColor }, best.brain);
    // json.textContent = JSON.stringify(
    //     runner.playerCar.json(),
    //     undefined,
    //     2
    // );
    steerButton.style.transform = "rotate(" + degrees(best.steer) * 6 + "deg)";
    runner.cars.forEach(c => c.display());

    runner.playerCar.display();
    fps.innerText = `Speed: ${(runner.getFps()/60).toFixed(2)}X`;
}
requestAnimationFrame(draw);
