import { dist, create, angle } from "../utils";
import Config from "../Config";

export default class Line {
    constructor(lineWrapper, p, cp) {
        this.p = p;
        this.cp = cp;
        this.el = create("div");
        this.el.classList.add("control-line");
        lineWrapper.appendChild(this.el);

        this.updateLengthAndAngle();
        this.update();
    }

    updateLengthAndAngle() {
        this.length = dist(this.p.x, this.p.y, this.cp.x, this.cp.y);
        this.angle = angle(this.p, this.cp);
    }

    updateAngle(a){
        this.angle = a;
    }

    update() {
        this.el.style.transform = `rotate(${this.angle}rad) scaleX(${this.length - Config.controlPointSize / 2})`;
    }

    getEndPoint(angle) {
        return {
            x: this.p.x + this.length * Math.cos(angle),
            y: this.p.y + this.length * Math.sin(angle),
        };
    }
}
