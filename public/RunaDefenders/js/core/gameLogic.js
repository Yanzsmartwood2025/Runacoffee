// js/core/gameLogic.js
import { config } from '../config.js';
import { Enemy } from '../characters/Enemy.js';
import { Resource } from '../characters/Resource.js';
import { playSound } from '../services/audio.js';
import { triggerDamageFlash } from '../ui/uiManager.js';

// --- Estado del Juego y Arrays de Entidades ---
let gameState = 'loading';
let previousGameState = 'loading';
let projectiles = [], enemies = [], resources = [];

// --- Temporizadores y Contadores ---
let levelTimer = 0;
let currentWaveIndex = -1;
let spawnTimer = 0;
let globalAnimationTimer = 0;
let levelMessagesShown = [];
let isPowerActive = false;
let specialPowerPoints = 0; // Se sincronizará con main.js

/**
 * Restablece el estado de la lógica del juego para un nuevo nivel.
 */
export function resetGameLogic() {
    projectiles = [];
    enemies = [];
    resources = [];
    levelTimer = 0;
    currentWaveIndex = -1;
    spawnTimer = 0;
    globalAnimationTimer = 0;
    levelMessagesShown = [];
    isPowerActive = false;
}

/**
 * El bucle principal que actualiza el estado del juego en cada frame.
 * @param {Player} player - La instancia del jugador.
 * @param {object} base - El objeto que representa la base (el árbol).
 * @param {number} currentLevelIndex - El índice del nivel actual.
 * @returns {object} - Un objeto con el estado actualizado para que main.js lo procese.
 */
export function gameLoop(player, base, currentLevelIndex) {
    globalAnimationTimer += 0.02;

    // Actualizar todas las entidades del juego
    player.update();
    projectiles.forEach((p, i) => {
        p.update();
        if (p.x > player.canvas.width) projectiles.splice(i, 1);
    });
    enemies.forEach(e => e.update());
    resources.forEach((r, i) => {
        r.update();
        if (r.life <= 0) resources.splice(i, 1);
    });

    // Manejar poder especial
    if (isPowerActive) {
        specialPowerPoints -= (config.powerDrainRate / 60);
        if (specialPowerPoints <= 0) {
            isPowerActive = false;
            specialPowerPoints = 0;
            playSound('powerDown', 'G3', '4n');
        }
    }

    // Manejar colisiones y progresión de nivel
    const collisionResults = handleCollisions(base);
    handleLevelProgression(currentLevelIndex, player.canvas, player.cellSize);

    // Comprobar si el nivel ha terminado
    const levelOver = levelTimer >= config.levels[currentLevelIndex].duration && enemies.length === 0;

    return {
        projectiles,
        enemies,
        resources,
        baseHealth: collisionResults.newBaseHealth,
        newCoffeeBeans: collisionResults.collectedBeans,
        specialPowerPoints,
        globalAnimationTimer,
        levelOver
    };
}

/**
 * Gestiona las colisiones entre proyectiles, enemigos y la base.
 * @param {object} base - El objeto de la base.
 * @returns {object} - Resultados de las colisiones.
 */
function handleCollisions(base) {
    let newBaseHealth = base.health;
    let collectedBeans = 0;

    // Colisión Proyectil <-> Enemigo
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                playSound('enemyHit');

                if (enemies[j].health <= 0) {
                    const enemy = enemies[j];
                    const dropX = Math.min(enemy.x, enemy.width * 10); // Evita que caiga fuera de pantalla
                    if (Math.random() < enemy.type.grainChance) {
                        resources.push(new Resource(dropX, enemy.y, 'grain'));
                    }
                    if (Math.random() < enemy.type.orbChance) {
                        resources.push(new Resource(dropX, enemy.y, 'orb'));
                    }
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }

    // Colisión Enemigo <-> Base
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x < 50) { // Umbral de ataque a la base
            newBaseHealth -= 50;
            triggerDamageFlash();
            playSound('baseHit', 'C2', '4n');
            enemies.splice(i, 1);
        }
    }
    
    return { newBaseHealth, collectedBeans };
}

/**
 * Controla el avance del nivel, las oleadas y la aparición de enemigos.
 * @param {number} currentLevelIndex - El índice del nivel actual.
 * @param {HTMLCanvasElement} canvas - Referencia al canvas.
 * @param {number} cellSize - El tamaño de celda/carril.
 */
function handleLevelProgression(currentLevelIndex, canvas, cellSize) {
    if (gameState !== 'playing') return;
    levelTimer += 1 / 60;

    const currentLevel = config.levels[currentLevelIndex];
    if (!currentLevel) return;

    // Lógica para mostrar mensajes de oleada (simplificada)
    // Puedes expandir esto como en tu código original
    if (levelTimer >= currentLevel.duration * 0.8 && !levelMessagesShown[0]) {
        levelMessagesShown[0] = true;
        // showWaveMessage("¡Oleada Final!"); // Esta función estaría en uiManager
    }

    // Lógica de aparición de enemigos
    if (levelTimer < currentLevel.duration) {
        const nextWaveIndex = currentWaveIndex + 1;
        if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) {
            currentWaveIndex = nextWaveIndex;
            spawnTimer = 0;
        }

        if (currentWaveIndex > -1) {
            if (spawnTimer > 0) {
                spawnTimer--;
            } else if (enemies.length < 20) { // Límite de enemigos en pantalla
                const wave = currentLevel.waves[currentWaveIndex];
                enemies.push(new Enemy(Math.floor(Math.random() * config.lanes), wave.enemyType, canvas, cellSize));
                spawnTimer = wave.spawnInterval;
            }
        }
    }
}

/**
 * Función de utilidad para detectar colisiones rectangulares.
 */
function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// --- Getters y Setters para el Estado del Juego ---
export function getGameState() { return gameState; }
export function setGameState(newState) { gameState = newState; }
export function getPreviousGameState() { return previousGameState; }
export function setPreviousGameState(newState) { previousGameState = newState; }
