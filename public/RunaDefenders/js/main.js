// Consolidated Game Script

// =================================================================
// --- CONFIG ---
// =================================================================
const config = {
    lanes: 4,
    playerSpeed: 5,
    projectileSpeed: 8,
    shootCooldown: 40,
    fastShootCooldown: 15,
    specialPowerMax: 100,
    powerDrainRate: 20,
    orbValue: 10,
    healingValue: 25,
    base: { health: 1000 },
    grainImage: 'imagenes/collectible_coffee_bean.png',
    orbImage: 'imagenes/collectible_power_orb.png',
    player: {
        image: { idle: 'imagenes/player.png', attack: 'imagenes/player.png' },
        projectileImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI2Q0NzUwMCIvPjwvc3ZnPg=='
    },
    enemies: [
        { name: 'Broca Débil', health: 20, speed: 0.5, grainChance: 0.8, orbChance: 0.1, image: 'imagenes/enemy_broca_1.png' },
        { name: 'Broca Normal', health: 60, speed: 0.4, grainChance: 0.5, orbChance: 0.2, image: 'imagenes/enemy_broca_2.png' },
        { name: 'Broca Fuerte', health: 300, speed: 0.3, grainChance: 0.2, orbChance: 0.5, image: 'imagenes/enemy_broca_3.png' },
    ],
    levels: [ { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 240 }, { startTime: 40, enemyType: 0, spawnInterval: 180 }, { startTime: 90, enemyType: 0, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 100 } ]}, { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 180 }, { startTime: 30, enemyType: 1, spawnInterval: 480 }, { startTime: 70, enemyType: 0, spawnInterval: 120 }, { startTime: 120, enemyType: 1, spawnInterval: 300 } ]}, { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 120 }, { startTime: 20, enemyType: 1, spawnInterval: 300 }, { startTime: 60, enemyType: 0, spawnInterval: 90 }, { startTime: 100, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 1, spawnInterval: 180 } ]}, { duration: 300, waves: [ { startTime: 10, enemyType: 0, spawnInterval: 150 }, { startTime: 40, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 0, spawnInterval: 100 }, { startTime: 180, enemyType: 1, spawnInterval: 180 }, { startTime: 240, enemyType: 1, spawnInterval: 150 } ]}, { duration: 300, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 240 }, { startTime: 50, enemyType: 0, spawnInterval: 100 }, { startTime: 120, enemyType: 1, spawnInterval: 180 }, { startTime: 180, enemyType: 2, spawnInterval: 900 }, { startTime: 240, enemyType: 1, spawnInterval: 120 } ]}, { duration: 300, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 180 }, { startTime: 45, enemyType: 1, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 60 }, { startTime: 180, enemyType: 2, spawnInterval: 600 }, { startTime: 240, enemyType: 1, spawnInterval: 100 } ]}, { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 150 }, { startTime: 60, enemyType: 0, spawnInterval: 80 }, { startTime: 180, enemyType: 1, spawnInterval: 120 }, { startTime: 240, enemyType: 2, spawnInterval: 600 }, { startTime: 300, enemyType: 1, spawnInterval: 100 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]}, { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 120 }, { startTime: 50, enemyType: 2, spawnInterval: 720 }, { startTime: 180, enemyType: 1, spawnInterval: 100 }, { startTime: 240, enemyType: 0, spawnInterval: 40 }, { startTime: 300, enemyType: 1, spawnInterval: 80 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]}, { duration: 420, waves: [ { startTime: 5, enemyType: 2, spawnInterval: 600 }, { startTime: 30, enemyType: 1, spawnInterval: 90 }, { startTime: 180, enemyType: 0, spawnInterval: 30 }, { startTime: 240, enemyType: 1, spawnInterval: 60 }, { startTime: 300, enemyType: 2, spawnInterval: 400 }, { startTime: 360, enemyType: 1, spawnInterval: 50 } ]}, { duration: 420, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 60 }, { startTime: 45, enemyType: 2, spawnInterval: 480 }, { startTime: 180, enemyType: 1, spawnInterval: 50 }, { startTime: 240, enemyType: 2, spawnInterval: 300 }, { startTime: 300, enemyType: 1, spawnInterval: 40 }, { startTime: 360, enemyType: 2, spawnInterval: 180 } ]} ]
};

// =================================================================
// --- STATE MANAGEMENT ---
// =================================================================
let gameState = 'loading';
let player, base, cellSize;
let projectiles = [], enemies = [], resources = [];
let currentLevelIndex = 0, shootTimer = 0, animationFrameId;
let specialPowerPoints = 0, coffeeBeanCount = 0;
let levelTimer = 0, currentWaveIndex = -1, spawnTimer = 0;
let previousGameState = 'loading', globalAnimationTimer = 0, levelMessagesShown = [], isPowerActive = false;

