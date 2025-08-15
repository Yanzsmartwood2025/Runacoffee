// =================================================================
// --- MODULE IMPORTS ---
// =================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// =================================================================
// --- 3D SCENE MODULE ---
// =================================================================
let treeScene, treeCamera, treeRenderer, treeModel;
let orbsGroup, orbs = [];
const treeContainer = document.getElementById('tree-container');
const treeCanvasContainer = document.getElementById('tree-canvas-container');
const treeHealthBar = document.getElementById('tree-health-bar');
const healthyColor = new THREE.Color(0xffffff);
const damagedColor = new THREE.Color(0xff0000);
const lockedOrbColor = new THREE.Color(0x333333);
const unlockedOrbColor = new THREE.Color(0xffffff);
let raycaster, pointer;

function initThreeScene() {
    treeScene = new THREE.Scene();

    const { width, height } = treeCanvasContainer.getBoundingClientRect();
    treeCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    treeCamera.position.set(0, 1.5, 9);
    treeCamera.lookAt(0, 1, 0);

    treeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    treeRenderer.setClearColor(0x000000, 0);
    treeRenderer.setSize(width, height);
    treeRenderer.setPixelRatio(window.devicePixelRatio);
    treeRenderer.outputColorSpace = THREE.SRGBColorSpace;
    treeCanvasContainer.appendChild(treeRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    treeScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    treeScene.add(directionalLight);
    
    const loader = new GLTFLoader();
    loader.load('https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/776b9c0c5a976bff5e8077da365a60a5e5c3e616/public/assets%20/3D/arbol_final.glb', (gltf) => {
        treeModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(treeModel);
        const center = box.getCenter(new THREE.Vector3());
        treeModel.position.y -= box.min.y;
        treeModel.position.add(center.multiplyScalar(-1));
        treeModel.scale.set(1.9, 1.9, 1.9);
        treeScene.add(treeModel);
        if (base) updateTreeAppearance();
    }, undefined, (error) => {
        console.error('An error happened while loading the tree model:', error);
    });

    orbsGroup = new THREE.Group();
    treeScene.add(orbsGroup);

    const gifUrls = [
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/birds.gif',
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/fire.gif',
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/music.gif',
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/rain.gif',
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/river.gif',
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/storm.gif',
        'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/wind.gif'
    ];

    const orbCount = 7;
    const orbGeometry = new THREE.SphereGeometry(0.45, 32, 32);
    orbGeometry.rotateY(-Math.PI / 2);
    const textureLoader = new THREE.TextureLoader();

    for (let i = 0; i < orbCount; i++) {
        const texture = textureLoader.load(gifUrls[i]);
        texture.colorSpace = THREE.SRGBColorSpace;
        const orbMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            color: lockedOrbColor
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.userData = { index: i, unlocked: false, name: `Poder ${i+1}` };
        const angle = (i / orbCount) * Math.PI * 2;
        const radius = 2.5;
        orb.position.x = Math.cos(angle) * radius;
        orb.position.z = Math.sin(angle) * radius;
        orb.initialY = 1.5;
        orb.position.y = orb.initialY;
        orb.bobSpeed = 2 + Math.random() * 3;
        orb.bobOffset = Math.random() * Math.PI * 2;
        orbsGroup.add(orb);
        orbs.push(orb);
    }

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    function animateTree() {
        requestAnimationFrame(animateTree);
        if (orbsGroup) {
            orbsGroup.rotation.y += 0.005;
            orbs.forEach(orb => {
                orb.position.y = orb.initialY + Math.sin(globalAnimationTimer * orb.bobSpeed + orb.bobOffset) * 0.3;
                orb.lookAt(treeCamera.position);
            });
        }
        if (treeRenderer && treeScene && treeCamera) {
            treeRenderer.render(treeScene, treeCamera);
        }
    }
    animateTree();
    
    const resizeObserver = new ResizeObserver(() => {
        const { width, height } = treeCanvasContainer.getBoundingClientRect();
        if (width > 0 && height > 0) {
            treeCamera.aspect = width / height;
            treeCamera.updateProjectionMatrix();
            treeRenderer.setSize(width, height);
        }
    });
    resizeObserver.observe(treeCanvasContainer);
}

function updateTreeAppearance() {
    if (!base || !treeModel) return;
    const healthPercent = Math.max(0, base.health / base.maxHealth);
    if (treeHealthBar) treeHealthBar.style.height = `${healthPercent * 100}%`;
    treeModel.traverse((node) => {
        if (node.isMesh && node.material) {
            if (!node.material.originalColor) node.material.originalColor = node.material.color.clone();
            node.material.color.copy(node.material.originalColor).lerp(damagedColor, 1 - healthPercent);
        }
    });
}

function updateOrbsLockState() {
    const unlockedCount = currentLevelIndex + 1;
    orbs.forEach((orb, i) => {
        const isUnlocked = i < unlockedCount;
        orb.userData.unlocked = isUnlocked;
        orb.material.color.set(isUnlocked ? unlockedOrbColor : lockedOrbColor);
    });
}

function animateCamera(targetPosition, onComplete) {
    const startPosition = treeCamera.position.clone();
    const duration = 800;
    let startTime = null;

    function animationLoop(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);

        treeCamera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        if (progress < 1) {
            requestAnimationFrame(animationLoop);
        } else {
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(animationLoop);
}

function toggleTreeMenu(show) {
    if (show) {
        if (gameState !== 'playing' && gameState !== 'paused') return;
        previousGameState = gameState;
        gameState = 'menu';
        
        treeContainer.classList.add('menu-view');
        gameOverlay.classList.add('menu-mode-bg');
        document.getElementById('top-bar').style.opacity = '0';
        document.getElementById('bottom-bar').style.opacity = '0';

        const menuCameraPosition = new THREE.Vector3(0, 1.5, 6);
        animateCamera(menuCameraPosition);

    } else {
        if (gameState !== 'menu') return;
        
        treeContainer.classList.remove('menu-view');
        gameOverlay.classList.remove('menu-mode-bg');
        document.getElementById('top-bar').style.opacity = '1';
        document.getElementById('bottom-bar').style.opacity = '1';
        
        const gameCameraPosition = new THREE.Vector3(0, 1.5, 9);
        animateCamera(gameCameraPosition, () => {
            if (previousGameState === 'playing') {
                gameState = 'playing';
                gameLoop();
            } else {
                gameState = 'paused';
                // If we were paused, we don't need to restart the game loop, just set the state.
            }
        });
    }
}

// =================================================================
// --- FIREBASE INTEGRATION ---
// =================================================================
let auth, db, userId = null;
const authContainer = document.getElementById('auth-container');
const authModal = document.getElementById('auth-modal');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';

async function initializeAndLoadGame() {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        if (Object.keys(firebaseConfig).length === 0) {
            console.log("Firebase config not found. Starting new game.");
            init(0, 0, 0, config.base.health, true);
            updateAuthUI(null);
            return;
        }

        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, async (user) => {
            updateAuthUI(user);
            if (user) {
                userId = user.uid;
                const savedData = await loadGameData();
                if (savedData) {
                    init(
                        savedData.level || 0, 
                        savedData.specialPower || 0, 
                        savedData.coffeeBeans || 0, 
                        savedData.baseHealth || config.base.health, 
                        true
                    );
                } else {
                    init(0, 0, 0, config.base.health, true);
                }
            } else {
                signInAnonymously(auth).catch(error => {
                    console.error("Anonymous sign-in failed:", error);
                    init(0, 0, 0, config.base.health, true);
                });
            }
        });

    } catch (e) {
        console.error("Firebase initialization failed:", e);
        init(0, 0, 0, config.base.health, true);
        updateAuthUI(null);
    }
}

