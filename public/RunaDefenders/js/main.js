// main.js - Punto de entrada principal del juego

// =================================================================
// --- MÓDULOS DEL JUEGO ---
// =================================================================
// Importa las clases de las entidades del juego
import { Player, Projectile, Enemy, Resource } from './entities.js';
// Importa la configuración del juego
import { config } from './config.js';
// Importa la lógica principal del juego
import { handleCollisions, handleGameLogic, handleLevelProgression, startNextLevel, spawnEnemy, gameLoop } from './systems.js';
// Importa las funciones de la interfaz de usuario
import { setupUIElements, updateUI, showOverlay, animateResourceToBag } from './modules/ui.js';
// Importa las funciones de audio
import { sounds, playSound } from './modules/audio.js';
// Importa las funciones de la escena 3D
import { initThreeScene, updateTreeAppearance, updateOrbsLockState, toggleTreeMenu } from './modules/threeScene.js';
// Importa las funciones de Firebase
import { initializeAndLoadGame, saveGameData, loadGameData, auth, db, userId } from './modules/firebase.js';

// =================================================================
// --- VARIABLES GLOBALES DEL JUEGO ---
// =================================================================
// Variables globales accesibles por todos los módulos
let cellSize, player, base;
let projectiles = [], enemies = [], resources = [];
let currentLevelIndex = 0, shootTimer = 0, animationFrameId;
let specialPowerPoints = 0, coffeeBeanCount = 0;
let levelTimer = 0, currentWaveIndex = -1, spawnTimer = 0;
let gameState = 'loading', previousGameState = 'loading';
let globalAnimationTimer = 0;
let levelMessagesShown = [];
let isPowerActive = false;

// Exporta las variables globales para que otros módulos puedan acceder a ellas
export {
    cellSize, player, base, projectiles, enemies, resources,
    currentLevelIndex, shootTimer, animationFrameId,
    specialPowerPoints, coffeeBeanCount, levelTimer, currentWaveIndex, spawnTimer,
    gameState, previousGameState, globalAnimationTimer, levelMessagesShown, isPowerActive,
    toggleTreeMenu
};

// =================================================================
// --- FUNCIONES DE MANIPULACIÓN DEL ESTADO ---
// =================================================================
// Función para inicializar el juego
function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    currentLevelIndex = level;
    specialPowerPoints = power;
    coffeeBeanCount = beans;
    base = { health: Math.min(health, config.base.health), maxHealth: config.base.health };
    
    levelTimer = 0; currentWaveIndex = -1;
    enemies = []; projectiles = []; resources = [];
    levelMessagesShown = [];
    isPowerActive = false;

    resizeAll(); 
    updateTreeAppearance();
    updateOrbsLockState();
    updateUI();
    
    gameState = 'start';
    showOverlay('start');

    if (isFirstLoad) {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => { document.getElementById('loading-screen').style.display = 'none'; }, 500);
    }
}

// Función para activar el poder especial
function activateSpecialPower() {
    if (specialPowerPoints >= config.specialPowerMax && !isPowerActive && gameState === 'playing') {
        isPowerActive = true;
        playSound('powerUp', 'C5', '2n');
        updateUI();
    }
}

