export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const length = this.length();
        if (length === 0) {
            return this;
        }
        this.x /= length;
        this.y /= length;
        return this;
    }

    getNormal() {
        return new Vector2(this.y, -this.x);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    log() {
        console.log(`Vector2(${this.x}, ${this.y})`);
    }

    static Zero() {
        return new Vector2(0, 0);
    }

    static Add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static Subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    static Scale(v, scalar) {
        return new Vector2(v.x * scalar, v.y * scalar);
    }

    static Distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