function updateAuthUI(user) {
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

async function saveGameData() {
    if (!userId || !db) return;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    const dataToSave = {
        level: currentLevelIndex,
        specialPower: specialPowerPoints,
        coffeeBeans: coffeeBeanCount,
        baseHealth: base.health,
        timestamp: new Date()
    };
    try {
        await setDoc(gameDataRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving game:", error);
    }
}

async function loadGameData() {
    if (!userId || !db) return null;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    try {
        const docSnap = await getDoc(gameDataRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error)
    {
        console.error("Error loading game:", error);
        return null;
    }
}

// =================================================================
// ---  GAME CONFIG & MAIN LOGIC ---
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
    player: {}, base: { health: 1000 },
    grainImage: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/collectible_coffee_bean.png',
    orbImage: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/collectible_power_orb.png',
    enemies: [], levels: []
};
Object.assign(config, {
    player: {
        image: { 
            idle: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/player.png',
            attack: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/player.png'
        },
        projectileImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI2Q0NzUwMCIvPjwvc3ZnPg=='
    },
    enemies: [
        { name: 'Broca Débil', health: 20, speed: 0.5, grainChance: 0.8, orbChance: 0.1, image: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/enemy_broca_1.png' },
        { name: 'Broca Normal', health: 60, speed: 0.4, grainChance: 0.5, orbChance: 0.2, image: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/enemy_broca_2.png' },
        { name: 'Broca Fuerte', health: 300, speed: 0.3, grainChance: 0.2, orbChance: 0.5, image: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/enemy_broca_3.png' },
    ],
    levels: [
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 240 }, { startTime: 40, enemyType: 0, spawnInterval: 180 }, { startTime: 90, enemyType: 0, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 100 } ]},
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 180 }, { startTime: 30, enemyType: 1, spawnInterval: 480 }, { startTime: 70, enemyType: 0, spawnInterval: 120 }, { startTime: 120, enemyType: 1, spawnInterval: 300 } ]},
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 120 }, { startTime: 20, enemyType: 1, spawnInterval: 300 }, { startTime: 60, enemyType: 0, spawnInterval: 90 }, { startTime: 100, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 1, spawnInterval: 180 } ]},
        { duration: 300, waves: [ { startTime: 10, enemyType: 0, spawnInterval: 150 }, { startTime: 40, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 0, spawnInterval: 100 }, { startTime: 180, enemyType: 1, spawnInterval: 180 }, { startTime: 240, enemyType: 1, spawnInterval: 150 } ]},
        { duration: 300, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 240 }, { startTime: 50, enemyType: 0, spawnInterval: 100 }, { startTime: 120, enemyType: 1, spawnInterval: 180 }, { startTime: 180, enemyType: 2, spawnInterval: 900 }, { startTime: 240, enemyType: 1, spawnInterval: 120 } ]},
        { duration: 300, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 180 }, { startTime: 45, enemyType: 1, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 60 }, { startTime: 180, enemyType: 2, spawnInterval: 600 }, { startTime: 240, enemyType: 1, spawnInterval: 100 } ]},
        { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 150 }, { startTime: 60, enemyType: 0, spawnInterval: 80 }, { startTime: 180, enemyType: 1, spawnInterval: 120 }, { startTime: 240, enemyType: 2, spawnInterval: 600 }, { startTime: 300, enemyType: 1, spawnInterval: 100 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]},
        { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 120 }, { startTime: 50, enemyType: 2, spawnInterval: 720 }, { startTime: 180, enemyType: 1, spawnInterval: 100 }, { startTime: 240, enemyType: 0, spawnInterval: 40 }, { startTime: 300, enemyType: 1, spawnInterval: 80 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]},
        { duration: 420, waves: [ { startTime: 5, enemyType: 2, spawnInterval: 600 }, { startTime: 30, enemyType: 1, spawnInterval: 90 }, { startTime: 180, enemyType: 0, spawnInterval: 30 }, { startTime: 240, enemyType: 1, spawnInterval: 60 }, { startTime: 300, enemyType: 2, spawnInterval: 400 }, { startTime: 360, enemyType: 1, spawnInterval: 50 } ]},
        { duration: 420, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 60 }, { startTime: 45, enemyType: 2, spawnInterval: 480 }, { startTime: 180, enemyType: 1, spawnInterval: 50 }, { startTime: 240, enemyType: 2, spawnInterval: 300 }, { startTime: 300, enemyType: 1, spawnInterval: 40 }, { startTime: 360, enemyType: 2, spawnInterval: 180 } ]}
    ]
});

