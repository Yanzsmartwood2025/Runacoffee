// Esta es nuestra clase "molde" para CUALQUIER enemigo.
export class Enemy {
    // El constructor ahora espera los datos de un tipo de enemigo específico.
    constructor(game, enemyData) {
        this.game = game;

        // Asignamos las propiedades basadas en los datos recibidos.
        this.width = enemyData.width;
        this.height = enemyData.height;
        this.speed = enemyData.speed;
        this.health = enemyData.health;
        this.maxHealth = enemyData.health; // Guardamos la vida máxima para la barra de vida

        // Cargamos la imagen correcta
        this.image = new Image();
        this.image.src = enemyData.imageSrc;

        // Posición inicial: aparece a la derecha, en un carril aleatorio
        this.x = this.game.width; // Empieza justo fuera de la pantalla
        this.lane = Math.floor(Math.random() * this.game.numberOfLanes);
        this.y = this.game.lanePositions[this.lane];

        // Se usará para eliminarlo del juego
        this.markedForDeletion = false;
    }

    // El método update mueve al enemigo
    update() {
        // Se mueve de derecha a izquierda
        this.x -= this.speed;

        // Si el enemigo sale completamente de la pantalla, lo marcamos para eliminarlo
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }

    // El método draw dibuja al enemigo
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
