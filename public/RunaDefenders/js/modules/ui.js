// modules/ui.js - Lógica de la interfaz de usuario

import { playSound } from './audio.js';
import { config } from '../config.js';
import { gameState, animationFrameId, currentLevelIndex, specialPowerPoints, coffeeBeanCount, levelTimer, isPowerActive, base, resources, enemies } from '../main.js';
import { updateTreeAppearance } from './scene3d.js';

const gameOverlay = document.getElementById('game-overlay');
const specialPowerBar = document.getElementById('special-power-bar');
const activatePowerButton = document.getElementById('activate-power-button');
const levelValue = document.getElementById('level-value');
const damageFlash = document.getElementById('damage-flash');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const loadingNextLevelScreen = document.getElementById('loading-next-level-screen');
const pauseScreen = document.getElementById('pause-screen');
const howToPlayScreen = document.getElementById('how-to-play-screen');
const waveMessage = document.getElementById('wave-message');
const coffeeBagIcon = document.getElementById('coffee-bag-icon');
const coffeeBeanCounterEl = document.getElementById('coffee-bean-counter');
const timelineProgress = document.getElementById('timeline-progress');
const timelineWorm = document.getElementById('timeline-worm');

function setupUIElements() {
    const startButton = document.getElementById('start-button');
    const retryButton = document.getElementById('retry-button');
    const resumeButton = document.getElementById('resume-button');
    const restartPauseButton = document.getElementById('restart-pause-button');
    const mainMenuButton = document.getElementById('main-menu-button');
    const howToPlayButton = document.getElementById('how-to-play-button');
    const backToPauseButton = document.getElementById('back-to-pause-button');
    const closeAuthModalButton = document.getElementById('close-auth-modal-button');
    const googleLoginButtonModal = document.getElementById('google-login-button-modal');

    // Aquí puedes añadir listeners específicos de UI si es necesario
    // Por ejemplo: closeAuthModalButton.addEventListener('click', ...);
}

function updateUI() {
    levelValue.textContent = currentLevelIndex + 1;
    coffeeBeanCounterEl.textContent = coffeeBeanCount;
    specialPowerBar.style.width = `${(specialPowerPoints / config.specialPowerMax) * 100}%`;

    if (specialPowerPoints >= config.specialPowerMax && !isPowerActive) {
        activatePowerButton.disabled = false;
        activatePowerButton.classList.add('power-ready');
    } else {
        activatePowerButton.disabled = true;
        activatePowerButton.classList.remove('power-ready');
    }

    const currentLevel = config.levels[currentLevelIndex];
    if (currentLevel) {
        const duration = currentLevel.duration;
        const progressPercent = Math.min((levelTimer / duration) * 100, 100);

        timelineProgress.style.width = `${progressPercent}%`;
        timelineWorm.style.right = `${progressPercent}%`;
    }
}

function showOverlay(type) {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }

    gameOverlay.classList.remove('hidden');
    gameOverlay.classList.add('active');

    startScreen.classList.remove('visible');
    gameOverScreen.classList.remove('visible');
    levelCompleteScreen.classList.remove('visible');
    loadingNextLevelScreen.classList.remove('visible');
    pauseScreen.classList.remove('visible');
    howToPlayScreen.classList.remove('visible');

    if (type === 'start') {
        startButton.textContent = `Empezar Nivel ${currentLevelIndex + 1}`;
        startScreen.classList.add('visible');
    } else if (type === 'game_over') {
        gameOverScreen.classList.add('visible');
    } else if (type === 'loading_next') {
        loadingNextLevelScreen.classList.add('visible');
    } else if (type === 'pause') {
        pauseScreen.classList.add('visible');
    } else if (type === 'how_to_play') {
        howToPlayScreen.classList.add('visible');
    } else if (type === 'level_complete') {
        const nextLevelExists = currentLevelIndex + 1 < config.levels.length;
        levelCompleteScreen.querySelector('h2').textContent = `¡Nivel ${currentLevelIndex + 1} Superado!`;
        const content = levelCompleteScreen.querySelector('div');
        
        if (nextLevelExists) {
            content.innerHTML = `<button id="next-level-button" class="game-button">Siguiente Nivel</button>`;
            content.querySelector('#next-level-button').addEventListener('click', () => {
                showOverlay('loading_next');
                setTimeout(() => {
                    currentLevelIndex++;
                    init(currentLevelIndex, specialPowerPoints, coffeeBeanCount, base.health, false);
                }, 1500);
            }, { once: true });
        } else {
            content.innerHTML = `<h1>¡VICTORIA TOTAL!</h1><p>¡Has defendido la cosecha!</p>`;
        }
        levelCompleteScreen.classList.add('visible');
    }
}

function showWaveMessage(text) {
    waveMessage.textContent = text;
    waveMessage.classList.add('visible');
    playSound('waveWarning', 'C4', '2n');
    setTimeout(() => {
        waveMessage.classList.remove('visible');
    }, 2500);
}

function triggerDamageFlash() {
    damageFlash.style.opacity = 1;
    setTimeout(() => { damageFlash.style.opacity = 0; }, 150);
}

function animateResourceToBag(resource) {
    const flyingBean = new Image();
    flyingBean.src = config.grainImage;
    flyingBean.style.position = 'absolute';
    flyingBean.style.zIndex = '999';
    flyingBean.style.width = `${resource.size}px`;
    flyingBean.style.height = `${resource.size}px`;
    flyingBean.style.pointerEvents = 'none';

    const canvasRect = document.getElementById('game-canvas').getBoundingClientRect();
    const startX = canvasRect.left + resource.x;
    const startY = canvasRect.top + resource.y;
    
    document.body.appendChild(flyingBean);

    const duration = 800;
    let startTime = null;

    function animationLoop(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const bagRect = coffeeBagIcon.getBoundingClientRect();
        const endX = bagRect.left + bagRect.width / 2 - resource.size / 2;
        const endY = bagRect.top + bagRect.height / 2 - resource.size / 2;

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        const scale = 1 - (0.8 * progress);

        flyingBean.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;

        if (progress < 1) {
            requestAnimationFrame(animationLoop);
        } else {
            base.health = Math.min(base.maxHealth, base.health + config.healingValue);
            coffeeBeanCount++;
            updateTreeAppearance();
            updateUI();
            playSound('heal', 'A5');

            coffeeBagIcon.classList.add('pulse');
            setTimeout(() => coffeeBagIcon.classList.remove('pulse'), 300);

            document.body.removeChild(flyingBean);
            const originalResourceIndex = resources.findIndex(res => res === resource);
            if (originalResourceIndex > -1) {
                resources.splice(originalResourceIndex, 1);
            }
        }
    }
    
    flyingBean.style.transform = `translate(${startX}px, ${startY}px)`;
    requestAnimationFrame(animationLoop);
}

export { setupUIElements, updateUI, showOverlay, showWaveMessage, triggerDamageFlash, animateResourceToBag };
                   
