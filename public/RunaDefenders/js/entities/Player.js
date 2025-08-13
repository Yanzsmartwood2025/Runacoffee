// entities/Player.js
import { config } from '../config.js';
import { getGameState, getShootTimer, setShootTimer, getProjectiles, getGlobalAnimationTimer, getCellSize, getIsPowerActive } from '../main.js';
import { playSound } from '../modules/audio.js';
import { Projectile } from './Projectile.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

export class Player {
    constructor() {
        this.reset();
    }

    reset() {
        const cellSize = getCellSize();
        this.width = cellSize * 0.9;
        this.height = cellSize * 0.9;
        this.x = 10;
        this.y = canvas.height / 2 - this.height / 2;
        this.speed = config.playerSpeed;
        this.image = new Image();
        this.image.src = config.player.image.idle;
        this.attackImage = new Image();
        this.attackImage.src = config.player.image.attack;
        this.isAttacking = false;
    }

    draw() {
        const bobble = Math.sin(getGlobalAnimationTimer() * 4) * (getCellSize() * 0.02);
        ctx.drawImage(this.isAttacking ? this.attackImage : this.image, this.x, this.y + bobble, this.width, this.height);
    }

    update() {
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    }

    shoot() {
        if (getShootTimer() > 0 || getGameState() !== 'playing') return;

        getProjectiles().push(new Projectile(this.x + this.width, this.y + this.height / 2));
        setShootTimer(getIsPowerActive() ? config.fastShootCooldown : config.shootCooldown);

        playSound('shoot', 'C5', '16n');
        this.isAttacking = true;
        setTimeout(() => this.isAttacking = false, 100);
    }
}
