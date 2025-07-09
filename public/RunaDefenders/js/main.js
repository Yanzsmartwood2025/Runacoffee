/*
* =================================================================
* ARCHIVO: RunaDefenders/js/main.js (El Director de Orquesta)
* =================================================================
* Propósito: El punto de entrada principal. Importa todos los módulos
* y los une para que el juego funcione.
*/

// --- 1. IMPORTACIONES DE TODOS LOS MÓDULOS (CORREGIDAS) ---
import { config } from './config.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Resource } from './entities/Resource.js';
import { gameLoop } from './systems/gameLoop.js';
import { handleLevelProgression } from './systems/levelManager.js'; // <-- Se importa el archivo que faltaba
import { handleCollisions, checkResourceClick } from './systems/collision.js'; // <-- Se importa la función que faltaba
import { playSound, initSounds } from './systems/sfx.js';
import { uiElements, updateUI, showOverlay, showWaveMessage, triggerDamageFlash, animateResourceToBag } from './modules/ui.js';
import { initThreeScene, updateTreeAppearance } from './modules/scene3d.js';
import { initializeFirebase, saveGameData, handleGoogleLogin, handleSignOut } from './modules/firebase.js';

// --- 2. EL CONTEXTO DEL JUEGO (EL ESTADO GLOBAL) ---
const gameContext = {
    gameState: 'loading',
    animationFrameId: null,
    currentLevelIndex: 0,
    levelTimer: 0,
    currentWaveIndex: -1,
    spawnTimer: 0,
    shootTimer: 0,
    levelMessagesShown: [],
    
    player: null,
    base: { ...config.base },
    coffeeBeanCount: 0,
    specialPowerPoints: 0,
    isPowerActive: false,
    unlockedPowers: [false, false, false],

    enemies: [],
    projectiles: [],
    resources: [],

    canvas: uiElements.gameContainer.querySelector('#game-canvas'),
    ctx: null,
    config: config,
    uiElements: uiElements,
    
    init: init,
    playSound: playSound,
    showOverlay: (type) => showOverlay(type, gameContext),
    showWaveMessage: (text) => showWaveMessage(text, playSound),
    triggerDamageFlash: triggerDamageFlash,
    handleCollisions: () => handleCollisions(gameContext),
    gameLoop: () => gameLoop(gameContext),
    updateTreeAppearance: () => updateTreeAppearance(gameContext.base, uiElements.treeHealthBar),
    saveGameData: () => saveGameData({
        level: gameContext.currentLevelIndex,
        specialPower: gameContext.specialPowerPoints,
        coffeeBeans: gameContext.coffeeBeanCount,
        baseHealth: gameContext.base.health,
        unlockedPowers: gameContext.unlockedPowers
    }),
};
gameContext.ctx = gameContext.canvas.getContext('2d');

// --- 3. FUNCIÓN DE INICIALIZACIÓN PRINCIPAL ---
function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true, powers = [false, false, false]) {
    if (gameContext.animationFrameId) cancelAnimationFrame(gameContext.animationFrameId);
    
    gameContext.currentLevelIndex = level;
    gameContext.specialPowerPoints = power;
    gameContext.coffeeBeanCount = beans;
    gameContext.base = { health: Math.min(health, config.base.health), maxHealth: config.base.health };
    gameContext.unlockedPowers = powers;
    
    gameContext.levelTimer = 0;
    gameContext.currentWaveIndex = -1;
    gameContext.enemies = [];
    gameContext.projectiles = [];
    gameContext.resources = [];
    gameContext.levelMessagesShown = [];
    gameContext.isPowerActive = false;

    resizeAll();
    gameContext.player = new Player(gameContext.canvas, gameContext.cellSize);
    
    gameContext.updateTreeAppearance();
    updateUI(gameContext);
    
    gameContext.gameState = 'start';
    showOverlay('start', gameContext);

    if (isFirstLoad) {
        uiElements.loadingScreen.style.opacity = '0';
        setTimeout(() => { uiElements.loadingScreen.style.display = 'none'; }, 500);
    }
}

