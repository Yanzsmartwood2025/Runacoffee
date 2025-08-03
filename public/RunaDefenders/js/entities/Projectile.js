
// entities/Projectile.js
import { config } from '../config.js';

class Projectile {
    constructor(x, y) {
        this.x = x; this.y = y - 10; this.width = 20; this.height = 20;
        this.speed = config.projectileSpeed; this.power = 20;
        this.image = new Image(); this.image.src = config.player.projectileImage;
    }
    update() { this.x += this.speed; }
    draw() { ctx.drawImage(this.image, this.x, this.y, this.width, this.height); }
}

export { Projectile };
