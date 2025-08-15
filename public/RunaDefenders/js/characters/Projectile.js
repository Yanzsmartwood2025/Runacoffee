// js/characters/Projectile.js
import { config } from '../config.js';

export class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y - 10; // Pequeño ajuste para que el disparo salga del centro del jugador
        this.width = 20;
        this.height = 20;
        this.speed = config.projectileSpeed;
        this.power = 20; // El daño que inflige cada proyectil
        
        this.image = new Image();
        this.image.src = config.player.projectileImage;
    }

    /**
     * Actualiza la posición del proyectil, moviéndolo hacia la derecha.
     */
    update() {
        this.x += this.speed;
    }

    /**
     * Dibuja el proyectil en el canvas.
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     */
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
