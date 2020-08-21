import Config from "./Config.js";
import Bezier from "./lib/Bezier.js";

export default () => {
    const canvas = document.getElementById("canvas");
    canvas.width = Config.windowWidth;
    canvas.height = Config.windowHeight;
    const ctx = canvas.getContext("2d");

    const beziers = [
        //Top Left corner
        new Bezier(
            Config.windowWidth / 8,
            Config.windowHeight / 3,
            Config.windowWidth / 32,
            Config.windowHeight / 32,
            Config.windowWidth / 3,
            Config.windowHeight / 8
        ),
        //Top
        new Bezier(
            Config.windowWidth / 3,
            Config.windowHeight / 8,
            Config.windowWidth / 2,
            Config.windowHeight / 6,
            (2 * Config.windowWidth) / 3,
            Config.windowHeight / 8
        ),
        //Top Right corner
        new Bezier(
            (2 * Config.windowWidth) / 3,
            Config.windowHeight / 8,
            (31 * Config.windowWidth) / 32,
            Config.windowHeight / 32,
            (7 * Config.windowWidth) / 8,
            Config.windowHeight / 3
        ),
        //Right
        new Bezier(
            (7 * Config.windowWidth) / 8,
            (2 * Config.windowHeight) / 3,
            (5 * Config.windowWidth) / 6,
            Config.windowHeight / 2,
            (7 * Config.windowWidth) / 8,
            Config.windowHeight / 3
        ),
        //Bottom Right corner
        new Bezier(
            (7 * Config.windowWidth) / 8,
            (2 * Config.windowHeight) / 3,
            (31 * Config.windowWidth) / 32,
            (31 * Config.windowHeight) / 32,
            (2 * Config.windowWidth) / 3,
            (7 * Config.windowHeight) / 8
        ),
        //Bottom
        new Bezier(
            (2 * Config.windowWidth) / 3,
            (7 * Config.windowHeight) / 8,
            Config.windowWidth / 2,
            (5 * Config.windowHeight) / 6,
            Config.windowWidth / 3,
            (7 * Config.windowHeight) / 8
        ),
        //Bottom Left corner
        new Bezier(
            Config.windowWidth / 3,
            (7 * Config.windowHeight) / 8,
            Config.windowWidth / 32,
            (31 * Config.windowHeight) / 32,
            Config.windowWidth / 8,
            (2 * Config.windowHeight) / 3
        ),
    ];

    //Left bezier
    const start = new Bezier(
        Config.windowWidth / 8,
        (2 * Config.windowHeight) / 3,
        Config.windowWidth / 6,
        Config.windowHeight / 2,
        Config.windowWidth / 8,
        Config.windowHeight / 3
    );

    beziers.unshift(start);

    ctx.clearRect(0, 0, Config.windowWidth, Config.windowHeight);
    ctx.beginPath();
    ctx.rect(0, 0, Config.windowWidth, Config.windowHeight);
    ctx.fillStyle = "#222";
    ctx.fill();

    let curves = [];
    beziers.forEach(bezier => {
        const outlines = bezier.outline(Config.TRACKWIDTH / 2).curves;
        outlines.shift();
        outlines.splice(Math.floor(outlines.length / 2), 1);
        curves = curves.concat(outlines);

        ctx.beginPath();
        ctx.strokeStyle = "#eee";
        ctx.arc(bezier.points[1].x, bezier.points[1].y, 3, 0, Math.PI * 2);
        ctx.stroke();
    });

    ctx.translate(Config.TRACKWIDTH / 4, Config.TRACKWIDTH / 8);
    curves.forEach(curve => {
        ctx.beginPath();
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 2;
        ctx.bezierCurveTo(
            curve.points[0].x,
            curve.points[0].y,
            curve.points[1].x,
            curve.points[1].y,
            curve.points[2].x,
            curve.points[2].y
        );
        ctx.stroke();
    });
    ctx.restore();

    return { curves, paths: beziers, start: start.get(0.01) };
};
