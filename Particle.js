import { Vector2 } from './Vector2.js';

export class Particle {
    constructor(position, mass = 1, radius = 1) {
        this.position = position;
        this.velocity = Vector2.Zero();
        this.color = "#0280ff";
        this.mass = mass;
        this.radius = radius;
    }
}
