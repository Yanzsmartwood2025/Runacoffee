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
let isMusicLoaded = false; // Variable para saber si la música se cargó correctamente

// =================================================================
// --- INITIALIZATION & GAME FLOW ---
// =================================================================

/**
 * Inicializa o resetea el estado del juego para un nivel específico.
 */
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

/**
 * Comienza la partida después de que el usuario hace clic en "Empezar".
 */
async function startGame() {
    await startAudioContext(); 
    
    // --- MODIFICADO: Reproduce la música solo si se cargó y es el nivel 1 ---
    if (isMusicLoaded) {
        playMusic();
    }

    setGameState('playing');
    gameContainer.classList.add('playing');
    showOverlay(null);
    
    requestAnimationFrame(mainGameLoop);
}

/**
 * Inicia la transición al siguiente nivel.
 */
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

/**
 * Pausa o reanuda el juego.
 */
function togglePause() {
    const currentState = getGameState();
    if (currentState === 'playing') {
        stopMusic(); // Detiene la música al pausar
        setPreviousGameState('playing');
        setGameState('paused');
        showOverlay('pause');
    } else if (currentState === 'paused') {
        // --- MODIFICADO: Reanuda la música solo si se cargó y es el nivel 1 ---
        if (isMusicLoaded) {
            playMusic();
        }
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
            stopMusic(); // Se asegura de detener la música en Game Over
            showOverlay('game_over');
        }
        return;
    }

    // Actualiza la lógica del juego y recibe el estado actual de los elementos
    const logicUpdates = gameLoop(player, base, currentLevelIndex);
    
    // Actualiza las variables globales del main.js con los datos de la lógica
    specialPowerPoints = logicUpdates.specialPowerPoints;
    coffeeBeanCount += logicUpdates.newCoffeeBeans;
    base.health = logicUpdates.baseHealth;

    // Actualiza la interfaz de usuario y la apariencia del árbol
    updateUI(currentLevelIndex, coffeeBeanCount, specialPowerPoints, base);
    updateTreeAppearance(base);

    // Dibuja todos los elementos en el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx, logicUpdates.globalAnimationTimer);
    logicUpdates.projectiles.forEach(p => p.draw(ctx));
    logicUpdates.enemies.forEach(e => e.draw(ctx, logicUpdates.globalAnimationTimer));
    logicUpdates.resources.forEach(r => r.draw(ctx, logicUpdates.globalAnimationTimer));

    // Comprueba si el nivel ha terminado
    if (logicUpdates.levelOver) {
        stopMusic(); // Detiene la música al pasar de nivel
        startNextLevel();
        return; // Detiene el loop actual
    }
    // Comprueba si el jugador ha perdido
    if (base.health <= 0) {
        setGameState('game_over');
    }

    // Continúa el loop
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

    // Intenta cargar la música de fondo
    try {
        const musicUrl = 'assets/audio/music/nivel1_musica.mp3';
        await loadMusic(musicUrl);
        isMusicLoaded = true;
    } catch (error) {
        console.error("La música no pudo ser cargada. El juego continuará sin ella.", error);
        isMusicLoaded = false;
    }

    // Inicializa Firebase y carga los datos del jugador
    initializeAndLoadGame(init);

    // Configura todos los event listeners de la UI
    setupEventListeners({
        onStart: startGame,
        onPause: togglePause,
        // --- MODIFICADO: Añade stopMusic() al reiniciar o volver al menú ---
        onRestart: () => {
            stopMusic();
            init(currentLevelIndex, 0, 0, config.base.maxHealth, false);
        },
        onMainMenu: () => {
            stopMusic();
            init(0, 0, 0, config.base.maxHealth, false);
        },
        onToggleTreeMenu: (show) => toggleTreeMenu(show, mainGameLoop),
        onActivatePower: () => {
            if (getGameState() === 'playing' && specialPowerPoints >= config.specialPowerMax) {
                // Aquí puedes llamar a una función que active el poder en gameLogic.js
                console.log("Poder activado desde main.js");
            }
        }
    });

    window.addEventListener('resize', resizeAll);
});