const loadingScreen = document.getElementById('loading-screen');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
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
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const restartPauseButton = document.getElementById('restart-pause-button');
const mainMenuButton = document.getElementById('main-menu-button');
const howToPlayButton = document.getElementById('how-to-play-button');
const backToPauseButton = document.getElementById('back-to-pause-button');
const coffeeBagIcon = document.getElementById('coffee-bag-icon');
const coffeeBeanCounterEl = document.getElementById('coffee-bean-counter');
const timelineProgress = document.getElementById('timeline-progress');
const timelineWorm = document.getElementById('timeline-worm');

let cellSize, player, base;
let projectiles = [], enemies = [], resources = [];
let currentLevelIndex = 0, shootTimer = 0, animationFrameId;
let specialPowerPoints = 0, coffeeBeanCount = 0;
let levelTimer = 0, currentWaveIndex = -1, spawnTimer = 0;
let gameState = 'loading', previousGameState = 'loading';
let globalAnimationTimer = 0;
let levelMessagesShown = [];
let isPowerActive = false;

const sounds = {
    shoot: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
    collect: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
    heal: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 } }).toDestination(),
    baseHit: new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.01, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination(),
    enemyHit: new Tone.PolySynth(Tone.NoiseSynth, { noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination(),
    gameOver: new Tone.PolySynth(Tone.Synth).toDestination(),
    levelUp: new Tone.PolySynth(Tone.Synth).toDestination(),
    waveWarning: new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 5, envelope: { attack: 0.01, decay: 0.5, sustain: 0.01, release: 0.8 } }).toDestination(),
    powerUp: new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 10, detune: 0, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }, modulation: { type: "square" }, modulationEnvelope: { attack: 0.1, decay: 0.1, sustain: 0.3, release: 0.5 } }).toDestination(),
    powerDown: new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, detune: 0, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, modulation: { type: "sawtooth" }, modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0, release: 0.5 } }).toDestination()
};

