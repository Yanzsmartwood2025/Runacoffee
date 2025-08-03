// entities/Player.js
import { config } from '../config.js';
import { Projectile } from './Projectile.js';
import { gameState, shootTimer, isPowerActive, projectiles, globalAnimationTimer, playSound } from '../main.js';

class Player {
    constructor() { this.reset(); }
    reset() {
        this.width = cellSize * 0.9;
        this.height = cellSize * 0.9;
        this.x = 10;
        this.baseY = canvas.height / 2 - this.height / 2;
        this.y = this.baseY;
        this.speed = config.playerSpeed;
        this.image = new Image();
        this.image.src = config.player.image.idle;
        this.attackImage = new Image();
        this.attackImage.src = config.player.image.attack;
        this.isAttacking = false;
    }
    draw() {
        const bobble = Math.sin(globalAnimationTimer * 4) * (cellSize * 0.02);
        ctx.drawImage(this.isAttacking ? this.attackImage : this.image, this.x, this.y + bobble, this.width, this.height);
    }
    update() {
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    }
    shoot() {
        if (shootTimer > 0 || gameState !== 'playing') return;
        projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2));
        shootTimer = isPowerActive ? config.fastShootCooldown : config.shootCooldown;
        playSound('shoot', 'C5', '16n');
        this.isAttacking = true;
        setTimeout(() => this.isAttacking = false, 100);
    }
}

export { Player };
