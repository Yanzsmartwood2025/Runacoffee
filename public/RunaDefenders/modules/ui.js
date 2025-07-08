
/*
* =================================================================
* ARCHIVO: RunaDefenders/js/modules/ui.js
* =================================================================
* Propósito: Gestiona toda la interfaz de usuario (UI), incluyendo
* la actualización de barras, contadores y la visualización de pantallas.
*/

// Objeto para mantener referencias a todos los elementos del DOM
export const uiElements = {
    gameContainer: document.getElementById('game-container'),
    gameOverlay: document.getElementById('game-overlay'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    pauseScreen: document.getElementById('pause-screen'),
    levelCompleteScreen: document.getElementById('level-complete-screen'),
    loadingNextLevelScreen: document.getElementById('loading-next-level-screen'),
    levelValue: document.getElementById('level-value'),
    coffeeBeanCounterEl: document.getElementById('coffee-bean-counter'),
    specialPowerBar: document.getElementById('special-power-bar'),
    activatePowerButton: document.getElementById('activate-power-button'),
    timelineProgress: document.getElementById('timeline-progress'),
    timelineWorm: document.getElementById('timeline-worm'),
    damageFlash: document.getElementById('damage-flash'),
    waveMessage: document.getElementById('wave-message'),
};

// Actualiza todos los elementos visuales de la UI en cada fotograma
export function updateUI(gameContext) {
    const { currentLevelIndex, coffeeBeanCount, specialPowerPoints, isPowerActive, config, levelTimer } = gameContext;
    const { levelValue, coffeeBeanCounterEl, specialPowerBar, activatePowerButton, timelineProgress, timelineWorm } = uiElements;

    levelValue.textContent = currentLevelIndex + 1;
    coffeeBeanCounterEl.textContent = coffeeBeanCount;
    specialPowerBar.style.width = `${(specialPowerPoints / config.specialPowerMax) * 100}%`;

    // Lógica para el botón de poder especial
    if (specialPowerPoints >= config.specialPowerMax && !isPowerActive) {
        activatePowerButton.disabled = false;
        activatePowerButton.classList.add('power-ready');
    } else {
        activatePowerButton.disabled = true;
        activatePowerButton.classList.remove('power-ready');
    }

    // Lógica para la línea de tiempo del nivel
    const currentLevel = config.levels[currentLevelIndex];
    if (currentLevel) {
        const duration = currentLevel.duration;
        const progressPercent = Math.min((levelTimer / duration) * 100, 100);
        timelineProgress.style.width = `${progressPercent}%`;
        timelineWorm.style.right = `${progressPercent}%`;
    }
}

// Muestra las diferentes pantallas superpuestas (inicio, pausa, game over, etc.)
export function showOverlay(type, gameContext) {
    if (gameContext.animationFrameId) {
        cancelAnimationFrame(gameContext.animationFrameId);
        gameContext.animationFrameId = null;
    }

    uiElements.gameOverlay.classList.remove('hidden');
    uiElements.gameOverlay.classList.add('active');

    // Oculta todas las pantallas primero
    for (const screen of Object.values(uiElements).filter(el => el.classList.contains('overlay-screen'))) {
        screen.classList.remove('visible');
    }

    switch (type) {
        case 'start':
            uiElements.startScreen.querySelector('button').textContent = `Empezar Nivel ${gameContext.currentLevelIndex + 1}`;
            uiElements.startScreen.classList.add('visible');
            break;
        case 'game_over':
            uiElements.gameOverScreen.classList.add('visible');
            break;
        case 'pause':
            uiElements.pauseScreen.classList.add('visible');
            break;
        case 'loading_next':
            uiElements.loadingNextLevelScreen.classList.add('visible');
            break;
        case 'level_complete':
            const nextLevelExists = gameContext.currentLevelIndex + 1 < gameContext.config.levels.length;
            uiElements.levelCompleteScreen.querySelector('h2').textContent = `¡Nivel ${gameContext.currentLevelIndex + 1} Superado!`;
            const content = uiElements.levelCompleteScreen.querySelector('div');
            
            if (nextLevelExists) {
                content.innerHTML = `<button id="next-level-button" class="game-button">Siguiente Nivel</button>`;
                content.querySelector('#next-level-button').addEventListener('click', () => {
                    showOverlay('loading_next', gameContext);
                    setTimeout(() => {
                        gameContext.currentLevelIndex++;
                        gameContext.init(gameContext.currentLevelIndex, gameContext.specialPowerPoints, gameContext.coffeeBeanCount, gameContext.base.health, false, gameContext.unlockedPowers);
                    }, 1500);
                }, { once: true });
            } else {
                content.innerHTML = `<h1>¡VICTORIA TOTAL!</h1><p>¡Has defendido la cosecha!</p>`;
            }
            uiElements.levelCompleteScreen.classList.add('visible');
            break;
    }
}

// Muestra el mensaje de advertencia de oleada
export function showWaveMessage(text, playSoundCallback) {
    uiElements.waveMessage.textContent = text;
    uiElements.waveMessage.classList.add('visible');
    playSoundCallback('waveWarning', 'C4', '2n');
    setTimeout(() => {
        uiElements.waveMessage.classList.remove('visible');
    }, 2500);
}

// Muestra un destello rojo en la pantalla cuando la base recibe daño
export function triggerDamageFlash() {
    uiElements.damageFlash.style.opacity = '1';
    setTimeout(() => {
        uiElements.damageFlash.style.opacity = '0';
    }, 150);
}
