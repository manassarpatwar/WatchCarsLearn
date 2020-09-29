import Point from "./Point";
import Line from "./Line";
import { create } from "../utils";
import Config from "../Config";

export default class ControlPoint {
    constructor({ p, cp1, cp2 }) {
        this.p = new Point(p);
        this.cp1 = new Point(cp1);
        this.cp2 = new Point(cp2);

        this.points = [this.p, this.cp1, this.cp2];
        this.beziers = [];

        const div = create("div");
        div.classList.add("control-line-wrapper");
        this.p.el.appendChild(div);

        this.line1 = new Line(div, this.p, this.cp1);
        this.line2 = new Line(div, this.p, this.cp2);
    }

    enable(){
        this.points.forEach(p => p.enable());
    }

    disable(){
        this.points.forEach(p => p.disable());
    }

    delete(){
        this.points.forEach(p => p.delete());
    }

    normalize({x, y}) {
        return {
            x: ((x * 8) / Config.canvasWidth - 1) / 6,
            y: ((y * 8) / Config.canvasHeight - 1) / 6,
        };
    }

    getPoint() {
        return {
            p: this.normalize(this.p),
            cp1: this.normalize(this.cp1),
            cp2: this.normalize(this.cp2),
        };
    }

    updateLines() {
        this.line1.update();
        this.line2.update();
    }
}
