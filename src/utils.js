export const select = selector => document.querySelector(selector);

export const create = el => document.createElement(el);

export const degrees = radians => (radians * 180) / Math.PI;

export const isFloat = n => Number(n) === n && n % 1 !== 0;
