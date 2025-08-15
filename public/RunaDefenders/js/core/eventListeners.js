// js/core/eventListeners.js
import { getGameState, setGameState, setPreviousGameState } from './gameLogic.js';
import { showOverlay } from '../ui/uiManager.js';
import { signInWithGoogle, signOutUser } from '../services/firebase.js';

// --- Elementos del DOM ---
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const restartPauseButton = document.getElementById('restart-pause-button');
const mainMenuButton = document.getElementById('main-menu-button');
const howToPlayButton = document.getElementById('how-to-play-button');
const backToPauseButton = document.getElementById('back-to-pause-button');
const activatePowerButton = document.getElementById('activate-power-button');
const treeCanvasContainer = document.getElementById('tree-canvas-container');
const authContainer = document.getElementById('auth-container');
const authModal = document.getElementById('auth-modal');

/**
 * Configura todos los event listeners de la aplicación.
 * @param {object} actions - Un objeto con las funciones a llamar para cada evento.
 */
export function setupEventListeners(actions) {
    // --- Botones de Flujo de Juego ---
    startButton.addEventListener('click', actions.onStart);
    retryButton.addEventListener('click', actions.onRestart);
    pauseButton.addEventListener('click', actions.onPause);
    resumeButton.addEventListener('click', actions.onPause); // Reanudar también llama a la función de pausa
    restartPauseButton.addEventListener('click', actions.onRestart);
    mainMenuButton.addEventListener('click', actions.onMainMenu);

    // --- Botones de Menús y UI ---
    howToPlayButton.addEventListener('click', () => showOverlay('how_to_play'));
    backToPauseButton.addEventListener('click', () => showOverlay('pause'));
    activatePowerButton.addEventListener('click', actions.onActivatePower);

    // --- Interacción con la Escena 3D ---
    treeCanvasContainer.addEventListener('click', (event) => {
        const state = getGameState();
        if (state === 'playing' || state === 'paused') {
            actions.onToggleTreeMenu(true); // Mostrar menú del árbol
        } else if (state === 'menu') {
            // La lógica de raycasting para clics en orbes se manejaría en scene3D.js
            // Pero el cierre del menú se puede manejar aquí o en scene3D.
            // Por simplicidad, lo pasamos a la acción.
            actions.onToggleTreeMenu(false, event); 
        }
    });

    // --- Autenticación con Firebase ---
    authContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.id === 'open-login-modal-btn') {
            authModal.classList.remove('hidden');
        } else if (button.id === 'logout-btn') {
            signOutUser().catch(error => console.error("Sign out error", error));
        }
    });
    
    document.getElementById('google-login-button-modal').addEventListener('click', () => {
        signInWithGoogle().then(() => {
            authModal.classList.add('hidden');
        }).catch(error => console.error("Google Sign-In Error:", error));
    });

    document.getElementById('close-auth-modal-button').addEventListener('click', () => {
        authModal.classList.add('hidden');
    });


    // --- Controles del Jugador (Teclado) ---
    const keys = {};
    window.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        // Prevenir el comportamiento por defecto de la barra espaciadora y flechas (scroll)
        if (e.key === ' ' || e.key.includes('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
        keys[e.key.toLowerCase()] = false;
    });

    // Bucle para procesar los controles del teclado
    function controlLoop() {
        if (getGameState() === 'playing' && actions.player) {
            if (keys['w'] || keys['arrowup']) actions.player.y -= actions.player.speed;
            if (keys['s'] || keys['arrowdown']) actions.player.y += actions.player.speed;
            if (keys[' ']) {
                if(actions.player.shoot(actions.projectiles, actions.isPowerActive)) {
                   // actions.playSound('shoot'); // Llama a la acción de sonido
                }
            }
            if (keys['e']) {
                actions.onActivatePower();
            }
        }
        requestAnimationFrame(controlLoop);
    }
    // controlLoop(); // Esto debería ser iniciado desde main.js para pasarle el jugador
    // Por ahora lo dejamos comentado para evitar errores. Se conectará en main.js.


    // --- Controles Táctiles (Canvas 2D) ---
    // (Aquí iría la lógica de 'touchstart', 'touchmove', 'touchend' y 'click' en el canvas)
    // Esta parte es compleja y depende de cómo se pasen las referencias a `player` y `resources`.
    // La dejaremos para integrarla directamente en main.js o en una función de setup más avanzada.
}

