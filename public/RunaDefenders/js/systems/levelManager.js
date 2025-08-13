// systems/levelManager.js
import { config } from '../config.js';
import { getState, setState, getEnemies, setCurrentWaveIndex, setSpawnTimer } from '../main.js';
import { Enemy } from '../entities.js';
import { showOverlay, showWaveMessage } from '../modules/ui.js';
import { playSound } from './sfx.js';
import { saveGameData } from '../modules/firebase.js';

export function handleLevelProgression() {
    if (getState().gameState !== 'playing') return;

    const state = getState();
    const currentLevel = config.levels[state.currentLevelIndex];
    const levelDuration = currentLevel.duration;

    if (state.levelTimer >= levelDuration && getEnemies().length === 0) {
        startNextLevel();
        return;
    }

    // Lógica de mensajes de oleada
    if (state.currentLevelIndex < 3) {
        if (state.levelTimer >= 120 && !state.levelMessagesShown[0]) {
            state.levelMessagesShown[0] = true; showWaveMessage("¡Oleada Final!");
        }
    } // ... (puedes añadir el resto de la lógica de mensajes aquí si quieres)

    if (state.levelTimer < levelDuration) {
        const nextWaveIndex = state.currentWaveIndex + 1;
        if (nextWaveIndex < currentLevel.waves.length && state.levelTimer >= currentLevel.waves[nextWaveIndex].startTime) {
            setCurrentWaveIndex(nextWaveIndex);
            setSpawnTimer(0);
        }

        if (state.currentWaveIndex > -1) {
            const currentSpawnTimer = getState().spawnTimer;
            if (currentSpawnTimer > 0) {
                setSpawnTimer(currentSpawnTimer - 1);
            } else if (getEnemies().length < 20) {
                spawnEnemy();
                setSpawnTimer(currentLevel.waves[state.currentWaveIndex].spawnInterval);
            }
        }
    }
}

function startNextLevel() {
    setState('level_complete');
    playSound('levelUp', 'C6', '2n');
    saveGameData();
    showOverlay('level_complete');
}

function spawnEnemy() {
    const state = getState();
    const currentWave = config.levels[state.currentLevelIndex].waves[state.currentWaveIndex];
    getEnemies().push(new Enemy(Math.floor(Math.random() * config.lanes), currentWave.enemyType));
}
