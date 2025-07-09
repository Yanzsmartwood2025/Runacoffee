export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.image = new Image();
        this.image.src = 'imagenes/player.png';
        this.totalLanes = this.game.numberOfLanes;
        this.currentLane = Math.floor(this.totalLanes / 2);
        this.x = 50;
        this.y = this.game.lanePositions[this.currentLane];
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y = this.game.lanePositions[this.currentLane];
    }

    moveUp() {
        if (this.currentLane > 0) this.currentLane--;
    }

    moveDown() {
        if (this.currentLane < this.totalLanes - 1) this.currentLane++;
    }

    // ¡NUEVO MÉTODO!
    // Este método crea y devuelve un nuevo proyectil desde la posición del jugador.
    shoot() {
        // La bala sale del centro-derecha del jugador
        const projectileX = this.x + this.width;
        const projectileY = this.y + this.height / 2 - 5; // -5 para centrar la bala
        return new Projectile(this.game, projectileX, projectileY);
    }
}
