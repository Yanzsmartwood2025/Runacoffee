
/*
* =================================================================
* ARCHIVO: RunaDefenders/js/entities/Resource.js
* =================================================================
* Propósito: Define los granos de café y orbes de poder que se pueden recolectar.
*/
import { config } from '../config.js';

export class Resource {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = 45;
        this.type = type; // Puede ser 'grain' o 'orb'
        
        // Carga la imagen correcta según el tipo de recurso
        this.image = new Image();
        this.image.src = type === 'grain' ? config.resources.grainImage : config.resources.orbImage;
        
        this.life = 400; // Tiempo en fotogramas antes de desaparecer
        this.isFlying = false; // Estado para la animación de recolección
    }

    // Reduce su tiempo de vida en cada fotograma
    update() {
        this.life--;
    }

    // Dibuja el recurso con un efecto de pulso y desvanecimiento
    draw(ctx, globalAnimationTimer) {
        if (this.isFlying) return; // Si está volando hacia la bolsa, no lo dibujes aquí

        const scale = 1 + Math.sin(globalAnimationTimer * 6) * 0.08;
        const newSize = this.size * scale;
        const sizeDiff = (newSize - this.size) / 2;

        // Efecto de desvanecimiento cuando está a punto de desaparecer
        ctx.globalAlpha = this.life < 60 ? this.life / 60 : 1;
        ctx.drawImage(this.image, this.x - sizeDiff, this.y - sizeDiff, newSize, newSize);
        ctx.globalAlpha = 1; // Restaura la opacidad global
    }
}
