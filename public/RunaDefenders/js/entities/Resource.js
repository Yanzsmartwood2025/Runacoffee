// entities/Resource.js
import { config } from '../config.js';
import { globalAnimationTimer } from '../main.js';

class Resource {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.size = 45;
        this.type = type;
        this.image = new Image(); this.image.src = type === 'grain' ? config.grainImage : config.orbImage;
        this.life = 400;
        this.isFlying = false;
    }
    update() { this.life--; }
    draw() {
        if (this.isFlying) return;
        const scale = 1 + Math.sin(globalAnimationTimer * 6) * 0.08;
        const newSize = this.size * scale;
        const sizeDiff = (newSize - this.size) / 2;

        ctx.globalAlpha = this.life < 60 ? this.life / 60 : 1;
        ctx.drawImage(this.image, this.x - sizeDiff, this.y - sizeDiff, newSize, newSize);
        ctx.globalAlpha = 1;
    }
}

export { Resource };

