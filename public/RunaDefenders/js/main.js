// =================================================================
// --- MODULE IMPORTS ---
// =================================================================
import { config } from './config.js';
import { Player } from './characters/Player.js';
import { initializeAndLoadGame, saveGameData } from './services/firebase.js';
import { initThreeScene, updateTreeAppearance, updateOrbsLockState, toggleTreeMenu } from './services/scene3D.js';
import { setupEventListeners } from './core/eventListeners.js';
import { gameLoop, resetGameLogic, getGameState, setGameState, setPreviousGameState } from './core/gameLogic.js';
import { showOverlay, updateUI, resizeCanvas, getCellSize } from './ui/uiManager.js';
import { startAudioContext, loadMusic, playMusic, stopMusic } from './services/audio.js';

// =================================================================
// --- GLOBAL STATE & VARIABLES ---
// =================================================================

const loadingScreen = document.getElementById('loading-screen');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let player;
let base = { ...config.base };
let currentLevelIndex = 0;
let specialPowerPoints = 0;
let coffeeBeanCount = 0;
let isMusicLoaded = false;

// =================================================================
// --- INITIALIZATION & GAME FLOW ---
// =================================================================

function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) {
    console.log(`Initializing level ${level + 1}`);
    
    currentLevelIndex = level;
    specialPowerPoints = power;
    coffeeBeanCount = beans;
    base.health = Math.min(health, config.base.maxHealth);
    base.maxHealth = config.base.maxHealth;

    resetGameLogic();

    resizeAll();
    if (!player) {
        player = new Player(canvas, getCellSize());
    } else {
        player.reset();
    }

    updateTreeAppearance(base);
    updateOrbsLockState(currentLevelIndex);
    updateUI(currentLevelIndex, coffeeBeanCount, specialPowerPoints, base);
    
    setGameState('start');
    showOverlay('start', { level: currentLevelIndex + 1 });

    if (isFirstLoad) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

async function startGame() {
    await startAudioContext(); 
    
    playMusic();

    setGameState('playing');
    gameContainer.classList.add('playing');
    showOverlay(null);
    
    requestAnimationFrame(mainGameLoop);
}

function startNextLevel() {
    setGameState('level_complete');
    saveCurrentGameData();
    showOverlay('level_complete', {
        level: currentLevelIndex + 1,
        onNext: () => {
            showOverlay('loading_next');
            setTimeout(() => {
                currentLevelIndex++;
                init(currentLevelIndex, specialPowerPoints, coffeeBeanCount, base.health, false);
            }, 1500);
        },
        isLastLevel: currentLevelIndex >= config.levels.length - 1
    });
}

function togglePause() {
    const currentState = getGameState();
    if (currentState === 'playing') {
        stopMusic();
        setPreviousGameState('playing');
        setGameState('paused');
        showOverlay('pause');
    } else if (currentState === 'paused') {
        playMusic();
        setGameState('playing');
        showOverlay(null);
        requestAnimationFrame(mainGameLoop);
    }
}

// =================================================================
// --- MAIN GAME LOOP ---
// =================================================================

function mainGameLoop(timestamp) {
    if (getGameState() !== 'playing') {
        if (getGameState() === 'game_over') {
            stopMusic();
            showOverlay('game_over');
        }
        return;
    }

    const logicUpdates = gameLoop(player, base, currentLevelIndex);
    
    specialPowerPoints = logicUpdates.specialPowerPoints;
    coffeeBeanCount += logicUpdates.newCoffeeBeans;
    base.health = logicUpdates.baseHealth;

    updateUI(currentLevelIndex, coffeeBeanCount, specialPowerPoints, base);
    updateTreeAppearance(base);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx, logicUpdates.globalAnimationTimer);
    logicUpdates.projectiles.forEach(p => p.draw(ctx));
    logicUpdates.enemies.forEach(e => e.draw(ctx, logicUpdates.globalAnimationTimer));
    logicUpdates.resources.forEach(r => r.draw(ctx, logicUpdates.globalAnimationTimer));

    if (logicUpdates.levelOver) {
        stopMusic();
        startNextLevel();
        return;
    }
    if (base.health <= 0) {
        setGameState('game_over');
    }

    requestAnimationFrame(mainGameLoop);
}

// =================================================================
// --- HELPER FUNCTIONS ---
// =================================================================

function resizeAll() {
    resizeCanvas();
    if (player) {
        player.cellSize = getCellSize();
        player.reset();
    }
}

function saveCurrentGameData() {
    saveGameData({
        level: currentLevelIndex,
        specialPower: specialPowerPoints,
        coffeeBeans: coffeeBeanCount,
        baseHealth: base.health
    });
}

// =================================================================
// --- SCRIPT EXECUTION ---
// =================================================================

document.addEventListener('DOMContentLoaded', async () => {
    initThreeScene();

    try {
        const musicUrl = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/RunaDefenders/assets/audio/music/nivel1_musica.mp3';
        console.log("Attempting to load music from:", musicUrl);
        await loadMusic(musicUrl);
        isMusicLoaded = true;
    } catch (error) {
        console.error("Music could not be loaded. The game will continue without it.");
        isMusicLoaded = false;
    }

    initializeAndLoadGame(init);

    setupEventListeners({
        onStart: startGame,
        onPause: togglePause,
        onRestart: () => init(currentLevelIndex, 0, 0, config.base.maxHealth, false),
        onMainMenu: () => init(0, 0, 0, config.base.maxHealth, false),
        onToggleTreeMenu: (show) => toggleTreeMenu(show, mainGameLoop),
        onActivatePower: () => {
            if (getGameState() === 'playing' && specialPowerPoints >= config.specialPowerMax) {
                console.log("Power activated from main");
            }
        }
    });

    window.addEventListener('resize', resizeAll);
});
