export class DrawUtils {
    static drawPoint (ctx, position, radius = 5, color = 'red') {
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    static strokePoint (ctx, position, radius = 5, color = 'red') {
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    static drawLine (ctx, start, end, color = 'red', lineWidth = 1) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();
    }

    static drawText (ctx, text, position, font = '16px Arial', color = 'black') {
        ctx.beginPath();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.fillText(text, position.x, position.y);
    }

    static drawParticle (ctx, particle) {
        ctx.beginPath();
        ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, 2 * Math.PI);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.closePath();
    }
}
