import { Simulation } from './Simulation.js';

export class Playground {
    constructor(boundary = { width: 800, height: 600 }) {
        this.simulation = new Simulation(boundary);
    }

    update(dt) {
        this.simulation.update(dt);
    }

    draw(ctx) {
        this.simulation.draw(ctx);
    }

    onMouseMove(pointer) {

    }

    onMouseDown(pointer) {
        const button = pointer.button;
        const x = pointer.vector.x;
        const y = pointer.vector.y;
    }

    onMouseUp(pointer) {
        const button = pointer.button;
        const x = pointer.vector.x;
        const y = pointer.vector.y;
    }
}
