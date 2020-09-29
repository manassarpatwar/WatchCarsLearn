export const select = selector => document.querySelector(selector);

export const create = el => document.createElement(el);

export const degrees = radians => (radians * 180) / Math.PI;

export const isFloat = n => Number(n) === n && n % 1 !== 0;

export const dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

export const map = (n, start1, stop1, start2, stop2) => {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

export const transform = (el, x, y, r) => {
    const d = getComputedStyle(el)
        .transform.split(",")
        .map(d => parseInt(d));

    x = x == null ? d[4] : x;
    y = y == null ? d[5] : y;
    r = r == null ? Math.asin(d[1]) || 0 : r;
    el.style.transform = `translate(${x}px, ${y}px) rotate(${r}rad)`;
    return { x: x, y: y, r: r };
};

export const angle = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

export const getRandomPoint = ({ xl, yt, xr, yb }) => ({
    x: Math.random() * xr + xl,
    y: Math.random() * yb + yt,
});

export const createButton = (src, options) => {
    const button = create("button");
    const img = create("img");
    img.src = src;
    button.appendChild(img);
    if (options?.callback) {
        button.classList.add("button");
        button.addEventListener("click", options.callback);
    }
    if (options?.title) {
        button.title = options.title;
    }
    const li = create("li");
    li.appendChild(button);
    select("#nav ul").appendChild(li);
    return button;
};

export const text = (content, el, pos) => {
    const p = create("p");
    p.innerText = content;
    p.classList.add("text");
    if (pos) {
        p.style.left = pos.x + "px";
        p.style.top = pos.y + "px";
    }
    el.appendChild(p);
    return p;
};

export class Vector {
    constructor(x, y, angle = 0) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }

    static len(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    setAngle(a) {
        this.angle = a;
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    update({ x, y, angle }) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }

    mult(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    add(value) {
        if (value instanceof Vector) {
            this.x += value.x;
            this.y += value.y;
        } else if (value instanceof Number) {
            this.x += value;
            this.y += value;
        }
        return this;
    }

    unit() {
        return new Vector(Math.cos(this.angle), Math.sin(this.angle), this.angle);
    }

    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
}
