
/*
* =================================================================
* ARCHIVO: RunaDefenders/js/entities/Enemy.js
* =================================================================
* Propósito: Define el comportamiento de todos los enemigos.
*/
import { config } from '../config.js';

export class Enemy {
    constructor(lane, typeIndex, canvas, cellSize) {
        this.canvas = canvas;
        this.cellSize = cellSize;
        
        // Obtiene los datos del tipo de enemigo desde el archivo de configuración
        this.type = config.enemies[typeIndex];

        this.width = this.cellSize - 10;
        this.height = this.cellSize - 10;
        this.x = this.canvas.width; // Empieza fuera de la pantalla, a la derecha
        this.baseY = (lane * this.cellSize) + 5;
        this.y = this.baseY;
        this.speed = this.type.speed;
        this.health = this.type.health;
        this.maxHealth = this.health;

        // Carga la imagen específica para este tipo de enemigo
        this.image = new Image();
        this.image.src = this.type.image;
    }

    // Mueve al enemigo hacia la izquierda en cada fotograma
    update() {
        this.x -= this.speed;
    }

    // Dibuja al enemigo y su barra de vida si está dañado
    draw(ctx, globalAnimationTimer) {
        // Pequeño efecto de "flote" para que se vea más vivo
        const bobble = Math.sin(globalAnimationTimer * 5 + this.baseY) * (this.cellSize * 0.05);
        ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height);

        // Dibuja la barra de vida solo si ha recibido daño
        if (this.health < this.maxHealth) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 10 + bobble, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y - 10 + bobble, this.width * (this.health / this.maxHealth), 5);
        }
    }
}
