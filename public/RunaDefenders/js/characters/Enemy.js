// js/characters/Enemy.js
import { config } from '../config.js';

export class Enemy {
    constructor(lane, typeIndex, canvas, cellSize) {
        const enemyType = config.enemies[typeIndex];
        this.type = enemyType;

        this.width = cellSize - 10;
        this.height = cellSize - 10;
        this.x = canvas.width; // Inicia justo fuera de la pantalla a la derecha
        this.y = (lane * cellSize) + 5; // Se posiciona en el carril vertical asignado
        
        this.speed = enemyType.speed;
        this.health = enemyType.health;
        this.maxHealth = enemyType.health;

        this.image = new Image();
        this.image.src = enemyType.image;
    }

    /**
     * Mueve al enemigo hacia la izquierda a través de la pantalla.
     */
    update() {
        this.x -= this.speed;
    }

    /**
     * Dibuja al enemigo y su barra de vida (si está dañado) en el canvas.
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     * @param {number} globalAnimationTimer - Temporizador para animaciones de "flote".
     */
    draw(ctx, globalAnimationTimer) {
        const bobble = Math.sin(globalAnimationTimer * 5 + this.y) * (this.height * 0.05);
        ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height);

        // Dibuja la barra de vida solo si el enemigo ha recibido daño
        if (this.health < this.maxHealth) {
            const healthBarWidth = this.width;
            const healthBarHeight = 5;
            const healthBarY = this.y - 10 + bobble;

            // Dibuja el fondo rojo de la barra de vida
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, healthBarY, healthBarWidth, healthBarHeight);

            // Dibuja la parte verde que representa la vida actual
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, healthBarY, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
        }
    }
}