// =================================================================
// --- ENTITIES ---
// =================================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

class Projectile {
    constructor(x, y) { this.x = x; this.y = y - 10; this.width = 20; this.height = 20; this.speed = config.projectileSpeed; this.power = 20; this.image = new Image(); this.image.src = config.player.projectileImage; }
    update() { this.x += this.speed; }
    draw() { ctx.drawImage(this.image, this.x, this.y, this.width, this.height); }
}

class Player {
    constructor() { this.reset(); }
    reset() { this.width = cellSize * 0.9; this.height = cellSize * 0.9; this.x = 10; this.y = canvas.height / 2 - this.height / 2; this.speed = config.playerSpeed; this.image = new Image(); this.image.src = config.player.image.idle; this.attackImage = new Image(); this.attackImage.src = config.player.image.attack; this.isAttacking = false; }
    draw() { const bobble = Math.sin(globalAnimationTimer * 4) * (cellSize * 0.02); ctx.drawImage(this.isAttacking ? this.attackImage : this.image, this.x, this.y + bobble, this.width, this.height); }
    update() { if (this.y < 0) this.y = 0; if (this.y > canvas.height - this.height) this.y = canvas.height - this.height; }
    shoot() { if (shootTimer > 0 || gameState !== 'playing') return; projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2)); shootTimer = isPowerActive ? config.fastShootCooldown : config.shootCooldown; playSound('shoot', 'C5', '16n'); this.isAttacking = true; setTimeout(() => this.isAttacking = false, 100); }
}

class Enemy {
    constructor(lane, typeIndex) { this.type = config.enemies[typeIndex]; this.width = cellSize - 10; this.height = cellSize - 10; this.x = canvas.width + 50; this.y = (lane * cellSize) + 5; this.speed = this.type.speed; this.health = this.type.health; this.maxHealth = this.health; this.image = new Image(); this.image.src = this.type.image; }
    update() { this.x -= this.speed; }
    draw() { const bobble = Math.sin(globalAnimationTimer * 5 + this.y) * (cellSize * 0.05); ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height); if (this.health < this.maxHealth) { ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 10 + bobble, this.width, 5); ctx.fillStyle = 'green'; ctx.fillRect(this.x, this.y - 10 + bobble, this.width * (this.health / this.maxHealth), 5); } }
}

class Resource {
    constructor(x, y, type) { this.x = x; this.y = y; this.size = 45; this.type = type; this.image = new Image(); this.image.src = type === 'grain' ? config.grainImage : config.orbImage; this.life = 400; this.isFlying = false; }
    update() { this.life--; }
    draw() { if (this.isFlying) return; const scale = 1 + Math.sin(globalAnimationTimer * 6) * 0.08; const newSize = this.size * scale; const sizeDiff = (newSize - this.size) / 2; ctx.globalAlpha = this.life < 60 ? this.life / 60 : 1; ctx.drawImage(this.image, this.x - sizeDiff, this.y - sizeDiff, newSize, newSize); ctx.globalAlpha = 1; }
}

// =================================================================
// --- GAME LOGIC & SYSTEMS ---
// =================================================================

function playSound(sound, note, duration = '8n') { if (typeof Tone !== 'undefined' && Tone.context.state === 'running' && sounds[sound]) { sounds[sound].triggerAttackRelease(note, duration); } }
function isColliding(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
function handleCollisions() { for (let i = projectiles.length - 1; i >= 0; i--) { for (let j = enemies.length - 1; j >= 0; j--) { if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) { enemies[j].health -= projectiles[i].power; projectiles.splice(i, 1); playSound('enemyHit'); if (enemies[j].health <= 0) { const enemy = enemies[j]; const dropX = Math.min(enemy.x, canvas.width - enemy.width); const dropY = enemy.y; if (Math.random() < enemy.type.grainChance) resources.push(new Resource(dropX, dropY, 'grain')); if (Math.random() < enemy.type.orbChance) resources.push(new Resource(dropX, dropY, 'orb')); enemies.splice(j, 1); } break; } } } for (let i = enemies.length - 1; i >= 0; i--) { if (enemies[i].x < player.x + player.width) { base.health -= 50; triggerDamageFlash(); playSound('baseHit', 'C2', '4n'); enemies.splice(i, 1); } } }
function spawnEnemy() { const currentWave = config.levels[currentLevelIndex].waves[currentWaveIndex]; enemies.push(new Enemy(Math.floor(Math.random() * config.lanes), currentWave.enemyType)); }
function handleLevelProgression() { if (gameState !== 'playing') return; const currentLevel = config.levels[currentLevelIndex]; if (levelTimer >= currentLevel.duration && enemies.length === 0) { startNextLevel(); return; } const nextWaveIndex = currentWaveIndex + 1; if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) { currentWaveIndex = nextWaveIndex; spawnTimer = 0; } if (currentWaveIndex > -1) { if (spawnTimer > 0) { spawnTimer--; } else if (enemies.length < 20) { spawnEnemy(); spawnTimer = currentLevel.waves[currentWaveIndex].spawnInterval; } } }
function draw() { ctx.clearRect(0, 0, canvas.width, canvas.height); if (player) player.draw(); projectiles.forEach(p => p.draw()); enemies.forEach(e => e.draw()); resources.forEach(r => r.draw()); }
function gameLoop() { if (gameState === 'playing') { levelTimer += 1/60; globalAnimationTimer += 0.02; if (shootTimer > 0) shootTimer--; handleCollisions(); handleLevelProgression(); updateUI(); } draw(); if (base.health <= 0) gameState = 'game_over'; if (gameState === 'game_over') { showOverlay('game_over'); } else { animationFrameId = requestAnimationFrame(gameLoop); } }
function activateSpecialPower() { if (specialPowerPoints >= config.specialPowerMax && !isPowerActive && gameState === 'playing') { isPowerActive = true; playSound('powerUp', 'C5', '2n'); } }
function checkResourceClick(x, y) { for (let i = resources.length - 1; i >= 0; i--) { const r = resources[i]; if (r.isFlying) continue; const dist = Math.sqrt(Math.pow(x - (r.x + r.size/2), 2) + Math.pow(y - (r.y + r.size/2), 2)); if (dist < r.size) { if (r.type === 'grain') { coffeeBeanCount++; } else { specialPowerPoints = Math.min(config.specialPowerMax, specialPowerPoints + config.orbValue); playSound('collect', 'G5'); } resources.splice(i, 1); break; } } }

