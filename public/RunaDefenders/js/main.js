// Importamos las clases necesarias
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js'; // <-- Nueva importación
import { enemyTypes } from './config.js';
import { UI } from './ui.js';

window.addEventListener('load', function(){
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.gameState = 'loading';
            this.ui = new UI(this);

            this.numberOfLanes = 4;
            this.lanePositions = [];
            const laneHeight = this.height / this.numberOfLanes;
            for (let i = 0; i < this.numberOfLanes; i++) {
                this.lanePositions.push(i * laneHeight);
            }

            this.player = new Player(this);
            this.enemies = [];
            this.projectiles = []; // <-- Array para guardar los proyectiles activos

            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.availableEnemyKeys = Object.keys(enemyTypes);
            
            // --- MANEJO DE EVENTOS ---
            this.ui.startButton.addEventListener('click', () => this.startGame());
            this.ui.retryButton.addEventListener('click', () => this.restartGame());
            this.ui.resumeButton.addEventListener('click', () => this.resumeGame());
            
            this.keys = {};
            window.addEventListener('keydown', (e) => {
                if (this.gameState !== 'running') return;
                
                // Movimiento (sin cambios)
                if ((e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown') && !this.keys[e.key]) {
                    this.keys[e.key] = true;
                    if (e.key === 'w' || e.key === 'ArrowUp') this.player.moveUp();
                    else if (e.key === 's' || e.key === 'ArrowDown') this.player.moveDown();
                }

                // ¡NUEVO! Lógica de disparo
                if (e.key === ' ' || e.key.toLowerCase() === 'spacebar') {
                    // Añadimos un nuevo proyectil al array del juego
                    this.projectiles.push(this.player.shoot());
                }
            });
            window.addEventListener('keyup', (e) => { delete this.keys[e.key]; });
        }

        update(){
            if (this.gameState !== 'running') return;
            
            this.player.update();

            // Actualizamos los proyectiles
            this.projectiles.forEach(p => p.update());
            this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
            
            // Actualizamos los enemigos (sin cambios)
            if (this.enemyTimer > this.enemyInterval){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += 16;
            }
            this.enemies.forEach(enemy => enemy.update());
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        }

        draw(context){
            this.player.draw(context);
            this.enemies.forEach(enemy => enemy.draw(context));
            // Dibujamos los proyectiles
            this.projectiles.forEach(p => p.draw(context));
        }

        addEnemy(){
            const randomKey = this.availableEnemyKeys[Math.floor(Math.random() * this.availableEnemyKeys.length)];
            const enemyData = enemyTypes[randomKey];
            this.enemies.push(new Enemy(this, enemyData));
        }

        // ... (métodos de estado del juego sin cambios) ...
        runInitialSetup() { this.gameState = 'ready'; this.ui.hideLoadingScreen(); this.ui.showOverlay('start'); }
        startGame() { this.gameState = 'running'; this.ui.hideOverlay(); }
        restartGame() { this.enemies = []; this.projectiles = []; this.startGame(); }
        resumeGame() { this.gameState = 'running'; this.ui.hideOverlay(); }
    }

    const game = new Game(canvas.width, canvas.height);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate();
    game.runInitialSetup();
});
