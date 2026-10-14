import { Particle } from './Particle.js';
import { Vector2 } from './Vector2.js';
import { DrawUtils } from './DrawUtils.js';
import { FluidHashGrid } from './FluidHashGrid.js';

export class Simulation {

    constructor(boundary = { width: 800, height: 600 }) {

        this.AMOUNT_OF_PARTICLES = 3000;
        this.VELOCITY_DAMPING = 1;
        this.GRAVITY = new Vector2(0, 100);
        this.K_NEAR = 4;
        this.K = 0.1;
        this.PARTICLE_RADIUS = 3;
        this.INTERACTION_RADIUS = this.PARTICLE_RADIUS * 5;
        this.REST_DENSITY = 10;
        this.MAX_RELAXATION_SPEED = 50;
        this.COEFFICIENT_OF_RESTITUTION = 0;

        this.particles = [];
        this.neighbourCells = [];
        this.boundary = boundary;
        this.initializeParticles();
        this.fluidHashGrid = new FluidHashGrid(this.INTERACTION_RADIUS);
        this.fluidHashGrid.initialize(this.particles);
    }

    initializeParticles() {
        const particleRadius = this.PARTICLE_RADIUS;
        const particleMass = 1;
        const spacing = this.INTERACTION_RADIUS * 0.5;
        const offsetX = 10;
        const offsetY = 10;
        const availableWidth = this.boundary.width - offsetX * 2 - particleRadius * 2;
        const availableHeight = this.boundary.height - offsetY * 2 - particleRadius * 2;
        const maxColumns = Math.floor(availableWidth / spacing) + 1;
        const maxRows = Math.floor(availableHeight / spacing) + 1;

        if (this.AMOUNT_OF_PARTICLES > maxColumns * maxRows) {
            throw new RangeError(
                `Cannot fit ${this.AMOUNT_OF_PARTICLES} particles in the simulation boundary.`
            );
        }

        const columns = Math.min(
            maxColumns,
            Math.ceil(Math.sqrt(this.AMOUNT_OF_PARTICLES * availableWidth / availableHeight))
        );
        this.particles = [];

        for (let index = 0; index < this.AMOUNT_OF_PARTICLES; index++) {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const position = new Vector2(
                offsetX + column * spacing + particleRadius,
                offsetY + row * spacing + particleRadius
            );
            const particle = new Particle(position, particleMass, particleRadius);
            particle.velocity = Vector2.Zero();
            this.particles.push(particle);
        }
    }

    draw(ctx){
        this.particles.forEach(particle => {
            DrawUtils.drawParticle(ctx, particle);
        });
    }

    update(dt){
        if (!Number.isFinite(dt) || dt <= 0) {
            return;
        }
        dt = Math.min(dt, 1 / 30);

        const previousPositions = new Float64Array(this.particles.length * 2);

        this.particles.forEach((particle, index) => {
            previousPositions[index * 2] = particle.position.x;
            previousPositions[index * 2 + 1] = particle.position.y;
            this.calculateVelocity(particle, dt);
            this.calculatePosition(particle, dt);
        });

        this.fluidHashGrid.clearGrid();
        this.fluidHashGrid.mapParticleToCell();

        this.doubleDensityRelaxation(dt);

        this.particles.forEach(particle => {
            this.checkBoundary(particle);
        });

        this.particles.forEach((particle, index) => {
            particle.velocity.x = (particle.position.x - previousPositions[index * 2]) / dt;
            particle.velocity.y = (particle.position.y - previousPositions[index * 2 + 1]) / dt;
        });
    }


    calculateVelocity(particle, dt) {
        particle.velocity = Vector2.Scale(particle.velocity, this.VELOCITY_DAMPING);
        particle.velocity.add(Vector2.Scale(this.GRAVITY, dt));
    }

    calculatePosition(particle, dt) {
        particle.position = Vector2.Add(
            particle.position,
            Vector2.Scale(particle.velocity, dt)
        );
        this.checkBoundary(particle);
    }

    doubleDensityRelaxation(dt) {
        const particleCount = this.particles.length;
        const pressures = new Float64Array(particleCount);
        const nearPressures = new Float64Array(particleCount);
        const displacements = new Float64Array(particleCount * 2);

        this.particles.forEach((particle, index) => {
            let density = 0;
            let nearDensity = 0;

            const cells = this.fluidHashGrid.getNeighbourCells(particle.position, this.neighbourCells);
            for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                const cell = cells[cellIndex];
                for (let i = 0; i < cell.length; i++) {
                    const neighbour = this.particles[cell[i]];
                    const dx = particle.position.x - neighbour.position.x;
                    const dy = particle.position.y - neighbour.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const q = 1 - distance / this.INTERACTION_RADIUS;

                    if (q > 0) {
                        density += q * q;
                        nearDensity += q * q * q;
                    }
                }
            }

            pressures[index] = this.K * (density - this.REST_DENSITY);
            nearPressures[index] = this.K_NEAR * nearDensity;
        });

        this.particles.forEach((particle, index) => {
            const cells = this.fluidHashGrid.getNeighbourCells(particle.position, this.neighbourCells);
            for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                const cell = cells[cellIndex];
                for (let i = 0; i < cell.length; i++) {
                    const neighbourIndex = cell[i];
                    if (neighbourIndex <= index) {
                        continue;
                    }

                    const neighbour = this.particles[neighbourIndex];
                    const dx = neighbour.position.x - particle.position.x;
                    const dy = neighbour.position.y - particle.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const q = 1 - distance / this.INTERACTION_RADIUS;

                    if (q <= 0 || distance === 0) {
                        continue;
                    }

                    const pressure = (pressures[index] + pressures[neighbourIndex]) / 2;
                    const nearPressure = (nearPressures[index] + nearPressures[neighbourIndex]) / 2;
                    const scale = (pressure * q + nearPressure * q * q) / distance;
                    const displacementX = dx * scale;
                    const displacementY = dy * scale;

                    displacements[index * 2] -= displacementX;
                    displacements[index * 2 + 1] -= displacementY;
                    displacements[neighbourIndex * 2] += displacementX;
                    displacements[neighbourIndex * 2 + 1] += displacementY;
                }
            }
        });

        this.particles.forEach((particle, index) => {
            let dx = displacements[index * 2];
            let dy = displacements[index * 2 + 1];
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = this.MAX_RELAXATION_SPEED * dt;
            if (distance > maxDistance) {
                const scale = maxDistance / distance;
                dx *= scale;
                dy *= scale;
            }
            particle.position.x += dx;
            particle.position.y += dy;
        });
    }

    checkBoundary(particle) {
        if (particle.position.x <= particle.radius) {
            particle.position.x = particle.radius;
            if (particle.velocity.x < 0) {
                particle.velocity.x *= -this.COEFFICIENT_OF_RESTITUTION;
            }
        } else if (particle.position.x >= this.boundary.width - particle.radius) {
            particle.position.x = this.boundary.width - particle.radius;
            if (particle.velocity.x > 0) {
                particle.velocity.x *= -this.COEFFICIENT_OF_RESTITUTION;
            }
        }

        if (particle.position.y <= particle.radius) {
            particle.position.y = particle.radius;
            if (particle.velocity.y < 0) {
                particle.velocity.y *= -this.COEFFICIENT_OF_RESTITUTION;
            }
        } else if (particle.position.y >= this.boundary.height - particle.radius) {
            particle.position.y = this.boundary.height - particle.radius;
            if (particle.velocity.y > 0) {
                particle.velocity.y *= -this.COEFFICIENT_OF_RESTITUTION;
            }
        }
    }
}
