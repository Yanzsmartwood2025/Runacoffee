const uiElements = {
    gameOverlay: document.getElementById('game-overlay'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    levelValue: document.getElementById('level-value'),
    coffeeBeanCounter: document.getElementById('coffee-bean-counter'),
    specialPowerBar: document.getElementById('special-power-bar'),
    activatePowerButton: document.getElementById('activate-power-button'),
    timelineProgress: document.getElementById('timeline-progress'),
    timelineWorm: document.getElementById('timeline-worm'),
    damageFlash: document.getElementById('damage-flash')
};

export function updateUI(base, currentLevelIndex, coffeeBeanCount, specialPowerPoints, isPowerActive, levelTimer, config) {
    if (!base) return;
    uiElements.levelValue.textContent = currentLevelIndex + 1;
    uiElements.coffeeBeanCounter.textContent = coffeeBeanCount;
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
        const progressPercent = Math.min((levelTimer / currentLevel.duration) * 100, 100);
        uiElements.timelineProgress.style.width = `${progressPercent}%`;
        uiElements.timelineWorm.style.right = `${progressPercent}%`;
    }
}

export function showOverlay(type) {
    uiElements.gameOverlay.classList.remove('hidden');
    if (type === 'start') uiElements.startScreen.style.display = 'flex';
    if (type === 'game_over') uiElements.gameOverScreen.style.display = 'flex';
}

export function triggerDamageFlash() {
    uiElements.damageFlash.style.opacity = '1';
    setTimeout(() => {
        uiElements.damageFlash.style.opacity = '0';
    }, 150);
}

export function showWaveMessage() {
    // This function was mentioned in the instructions but not present in the original script.
    // I'm adding a placeholder for it.
    console.log("Wave message showing");
}
