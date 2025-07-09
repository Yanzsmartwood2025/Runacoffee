/*
* =================================================================
* ARCHIVO: js/modules/ui.js
* =================================================================
* Propósito: Maneja toda la interacción con el DOM (la interfaz de
* usuario). Actualiza barras, contadores y muestra menús.
*/

export const uiElements = {
    loadingScreen: document.getElementById('loading-screen'),
    gameContainer: document.getElementById('game-container'),
    gameOverlay: document.getElementById('game-overlay'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    pauseScreen: document.getElementById('pause-screen'),
    levelCompleteScreen: document.getElementById('level-complete-screen'),
    loadingNextLevelScreen: document.getElementById('loading-next-level-screen'),
    waveMessage: document.getElementById('wave-message'),
    damageFlash: document.getElementById('damage-flash'),
    
    // Botones
    startButton: document.getElementById('start-button'),
    retryButton: document.getElementById('retry-button'),
    menuButton: document.getElementById('menu-button'),
    resumeButton: document.getElementById('resume-button'),
    restartLevelButton: document.getElementById('restart-level-button'),
    activatePowerButton: document.getElementById('activate-power-button'),

    // Elementos de la UI
    levelValue: document.getElementById('level-value'),
    coffeeBeanCounterEl: document.getElementById('coffee-bean-counter'),
    coffeeBagIcon: document.getElementById('coffee-bag-icon'),
    specialPowerBar: document.getElementById('special-power-bar'),
    timelineProgress: document.getElementById('timeline-progress'),
    timelineWorm: document.getElementById('timeline-worm'),
    treeHealthBar: document.getElementById('tree-health-bar'),
};

export function updateUI(gameContext) {
    const { currentLevelIndex, coffeeBeanCount, specialPowerPoints, isPowerActive, config } = gameContext;
    
    uiElements.levelValue.textContent = currentLevelIndex + 1;
    uiElements.coffeeBeanCounterEl.textContent = coffeeBeanCount;
    uiElements.specialPowerBar.style.width = `${(specialPowerPoints / config.specialPowerMax) * 100}%`;

    if (specialPowerPoints >= config.specialPowerMax && !isPowerActive) {
        uiElements.activatePowerButton.disabled = false;
        uiElements.activatePowerButton.classList.add('power-ready');
    } else {
        uiElements.activatePowerButton.disabled = true;
        uiElements.activatePowerButton.classList.remove('power-ready');
    }

    const currentLevel = config.levels[currentLevelIndex];
    if (currentLevel) {
        const progressPercent = Math.min((gameContext.levelTimer / currentLevel.duration) * 100, 100);
        uiElements.timelineProgress.style.width = `${progressPercent}%`;
        uiElements.timelineWorm.style.right = `${progressPercent}%`;
    }
}

export function showOverlay(type, gameContext) {
    if (gameContext.animationFrameId) {
        cancelAnimationFrame(gameContext.animationFrameId);
        gameContext.animationFrameId = null;
    }

    uiElements.gameOverlay.classList.remove('hidden');
    uiElements.gameOverlay.classList.add('active');

    // Ocultar todas las pantallas primero
    uiElements.startScreen.classList.remove('visible');
    uiElements.gameOverScreen.classList.remove('visible');
    uiElements.pauseScreen.classList.remove('visible');
    uiElements.levelCompleteScreen.classList.remove('visible');
    uiElements.loadingNextLevelScreen.classList.remove('visible');

    if (type === 'start') {
        uiElements.startButton.textContent = `Empezar Nivel ${gameContext.currentLevelIndex + 1}`;
        uiElements.startScreen.classList.add('visible');
    } else if (type === 'game_over') {
        uiElements.gameOverScreen.classList.add('visible');
    } else if (type === 'pause') {
        uiElements.pauseScreen.classList.add('visible');
    }
    // ... Lógica para otras pantallas si es necesario
}

export function showWaveMessage(text, playSound) {
    uiElements.waveMessage.textContent = text;
    uiElements.waveMessage.classList.add('visible');
    playSound('waveWarning', 'C4', '2n');
    setTimeout(() => {
        uiElements.waveMessage.classList.remove('visible');
    }, 2500);
}

export function triggerDamageFlash() {
    uiElements.damageFlash.style.opacity = 1;
    setTimeout(() => { uiElements.damageFlash.style.opacity = 0; }, 150);
}
