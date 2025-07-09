/*
* =================================================================
* ARCHIVO: RunaDefenders/js/modules/ui.js
* =================================================================
* Propósito: Gestiona toda la interfaz de usuario (UI), incluyendo
* la actualización de barras, contadores y la visualización de pantallas.
*/

// Objeto para mantener referencias a todos los elementos del DOM para fácil acceso
export const uiElements = {
    loadingScreen: document.getElementById('loading-screen'),
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
    authContainer: document.getElementById('auth-container'),
    authModal: document.getElementById('auth-modal'),
    closeAuthModalButton: document.getElementById('close-auth-modal-button'),
    googleLoginButton: document.getElementById('google-login-button-modal'),
    startButton: document.getElementById('start-button'),
    retryButton: document.getElementById('retry-button'),
    resumeButton: document.getElementById('resume-button'),
    restartLevelButton: document.getElementById('restart-level-button'),
    menuButton: document.getElementById('menu-button'),
};

// Actualiza todos los elementos visuales de la UI en cada fotograma
export function updateUI(gameContext) {
    const { currentLevelIndex, coffeeBeanCount, specialPowerPoints, isPowerActive, config, levelTimer } = gameContext;
    
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
        const duration = currentLevel.duration;
        const progressPercent = Math.min((levelTimer / duration) * 100, 100);
        uiElements.timelineProgress.style.width = `${progressPercent}%`;
        uiElements.timelineWorm.style.right = `${progressPercent}%`;
    }
}

// Muestra las diferentes pantallas superpuestas (inicio, pausa, etc.)
export function showOverlay(type, gameContext) {
    if (gameContext.animationFrameId) {
        cancelAnimationFrame(gameContext.animationFrameId);
        gameContext.animationFrameId = null;
    }

    uiElements.gameOverlay.classList.remove('hidden');
    uiElements.gameOverlay.classList.add('active');

    const screens = [uiElements.startScreen, uiElements.gameOverScreen, uiElements.pauseScreen, uiElements.levelCompleteScreen, uiElements.loadingNextLevelScreen];
    screens.forEach(s => s.classList.remove('visible'));

    switch (type) {
        case 'start':
            uiElements.startButton.textContent = `Empezar Nivel ${gameContext.currentLevelIndex + 1}`;
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

// Actualiza la UI de autenticación para mostrar la foto del usuario o el botón de login
export function updateAuthUI(user) {
    const authContainer = uiElements.authContainer;
    authContainer.innerHTML = '';
    if (user && !user.isAnonymous) {
        const fallbackImage = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png';
        const photoURL = user.photoURL || fallbackImage;

        const userButton = document.createElement('button');
        userButton.id = 'logout-btn';
        userButton.title = `Cerrar sesión de ${user.displayName || 'Usuario'}`;
        
        const userPhoto = document.createElement('img');
        userPhoto.src = photoURL;
        userPhoto.alt = "Foto de Usuario";
        userPhoto.style.objectFit = user.photoURL ? 'cover' : 'contain';
        if (!user.photoURL) {
            userPhoto.style.padding = '5px';
            userPhoto.style.backgroundColor = '#fff';
        }
        userPhoto.onerror = () => { userPhoto.src = fallbackImage; };

        userButton.appendChild(userPhoto);
        authContainer.appendChild(userButton);
    } else {
        const loginButton = document.createElement('button');
        loginButton.id = 'open-login-modal-btn';
        loginButton.title = 'Iniciar Sesión';
        
        const loginImage = document.createElement('img');
        loginImage.src = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png';
        loginImage.alt = "Iniciar Sesión con Google";
        
        loginButton.appendChild(loginImage);
        authContainer.appendChild(loginButton);
    }
}

