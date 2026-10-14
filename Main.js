import { Playground } from './Playground.js';
import { Pointer } from './Pointer.js';

export class Main {
    constructor(canvasId, backgroundColor = "#000000") {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found.`);
        }
        this.backgroundColor = backgroundColor;
        this.ctx = this.canvas.getContext('2d');
        const rect = this.canvas.getBoundingClientRect();
        this.playground = new Playground({ width: rect.width, height: rect.height });
        this.lastTime = performance.now();
        this.currentTime = 0;
        this.mainLoop = this.mainLoop.bind(this);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (event) => {
            const mousePos = this.getMousePos(event);
            const vector = { x: mousePos.x, y: mousePos.y };
            const pointer = new Pointer(event.button, vector);
            this.playground.onMouseMove(pointer);
        }, false);

        this.canvas.addEventListener('mousedown', (event) => {
            const mousePos = this.getMousePos(event);
            const vector = { x: mousePos.x, y: mousePos.y };
            const pointer = new Pointer(event.button, vector);
            this.playground.onMouseDown(pointer);
        });

        this.canvas.addEventListener('mouseup', (event) => {
            const mousePos = this.getMousePos(event);
            const vector = { x: mousePos.x, y: mousePos.y };
            const pointer = new Pointer(event.button, vector);
            this.playground.onMouseUp(pointer);
        });
    }

    clearCanvas() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    update(dt) {
        this.clearCanvas();
        this.playground.update(dt);
        this.playground.draw(this.ctx);
    }

    mainLoop() {
        window.requestAnimationFrame(this.mainLoop);
        this.currentTime = performance.now();
        const dt = Math.min((this.currentTime - this.lastTime) / 1000, 1 / 30);
        this.lastTime = this.currentTime;
        this.update(dt);
    }

    start() {
        this.mainLoop();
    }
}