function playSound(sound, note, duration = '8n') {
    if (Tone.context.state !== 'running') return;
    if (sounds[sound]) sounds[sound].triggerAttackRelease(note, duration);
}

class Player {
    constructor() { this.reset(); }
    reset() {
        this.width = cellSize * 0.9;
        this.height = cellSize * 0.9;
        this.x = 10; 
        this.baseY = canvas.height / 2 - this.height / 2;
        this.y = this.baseY;
        this.speed = config.playerSpeed;
        this.image = new Image();
        this.image.src = config.player.image.idle;
        this.attackImage = new Image();
        this.attackImage.src = config.player.image.attack;
        this.isAttacking = false;
    }
    draw() {
        const bobble = Math.sin(globalAnimationTimer * 4) * (cellSize * 0.02);
        ctx.drawImage(this.isAttacking ? this.attackImage : this.image, this.x, this.y + bobble, this.width, this.height);
    }
    update() {
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    }
    shoot() {
        if (shootTimer > 0 || gameState !== 'playing') return;
        projectiles.push(new Projectile(this.x + this.width, this.y + this.height / 2));
        shootTimer = isPowerActive ? config.fastShootCooldown : config.shootCooldown;
        playSound('shoot', 'C5', '16n');
        this.isAttacking = true;
        setTimeout(() => this.isAttacking = false, 100);
    }
}
class Projectile {
    constructor(x, y) {
        this.x = x; this.y = y - 10; this.width = 20; this.height = 20;
        this.speed = config.projectileSpeed; this.power = 20;
        this.image = new Image(); this.image.src = config.player.projectileImage;
    }
    update() { this.x += this.speed; }
    draw() { ctx.drawImage(this.image, this.x, this.y, this.width, this.height); }
}
class Enemy {
    constructor(lane, typeIndex) {
        this.type = config.enemies[typeIndex];
        this.width = cellSize - 10; this.height = cellSize - 10;
        this.x = canvas.width + 700; 
        this.baseY = (lane * cellSize) + 5;
        this.y = this.baseY;
        this.speed = this.type.speed; this.health = this.type.health;
        this.maxHealth = this.health;
        this.image = new Image(); this.image.src = this.type.image;
    }
    update() { this.x -= this.speed; }
    draw() { 
        const bobble = Math.sin(globalAnimationTimer * 5 + this.baseY) * (cellSize * 0.05);
        ctx.drawImage(this.image, this.x, this.y + bobble, this.width, this.height);
        
        if (this.health < this.maxHealth) {
            ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 10 + bobble, this.width, 5);
            ctx.fillStyle = 'green'; ctx.fillRect(this.x, this.y - 10 + bobble, this.width * (this.health / this.maxHealth), 5);
        }
    }
}
class Resource {
    constructor(x, y, type) {
        this.x = x; this.y = y; 
        this.size = 45; 
        this.type = type;
        this.image = new Image(); this.image.src = type === 'grain' ? config.grainImage : config.orbImage;
        this.life = 400;
        this.isFlying = false;
    }
    update() { this.life--; }
    draw() {
        if (this.isFlying) return;
        const scale = 1 + Math.sin(globalAnimationTimer * 6) * 0.08;
        const newSize = this.size * scale;
        const sizeDiff = (newSize - this.size) / 2;

        ctx.globalAlpha = this.life < 60 ? this.life / 60 : 1;
        ctx.drawImage(this.image, this.x - sizeDiff, this.y - sizeDiff, newSize, newSize);
        ctx.globalAlpha = 1;
    }
}

