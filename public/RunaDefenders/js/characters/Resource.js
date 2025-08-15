// js/characters/Resource.js
import { config } from '../config.js';

export class Resource {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = 45;
        this.type = type; // Puede ser 'grain' (grano) o 'orb' (orbe)
        
        this.image = new Image();
        this.image.src = type === 'grain' ? config.grainImage : config.orbImage;
        
        this.life = 400; // Tiempo en frames antes de desaparecer si no se recoge
        this.isFlying = false; // Se activa cuando el jugador lo recoge para la animación
    }

    /**
     * Reduce el tiempo de vida del recurso en cada frame.
     */
    update() {
        this.life--;
    }

    /**
     * Dibuja el recurso en el canvas con un efecto de pulso y desvanecimiento.
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     * @param {number} globalAnimationTimer - Un temporizador global para sincronizar animaciones.
     */
    draw(ctx, globalAnimationTimer) {
        // No se dibuja si ya está en la animación de "volar" hacia el contador
        if (this.isFlying) return;

        // Efecto de pulso (crece y decrece)
        const scale = 1 + Math.sin(globalAnimationTimer * 6) * 0.08;
        const newSize = this.size * scale;
        const sizeDiff = (newSize - this.size) / 2;

        // Efecto de desvanecimiento cuando está a punto de desaparecer
        ctx.globalAlpha = this.life < 60 ? this.life / 60 : 1;
        
        ctx.drawImage(this.image, this.x - sizeDiff, this.y - sizeDiff, newSize, newSize);
        
        // Restaurar la opacidad global para no afectar a otros dibujos
        ctx.globalAlpha = 1;
    }
}
