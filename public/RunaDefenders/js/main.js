// ¡IMPORTANTE! La ruta ahora apunta a la carpeta 'entities'
import { Player } from './entities/Player.js';

// Esperamos a que toda la página (HTML, CSS, imágenes) se haya cargado
window.addEventListener('load', function(){
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // La clase principal del juego que contendrá todo
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            
            // --- CONFIGURACIÓN DE CARRILES ---
            this.numberOfLanes = 4; // ¿Cuántos carriles queremos?
            this.lanePositions = []; // Aquí guardaremos las posiciones Y de cada carril
            const laneHeight = this.height / this.numberOfLanes;
            for (let i = 0; i < this.numberOfLanes; i++) {
                // Calculamos la posición Y del centro de cada carril
                this.lanePositions.push(i * laneHeight);
            }

            // Creamos una instancia de nuestro jugador
            // Le pasamos 'this' para que el jugador conozca el estado del juego (como los carriles)
            this.player = new Player(this);

            // --- MANEJO DE TECLAS ---
            this.keys = {}; // Objeto para guardar las teclas presionadas
            // Usamos una función de flecha para que 'this' se refiera a la clase 'Game'
            window.addEventListener('keydown', (e) => {
                // Evitamos que se mueva repetidamente si se mantiene la tecla presionada
                if ((e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown') && !this.keys[e.key]) {
                    this.keys[e.key] = true; // Marcamos la tecla como presionada
                    if (e.key === 'w' || e.key === 'ArrowUp') {
                        this.player.moveUp();
                    } else if (e.key === 's' || e.key === 'ArrowDown') {
                        this.player.moveDown();
                    }
                }
            });
            window.addEventListener('keyup', (e) => {
                // Cuando se suelta la tecla, la eliminamos del objeto
                delete this.keys[e.key];
            });
        }

        // Método para actualizar todos los elementos del juego
        update(){
            this.player.update();
        }

        // Método para dibujar todos los elementos del juego
        draw(context){
            // Dibujamos unas líneas para visualizar los carriles (opcional, pero útil)
            context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            context.lineWidth = 2;
            this.lanePositions.forEach(pos => {
                context.beginPath();
                context.moveTo(0, pos);
                context.lineTo(this.width, pos);
                context.stroke();
            });

            this.player.draw(context);
        }
    }

    // Creamos la instancia principal del juego
    const game = new Game(canvas.width, canvas.height);

    // --- CICLO DE ANIMACIÓN (GAME LOOP) ---
    function animate(){
        // Limpiamos el canvas en cada fotograma
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Actualizamos y dibujamos el juego
        game.update();
        game.draw(ctx);

        // Le pedimos al navegador que llame a 'animate' para el siguiente fotograma
        requestAnimationFrame(animate);
    }

    // ¡Iniciamos el ciclo del juego!
    animate();
});

