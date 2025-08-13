// systems/gameloop.js
import { config } from '../config.js';
import {
    getState, setState, getPlayer, getProjectiles, getEnemies, getResources,
    setShootTimer, setLevelTimer, setGlobalAnimationTimer, setIsPowerActive,
    setSpecialPowerPoints, getAnimationId, setAnimationId
} from '../main.js';
import { handleCollisions } from './collision.js';
import { handleLevelProgression } from './levelManager.js';
import { updateUI, showOverlay } from '../modules/ui.js';
import { playSound } from './sfx.js';

function draw() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const player = getPlayer();
    if (player) player.draw();

    getProjectiles().forEach(p => p.draw());
    getEnemies().forEach(e => e.draw());
    getResources().forEach(r => r.draw());
}

function handleGameLogic() {
    const state = getState();
    setGlobalAnimationTimer(state.globalAnimationTimer + 0.02);
    if (state.shootTimer > 0) setShootTimer(state.shootTimer - 1);
    setLevelTimer(state.levelTimer + 1/60);

    if (state.isPowerActive) {
        const newPower = state.specialPowerPoints - (config.powerDrainRate / 60);
        setSpecialPowerPoints(newPower);
        if (newPower <= 0) {
            setIsPowerActive(false);
            setSpecialPowerPoints(0);
            playSound('powerDown', 'G3', '4n');
        }
    }

    getProjectiles().forEach((p, i) => { p.update(); if (p.x > document.getElementById('game-canvas').width) getProjectiles().splice(i, 1); });
    getEnemies().forEach(e => e.update());
    getResources().forEach((r, i) => { r.update(); if (r.life <= 0) getResources().splice(i, 1); });

    handleCollisions();
    handleLevelProgression();
}

export function gameLoop() {
    const state = getState();

    if (state.gameState === 'playing') {
        handleGameLogic();
        updateUI();
    }

    draw();

    if (state.base.health <= 0 && state.gameState !== 'game_over') {
        setState('game_over');
    }

    if (state.gameState === 'game_over') {
        showOverlay('game_over');
        if (getAnimationId()) {
            cancelAnimationFrame(getAnimationId());
            setAnimationId(null);
        }
    } else if (state.gameState !== 'level_complete' && state.gameState !== 'paused' && state.gameState !== 'menu') {
        setAnimationId(requestAnimationFrame(gameLoop));
    } else {
        if (getAnimationId()) {
            cancelAnimationFrame(getAnimationId());
            setAnimationId(null);
        }
    }
}
