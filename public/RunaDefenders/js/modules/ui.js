// modules/ui.js
// Gestiona todos los elementos de la interfaz de usuario (DOM).

import { config } from '../config.js';
import { getState, init } from '../main.js';

const uiElements = {
    gameOverlay: document.getElementById('game-overlay'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    levelCompleteScreen: document.getElementById('level-complete-screen'),
    loadingNextLevelScreen: document.getElementById('loading-next-level-screen'),
    pauseScreen: document.getElementById('pause-screen'),
    howToPlayScreen: document.getElementById('how-to-play-screen'),
    waveMessage: document.getElementById('wave-message'),
    levelValue: document.getElementById('level-value'),
    coffeeBeanCounter: document.getElementById('coffee-bean-counter'),
    specialPowerBar: document.getElementById('special-power-bar'),
    activatePowerButton: document.getElementById('activate-power-button'),
    timelineProgress: document.getElementById('timeline-progress'),
    timelineWorm: document.getElementById('timeline-worm'),
    damageFlash: document.getElementById('damage-flash'),
    coffeeBagIcon: document.getElementById('coffee-bag-icon'),
    startButton: document.getElementById('start-button')
};

export function updateUI() {
    const state = getState();
    if (!state || !state.base) return;

    uiElements.levelValue.textContent = state.currentLevelIndex + 1;
    uiElements.coffeeBeanCounter.textContent = state.coffeeBeanCount;
    uiElements.specialPowerBar.style.width = `${(state.specialPowerPoints / config.specialPowerMax) * 100}%`;

    if (state.specialPowerPoints >= config.specialPowerMax && !state.isPowerActive) {
        uiElements.activatePowerButton.disabled = false;
        uiElements.activatePowerButton.classList.add('power-ready');
    } else {
        uiElements.activatePowerButton.disabled = true;
        uiElements.activatePowerButton.classList.remove('power-ready');
    }

    const currentLevel = config.levels[state.currentLevelIndex];
    if (currentLevel) {
        const progressPercent = Math.min((state.levelTimer / currentLevel.duration) * 100, 100);
        uiElements.timelineProgress.style.width = `${progressPercent}%`;
        uiElements.timelineWorm.style.right = `${progressPercent}%`;
    }
}

export function showOverlay(type) {
    const { gameOverlay, startScreen, gameOverScreen, levelCompleteScreen, loadingNextLevelScreen, pauseScreen, howToPlayScreen, startButton } = uiElements;

    gameOverlay.classList.remove('hidden');
    gameOverlay.classList.add('active');

    [startScreen, gameOverScreen, levelCompleteScreen, loadingNextLevelScreen, pauseScreen, howToPlayScreen].forEach(screen => screen.classList.remove('visible'));

    const state = getState();

    switch (type) {
        case 'start':
            startButton.textContent = `Empezar Nivel ${state.currentLevelIndex + 1}`;
            startScreen.classList.add('visible');
            break;
        case 'game_over':
            gameOverScreen.classList.add('visible');
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
        case 'level_complete':
            const nextLevelExists = state.currentLevelIndex + 1 < config.levels.length;
            levelCompleteScreen.querySelector('h2').textContent = `¡Nivel ${state.currentLevelIndex + 1} Superado!`;
            const content = levelCompleteScreen.querySelector('div');

            if (nextLevelExists) {
                content.innerHTML = `<button id="next-level-button" class="game-button">Siguiente Nivel</button>`;
                content.querySelector('#next-level-button').addEventListener('click', () => {
                    showOverlay('loading_next');
                    setTimeout(() => {
                        const newState = getState();
                        init(newState.currentLevelIndex + 1, newState.specialPowerPoints, newState.coffeeBeanCount, newState.base.health, false);
                    }, 1500);
                }, { once: true });
            } else {
                content.innerHTML = `<h1>¡VICTORIA TOTAL!</h1><p>¡Has defendido la cosecha!</p>`;
            }
            levelCompleteScreen.classList.add('visible');
            break;
    }
}

export function showWaveMessage(text) {
    uiElements.waveMessage.textContent = text;
    uiElements.waveMessage.classList.add('visible');
    setTimeout(() => {
        uiElements.waveMessage.classList.remove('visible');
    }, 2500);
}

export function triggerDamageFlash() {
    uiElements.damageFlash.style.opacity = '1';
    setTimeout(() => { uiElements.damageFlash.style.opacity = '0'; }, 150);
}

export function animateResourceToBag(resource) {
    // (Pega aquí el código de la función animateResourceToBag de tu archivo original)
}
