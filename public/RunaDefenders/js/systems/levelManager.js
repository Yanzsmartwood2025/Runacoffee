/*
* =================================================================
* ARCHIVO: js/systems/levelManager.js
* =================================================================
* Propósito: Controla la progresión del nivel, el tiempo, y
* cuándo deben aparecer las oleadas de enemigos.
*/

import { Enemy } from '../entities/Enemy.js';

function spawnEnemy(gameContext) {
    const { currentLevelIndex, currentWaveIndex, enemies, canvas, cellSize, config } = gameContext;
    const currentWave = config.levels[currentLevelIndex].waves[currentWaveIndex];
    enemies.push(new Enemy(Math.floor(Math.random() * config.lanes), currentWave.enemyType, canvas, cellSize));
}

function startNextLevel(gameContext) {
    gameContext.gameState = 'level_complete';
    gameContext.playSound('levelUp', 'C6', '2n');

    if (gameContext.currentLevelIndex === 2) gameContext.unlockedPowers[0] = true;
    if (gameContext.currentLevelIndex === 5) gameContext.unlockedPowers[1] = true;
    if (gameContext.currentLevelIndex === 8) gameContext.unlockedPowers[2] = true;
    // updatePowerOrbsVisuals(); // Esta función vive en scene3d.js, se llamará desde allí

    gameContext.saveGameData();
    gameContext.showOverlay('level_complete');
}


export function handleLevelProgression(gameContext) {
    if (gameContext.gameState !== 'playing') return;

    const { config, currentLevelIndex, levelTimer, enemies, showWaveMessage } = gameContext;
    const currentLevel = config.levels[currentLevelIndex];
    const levelDuration = currentLevel.duration;

    // Condición de victoria del nivel
    if (levelTimer >= levelDuration && enemies.length === 0) {
        startNextLevel(gameContext);
        return;
    }

    // Lógica para mostrar mensajes de oleadas
    // (Esta lógica puede ser expandida o mejorada)
    if (levelTimer >= 120 && !gameContext.levelMessagesShown[0]) {
        gameContext.levelMessagesShown[0] = true;
        showWaveMessage("¡Oleada Final!");
    }

    // Lógica para activar oleadas
    if (levelTimer < levelDuration) {
        const nextWaveIndex = gameContext.currentWaveIndex + 1;
        if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) {
            gameContext.currentWaveIndex = nextWaveIndex;
            gameContext.spawnTimer = 0;
        }

        if (gameContext.currentWaveIndex > -1) {
            if (gameContext.spawnTimer > 0) {
                gameContext.spawnTimer--;
            } else if (enemies.length < 20) { // Límite de enemigos en pantalla
                spawnEnemy(gameContext);
                gameContext.spawnTimer = currentLevel.waves[gameContext.currentWaveIndex].spawnInterval;
            }
        }
    }
}
