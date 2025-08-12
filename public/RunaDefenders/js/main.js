// main.js - Punto de entrada principal del juego

// =================================================================
// --- MÓDULOS DEL JUEGO (RUTAS CORREGIDAS) ---
// =================================================================
import { Player, Projectile, Enemy, Resource } from './entities.js';
import { config } from './config.js';
// 'systems' es una carpeta, así que la ruta debe incluirla.
import { handleCollisions, handleGameLogic, handleLevelProgression, startNextLevel, spawnEnemy, draw, gameLoop } from './systems/systems.js';
// 'modules' es una carpeta, así que las rutas deben incluirla.
import { setupUIElements, updateUI, showOverlay, showWaveMessage, triggerDamageFlash, animateResourceToBag } from './modules/ui.js';
import { sounds, playSound } from './modules/audio.js';
import { initThreeScene, updateTreeAppearance, updateOrbsLockState, toggleTreeMenu } from './modules/threeScene.js';
import { initializeAndLoadGame, saveGameData, loadGameData, auth, db, userId } from './modules/firebase.js';


// =================================================================
// --- VARIABLES GLOBALES DEL JUEGO ---
// =================================================================
let cellSize, player, base;
let projectiles = [], enemies = [], resources = [];
let currentLevelIndex = 0, shootTimer = 0, animationFrameId;
let specialPowerPoints = 0, coffeeBeanCount = 0;
let levelTimer = 0, currentWaveIndex = -1, spawnTimer = 0;
let gameState = 'loading', previousGameState = 'loading';
let globalAnimationTimer = 0;
let levelMessagesShown = [];
let isPowerActive = false;

// Exportar variables globales
export {
    cellSize, player, base, projectiles, enemies, resources,
    currentLevelIndex, shootTimer, animationFrameId,
    specialPowerPoints, coffeeBeanCount, levelTimer, currentWaveIndex, spawnTimer,
    gameState, previousGameState, globalAnimationTimer, levelMessagesShown, isPowerActive,
    toggleTreeMenu
};

// =================================================================
// --- FUNCIONES Y LÓGICA GENERAL ---
// =================================================================

/**
 * Inicializa o reinicia el estado del juego.
 * @param {number} level - El nivel en el que empezar.
 * @param {number} power - Los puntos de poder iniciales.
 * @param {number} beans - La cantidad de granos de café inicial.
 * @param {number} health - La salud inicial de la base.
 * @param {boolean} isFirstLoad - Indica si es la primera carga del juego.
 */
function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    currentLevelIndex = level;
    specialPowerPoints = power;
    coffeeBeanCount = beans;
    base = { health: Math.min(health, config.base.health), maxHealth: config.base.health };
    
    levelTimer = 0;
    currentWaveIndex = -1;
    enemies = [];
    projectiles = [];
    resources = [];
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

/**
 * Activa el poder especial del jugador si la barra está llena.
 */
function activateSpecialPower() {
    if (specialPowerPoints >= config.specialPowerMax && !isPowerActive && gameState === 'playing') {
        isPowerActive = true;
        playSound('powerUp', 'C5', '2n');
        updateUI();
    }
}

/**
 * Redimensiona el canvas y reinicia la posición del jugador.
 */
function resizeAll() {
    const canvas = document.getElementById('game-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas.height > 0) cellSize = canvas.height / config.lanes;
    if (!player) player = new Player();
    else player.reset();
    if(gameState !== 'playing') draw();
}

/**
 * Lógica para la recolección de recursos al hacer clic.
 * @param {number} x - La coordenada X del clic.
 * @param {number} y - La coordenada Y del clic.
 */
function checkResourceClick(x, y) {
    for (let i = resources.length - 1; i >= 0; i--) {
        const r = resources[i];
        if (r.isFlying) continue;

        const dist = Math.sqrt(Math.pow(x - (r.x + r.size/2), 2) + Math.pow(y - (r.y + r.size/2), 2));
        
        if (dist < r.size) { 
            if (r.type === 'grain') {
                r.isFlying = true;
                animateResourceToBag(r);
            } else {
                specialPowerPoints = Math.min(config.specialPowerMax, specialPowerPoints + config.orbValue);
                playSound('collect', 'G5');
                updateUI();
                resources.splice(i, 1);
            }
            break;
        }
    }
}


// =================================================================
// --- EVENTOS Y CONTROL DE ENTRADA ---
// =================================================================

/**
 * Configura todos los oyentes de eventos.
 */
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
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalButton = document.getElementById('close-auth-modal-button');
    const googleLoginButtonModal = document.getElementById('google-login-button-modal');

    // Eventos de botones
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
    restartPauseButton.addEventListener('click', () => init(currentLevelIndex, 0, 0, config.base.health, false));
    mainMenuButton.addEventListener('click', () => init(0, 0, 0, config.base.health, false));
    howToPlayButton.addEventListener('click', () => showOverlay('how_to_play'));
    backToPauseButton.addEventListener('click', () => showOverlay('pause'));
    activatePowerButton.addEventListener('click', activateSpecialPower);

    // Eventos de teclado
    let keys = {};
    window.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ' || e.key.includes('Arrow')) e.preventDefault();
        if (e.key.toLowerCase() === 'e') activateSpecialPower();
    });
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

    // Eventos de ratón y táctiles
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
    
    treeCanvasContainer.addEventListener('click', () => {
        if (gameState === 'playing' || gameState === 'paused') {
            toggleTreeMenu(true);
        } else if (gameState === 'menu') {
            // Lógica de selección de poderes iría aquí
            toggleTreeMenu(false);
        }
    });

    // Eventos de Firebase UI
    closeAuthModalButton.addEventListener('click', () => authModal.classList.add('hidden'));
    googleLoginButtonModal.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(() => authModal.classList.add('hidden'))
            .catch(error => console.error("Google Sign-In Error:", error));
    });
    document.getElementById('auth-container').addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.id === 'open-login-modal-btn') {
            authModal.classList.remove('hidden');
        } else if (button.id === 'logout-btn') {
            signOut(auth).catch(error => console.error("Sign out error", error));
        }
    });
}

// =================================================================
// --- INICIALIZACIÓN ---
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initThreeScene();
    initializeAndLoadGame();
    window.addEventListener('resize', resizeAll);
});
