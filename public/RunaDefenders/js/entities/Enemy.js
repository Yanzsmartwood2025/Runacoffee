// entities/Enemy.js
import { config } from '../config.js';
import { getGlobalAnimationTimer, getCellSize } from '../main.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

export class Enemy {
    constructor(lane, typeIndex) {
        const cellSize = getCellSize();
        this.type = config.enemies[typeIndex];
        this.width = cellSize - 10;
        this.height = cellSize - 10;
        this.x = canvas.width + 50; // Start slightly off-screen
        this.y = (lane * cellSize) + 5;
        this.speed = this.type.speed;
        this.health = this.type.health;
        this.maxHealth = this.health;
        this.image = new Image();
        this.image.src = this.type.image;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        const bobble = Math.sin(getGlobalAnimationTimer() * 5 + this.y) * (getCellSize() * 0.05);
        ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height);

        // Draw health bar
        if (this.health < this.maxHealth) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 10 + bobble, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y - 10 + bobble, this.width * (this.health / this.maxHealth), 5);
        }
    }
}
