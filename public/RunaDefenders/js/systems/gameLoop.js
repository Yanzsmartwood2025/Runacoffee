// systems/gameLoop.js - El bucle principal del juego

import { handleCollisions } from './collision.js';
import { handleLevelProgression } from './levelManager.js';
import { updateUI } from '../modules/ui.js';
import {
    player, projectiles, enemies, resources, gameState,
    isPowerActive, specialPowerPoints,
    animationFrameId, globalAnimationTimer
} from '../main.js';

/**
 * Dibuja todas las entidades en el canvas.
 */
function draw() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (player) player.draw();
    projectiles.forEach(p => p.draw());
    enemies.forEach(e => e.draw());
    resources.forEach(r => r.draw());
}

/**
 * Maneja la lógica de actualización del juego.
 */
function handleGameLogic() {
    globalAnimationTimer += 0.02;
    if (shootTimer > 0) shootTimer--;
    levelTimer += 1 / 60;

    if (isPowerActive) {
        specialPowerPoints -= (config.powerDrainRate / 60);
        if (specialPowerPoints <= 0) {
            isPowerActive = false;
            specialPowerPoints = 0;
            playSound('powerDown', 'G3', '4n');
            document.getElementById('activate-power-button').classList.remove('power-ready');
        }
    }

    projectiles.forEach((p, i) => { p.update(); if (p.x > canvas.width) projectiles.splice(i, 1); });
    enemies.forEach(e => e.update());
    resources.forEach((r, i) => { r.update(); if (r.life <= 0) resources.splice(i, 1); });
    handleCollisions();
    handleLevelProgression();
}

/**
 * El bucle principal del juego. Se llama en cada frame.
 */
function gameLoop() {
    if (gameState === 'playing') {
        handleGameLogic();
        updateUI();
    }
    draw();

    if (gameState === 'game_over') {
        showOverlay('game_over');
    } else if (gameState !== 'level_complete' && gameState !== 'paused' && gameState !== 'menu') {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

export { draw, gameLoop };

