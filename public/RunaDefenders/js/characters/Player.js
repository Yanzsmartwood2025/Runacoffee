// js/characters/Player.js
import { config } from '../config.js';
import { Projectile } from './Projectile.js';

export class Player {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.cellSize = cellSize;
        this.shootTimer = 0;

        // Cargar imágenes una sola vez
        this.image = new Image();
        this.image.src = config.player.image.idle;
        this.attackImage = new Image();
        this.attackImage.src = config.player.image.attack;
        
        this.reset();
    }

    /**
     * Restablece al jugador a su estado y posición inicial.
     */
    reset() {
        this.width = this.cellSize * 0.9;
        this.height = this.cellSize * 0.9;
        this.x = 10;
        this.y = this.canvas.height / 2 - this.height / 2;
        this.speed = config.playerSpeed;
        this.isAttacking = false;
        this.shootTimer = 0;
    }

    /**
     * Dibuja al jugador en el canvas con una animación de "flote".
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     * @param {number} globalAnimationTimer - Temporizador global para animaciones.
     */
    draw(ctx, globalAnimationTimer) {
        const bobble = Math.sin(globalAnimationTimer * 4) * (this.cellSize * 0.02);
        const currentImage = this.isAttacking ? this.attackImage : this.image;
        ctx.drawImage(currentImage, this.x, this.y + bobble, this.width, this.height);
    }

    /**
     * Actualiza la posición del jugador, asegurando que no se salga de la pantalla.
     */
    update() {
        // Actualiza el temporizador de disparo
        if (this.shootTimer > 0) {
            this.shootTimer--;
        }

        // Mantiene al jugador dentro de los límites verticales del canvas
        if (this.y < 0) this.y = 0;
        if (this.y > this.canvas.height - this.height) {
            this.y = this.canvas.height - this.height;
        }
    }

    /**
     * Crea un nuevo proyectil si el temporizador de disparo lo permite.
     * @param {Projectile[]} projectiles - El array donde se añadirán los nuevos proyectiles.
     * @param {boolean} isPowerActive - Indica si el poder de disparo rápido está activo.
     * @returns {boolean} - Devuelve `true` si se disparó, para poder reproducir el sonido.
     */
    shoot(projectiles, isPowerActive) {
        if (this.shootTimer > 0) return false;

        projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2));
        this.shootTimer = isPowerActive ? config.fastShootCooldown : config.shootCooldown;
        
        this.isAttacking = true;
        setTimeout(() => this.isAttacking = false, 150); // La animación de ataque dura 150ms

        return true; // Indica que el disparo fue exitoso
    }
}
