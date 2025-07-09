/*
* =================================================================
* ARCHIVO: RunaDefenders/js/main.js (El Director de Orquesta)
* =================================================================
* Propósito: El punto de entrada principal. Importa todos los módulos
* y los une para que el juego funcione.
*/

// --- 1. IMPORTACIONES DE TODOS LOS MÓDULOS ---
import { config } from './config.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Resource } from './entities/Resource.js';
import { gameLoop } from './systems/gameLoop.js';
import { handleLevelProgression } from './systems/levelManager.js';
import { handleCollisions } from './systems/collision.js';
import { playSound } from './systems/sfx.js';
import { uiElements, updateUI, showOverlay, showWaveMessage, triggerDamageFlash } from './modules/ui.js';
import { initThreeScene, updateTreeAppearance } from './modules/scene3d.js';
import { initializeFirebase, saveGameData, handleGoogleLogin, handleSignOut } from './modules/firebase.js';


// --- 2. EL CONTEXTO DEL JUEGO (EL ESTADO GLOBAL) ---
// En lugar de tener docenas de variables globales, creamos un solo objeto
// que contiene todo el estado del juego. Esto es mucho más limpio.
const gameContext = {
    // --- Estado del Juego ---
    gameState: 'loading',
    animationFrameId: null,
    currentLevelIndex: 0,
    levelTimer: 0,
    currentWaveIndex: -1,
    spawnTimer: 0,
    shootTimer: 0,
    levelMessagesShown: [],
    
    // --- Jugador y Base ---
    player: null,
    base: { ...config.base },
    coffeeBeanCount: 0,
    specialPowerPoints: 0,
    isPowerActive: false,
    unlockedPowers: [false, false, false],

    // --- Entidades ---
    enemies: [],
    resources: [],

    // --- Referencias a Elementos y Módulos ---
    canvas: uiElements.gameContainer.querySelector('#game-canvas'),
    ctx: null,
    config: config,
    uiElements: uiElements,
    
    // --- Funciones (para que otros módulos puedan llamarlas) ---
    init: init,
    playSound: playSound,
    showOverlay: (type) => showOverlay(type, gameContext),
    showWaveMessage: (text) => showWaveMessage(text, playSound),
    triggerDamageFlash: triggerDamageFlash,
    handleCollisions: () => handleCollisions(gameContext),
    handleLevelProgression: () => handleLevelProgression(gameContext),
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
    
    // Resetea todo el estado del juego al inicio de un nivel
    gameContext.currentLevelIndex = level;
    gameContext.specialPowerPoints = power;
    gameContext.coffeeBeanCount = beans;
    gameContext.base = { health: Math.min(health, config.base.health), maxHealth: config.base.health };
    gameContext.unlockedPowers = powers;
    
    gameContext.levelTimer = 0;
    gameContext.currentWaveIndex = -1;
    gameContext.enemies = [];
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

    // ... (Aquí iría la lógica para los controles de teclado y táctiles)
}

// --- 5. FUNCIONES DE INICIO ---
function resizeAll() {
    const canvas = gameContext.canvas;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas.height > 0) gameContext.cellSize = canvas.height / config.lanes;
    if (gameContext.player) {
        gameContext.player.cellSize = gameContext.cellSize; // Actualiza cellSize en el player
        gameContext.player.reset();
    }
}

// --- PUNTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    const treeCanvasContainer = document.getElementById('tree-canvas-container');
    
    setupEventListeners();
    initThreeScene(treeCanvasContainer);
    
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
        (user) => {
            // Lógica para actualizar la UI de autenticación
        }
    );
    
    window.addEventListener('resize', resizeAll);
    // El gameLoop ahora se inicia al presionar "Start"
});
