// systems/levelManager.js - Lógica de gestión de niveles

import { startNextLevel, spawnEnemy } from './levelManager.js';
import { showWaveMessage } from '../modules/ui.js';
import { playSound } from '../modules/audio.js';
import {
    gameState, currentLevelIndex, levelTimer, enemies,
    currentWaveIndex, spawnTimer,
    levelMessagesShown
} from '../main.js';

/**
 * Maneja la progresión del nivel actual, incluyendo el lanzamiento de oleadas de enemigos.
 */
function handleLevelProgression() {
    if (gameState !== 'playing') return;
    const currentLevel = config.levels[currentLevelIndex];
    const levelDuration = currentLevel.duration;

    if (levelTimer >= levelDuration && enemies.length === 0) {
        startNextLevel();
        return;
    }

    // Muestra mensajes de advertencia de oleadas
    if (currentLevelIndex < 3) {
        if (levelTimer >= 120 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true;
            showWaveMessage("¡Oleada Final!");
        }
    } else if (currentLevelIndex < 6) {
        if (levelTimer >= 120 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true;
            showWaveMessage("¡Se acerca una gran oleada!");
        }
        if (levelTimer >= 240 && !levelMessagesShown[1]) {
            levelMessagesShown[1] = true;
            showWaveMessage("¡Oleada Final!");
        }
    } else {
        if (levelTimer >= 180 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true;
            showWaveMessage("¡Oleada Intensa!");
        }
        if (levelTimer >= 360 && !levelMessagesShown[1]) {
            levelMessagesShown[1] = true;
            showWaveMessage("¡Oleada Final!");
        }
    }

    // Lógica para el spawning de enemigos
    if (levelTimer < levelDuration) {
        const nextWaveIndex = currentWaveIndex + 1;
        if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) {
            currentWaveIndex = nextWaveIndex;
            spawnTimer = 0;
        }

        if (currentWaveIndex > -1) {
            if (spawnTimer > 0) {
                spawnTimer--;
            } else if (enemies.length < 20) {
                spawnEnemy();
                spawnTimer = currentLevel.waves[currentWaveIndex].spawnInterval;
            }
        }
    }
}

/**
 * Inicia el siguiente nivel del juego.
 */
function startNextLevel() {
    gameState = 'level_complete';
    playSound('levelUp', 'C6', '2n');
    saveGameData();
    showOverlay('level_complete');
}

/**
 * Crea un nuevo enemigo y lo añade al array de enemigos.
 */
function spawnEnemy() {
    const currentWave = config.levels[currentLevelIndex].waves[currentWaveIndex];
    enemies.push(new Enemy(Math.floor(Math.random() * config.lanes), currentWave.enemyType));
}

export { handleLevelProgression, startNextLevel, spawnEnemy };