// --- 4. CONFIGURACIÓN DE EVENTOS Y CONTROLES ---
function setupEventListeners() {
    const handleStart = async (event) => {
        event.preventDefault();
        try { if (Tone.context.state !== 'running') await Tone.start(); } 
        catch (e) { console.error("Could not start audio context:", e); }

        gameContext.gameState = 'playing';
        uiElements.gameContainer.classList.add('playing');
        uiElements.gameOverlay.classList.add('hidden');
        uiElements.gameOverlay.classList.remove('active');
        gameContext.spawnTimer = 0;
        if (gameContext.animationFrameId) cancelAnimationFrame(gameContext.animationFrameId);
        gameLoop(gameContext);
    };

    uiElements.startButton.addEventListener('click', handleStart);
    uiElements.retryButton.addEventListener('click', (e) => { e.preventDefault(); init(gameContext.currentLevelIndex, 0, 0, config.base.health, false, gameContext.unlockedPowers); });
    
    const togglePause = () => {
        if (gameContext.gameState === 'playing') {
            gameContext.gameState = 'paused';
            showOverlay('pause', gameContext);
        } else if (gameContext.gameState === 'paused') {
            gameContext.gameState = 'playing';
            uiElements.gameOverlay.classList.add('hidden');
            uiElements.gameOverlay.classList.remove('active');
            gameLoop(gameContext);
        }
    };

    uiElements.menuButton.addEventListener('click', togglePause);
    uiElements.resumeButton.addEventListener('click', togglePause);
    uiElements.restartLevelButton.addEventListener('click', (e) => {
        e.preventDefault();
        gameContext.gameState = 'playing';
        init(gameContext.currentLevelIndex, gameContext.specialPowerPoints, gameContext.coffeeBeanCount, config.base.health, false, gameContext.unlockedPowers);
    });

    const activateSpecialPower = () => {
        if (gameContext.specialPowerPoints >= config.specialPowerMax && !gameContext.isPowerActive && gameContext.gameState === 'playing') {
            gameContext.isPowerActive = true;
            playSound('powerUp', 'C5', '2n');
            updateUI(gameContext);
        }
    };
    uiElements.activatePowerButton.addEventListener('click', activateSpecialPower);

    const keys = {};
    window.addEventListener('keydown', e => { 
        const key = e.key.toLowerCase();
        keys[key] = true; 
        if (key === ' ' || key.includes('arrow')) e.preventDefault();
        if (key === 'e') activateSpecialPower();
        if (key === 'escape' && (gameContext.gameState === 'playing' || gameContext.gameState === 'paused')) {
            togglePause();
        }
    });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    
    function controlLoop() {
        if (gameContext.gameState === 'playing' && gameContext.player) {
            if (keys['w'] || keys['arrowup']) gameContext.player.y -= gameContext.player.speed;
            if (keys['s'] || keys['arrowdown']) gameContext.player.y += gameContext.player.speed;
            if (keys[' ']) gameContext.player.shoot(gameContext);
            gameContext.player.update();
        }
        requestAnimationFrame(controlLoop);
    }
    controlLoop();
    
    // Controles Táctiles
    let isDragging = false, didDrag = false, touchYOffset = 0, touchStartY = 0;
    const canvas = gameContext.canvas;
    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); 
        if (!gameContext.player || gameContext.gameState !== 'playing') return;
        const touch = e.touches[0]; 
        const rect = canvas.getBoundingClientRect();
        isDragging = true; 
        didDrag = false;
        const currentY = touch.clientY - rect.top;
        touchStartY = currentY; 
        touchYOffset = currentY - gameContext.player.y;
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault(); 
        if (!isDragging || !gameContext.player || gameContext.gameState !== 'playing') return;
        const touch = e.touches[0]; 
        const rect = canvas.getBoundingClientRect();
        const newY = touch.clientY - rect.top;
        if (Math.abs(newY - touchStartY) > 5) didDrag = true;
        gameContext.player.y = newY - touchYOffset;
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        if (gameContext.gameState !== 'playing' || !gameContext.player) return;
        if (didDrag) {
            isDragging = false;
            didDrag = false;
            return;
        }
        
        isDragging = false;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.changedTouches[0].clientX - rect.left;
        const clickY = e.changedTouches[0].clientY - rect.top;

        if (isColliding({x: clickX, y: clickY, width: 1, height: 1}, gameContext.player)) {
            gameContext.player.shoot(gameContext);
        } else {
            checkResourceClick(clickX, clickY, gameContext);
        }
    });

    canvas.addEventListener('click', e => {
        if (!gameContext.player || gameContext.gameState !== 'playing') return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (isColliding({x: clickX, y: clickY, width: 1, height: 1}, gameContext.player)) {
            gameContext.player.shoot(gameContext);
        } else {
            checkResourceClick(clickX, clickY, gameContext);
        }
    });
}

// --- 5. FUNCIONES DE INICIO ---
function resizeAll() {
    const canvas = gameContext.canvas;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas.height > 0) gameContext.cellSize = canvas.height / config.lanes;
    if (gameContext.player) {
        gameContext.player.cellSize = gameContext.cellSize;
        gameContext.player.reset();
    }
}

function isColliding(a,b){ return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }

// --- PUNTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    const treeCanvasContainer = document.getElementById('tree-canvas-container');
    
    initSounds();
    setupEventListeners();
    initThreeScene(treeCanvasContainer, gameContext);
    
    initializeFirebase(
        (savedData) => {
            if (savedData) {
                init(savedData.level, savedData.specialPower, savedData.coffeeBeans, savedData.baseHealth, true, savedData.unlockedPowers);
            } else {
                init(0, 0, 0, config.base.health, true, [false, false, false]);
            }
        },
        () => {
            init(0, 0, 0, config.base.health, true, [false, false, false]);
        },
        handleGoogleLogin,
        handleSignOut
    );
    
    window.addEventListener('resize', resizeAll);
});
