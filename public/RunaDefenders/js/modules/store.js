// modules/store.js
// Centraliza el estado del juego para que sea fácil de acceder y modificar.

let gameState = {
    // Game State
    gameState: 'loading',
    previousGameState: 'loading',
    animationFrameId: null,
    
    // Player & Base
    player: null,
    base: { health: 1000, maxHealth: 1000 },
    
    // Entities
    projectiles: [],
    enemies: [],
    resources: [],
    
    // Level & Timers
    currentLevelIndex: 0,
    levelTimer: 0,
    currentWaveIndex: -1,
    spawnTimer: 0,
    shootTimer: 0,
    globalAnimationTimer: 0,
    levelMessagesShown: [],
    
    // Power & Score
    specialPowerPoints: 0,
    coffeeBeanCount: 0,
    isPowerActive: false,

    // System
    cellSize: 0,
    userId: null
};

export function getState() {
    return gameState;
}

export function setState(newState) {
    gameState = { ...gameState, ...newState };
}
