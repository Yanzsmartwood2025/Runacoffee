import { config } from '../config.js';
import { Projectile } from './Projectile.js';

export class Player {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.cellSize = cellSize;
        this.projectiles = []; // El jugador ahora gestiona sus propios proyectiles
        this.shootTimer = 0;
        this.isPowerActive = false;

        this.image = new Image();
        this.image.src = config.player.image.idle;
        this.attackImage = new Image();
        this.attackImage.src = config.player.image.attack;
        
        this.reset();
    }

    reset() {
        this.width = this.cellSize * 0.9;
        this.height = this.cellSize * 0.9;
        this.x = 10;
        this.y = this.canvas.height / 2 - this.height / 2;
        this.speed = config.playerSpeed;
        this.isAttacking = false;
    }

    draw(ctx, globalAnimationTimer) {
        const bobble = Math.sin(globalAnimationTimer * 4) * (this.cellSize * 0.02);
        ctx.drawImage(this.isAttacking ? this.attackImage : this.image, this.x, this.y + bobble, this.width, this.height);
    }

    update() {
        if (this.shootTimer > 0) this.shootTimer--;
        if (this.y < 0) this.y = 0;
        if (this.y > this.canvas.height - this.height) this.y = this.canvas.height - this.height;
    }

    shoot(playSoundCallback) {
        if (this.shootTimer > 0) return;
        this.projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2));
        this.shootTimer = this.isPowerActive ? config.fastShootCooldown : config.shootCooldown;
        playSoundCallback('shoot', 'C5', '16n');
        this.isAttacking = true;
        setTimeout(() => this.isAttacking = false, 100);
    }
}