function isColliding(a,b){ return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
function triggerDamageFlash() {
    damageFlash.style.opacity = 1;
    setTimeout(() => { damageFlash.style.opacity = 0; }, 150);
}

function handleCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power; 
                projectiles.splice(i, 1); 
                playSound('enemyHit');

                if (enemies[j].health <= 0) {
                    const enemy = enemies[j];
                    const dropX = Math.min(enemy.x, canvas.width - enemy.width);
                    const dropY = enemy.y;

                    if (Math.random() < enemy.type.grainChance) {
                        resources.push(new Resource(dropX, dropY, 'grain'));
                    }
                    if (Math.random() < enemy.type.orbChance) {
                        resources.push(new Resource(dropX, dropY, 'orb'));
                    }
                    enemies.splice(j, 1);
                }
                break; 
            }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x < player.x + player.width) { 
            base.health -= 50; updateTreeAppearance(); triggerDamageFlash(); playSound('baseHit', 'C2', '4n');
            enemies.splice(i, 1);
            if (base.health <= 0) { gameState = 'game_over'; playSound('gameOver', 'C3', '1n'); }
        }
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

function handleGameLogic() {
    globalAnimationTimer += 0.02;
    if (shootTimer > 0) shootTimer--;
    levelTimer += 1/60;

    if (isPowerActive) {
        specialPowerPoints -= (config.powerDrainRate / 60);
        if (specialPowerPoints <= 0) {
            isPowerActive = false;
            specialPowerPoints = 0;
            playSound('powerDown', 'G3', '4n');
            activatePowerButton.classList.remove('power-ready');
        }
    }

    projectiles.forEach((p, i) => { p.update(); if (p.x > canvas.width) projectiles.splice(i, 1); });
    enemies.forEach(e => e.update());
    resources.forEach((r, i) => { r.update(); if (r.life <= 0) resources.splice(i, 1); });
    handleCollisions();
    handleLevelProgression();
}

function handleLevelProgression() {
    if (gameState !== 'playing') return;
    const currentLevel = config.levels[currentLevelIndex];
    const levelDuration = currentLevel.duration;

    if (levelTimer >= levelDuration && enemies.length === 0) {
        startNextLevel(); 
        return; 
    }

    if (currentLevelIndex < 3) {
        if (levelTimer >= 120 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true; showWaveMessage("¡Oleada Final!");
        }
    } else if (currentLevelIndex < 6) {
        if (levelTimer >= 120 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true; showWaveMessage("¡Se acerca una gran oleada!");
        }
        if (levelTimer >= 240 && !levelMessagesShown[1]) {
            levelMessagesShown[1] = true; showWaveMessage("¡Oleada Final!");
        }
    } else {
        if (levelTimer >= 180 && !levelMessagesShown[0]) {
            levelMessagesShown[0] = true; showWaveMessage("¡Oleada Intensa!");
        }
        if (levelTimer >= 360 && !levelMessagesShown[1]) {
            levelMessagesShown[1] = true; showWaveMessage("¡Oleada Final!");
        }
    }

    if (levelTimer < levelDuration) {
        const nextWaveIndex = currentWaveIndex + 1;
        if (nextWaveIndex < currentLevel.waves.length && levelTimer >= currentLevel.waves[nextWaveIndex].startTime) {
            currentWaveIndex = nextWaveIndex; spawnTimer = 0;
        }
        
        if (currentWaveIndex > -1) {
            if (spawnTimer > 0) {
                spawnTimer--;
            } else if (enemies.length < 20) { 
                spawnEnemy(); 
                spawnTimer = currentLevel.waves[currentWaveIndex].spawnInterval; 
            }
        }
    }
}

