// =================================================================
// --- 1. IMPORTAR MÓDULOS ---
// =================================================================
import { config } from './modules/config.js';
import { Player, Projectile, Enemy, Resource } from './modules/gameClasses.js';
import { initThreeScene, updateTreeAppearance, updateOrbsLockState, toggleTreeMenu } from './modules/scene3D.js';
import { showOverlay, updateUI, triggerDamageFlash, showWaveMessage } from './modules/ui.js';
import { loadMusic, playMusic, stopMusic, startAudioContext, playSound } from './modules/audio.js';

// =================================================================
// --- 2. LÓGICA PRINCIPAL DEL JUEGO ---
// =================================================================

// - Declaraciones de variables globales del juego (canvas, ctx, player, etc.)
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let player, base, cellSize;
let projectiles = [], enemies = [], resources = [];
let gameState = 'loading';
let currentLevelIndex = 0, shootTimer = 0, animationFrameId;
let specialPowerPoints = 0, coffeeBeanCount = 0;
let levelTimer = 0, currentWaveIndex = -1, spawnTimer = 0;
let previousGameState = 'loading', globalAnimationTimer = 0, levelMessagesShown = [], isPowerActive = false;

// - Las funciones principales: gameLoop(), handleCollisions(), init(), etc.
function isColliding(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
function handleCollisions() { for (let i = projectiles.length - 1; i >= 0; i--) { for (let j = enemies.length - 1; j >= 0; j--) { if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) { enemies[j].health -= projectiles[i].power; projectiles.splice(i, 1); playSound('enemyHit'); if (enemies[j].health <= 0) { const enemy = enemies[j]; const dropX = Math.min(enemy.x, canvas.width - enemy.width); const dropY = enemy.y; if (Math.random() < enemy.type.grainChance) resources.push(new Resource(dropX, dropY, 'grain', ctx)); if (Math.random() < enemy.type.orbChance) resources.push(new Resource(dropX, dropY, 'orb', ctx)); enemies.splice(j, 1); } break; } } } for (let i = enemies.length - 1; i >= 0; i--) { if (enemies[i].x < player.x + player.width) { base.health -= 50; triggerDamageFlash(); playSound('baseHit', 'C2', '4n'); enemies.splice(i, 1); } } }
function spawnEnemy() { const currentWave = config.levels[currentLevelIndex].waves[currentWaveIndex]; enemies.push(new Enemy(Math.floor(Math.random() * config.lanes), currentWave.enemyType, canvas, ctx)); }
function handleLevelProgression() { if (gameState !== 'playing') return; const currentLevel = config.levels[currentLevelIndex]; if (levelTimer >= currentLevel.duration && enemies.length === 0) { startNextLevel(); return; } const nextWaveIndex = currentWaveIndex + 1; if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) { currentWaveIndex = nextWaveIndex; spawnTimer = 0; } if (currentWaveIndex > -1) { if (spawnTimer > 0) { spawnTimer--; } else if (enemies.length < 20) { spawnEnemy(); spawnTimer = currentLevel.waves[currentWaveIndex].spawnInterval; } } }
function draw() { ctx.clearRect(0, 0, canvas.width, canvas.height); if (player) player.draw(); projectiles.forEach(p => p.draw()); enemies.forEach(e => e.draw()); resources.forEach(r => r.draw()); }
function gameLoop() { if (gameState === 'playing') { levelTimer += 1/60; globalAnimationTimer += 0.02; if (shootTimer > 0) shootTimer--; handleCollisions(); handleLevelProgression(); updateUI(base, currentLevelIndex, coffeeBeanCount, specialPowerPoints, isPowerActive, levelTimer, config); } draw(); if (base.health <= 0) gameState = 'game_over'; if (gameState === 'game_over') { showOverlay('game_over'); } else { animationFrameId = requestAnimationFrame(gameLoop); } }
function activateSpecialPower() { if (specialPowerPoints >= config.specialPowerMax && !isPowerActive && gameState === 'playing') { isPowerActive = true; playSound('powerUp', 'C5', '2n'); } }
function checkResourceClick(x, y) { for (let i = resources.length - 1; i >= 0; i--) { const r = resources[i]; if (r.isFlying) continue; const dist = Math.sqrt(Math.pow(x - (r.x + r.size/2), 2) + Math.pow(y - (r.y + r.size/2), 2)); if (dist < r.size) { if (r.type === 'grain') { coffeeBeanCount++; } else { specialPowerPoints = Math.min(config.specialPowerMax, specialPowerPoints + config.orbValue); playSound('collect', 'G5'); } resources.splice(i, 1); break; } } }

function resizeAll() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; if (canvas.height > 0) cellSize = canvas.height / config.lanes; if (!player) player = new Player(canvas, ctx); else player.reset(); if (gameState !== 'playing') draw(); }
function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) { currentLevelIndex = level; specialPowerPoints = power; coffeeBeanCount = beans; base = { health: Math.min(health, config.base.health), maxHealth: config.base.health }; levelTimer = 0; currentWaveIndex = -1; enemies = []; projectiles = []; resources = []; levelMessagesShown = []; isPowerActive = false; resizeAll(); updateUI(base, currentLevelIndex, coffeeBeanCount, specialPowerPoints, isPowerActive, levelTimer, config); if (isFirstLoad) { document.getElementById('loading-screen').style.opacity = '0'; setTimeout(() => { document.getElementById('loading-screen').style.display = 'none'; showOverlay('start'); }, 500); } else { showOverlay('start'); } }

// - La función setupEventListeners() y la inicialización final.
function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', () => {
        startAudioContext();
        playMusic();
        gameState = 'playing';
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.classList.add('hidden');
        }
        gameLoop();
    });
    window.addEventListener('resize', resizeAll);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            stopMusic();
        } else {
            playMusic();
        }
    });
}

// --- INICIALIZAR TODO ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadMusic('https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/RunaDefenders/assets/audio/music/nivel1_musica.mp3');
    } catch (error) {
        console.error("Could not load music:", error);
    }
    init(0, 0, 0, config.base.health, true);
    setupEventListeners();
    initThreeScene();
});
