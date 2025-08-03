// modules/store.js - Gestión del estado centralizado del juego

import { Player } from '../entities/Player.js';
import { config } from '../config.js';
import { updateUI } from './ui.js';
import { updateTreeAppearance } from './scene3d.js';
import { saveGameData } from './firebase.js';

let state = {
    player: new Player(),
    base: { health: config.base.health, maxHealth: config.base.health },
    projectiles: [],
    enemies: [],
    resources: [],
    currentLevelIndex: 0,
    shootTimer: 0,
    animationFrameId: null,
    specialPowerPoints: 0,
    coffeeBeanCount: 0,
    levelTimer: 0,
    currentWaveIndex: -1,
    spawnTimer: 0,
    gameState: 'loading',
    previousGameState: 'loading',
    globalAnimationTimer: 0,
    levelMessagesShown: [],
    isPowerActive: false,
    
    // UI elements
    canvas: document.getElementById('game-canvas'),
    ctx: document.getElementById('game-canvas').getContext('2d'),
    cellSize: 0,
    
    // 3D scene elements
    orbs: [],
};

/**
 * Función para actualizar el estado de manera controlada.
 * @param {object} newState - Un objeto con las propiedades a actualizar.
 */
function updateState(newState) {
    state = { ...state, ...newState };
    
    if (newState.hasOwnProperty('base')) {
        updateTreeAppearance();
    }
    
    if (newState.hasOwnProperty('specialPowerPoints') || newState.hasOwnProperty('coffeeBeanCount')) {
        updateUI();
    }

    if (newState.hasOwnProperty('gameState')) {
        if (newState.gameState === 'game_over' || newState.gameState === 'level_complete') {
            saveGameData();
        }
    }
}

/**
 * Función para obtener una parte del estado.
 * @param {string} key - La clave de la propiedad que deseas obtener.
 * @returns {*} El valor de la propiedad.
 */
function getState(key) {
    return state[key];
}

export { state, updateState, getState };