function startNextLevel() {
    gameState = 'level_complete';
    playSound('levelUp', 'C6', '2n');
    saveGameData();
    showOverlay('level_complete');
}

function spawnEnemy() {
    const currentWave = config.levels[currentLevelIndex].waves[currentWaveIndex];
    enemies.push(new Enemy(Math.floor(Math.random() * config.lanes), currentWave.enemyType));
}

function draw() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (player) player.draw();
    projectiles.forEach(p => p.draw());
    enemies.forEach(e => e.draw());
    resources.forEach(r => r.draw());
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

function gameLoop() {
    if (gameState === 'playing') {
        handleGameLogic();
        updateUI(); 
    }
    draw();
    
    if (gameState === 'game_over') {
        showOverlay('game_over');
    } else if (gameState !== 'level_complete' && gameState !== 'paused' && gameState !== 'menu') {
        animationFrameId = requestAnimationFrame(gameLoop);
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

function init(level = 0, power = 0, beans = 0, health = config.base.health, isFirstLoad = true) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    currentLevelIndex = level;
    specialPowerPoints = power;
    coffeeBeanCount = beans;
    base = { health: Math.min(health, config.base.health), maxHealth: config.base.health };
    
    levelTimer = 0; currentWaveIndex = -1;
    enemies = []; projectiles = []; resources = [];
    levelMessagesShown = [];
    isPowerActive = false;

    resizeAll(); 
    updateTreeAppearance();
    updateOrbsLockState();
    updateUI();
    
    gameState = 'start';
    showOverlay('start');

    if (isFirstLoad) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
    }
}

function activateSpecialPower() {
    if (specialPowerPoints >= config.specialPowerMax && !isPowerActive && gameState === 'playing') {
        isPowerActive = true;
        playSound('powerUp', 'C5', '2n');
        updateUI();
    }
}

