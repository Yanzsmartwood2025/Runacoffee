// js/ui/uiManager.js
import { config } from "../config.js";

// --- Referencias a Elementos del DOM ---
const canvas = document.getElementById('game-canvas');
const gameOverlay = document.getElementById('game-overlay');

// Pantallas y Overlays
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const loadingNextLevelScreen = document.getElementById('loading-next-level-screen');
const pauseScreen = document.getElementById('pause-screen');
const howToPlayScreen = document.getElementById('how-to-play-screen');

// Elementos de la UI del Juego
const levelValue = document.getElementById('level-value');
const coffeeBeanCounterEl = document.getElementById('coffee-bean-counter');
const specialPowerBar = document.getElementById('special-power-bar');
const activatePowerButton = document.getElementById('activate-power-button');
const timelineProgress = document.getElementById('timeline-progress');
const timelineWorm = document.getElementById('timeline-worm');
const damageFlash = document.getElementById('damage-flash');
const coffeeBagIcon = document.getElementById('coffee-bag-icon');
const authContainer = document.getElementById('auth-container');

// Variables de estado del canvas
let cellSize = 0;

/**
 * Muestra u oculta los diferentes overlays del juego (menús).
 * @param {string|null} type - El tipo de overlay a mostrar ('start', 'game_over', etc.) o null para ocultar todos.
 * @param {object} [options={}] - Opciones adicionales, como callbacks para botones.
 */
export function showOverlay(type, options = {}) {
    const overlays = [startScreen, gameOverScreen, levelCompleteScreen, loadingNextLevelScreen, pauseScreen, howToPlayScreen];
    overlays.forEach(o => o.classList.remove('visible'));

    if (!type) {
        gameOverlay.classList.add('hidden');
        gameOverlay.classList.remove('active');
        return;
    }

    gameOverlay.classList.remove('hidden');
    gameOverlay.classList.add('active');

    switch (type) {
        case 'start':
            document.getElementById('start-button').textContent = `Empezar Nivel ${options.level || 1}`;
            startScreen.classList.add('visible');
            break;
        case 'game_over':
            gameOverScreen.classList.add('visible');
            break;
        case 'level_complete':
            const nextLevelButton = levelCompleteScreen.querySelector('#next-level-button');
            const victoryMessage = levelCompleteScreen.querySelector('#victory-message');
            levelCompleteScreen.querySelector('h2').textContent = `¡Nivel ${options.level} Superado!`;

            if (options.isLastLevel) {
                nextLevelButton.style.display = 'none';
                victoryMessage.style.display = 'block';
            } else {
                nextLevelButton.style.display = 'block';
                victoryMessage.style.display = 'none';
                // Clonar y reemplazar el botón para evitar listeners duplicados
                const newButton = nextLevelButton.cloneNode(true);
                nextLevelButton.parentNode.replaceChild(newButton, nextLevelButton);
                newButton.addEventListener('click', options.onNext, { once: true });
            }
            levelCompleteScreen.classList.add('visible');
            break;
        case 'loading_next':
            loadingNextLevelScreen.classList.add('visible');
            break;
        case 'pause':
            pauseScreen.classList.add('visible');
            break;
        case 'how_to_play':
            howToPlayScreen.classList.add('visible');
            break;
    }
}

/**
 * Actualiza todos los elementos visuales de la interfaz de juego.
 * @param {number} level - Nivel actual.
 * @param {number} beans - Cantidad de granos de café.
 * @param {number} power - Puntos de poder especial.
 * @param {object} base - Objeto de la base con su salud.
 */
export function updateUI(level, beans, power, base) {
    levelValue.textContent = level + 1;
    coffeeBeanCounterEl.textContent = beans;
    specialPowerBar.style.width = `${(power / config.specialPowerMax) * 100}%`;

    if (power >= config.specialPowerMax) {
        activatePowerButton.disabled = false;
        activatePowerButton.classList.add('power-ready');
    } else {
        activatePowerButton.disabled = true;
        activatePowerButton.classList.remove('power-ready');
    }

    // Actualizar la línea de tiempo del nivel
    // (La lógica del temporizador debe pasarse desde gameLogic)
}

/**
 * Actualiza la UI de autenticación para mostrar el botón de login o el perfil del usuario.
 * @param {object|null} user - El objeto de usuario de Firebase o null.
 */
export function updateAuthUI(user) {
    authContainer.innerHTML = ''; // Limpiar el contenedor
    if (user && !user.isAnonymous) {
        const fallbackImage = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png';
        const photoURL = user.photoURL || fallbackImage;

        authContainer.innerHTML = `
            <button id="logout-btn" title="Cerrar sesión de ${user.displayName || 'Usuario'}">
                <img src="${photoURL}" alt="Foto de Usuario" style="object-fit: ${user.photoURL ? 'cover' : 'contain'}; ${!user.photoURL ? 'padding: 5px; background-color: #fff;' : ''}" onerror="this.src='${fallbackImage}'">
            </button>
        `;
    } else {
        authContainer.innerHTML = `
            <button id="open-login-modal-btn" title="Iniciar Sesión">
                <img src="https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png" alt="Iniciar Sesión con Google">
            </button>
        `;
    }
}

/**
 * Activa un destello rojo en la pantalla para indicar daño a la base.
 */
export function triggerDamageFlash() {
    damageFlash.style.opacity = '1';
    setTimeout(() => {
        damageFlash.style.opacity = '0';
    }, 150);
}

/**
 * Ajusta el tamaño del canvas para que ocupe el espacio disponible y recalcula el tamaño de los carriles.
 */
export function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas.height > 0) {
        cellSize = canvas.height / config.lanes;
    }
}

/**
 * Devuelve el tamaño de celda calculado.
 * @returns {number}
 */
export function getCellSize() {
    return cellSize;
}
