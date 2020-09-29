import Voronoi from "voronoi";
import Config from "../Config";
import { getRandomPoint, dist } from "../utils";
import ControlPoint from "./ControlPoint";

export default class TrackGenerator {
    constructor(options) {
        this.width = options?.width || Config.canvasWidth;
        this.height = options?.height || Config.canvasHeight;
        this.numPoints = options?.numPoints || 500;
        this.maxCells = options?.maxCells || 5;
        this.minimumDistance = options?.minimumDistance || 0.01;

        this.controlPoints = localStorage.getItem("ControlPoints");
    }

    getSortedPoints() {
        this.voronoi = new Voronoi();

        this.bbox = { xl: 0, xr: 1, yt: 0, yb: 1 };
        this.sites = Array.from(Array(this.numPoints)).map(_ => getRandomPoint(this.bbox));

        this.diagram = this.voronoi.compute(this.sites, this.bbox);

        this.centerCells = this.diagram.cells.filter(cell =>
            cell.halfedges.every(halfedge => halfedge.edge.lSite && halfedge.edge.rSite)
        );

        this.chosenEdges = [];
        this.duplicateEdges = [];

        let cell = this.centerCells[Math.floor(Math.random() * this.centerCells.length)];

        for (let i = 0; i < this.maxCells; i++) {
            const halfedges = cell.halfedges.filter(
                halfedge =>
                    !this.isChosen(halfedge.edge) &&
                    !this.isBorderEdge(cell, halfedge) &&
                    !this.isTooSmall(halfedge.edge)
            );
            if (halfedges.length > 0) {
                const randomEdge = halfedges[Math.floor(Math.random() * halfedges.length)];

                cell.halfedges.forEach(halfedge => {
                    if (this.isChosen(halfedge.edge)) {
                        this.duplicateEdges.push(halfedge.edge);
                    }
                    this.chosenEdges.push(halfedge.edge);
                });

                const { lSite, rSite } = randomEdge.edge;
                const nextSite = lSite === cell.site ? rSite : lSite;
                cell = this.diagram.cells[nextSite.voronoiId];
            }
        }

        this.chosenEdges = this.chosenEdges.filter(
            edge => !this.duplicateEdges.some(duplicateEdge => duplicateEdge === edge)
        );

        const { va, vb } = this.chosenEdges[0];
        let sortedPoints = [{ ...va }, { ...vb }];
        this.chosenEdges.splice(0, 1);

        for (let j = 0; j < Math.pow(this.chosenEdges.length, 2); j++) {
            const lastPoint = sortedPoints[sortedPoints.length - 1];
            for (let i = 0; i < this.chosenEdges.length; i++) {
                const chosenEdge = this.chosenEdges[i];
                if (lastPoint.x === chosenEdge.va.x && lastPoint.y === chosenEdge.va.y) {
                    sortedPoints.push({ ...chosenEdge.vb });
                    this.chosenEdges.splice(i, 1);
                    i--;
                } else if (lastPoint.x === chosenEdge.vb.x && lastPoint.y === chosenEdge.vb.y) {
                    sortedPoints.push({ ...chosenEdge.va });
                    this.chosenEdges.splice(i, 1);
                    i--;
                }
            }
        }

        for (let i = 0; i < sortedPoints.length - 1; i++) {
            const { x: x1, y: y1 } = sortedPoints[i];
            const { x: x2, y: y2 } = sortedPoints[i + 1];

            if (dist(x1, y1, x2, y2) < this.minimumDistance) {
                sortedPoints.splice(i, 1);
                i--;
            }
        }

        let minX = 1,
            minY = 1;
        let maxX = 0,
            maxY = 0;

        sortedPoints.forEach(({ x, y }) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        return sortedPoints.map(p => ({
            x: (p.x - minX) / (maxX - minX),
            y: (p.y - minY) / (maxY - minY),
        }));
    }

    scalePoint(p, width, height) {
        return {
            x: (width * (p.x * 6 + 1)) / 8,
            y: (height * (p.y * 6 + 1)) / 8,
        };
    }

    getControlPoints(load = true, width = this.width, height = this.height) {
        if (load && this.controlPoints) {
            this.controlPoints = JSON.parse(this.controlPoints);

            return this.controlPoints.map(
                ({ p, cp1, cp2 }) =>
                    new ControlPoint({
                        p: this.scalePoint(p, width, height),
                        cp1: this.scalePoint(cp1, width, height),
                        cp2: this.scalePoint(cp2, width, height),
                    })
            );
        }
        
        this.sortedPoints = this.getSortedPoints();
        const scaledPoints = this.sortedPoints.map(p => this.scalePoint(p, width, height));
        return this.catmulRomToBezier(scaledPoints);
    }

    catmulRomToBezier(data, alpha = 0.5) {
        if (alpha == 0 || alpha === undefined) {
            return false;
        }

        var p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
        var d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
        const points = [];
        const controlPoints = [];
        for (var i = 0; i < data.length - 1; i++) {
            p0 = i == 0 ? data[0] : data[i - 1];
            p1 = data[i];
            p2 = data[i + 1];
            p3 = i + 2 < data.length ? data[i + 2] : p2;

            d1 = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
            d2 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            d3 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));

            // Catmull-Rom to Cubic Bezier conversion matrix

            // A = 2d1^2a + 3d1^a * d2^a + d3^2a
            // B = 2d3^2a + 3d3^a * d2^a + d2^2a

            // [   0             1            0          0          ]
            // [   -d2^2a /N     A/N          d1^2a /N   0          ]
            // [   0             d3^2a /M     B/M        -d2^2a /M  ]
            // [   0             0            1          0          ]

            d3powA = Math.pow(d3, alpha);
            d3pow2A = Math.pow(d3, 2 * alpha);
            d2powA = Math.pow(d2, alpha);
            d2pow2A = Math.pow(d2, 2 * alpha);
            d1powA = Math.pow(d1, alpha);
            d1pow2A = Math.pow(d1, 2 * alpha);

            A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
            B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
            N = 3 * d1powA * (d1powA + d2powA);
            if (N > 0) {
                N = 1 / N;
            }
            M = 3 * d3powA * (d3powA + d2powA);
            if (M > 0) {
                M = 1 / M;
            }

            bp1 = {
                x: (-d2pow2A * p0.x + A * p1.x + d1pow2A * p2.x) * N,
                y: (-d2pow2A * p0.y + A * p1.y + d1pow2A * p2.y) * N,
            };

            bp2 = {
                x: (d3pow2A * p1.x + B * p2.x - d2pow2A * p3.x) * M,
                y: (d3pow2A * p1.y + B * p2.y - d2pow2A * p3.y) * M,
            };

            if (bp1.x == 0 && bp1.y == 0) {
                bp1 = p1;
            }
            if (bp2.x == 0 && bp2.y == 0) {
                bp2 = p2;
            }

            points.push(p1);
            controlPoints.push(bp1);
            controlPoints.push(bp2);
        }

        for (let i = 1; i < points.length; i++) {
            points[i] = new ControlPoint({
                p: points[i],
                cp1: controlPoints[i * 2 - 1],
                cp2: controlPoints[i * 2],
            });
        }
        points.splice(0, 1);

        return points;
    }

    isChosen(edge) {
        return this.chosenEdges.some(e => e === edge);
    }

    isTooSmall(edge) {
        const {
            va: { x: x1, y: y1 },
            vb: { x: x2, y: y2 },
        } = edge;
        return dist(x1, y1, x2, y2) < this.minimumDistance;
    }

    isBorderEdge(currentCell, halfedge) {
        const { lSite, rSite } = halfedge.edge;
        const site = lSite === currentCell.site ? rSite : lSite;
        const halfedges = this.diagram.cells[site.voronoiId].halfedges;

        return halfedges.some(
            halfedge => halfedge.edge.lSite === null || halfedge.edge.rSite === null
        );
    }
}
