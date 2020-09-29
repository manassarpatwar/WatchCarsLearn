import { select, create, transform } from "../utils";

export default class Point {
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
        this.points = [];

        this.el = create("div");
        this.el.classList.add("control-point");
        transform(this.el, this.x, this.y);

        select("#simulation").appendChild(this.el);
        
        this.dragged = false;
        this.isDragging = false;
        this.startPosition = { x: 0, y: 0 };
        this.delta = { x: 0, y: 0 };
        this.currentPosition = transform(this.el);
        this.selected = false;

        this.el.addEventListener("touchstart", this.startDrag.bind(this));
        this.el.addEventListener("mousedown", this.startDrag.bind(this));
    }

    enable(){
        this.el.classList.remove('disabled');
    }

    disable(){
        this.el.classList.add('disabled');
    }

    delete(){
        select('#simulation').removeChild(this.el);
    }

    startDrag(e) {
        e.preventDefault();
        if (e.touches) {
            e = e.touches[0];
        }
        document.body.classList.add("pointer");
        this.selected = true;
        this.isDragging = true;
        this.startPosition = { x: e.clientX, y: e.clientY };
        this.reset();
    }

    reset() {
        this.el.classList.add("dragging");
        this.currentPosition = transform(this.el);
        this.delta = { x: 0, y: 0 };
    }

    stopDrag() {
        this.el.classList.remove("dragging");
        document.body.classList.remove("pointer");
        this.isDragging = false;
        this.dragged = false;
        this.selected = false;
    }

    addPoint(point) {
        this.points.push(point);
    }

    update(point) {
        this.x = point?.x || this.currentPosition.x + this.delta.x;
        this.y = point?.y || this.currentPosition.y + this.delta.y;
        this.points.forEach(p => {
            p.x = this.x;
            p.y = this.y;
        });
        transform(this.el, this.x, this.y);
    }
}
