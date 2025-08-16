import { config } from './config.js';

let projectiles = [], enemies = [], resources = [];
let shootTimer = 0, globalAnimationTimer = 0, isPowerActive = false;
let cellSize;
let gameState;

function playSound(sound, note, duration = '8n') { if (typeof Tone !== 'undefined' && Tone.context.state === 'running' && sounds[sound]) { sounds[sound].triggerAttackRelease(note, duration); } }

export class Projectile {
    constructor(x, y, ctx) { this.x = x; this.y = y - 10; this.width = 20; this.height = 20; this.speed = config.projectileSpeed; this.power = 20; this.image = new Image(); this.image.src = config.player.projectileImage; this.ctx = ctx; }
    update() { this.x += this.speed; }
    draw() { this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height); }
}

export class Player {
    constructor(canvas, ctx) { this.canvas = canvas; this.ctx = ctx; this.reset(); }
    reset() {
        cellSize = this.canvas.height / config.lanes;
        this.width = cellSize * 0.9;
        this.height = cellSize * 0.9;
        this.x = 10; this.y = this.canvas.height / 2 - this.height / 2;
        this.speed = config.playerSpeed;
        this.image = new Image();
        this.image.src = config.player.image.idle;
        this.attackImage = new Image();
        this.attackImage.src = config.player.image.attack;
        this.isAttacking = false;
    }
    draw() { const bobble = Math.sin(globalAnimationTimer * 4) * (cellSize * 0.02); this.ctx.drawImage(this.isAttacking ? this.attackImage : this.image, this.x, this.y + bobble, this.width, this.height); }
    update() { if (this.y < 0) this.y = 0; if (this.y > this.canvas.height - this.height) this.y = this.canvas.height - this.height; }
    shoot() { if (shootTimer > 0 || gameState !== 'playing') return; projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2, this.ctx)); shootTimer = isPowerActive ? config.fastShootCooldown : config.shootCooldown; playSound('shoot', 'C5', '16n'); this.isAttacking = true; setTimeout(() => this.isAttacking = false, 100); }
}

export class Enemy {
    constructor(lane, typeIndex, canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.type = config.enemies[typeIndex];
        cellSize = this.canvas.height / config.lanes;
        this.width = cellSize - 10;
        this.height = cellSize - 10;
        this.x = this.canvas.width + 50;
        this.y = (lane * cellSize) + 5;
        this.speed = this.type.speed;
        this.health = this.type.health;
        this.maxHealth = this.health;
        this.image = new Image();
        this.image.src = this.type.image;
    }
    update() { this.x -= this.speed; }
    draw() { const bobble = Math.sin(globalAnimationTimer * 5 + this.y) * (cellSize * 0.05); this.ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height); if (this.health < this.maxHealth) { this.ctx.fillStyle = 'red'; this.ctx.fillRect(this.x, this.y - 10 + bobble, this.width, 5); this.ctx.fillStyle = 'green'; this.ctx.fillRect(this.x, this.y - 10 + bobble, this.width * (this.health / this.maxHealth), 5); } }
}

export class Resource {
    constructor(x, y, type, ctx) {
        this.x = x;
        this.y = y;
        this.size = 45;
        this.type = type;
        this.image = new Image();
        this.image.src = type === 'grain' ? config.grainImage : config.orbImage;
        this.life = 400;
        this.isFlying = false;
        this.ctx = ctx;
    }
    update() { this.life--; }
    draw() { if (this.isFlying) return; const scale = 1 + Math.sin(globalAnimationTimer * 6) * 0.08; const newSize = this.size * scale; const sizeDiff = (newSize - this.size) / 2; this.ctx.globalAlpha = this.life < 60 ? this.life / 60 : 1; this.ctx.drawImage(this.image, this.x - sizeDiff, this.y - sizeDiff, newSize, newSize); this.ctx.globalAlpha = 1; }
}
