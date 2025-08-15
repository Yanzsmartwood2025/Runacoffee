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
import { startAudioContext } from './services/audio.js';

// =================================================================
// --- GLOBAL STATE & VARIABLES ---
// =================================================================

// Referencias a elementos del DOM
const loadingScreen = document.getElementById('loading-screen');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Variables principales del estado del juego
let player;
let base = { ...config.base }; // Copia inicial de la configuración de la base
let currentLevelIndex = 0;
let specialPowerPoints = 0;
let coffeeBeanCount = 0;

// =================================================================
// --- INITIALIZATION & GAME FLOW ---
// =================================================================

/**
 * Función principal de inicialización o reinicio del juego.
 * Configura el estado para un nuevo nivel.
 * @param {number} level - Índice del nivel a iniciar.
 * @param {number} power - Puntos de poder especiales iniciales.
 * @param {number} beans - Contador de granos de café inicial.
 * @param {number} health - Salud inicial de la base.
 * @param {boolean} isFirstLoad - Indica si es la primera carga del juego.
 */
function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) {
    console.log(`Initializing level ${level + 1}`);
    
    // 1. Actualizar estado global del juego
    currentLevelIndex = level;
    specialPowerPoints = power;
    coffeeBeanCount = beans;
    base.health = Math.min(health, config.base.maxHealth);
    base.maxHealth = config.base.maxHealth;

    // 2. Reiniciar la lógica del juego (temporizadores, enemigos, etc.)
    resetGameLogic();

    // 3. Ajustar el canvas y crear al jugador
    resizeAll();
    if (!player) {
        player = new Player(canvas, getCellSize());
    } else {
        player.reset();
    }

    // 4. Actualizar elementos visuales (UI y escena 3D)
    updateTreeAppearance(base);
    updateOrbsLockState(currentLevelIndex);
    updateUI(currentLevelIndex, coffeeBeanCount, specialPowerPoints, base);
    
    // 5. Cambiar el estado del juego y mostrar la pantalla de inicio
    setGameState('start');
    showOverlay('start', { level: currentLevelIndex + 1 });

    // 6. Ocultar pantalla de carga si es la primera vez
    if (isFirstLoad) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

/**
 * Inicia el juego después de que el usuario hace clic en "Empezar".
 */
async function startGame() {
    await startAudioContext(); // Iniciar audio en la primera interacción del usuario

    setGameState('playing');
    gameContainer.classList.add('playing');
    showOverlay(null); // Oculta cualquier overlay
    
    // Iniciar el bucle principal del juego
    requestAnimationFrame(mainGameLoop);
}

/**
 * Avanza al siguiente nivel.
 */
function startNextLevel() {
    setGameState('level_complete');
    saveCurrentGameData(); // Guardar progreso
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
        setPreviousGameState('playing');
        setGameState('paused');
        showOverlay('pause');
    } else if (currentState === 'paused') {
        setGameState('playing');
        showOverlay(null);
        requestAnimationFrame(mainGameLoop); // Reanudar el bucle
    }
}

// =================================================================
// --- MAIN GAME LOOP ---
// =================================================================

function mainGameLoop(timestamp) {
    if (getGameState() !== 'playing') {
        // Si el juego se pausa o termina, detener el bucle
        if (getGameState() === 'game_over') {
            showOverlay('game_over');
        }
        return;
    }

    // 1. Actualizar la lógica del juego (movimiento, colisiones, etc.)
    const logicUpdates = gameLoop(player, base, currentLevelIndex);
    
    // Actualizar estado global con los resultados de la lógica
    specialPowerPoints = logicUpdates.specialPowerPoints;
    coffeeBeanCount += logicUpdates.newCoffeeBeans;
    base.health = logicUpdates.baseHealth;

    // 2. Actualizar la UI con el nuevo estado
    updateUI(currentLevelIndex, coffeeBeanCount, specialPowerPoints, base);
    updateTreeAppearance(base); // Actualizar el árbol si la vida cambió

    // 3. Limpiar y dibujar el canvas 2D
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx, logicUpdates.globalAnimationTimer);
    logicUpdates.projectiles.forEach(p => p.draw(ctx));
    logicUpdates.enemies.forEach(e => e.draw(ctx, logicUpdates.globalAnimationTimer));
    logicUpdates.resources.forEach(r => r.draw(ctx, logicUpdates.globalAnimationTimer));

    // 4. Comprobar condiciones de fin de nivel o de juego
    if (logicUpdates.levelOver) {
        startNextLevel();
        return; // Detener el bucle actual
    }
    if (base.health <= 0) {
        setGameState('game_over');
    }

    // 5. Solicitar el siguiente frame
    requestAnimationFrame(mainGameLoop);
}

// =================================================================
// --- HELPER FUNCTIONS ---
// =================================================================

/**
 * Función para ajustar el tamaño del canvas y otros elementos al cambiar el tamaño de la ventana.
 */
function resizeAll() {
    resizeCanvas();
    if (player) {
        player.cellSize = getCellSize();
        player.reset();
    }
    // Redibujar en caso de que el juego no esté en bucle (ej. en menú de pausa)
    if (getGameState() !== 'playing') {
        // Se podría añadir una función de redibujado estático si fuera necesario
    }
}

/**
 * Guarda el estado actual del juego.
 */
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

// Se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar la escena 3D
    initThreeScene();

    // 2. Conectar a Firebase y cargar datos o iniciar nuevo juego
    initializeAndLoadGame(init);

    // 3. Configurar todos los event listeners de la aplicación
    setupEventListeners({
        onStart: startGame,
        onPause: togglePause,
        onRestart: () => init(currentLevelIndex, 0, 0, config.base.maxHealth, false),
        onMainMenu: () => init(0, 0, 0, config.base.maxHealth, false),
        onToggleTreeMenu: (show) => toggleTreeMenu(show, mainGameLoop),
        onActivatePower: () => {
            if (getGameState() === 'playing' && specialPowerPoints >= config.specialPowerMax) {
                // La lógica del poder se maneja dentro de gameLogic.js
                // Aquí solo se podría emitir el evento si fuera necesario
                console.log("Power activated from main");
            }
        }
    });

    // 4. Configurar el listener para el reescalado de la ventana
    window.addEventListener('resize', resizeAll);
});

