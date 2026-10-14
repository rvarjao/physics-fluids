export class FluidHashGrid {

    constructor(cellSize) {
        if (!(cellSize > 0)) {
            throw new Error('Grid cell size must be greater than zero.');
        }
        this.cellSize = cellSize;
        this.hashMap = new Map();
        this.particles = [];
    }

    initialize(particles) {
        this.particles = particles;
    }

    clearGrid() {
        this.hashMap.clear();
    }

    getGridId(x, y) {
        return `${x},${y}`;
    }

    mapParticleToCell() {
        this.particles.forEach((particle, index) => {
            const x = Math.floor(particle.position.x / this.cellSize);
            const y = Math.floor(particle.position.y / this.cellSize);
            const gridId = this.getGridId(x, y);
            if (!this.hashMap.has(gridId)) {
                this.hashMap.set(gridId, []);
            }
            this.hashMap.get(gridId).push(index);
        });
    }

    getNeighbourCells(position, cells) {
        cells.length = 0;
        const particleGridX = Math.floor(position.x / this.cellSize);
        const particleGridY = Math.floor(position.y / this.cellSize);

        for (let x = particleGridX - 1; x <= particleGridX + 1; x++) {
            for (let y = particleGridY - 1; y <= particleGridY + 1; y++) {
                const cell = this.hashMap.get(this.getGridId(x, y));
                if (cell) {
                    cells.push(cell);
                }
            }
        }
        return cells;
    }
}