// =================================================================
// --- UI & INITIALIZATION ---
// =================================================================
const uiElements = { gameOverlay: document.getElementById('game-overlay'), startScreen: document.getElementById('start-screen'), gameOverScreen: document.getElementById('game-over-screen'), levelValue: document.getElementById('level-value'), coffeeBeanCounter: document.getElementById('coffee-bean-counter'), specialPowerBar: document.getElementById('special-power-bar'), activatePowerButton: document.getElementById('activate-power-button'), timelineProgress: document.getElementById('timeline-progress'), timelineWorm: document.getElementById('timeline-worm'), damageFlash: document.getElementById('damage-flash') };
function updateUI() { if (!base) return; uiElements.levelValue.textContent = currentLevelIndex + 1; uiElements.coffeeBeanCounter.textContent = coffeeBeanCount; uiElements.specialPowerBar.style.width = `${(specialPowerPoints / config.specialPowerMax) * 100}%`; if (specialPowerPoints >= config.specialPowerMax && !isPowerActive) { uiElements.activatePowerButton.disabled = false; uiElements.activatePowerButton.classList.add('power-ready'); } else { uiElements.activatePowerButton.disabled = true; uiElements.activatePowerButton.classList.remove('power-ready'); } const currentLevel = config.levels[currentLevelIndex]; if (currentLevel) { const progressPercent = Math.min((levelTimer / currentLevel.duration) * 100, 100); uiElements.timelineProgress.style.width = `${progressPercent}%`; uiElements.timelineWorm.style.right = `${progressPercent}%`; } }
function showOverlay(type) { uiElements.gameOverlay.classList.remove('hidden'); if (type === 'start') uiElements.startScreen.style.display = 'flex'; if (type === 'game_over') uiElements.gameOverScreen.style.display = 'flex'; }
function triggerDamageFlash() { uiElements.damageFlash.style.opacity = '1'; setTimeout(() => { uiElements.damageFlash.style.opacity = '0'; }, 150); }
function resizeAll() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; if (canvas.height > 0) cellSize = canvas.height / config.lanes; if (!player) player = new Player(); else player.reset(); if (gameState !== 'playing') draw(); }
function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) { currentLevelIndex = level; specialPowerPoints = power; coffeeBeanCount = beans; base = { health: Math.min(health, config.base.health), maxHealth: config.base.health }; levelTimer = 0; currentWaveIndex = -1; enemies = []; projectiles = []; resources = []; levelMessagesShown = []; isPowerActive = false; resizeAll(); updateUI(); if (isFirstLoad) { document.getElementById('loading-screen').style.opacity = '0'; setTimeout(() => { document.getElementById('loading-screen').style.display = 'none'; showOverlay('start'); }, 500); } else { showOverlay('start'); } }
function setupEventListeners() { document.getElementById('start-button').addEventListener('click', () => { if (Tone.context.state !== 'running') Tone.start(); gameState = 'playing'; uiElements.gameOverlay.classList.add('hidden'); gameLoop(); }); window.addEventListener('resize', resizeAll); }

document.addEventListener('DOMContentLoaded', () => {
    init(0, 0, 0, config.base.health, true);
    setupEventListeners();
});
