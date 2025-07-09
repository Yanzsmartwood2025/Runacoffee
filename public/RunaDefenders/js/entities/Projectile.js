export class Projectile {
    // El constructor necesita saber dónde empezar (la posición x, y del jugador)
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;

        // Propiedades del proyectil
        this.width = 25;
        this.height = 10;
        this.speed = 10;
        this.damage = 20; // El daño que hará al enemigo

        // Se marcará como 'true' cuando salga de la pantalla para ser eliminado
        this.markedForDeletion = false;
    }

    // Mueve el proyectil de izquierda a derecha
    update() {
        this.x += this.speed;
        // Si el proyectil se sale del borde derecho de la pantalla...
        if (this.x > this.game.width) {
            this.markedForDeletion = true; // ...lo marcamos para eliminarlo.
        }
    }

    // Dibuja el proyectil como un simple rectángulo
    draw(context) {
        context.fillStyle = '#ff0'; // Un color amarillo brillante
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

