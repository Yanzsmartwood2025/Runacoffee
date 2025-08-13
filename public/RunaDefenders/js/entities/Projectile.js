// entities/Projectile.js
import { config } from '../config.js';

const ctx = document.getElementById('game-canvas').getContext('2d');

export class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y - 10; // Adjust vertical position
        this.width = 20;
        this.height = 20;
        this.speed = config.projectileSpeed;
        this.power = 20;
        this.image = new Image();
        this.image.src = config.player.projectileImage;
    }

    update() {
        this.x += this.speed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