function setupEventListeners() {
    const handleStart = async (event) => {
        event.preventDefault();
        try { if (Tone.context.state !== 'running') await Tone.start(); } 
        catch (e) { console.error("Could not start audio context:", e); }

        gameState = 'playing';
        gameContainer.classList.add('playing');
        gameOverlay.classList.add('hidden');
        gameOverlay.classList.remove('active');
        spawnTimer = 0;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
    };
    startButton.addEventListener('click', handleStart);

    retryButton.addEventListener('click', (e) => { e.preventDefault(); init(currentLevelIndex, 0, 0, config.base.health, false); });
    
    pauseButton.addEventListener('click', () => {
         if (gameState === 'playing') {
              previousGameState = gameState;
              gameState = 'paused';
              showOverlay('pause');
         }
    });
    
    resumeButton.addEventListener('click', () => {
        if (gameState === 'paused') {
            gameState = 'playing';
            gameOverlay.classList.add('hidden');
            gameOverlay.classList.remove('active');
            gameLoop();
        }
    });
    
    const restartFunction = () => {
        init(currentLevelIndex, 0, 0, config.base.health, false);
    };
    restartPauseButton.addEventListener('click', restartFunction);
    
    mainMenuButton.addEventListener('click', () => {
        init(0, 0, 0, config.base.health, false);
    });

    howToPlayButton.addEventListener('click', () => {
        showOverlay('how_to_play');
    });

    backToPauseButton.addEventListener('click', () => {
        showOverlay('pause');
    });


    activatePowerButton.addEventListener('click', activateSpecialPower);
    window.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === 'e') {
            activateSpecialPower();
        }
    });

    document.getElementById('close-auth-modal-button').addEventListener('click', () => authModal.classList.add('hidden'));
    
    document.getElementById('google-login-button-modal').addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).then(() => {
            authModal.classList.add('hidden');
        }).catch(error => console.error("Google Sign-In Error:", error));
    });

    authContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.id === 'open-login-modal-btn') {
            authModal.classList.remove('hidden');
        } else if (button.id === 'logout-btn') {
            signOut(auth).catch(error => console.error("Sign out error", error));
        }
    });

    let keys = {};
    window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key === ' ' || e.key.includes('Arrow')) e.preventDefault(); });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    
    function controlLoop() {
        if (gameState === 'playing' && player) {
            if (keys['w'] || keys['arrowup']) player.y -= player.speed;
            if (keys['s'] || keys['arrowdown']) player.y += player.speed;
            if (keys[' ']) player.shoot();
            player.update();
        }
        requestAnimationFrame(controlLoop);
    }
    controlLoop();

    let isDragging = false, didDrag = false, touchYOffset = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); 
        if (!player) return;
        const touch = e.touches[0]; 
        const rect = canvas.getBoundingClientRect();
        isDragging = true; 
        didDrag = false;
        const currentY = touch.clientY - rect.top;
        touchStartY = currentY; 
        touchYOffset = currentY - player.y;
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault(); 
        if (!isDragging || !player) return;
        const touch = e.touches[0]; 
        const rect = canvas.getBoundingClientRect();
        const newY = touch.clientY - rect.top;
        if (Math.abs(newY - touchStartY) > 5) didDrag = true;
        player.y = newY - touchYOffset;
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        if (didDrag || !player) {
            isDragging = false;
            didDrag = false;
            return;
        }
        
        isDragging = false;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.changedTouches[0].clientX - rect.left;
        const clickY = e.changedTouches[0].clientY - rect.top;

        if (clickX >= player.x && clickX <= player.x + player.width &&
            clickY >= player.y && clickY <= player.y + player.height) {
            player.shoot();
        } else {
            checkResourceClick(clickX, clickY);
        }
    });

    canvas.addEventListener('click', e => {
        if (!player) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (clickX >= player.x && clickX <= player.x + player.width &&
            clickY >= player.y && clickY <= player.y + player.height) {
            player.shoot();
        } else {
            checkResourceClick(clickX, clickY);
        }
    });

    treeCanvasContainer.addEventListener('click', (event) => {
        if (gameState === 'playing' || gameState === 'paused') {
            toggleTreeMenu(true);
            return;
        }
        
        if (gameState !== 'menu') return;

        const rect = treeCanvasContainer.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, treeCamera);
        const intersects = raycaster.intersectObjects(orbs);

        if (intersects.length > 0) {
            const clickedOrb = intersects[0].object;
            if (clickedOrb.userData.unlocked) {
                console.log(`Poder seleccionado: ${clickedOrb.userData.name}`);
                // Aquí puedes añadir la lógica para activar el poder seleccionado
                playSound('collect', 'C6');
                toggleTreeMenu(false);
            }
        } else {
            // Si se hace clic fuera de un orbe, también se cierra el menú
            toggleTreeMenu(false);
        }
    });
}

function checkResourceClick(x, y) {
    for (let i = resources.length - 1; i >= 0; i--) {
        const r = resources[i];
        if (r.isFlying) continue;

        const dist = Math.sqrt(Math.pow(x - (r.x + r.size/2), 2) + Math.pow(y - (r.y + r.size/2), 2));
        
        if (dist < r.size) { 
            if (r.type === 'grain') {
                r.isFlying = true;
                animateResourceToBag(r);
            } else {
                specialPowerPoints = Math.min(config.specialPowerMax, specialPowerPoints + config.orbValue);
                playSound('collect', 'G5');
                updateUI();
                resources.splice(i, 1);
            }
            break;
        }
    }
}

function animateResourceToBag(resource) {
    const flyingBean = new Image();
    flyingBean.src = config.grainImage;
    flyingBean.style.position = 'absolute';
    flyingBean.style.zIndex = '999';
    flyingBean.style.width = `${resource.size}px`;
    flyingBean.style.height = `${resource.size}px`;
    flyingBean.style.pointerEvents = 'none';

    const canvasRect = canvas.getBoundingClientRect();
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

function resizeAll() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas.height > 0) cellSize = canvas.height / config.lanes;
    if (!player) player = new Player();
    else player.reset();
    if(gameState !== 'playing') draw();
}

// --- INITIALIZE EVERYTHING ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initThreeScene();
    initializeAndLoadGame();
    window.addEventListener('resize', resizeAll);
});
