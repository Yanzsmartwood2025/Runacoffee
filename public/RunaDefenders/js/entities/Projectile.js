/*
* =================================================================
* ARCHIVO: RunaDefenders/js/entities/Projectile.js
* =================================================================
* Propósito: Define el comportamiento de los proyectiles (las balas de café).
*/
import { config } from '../config.js';

export class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y - 10; // Pequeño ajuste para que salga del centro del cañón
        this.width = 20;
        this.height = 20;
        this.speed = config.projectileSpeed;
        this.power = 20; // Daño que inflige

        // Carga la imagen del proyectil desde la configuración
        this.image = new Image();
        this.image.src = config.player.projectileImage;
    }

    // Mueve el proyectil hacia la derecha en cada fotograma
    update() {
        this.x += this.speed;
    }

    // Dibuja el proyectil en el lienzo
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

