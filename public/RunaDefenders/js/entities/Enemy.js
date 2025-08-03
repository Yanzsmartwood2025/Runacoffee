// entities/Enemy.js
import { config } from '../config.js';
import { globalAnimationTimer } from '../main.js';

class Enemy {
    constructor(lane, typeIndex) {
        this.type = config.enemies[typeIndex];
        this.width = cellSize - 10; this.height = cellSize - 10;
        this.x = canvas.width + 700;
        this.baseY = (lane * cellSize) + 5;
        this.y = this.baseY;
        this.speed = this.type.speed; this.health = this.type.health;
        this.maxHealth = this.health;
        this.image = new Image(); this.image.src = this.type.image;
    }
    update() { this.x -= this.speed; }
    draw() {
        const bobble = Math.sin(globalAnimationTimer * 5 + this.baseY) * (cellSize * 0.05);
        ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height);
        
        if (this.health < this.maxHealth) {
            ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 10 + bobble, this.width, 5);
            ctx.fillStyle = 'green'; ctx.fillRect(this.x, this.y - 10 + bobble, this.width * (this.health / this.maxHealth), 5);
        }
    }
}

export { Enemy };
