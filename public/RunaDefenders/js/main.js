import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
// ¡Importamos nuestro "menú" de enemigos!
import { enemyTypes } from './config.js';

window.addEventListener('load', function(){
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            
            this.numberOfLanes = 4;
            this.lanePositions = [];
            const laneHeight = this.height / this.numberOfLanes;
            for (let i = 0; i < this.numberOfLanes; i++) {
                this.lanePositions.push(i * laneHeight);
            }

            this.player = new Player(this);

            // --- LÓGICA DE ENEMIGOS ---
            this.enemies = []; // El array que contendrá los enemigos en pantalla
            this.enemyTimer = 0;
            this.enemyInterval = 2000; // Crear un enemigo cada 2 segundos

            // Lista de las claves de los enemigos que podemos crear
            this.availableEnemyKeys = Object.keys(enemyTypes);

            // ... (el código de manejo de teclas se queda igual) ...
            this.keys = {};
            window.addEventListener('keydown', (e) => {
                if ((e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown') && !this.keys[e.key]) {
                    this.keys[e.key] = true;
                    if (e.key === 'w' || e.key === 'ArrowUp') this.player.moveUp();
                    else if (e.key === 's' || e.key === 'ArrowDown') this.player.moveDown();
                }
            });
            window.addEventListener('keyup', (e) => { delete this.keys[e.key]; });
        }

        update(){
            this.player.update();

            // Si ha pasado suficiente tiempo, añadimos un nuevo enemigo
            if (this.enemyTimer > this.enemyInterval){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += 16; // Aproximadamente 16ms por fotograma
            }

            // Actualizamos cada enemigo en el array
            this.enemies.forEach(enemy => {
                enemy.update();
            });

            // Filtramos y eliminamos los enemigos que ya salieron de la pantalla
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        }

        draw(context){
            // ... (el código para dibujar los carriles se queda igual) ...
            context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            context.lineWidth = 2;
            this.lanePositions.forEach(pos => {
                context.beginPath();
                context.moveTo(0, pos);
                context.lineTo(this.width, pos);
                context.stroke();
            });

            this.player.draw(context);

            // Dibujamos cada enemigo en el array
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }

        // Nuevo método para añadir un enemigo
        addEnemy(){
            // Elegimos una "receta" de enemigo al azar de nuestro menú
            const randomKey = this.availableEnemyKeys[Math.floor(Math.random() * this.availableEnemyKeys.length)];
            const enemyData = enemyTypes[randomKey];
            
            // Creamos un nuevo enemigo usando esa receta
            this.enemies.push(new Enemy(this, enemyData));
        }
    }

    const game = new Game(canvas.width, canvas.height);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();
});
