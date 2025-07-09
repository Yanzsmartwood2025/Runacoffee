// Usamos 'export' para que esta clase pueda ser usada en otros archivos (como main.js)
export class Player {
    // El constructor se ejecuta cuando creamos un 'new Player()'
    constructor(game) {
        this.game = game; // Guardamos una referencia al juego principal
        this.width = 100; // Ancho del jugador en píxeles
        this.height = 100; // Alto del jugador en píxeles

        // Cargamos la imagen del jugador
        this.image = new Image();
        this.image.src = 'imagenes/player.png';

        // Lógica de los carriles
        this.totalLanes = this.game.numberOfLanes;
        this.currentLane = Math.floor(this.totalLanes / 2); // Empezar en el carril del medio

        // Posición inicial
        this.x = 50; // Una pequeña distancia desde el borde izquierdo
        // La posición Y se calculará basada en el carril actual
        this.y = this.game.lanePositions[this.currentLane];

        // Velocidad para el cambio de carril (no se usa aún, pero es útil para el futuro)
        this.speed = 10;
    }

    // Dibuja al jugador en el canvas
    draw(context) {
        // Dibuja la imagen en la posición x, y con el tamaño width, height
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    // Actualiza el estado del jugador (por ahora, solo la posición Y)
    update() {
        // Hacemos que la posición Y del jugador coincida con la posición del carril actual.
        // Esto asegura que el jugador siempre esté centrado en su carril.
        this.y = this.game.lanePositions[this.currentLane];
    }

    // Mueve al jugador al carril de arriba
    moveUp() {
        // Solo se mueve si no está ya en el carril superior (carril 0)
        if (this.currentLane > 0) {
            this.currentLane--;
        }
    }

    // Mueve al jugador al carril de abajo
    moveDown() {
        // Solo se mueve si no está ya en el carril inferior
        if (this.currentLane < this.totalLanes - 1) {
            this.currentLane++;
        }
    }
}
