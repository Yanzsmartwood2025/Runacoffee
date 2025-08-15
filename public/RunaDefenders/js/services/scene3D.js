
// js/services/scene3D.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getGameState, setGameState, getPreviousGameState } from '../core/gameLogic.js';
import { playSound } from './audio.js';

// --- Variables de la Escena 3D ---
let scene, camera, renderer, model;
let orbsGroup, orbs = [];
let raycaster, pointer;
let globalAnimationTimer = 0; // Temporizador local para la animación 3D

// --- Referencias al DOM ---
const treeCanvasContainer = document.getElementById('tree-canvas-container');
const treeHealthBar = document.getElementById('tree-health-bar');
const gameOverlay = document.getElementById('game-overlay');

// --- Colores ---
const healthyColor = new THREE.Color(0xffffff);
const damagedColor = new THREE.Color(0xff0000);
const lockedOrbColor = new THREE.Color(0x333333);
const unlockedOrbColor = new THREE.Color(0xffffff);

/**
 * Inicializa la escena 3D, cámara, luces y carga los modelos y texturas.
 */
export function initThreeScene() {
    scene = new THREE.Scene();

    // --- Cámara ---
    const { width, height } = treeCanvasContainer.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 9);
    camera.lookAt(0, 1, 0);

    // --- Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Fondo transparente
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    treeCanvasContainer.appendChild(renderer.domElement);

    // --- Luces ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Carga del Modelo del Árbol ---
    const loader = new GLTFLoader();
    loader.load('https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/776b9c0c5a976bff5e8077da365a60a5e5c3e616/public/assets%20/3D/arbol_final.glb', (gltf) => {
        model = gltf.scene;
        model.position.y = -1; // Ajuste manual para la posición
        model.scale.set(1.9, 1.9, 1.9);
        scene.add(model);
    }, undefined, (error) => console.error('Error loading tree model:', error));

    // --- Creación de los Orbes ---
    createOrbs();

    // --- Raycaster para Interacción ---
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // --- Iniciar Bucle de Animación y Listeners ---
    animate();
    setupResizeListener();
}

/**
 * Crea y posiciona los 7 orbes de poder alrededor del árbol.
 */
function createOrbs() {
    orbsGroup = new THREE.Group();
    scene.add(orbsGroup);

    const gifUrls = [ 'birds.gif', 'fire.gif', 'music.gif', 'rain.gif', 'river.gif', 'storm.gif', 'wind.gif' ];
    const basePath = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/gif/';
    const orbGeometry = new THREE.SphereGeometry(0.45, 32, 32);
    const textureLoader = new THREE.TextureLoader();

    for (let i = 0; i < 7; i++) {
        const texture = textureLoader.load(basePath + gifUrls[i]);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            color: lockedOrbColor
        });
        const orb = new THREE.Mesh(orbGeometry, material);
        orb.userData = { index: i, unlocked: false, name: `Poder ${i + 1}` };
        
        const angle = (i / 7) * Math.PI * 2;
        const radius = 2.5;
        orb.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
        
        // Propiedades para la animación de "flote"
        orb.bobSpeed = 2 + Math.random() * 3;
        orb.bobOffset = Math.random() * Math.PI * 2;

        orbsGroup.add(orb);
        orbs.push(orb);
    }
}

/**
 * El bucle de animación para la escena 3D.
 */
function animate() {
    requestAnimationFrame(animate);
    globalAnimationTimer += 0.02;

    // Animación de rotación y flote de los orbes
    if (orbsGroup) {
        orbsGroup.rotation.y += 0.005;
        orbs.forEach(orb => {
            orb.position.y = 1.5 + Math.sin(globalAnimationTimer * orb.bobSpeed + orb.bobOffset) * 0.3;
            orb.lookAt(camera.position);
        });
    }

    if (renderer) {
        renderer.render(scene, camera);
    }
}

/**
 * Actualiza la apariencia del árbol (color y barra de vida) según su salud.
 * @param {object} base - El objeto de la base con su salud actual y máxima.
 */
export function updateTreeAppearance(base) {
    if (!model || !base) return;
    const healthPercent = Math.max(0, base.health / base.maxHealth);

    if (treeHealthBar) treeHealthBar.style.height = `${healthPercent * 100}%`;

    model.traverse((node) => {
        if (node.isMesh && node.material) {
            if (!node.material.originalColor) {
                node.material.originalColor = node.material.color.clone();
            }
            node.material.color.copy(node.material.originalColor).lerp(damagedColor, 1 - healthPercent);
        }
    });
}

/**
 * Actualiza el estado visual (bloqueado/desbloqueado) de los orbes.
 * @param {number} currentLevelIndex - El nivel actual del jugador.
 */
export function updateOrbsLockState(currentLevelIndex) {
    const unlockedCount = currentLevelIndex + 1;
    orbs.forEach((orb, i) => {
        const isUnlocked = i < unlockedCount;
        orb.userData.unlocked = isUnlocked;
        orb.material.color.set(isUnlocked ? unlockedOrbColor : lockedOrbColor);
    });
}

/**
 * Muestra u oculta el menú del árbol con una animación de cámara.
 * @param {boolean} show - True para mostrar, false para ocultar.
 * @param {Function} [gameLoopCallback] - El callback para reanudar el game loop.
 */
export function toggleTreeMenu(show, gameLoopCallback) {
    const currentState = getGameState();
    if (show) {
        if (currentState !== 'playing' && currentState !== 'paused') return;
        setPreviousGameState(currentState);
        setGameState('menu');
        
        document.getElementById('tree-container').classList.add('menu-view');
        gameOverlay.classList.add('menu-mode-bg');
        
        animateCamera(new THREE.Vector3(0, 1.5, 6));
    } else {
        if (currentState !== 'menu') return;
        
        document.getElementById('tree-container').classList.remove('menu-view');
        gameOverlay.classList.remove('menu-mode-bg');
        
        animateCamera(new THREE.Vector3(0, 1.5, 9), () => {
            const previousState = getPreviousGameState();
            setGameState(previousState);
            if (previousState === 'playing' && gameLoopCallback) {
                requestAnimationFrame(gameLoopCallback);
            }
        });
    }
}


/**
 * Anima suavemente la cámara a una nueva posición.
 */
function animateCamera(targetPosition, onComplete) {
    const startPosition = camera.position.clone();
    const duration = 800;
    let startTime = null;

    function loop(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);

        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        if (progress < 1) {
            requestAnimationFrame(loop);
        } else {
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(loop);
}

/**
 * Configura el listener para reajustar el tamaño del renderer cuando cambia el tamaño del contenedor.
 */
function setupResizeListener() {
    const resizeObserver = new ResizeObserver(() => {
        const { width, height } = treeCanvasContainer.getBoundingClientRect();
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    });
    resizeObserver.observe(treeCanvasContainer);
}