// Lógica para redimensionar el canvas y las entidades
function resizeAll() {
    const canvas = document.getElementById('game-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas.height > 0) cellSize = canvas.height / config.lanes;
    if (!player) player = new Player();
    else player.reset();
    if(gameState !== 'playing') draw();
}

// =================================================================
// --- EVENTOS Y CONTROL DE ENTRADA ---
// =================================================================
function setupEventListeners() {
    const startButton = document.getElementById('start-button');
    const retryButton = document.getElementById('retry-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const restartPauseButton = document.getElementById('restart-pause-button');
    const mainMenuButton = document.getElementById('main-menu-button');
    const howToPlayButton = document.getElementById('how-to-play-button');
    const backToPauseButton = document.getElementById('back-to-pause-button');
    const activatePowerButton = document.getElementById('activate-power-button');
    const canvas = document.getElementById('game-canvas');
    const treeCanvasContainer = document.getElementById('tree-canvas-container');

    const handleStart = async (event) => {
        event.preventDefault();
        try { if (Tone.context.state !== 'running') await Tone.start(); } 
        catch (e) { console.error("Could not start audio context:", e); }

        gameState = 'playing';
        document.getElementById('game-container').classList.add('playing');
        document.getElementById('game-overlay').classList.add('hidden');
        document.getElementById('game-overlay').classList.remove('active');
        gameLoop();
    };
    startButton.addEventListener('click', handleStart);

    retryButton.addEventListener('click', (e) => { e.preventDefault(); init(currentLevelIndex, 0, 0, config.base.health, false); });
    
    pauseButton.addEventListener('click', () => {
        if (gameState === 'playing') {
            previousGameState = gameState;
            gameState = 'paused';
            showOverlay('pause');
        }
    });
    
    resumeButton.addEventListener('click', () => {
        if (gameState === 'paused') {
            gameState = 'playing';
            document.getElementById('game-overlay').classList.add('hidden');
            document.getElementById('game-overlay').classList.remove('active');
            gameLoop();
        }
    });
    
    const restartFunction = () => {
        init(currentLevelIndex, 0, 0, config.base.health, false);
    };
    restartPauseButton.addEventListener('click', restartFunction);
    
    mainMenuButton.addEventListener('click', () => {
        init(0, 0, 0, config.base.health, false);
    });

    howToPlayButton.addEventListener('click', () => {
        showOverlay('how_to_play');
    });

    backToPauseButton.addEventListener('click', () => {
        showOverlay('pause');
    });

    activatePowerButton.addEventListener('click', activateSpecialPower);
    window.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === 'e') {
            activateSpecialPower();
        }
    });

    // Control de teclado
    let keys = {};
    window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key === ' ' || e.key.includes('Arrow')) e.preventDefault(); });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    
    function controlLoop() {
        if (gameState === 'playing' && player) {
            if (keys['w'] || keys['arrowup']) player.y -= player.speed;
            if (keys['s'] || keys['arrowdown']) player.y += player.speed;
            if (keys[' ']) player.shoot();
            player.update();
        }
        requestAnimationFrame(controlLoop);
    }
    controlLoop();

    // Control táctil y con ratón
    let isDragging = false, didDrag = false, touchYOffset = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); 
        if (!player) return;
        const touch = e.touches[0]; 
        const rect = canvas.getBoundingClientRect();
        isDragging = true; 
        didDrag = false;
        const currentY = touch.clientY - rect.top;
        touchStartY = currentY; 
        touchYOffset = currentY - player.y;
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault(); 
        if (!isDragging || !player) return;
        const touch = e.touches[0]; 
        const rect = canvas.getBoundingClientRect();
        const newY = touch.clientY - rect.top;
        if (Math.abs(newY - touchStartY) > 5) didDrag = true;
        player.y = newY - touchYOffset;
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        if (didDrag || !player) {
            isDragging = false;
            didDrag = false;
            return;
        }
        
        isDragging = false;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.changedTouches[0].clientX - rect.left;
        const clickY = e.changedTouches[0].clientY - rect.top;

        if (clickX >= player.x && clickX <= player.x + player.width &&
            clickY >= player.y && clickY <= player.y + player.height) {
            player.shoot();
        } else {
            checkResourceClick(clickX, clickY);
        }
    });

    canvas.addEventListener('click', e => {
        if (!player) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (clickX >= player.x && clickX <= player.x + player.width &&
            clickY >= player.y && clickY <= player.y + player.height) {
            player.shoot();
        } else {
            checkResourceClick(clickX, clickY);
        }
    });
    
    treeCanvasContainer.addEventListener('click', (event) => {
        if (gameState === 'playing' || gameState === 'paused') {
            toggleTreeMenu(true);
            return;
        }
        
        if (gameState !== 'menu') return;
        toggleTreeMenu(false);
    });
}

// Lógica de inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Establecer las funciones globales necesarias para otros módulos
    window.game = {
        init,
        resizeAll,
        activateSpecialPower,
        checkResourceClick,
        animateResourceToBag
    };

    setupUIElements();
    setupEventListeners();
    initThreeScene();
    initializeAndLoadGame();
    window.addEventListener('resize', resizeAll);
});

