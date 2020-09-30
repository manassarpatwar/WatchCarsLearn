import Config from "../Config";
import Bezier from "bezier-js";
import { Vector, create } from "../utils";
import TrackGenerator from "./TrackGenerator";
import User from "../User";

export default class TrackHandler {
    constructor(options) {
        this.width = options?.width || Config.canvasWidth;
        this.height = options?.height || Config.canvasHeight;

        this.canvas = document.getElementById("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = canvas.getContext("2d");

        this.beziers = [];
        this.curves = [];

        this.generator = new TrackGenerator(options);

        this.startFactor = options?.startFactor || 0.5;
        this.start = new Vector(0, 0);

        this.generateTrack();

        this.selectedControlPoint = null;
        this.selectedPoint = null;

        this.controlPoints.forEach(c => (User.isEditing ? c.enable() : c.disable()));

        document.addEventListener("touchstart", this.mouseDown.bind(this));
        document.addEventListener("mousedown", this.mouseDown.bind(this));
        document.addEventListener("touchend", this.mouseUp.bind(this));
        document.addEventListener("mouseup", this.mouseUp.bind(this));
        document.addEventListener("mousemove", this.mouseDragged.bind(this));
        document.addEventListener("touchmove", this.mouseDragged.bind(this));
    }

    download(filename) {
        const link = create("a");
        link.setAttribute("download", filename || "track.png");
        const dataURL = canvas.toDataURL("image/png");
        const url = dataURL.replace(/^data:image\/png/, "data:application/octet-stream");
        link.setAttribute("href", url);
        link.click();
    }

    editTrack() {
        User.isEditing = !User.isEditing;
        this.controlPoints.forEach(c => (User.isEditing ? c.enable() : c.disable()));
        localStorage.setItem("user", JSON.stringify(User));
    }

    randomTrack() {
        this.deleteTrack();
        this.generateTrack(false);
        this.controlPoints.forEach(c => (User.isEditing ? c.enable() : c.disable()));
    }

    deleteTrack() {
        this.controlPoints.forEach(c => c.delete());
    }

    generateTrack(load = true) {
        this.controlPoints = this.generator.getControlPoints(load);
        localStorage.setItem(
            "ControlPoints",
            JSON.stringify(this.controlPoints.map(c => c.getPoint()))
        );

        this.beziers.length = 0;
        let id = 1;
        for (let i = 0; i < this.controlPoints.length - 1; i++) {
            const current = this.controlPoints[i];
            const next = this.controlPoints[i + 1];
            this.beziers.push(this.addBezier(current, next, i + 1));
            id++;
        }

        this.beziers.unshift(
            this.addBezier(
                this.controlPoints[this.controlPoints.length - 1],
                this.controlPoints[0],
                0
            )
        );

        this.createTrackOutline();
    }

    addBezier(current, next, id) {
        const bezier = new Bezier(current.p, current.cp2, next.cp1, next.p);
        bezier.id = id;
        current.p.addPoint(bezier.points[0]);
        current.cp2.addPoint(bezier.points[1]);
        next.cp1.addPoint(bezier.points[2]);
        next.p.addPoint(bezier.points[3]);
        current.beziers.push(bezier);
        next.beziers.push(bezier);
        return bezier;
    }

    animate() {
        if (User.isDragging) {
            window.requestAnimationFrame(this.animate.bind(this));
        }
        if (this.selectedPoint) {
            this.selectedPoint.update();
            if (this.selectedPoint === this.selectedControlPoint.p) {
                this.selectedControlPoint.cp1.update();
                this.selectedControlPoint.cp2.update();
            } else {
                this.selectedControlPoint.updateLines();
            }
        }

        this.updateTrack();
    }

    mouseUp(e) {
        if (e.touches) {
            e = e.touches[0];
        }

        if (this.selectedControlPoint) {
            if (this.selectedPoint) {
                this.selectedPoint.stopDrag();
                if (this.selectedPoint === this.selectedControlPoint.p) {
                    this.selectedControlPoint.cp1.el.classList.remove("dragging");
                    this.selectedControlPoint.cp2.el.classList.remove("dragging");
                } else {
                    const { line1, line2 } = this.selectedControlPoint;
                    if (this.selectedPoint === this.selectedControlPoint.cp1) {
                        line1.updateLengthAndAngle();
                        const a = line1.angle + Math.PI;
                        this.selectedControlPoint.cp2.update(line2.getEndPoint(a));
                        line2.updateAngle(a);
                    } else if (this.selectedPoint === this.selectedControlPoint.cp2) {
                        line2.updateLengthAndAngle();
                        const a = line2.angle + Math.PI;
                        this.selectedControlPoint.cp1.update(line1.getEndPoint(a));
                        line1.updateAngle(a);
                    }
                }
            }

            this.selectedControlPoint.updateLines();
            User.isDragging = false;
            this.selectedControlPoint = null;
            this.selectedPoint = null;

            localStorage.removeItem("ControlPoints");
            localStorage.setItem(
                "ControlPoints",
                JSON.stringify(this.controlPoints.map(c => c.getPoint()))
            );

            this.updateTrack();
        }
    }

    mouseDragged(e) {
        if (e.touches) {
            e = e.touches[0];
        }

        if (this.selectedPoint) {
            this.selectedPoint.dragged = true;
            this.selectedPoint.isDragging = true;
            const dx = e.clientX - this.selectedPoint.startPosition.x;
            const dy = e.clientY - this.selectedPoint.startPosition.y;
            this.selectedPoint.delta = { x: dx, y: dy };

            if (this.selectedPoint === this.selectedControlPoint.p) {
                this.selectedControlPoint.cp1.delta = { x: dx, y: dy };
                this.selectedControlPoint.cp2.delta = { x: dx, y: dy };
            } else {
                const { line1, line2 } = this.selectedControlPoint;
                if (this.selectedPoint === this.selectedControlPoint.cp1) {
                    line1.updateLengthAndAngle();
                    const a = line1.angle + Math.PI;
                    this.selectedControlPoint.cp2.update(line2.getEndPoint(a));
                    line2.updateAngle(a);
                } else if (this.selectedPoint === this.selectedControlPoint.cp2) {
                    line2.updateLengthAndAngle();
                    const a = line2.angle + Math.PI;
                    this.selectedControlPoint.cp1.update(line1.getEndPoint(a));
                    line1.updateAngle(a);
                }
            }

            this.selectedControlPoint.beziers.forEach(this.updateCurve.bind(this));
        }
    }

    mouseDown(e) {
        const selectedControlPoint = this.controlPoints.find(c => c.points.some(p => p.selected));
        if (selectedControlPoint) {
            this.selectedControlPoint = selectedControlPoint;
            this.selectedPoint = this.selectedControlPoint.points.find(p => p.selected);

            if (this.selectedPoint === this.selectedControlPoint.p) {
                this.selectedControlPoint.cp1.reset();
                this.selectedControlPoint.cp2.reset();
            }
            User.isDragging = true;
            this.animate();
        }
    }

    createTrackOutline() {
        this.curves.length = 0;
        this.beziers.forEach(bezier => {
            bezier.update();
            const outlines = bezier.outline(Config.trackWidth / 2).curves;
            outlines.shift();
            outlines.splice(Math.floor(outlines.length / 2), 1);
            this.curves.push(outlines);
        });

        this.updateTrack();
    }

    updateTrack() {
        this.start.update(this.beziers[0].get(this.startFactor));
        this.drawBackground();
        this.drawTrack();
    }

    updateCurve(bezier) {
        bezier.update();
        const outlines = bezier.outline(Config.trackWidth / 2).curves;
        outlines.shift();
        outlines.splice(Math.floor(outlines.length / 2), 1);
        this.curves[bezier.id] = outlines;
    }

    drawBackground() {
        this.ctx.clearRect(0, 0, Config.canvasWidth, Config.canvasHeight);
    }

    drawTrack() {
        this.curves.forEach(c => c.forEach(this.drawCurve.bind(this)));
        this.drawStartLine();
    }

    drawStartLine() {
        const { x: dx, y: dy } = this.beziers[0].normal(this.startFactor);
        const a = Math.atan2(dy, dx) - Math.PI / 2;
        this.start.setAngle(a);

        let y = (Config.trackWidth / 2) * (1 / Config.flagSquares - 1);
        this.ctx.save();
        this.ctx.translate(this.start.x, this.start.y);
        this.ctx.rotate(a);
        this.ctx.lineWidth = Config.trackWidth / Config.flagSquares;
        for (let i = 0; i < Config.flagSquares; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo((Config.trackWidth / Config.flagSquares) * (1 - (i % 2 !== 0) * 2), y);
            this.ctx.stroke();
            this.ctx.closePath();
            y += Config.trackWidth / Config.flagSquares;
        }
        this.ctx.restore();
    }

    drawCurve(curve) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = Config.trackColor;
        this.ctx.lineWidth = Config.trackBorder;
        const p = curve.points;
        this.ctx.moveTo(p[0].x, p[0].y);
        this.ctx.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
        this.ctx.stroke();
        this.ctx.closePath();
    }
}
