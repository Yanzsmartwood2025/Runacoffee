
/*
* =================================================================
* ARCHIVO: RunaDefenders/js/systems/levelManager.js
* =================================================================
* Propósito: Gestiona toda la progresión de los niveles, las olas
* de enemigos y los tiempos.
*/

import { Enemy } from '../entities/Enemy.js';

// Gestiona la aparición de enemigos y el avance del nivel
export function handleLevelProgression(gameContext) {
    if (gameContext.gameState !== 'playing') return;

    const { config, currentLevelIndex, levelTimer } = gameContext;
    const currentLevel = config.levels[currentLevelIndex];
    if (!currentLevel) return; // No hay más niveles

    const levelDuration = currentLevel.duration;

    // Comprueba si el nivel ha terminado
    if (levelTimer >= levelDuration && gameContext.enemies.length === 0) {
        startNextLevel(gameContext);
        return;
    }

    // Lógica para mostrar mensajes de oleada
    handleWaveMessages(gameContext);

    // Lógica para generar enemigos de las olas
    if (levelTimer < levelDuration) {
        const nextWaveIndex = gameContext.currentWaveIndex + 1;
        if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) {
            gameContext.currentWaveIndex = nextWaveIndex;
            gameContext.spawnTimer = 0;
        }

        if (gameContext.currentWaveIndex > -1) {
            if (gameContext.spawnTimer > 0) {
                gameContext.spawnTimer--;
            } else if (gameContext.enemies.length < 20) {
                spawnEnemy(gameContext);
                gameContext.spawnTimer = currentLevel.waves[gameContext.currentWaveIndex].spawnInterval;
            }
        }
    }
}

// Genera un nuevo enemigo
function spawnEnemy(gameContext) {
    const { config, currentLevelIndex, currentWaveIndex, canvas, cellSize } = gameContext;
    const currentWave = config.levels[currentLevelIndex].waves[currentWaveIndex];
    const lane = Math.floor(Math.random() * config.lanes);
    const newEnemy = new Enemy(lane, currentWave.enemyType, canvas, cellSize);
    gameContext.enemies.push(newEnemy);
}

// Llama a la función para pasar al siguiente nivel
function startNextLevel(gameContext) {
    gameContext.gameState = 'level_complete';
    gameContext.playSound('levelUp', 'C6', '2n');
    
    // Lógica de desbloqueo de poderes
    if (gameContext.currentLevelIndex === 2) gameContext.unlockedPowers[0] = true;
    if (gameContext.currentLevelIndex === 5) gameContext.unlockedPowers[1] = true;
    if (gameContext.currentLevelIndex === 8) gameContext.unlockedPowers[2] = true;
    
    // Esta función la moveremos al módulo 3D, pero la dejamos aquí por ahora
    // gameContext.updatePowerOrbsVisuals(); 
    
    gameContext.saveGameData();
    gameContext.showOverlay('level_complete');
}

// Muestra los mensajes de advertencia de oleada
function handleWaveMessages(gameContext) {
    const { currentLevelIndex, levelTimer, levelMessagesShown } = gameContext;
    
    if (currentLevelIndex < 3) {
        if (levelTimer >= 120 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true; gameContext.showWaveMessage("¡Oleada Final!");
        }
    } else if (currentLevelIndex < 6) {
        if (levelTimer >= 120 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true; gameContext.showWaveMessage("¡Se acerca una gran oleada!");
        }
        if (levelTimer >= 240 && !levelMessagesShown[1]) {
            levelMessagesShown[1] = true; gameContext.showWaveMessage("¡Oleada Final!");
        }
    } else {
        if (levelTimer >= 180 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true; gameContext.showWaveMessage("¡Oleada Intensa!");
        }
        if (levelTimer >= 360 && !levelMessagesShown[1]) {
            levelMessagesShown[1] = true; gameContext.showWaveMessage("¡Oleada Final!");
        }
    }
}
