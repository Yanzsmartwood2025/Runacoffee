// modules/scene3d.js - Lógica de la escena 3D del árbol de café

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { updateUI, playSound, gameState, previousGameState, globalAnimationTimer, orbs, base, currentLevelIndex } from '../main.js';

let treeScene, treeCamera, treeRenderer, treeModel;
let orbsGroup;
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
        document.getElementById('game-overlay').classList.add('menu-mode-bg');
        document.getElementById('top-bar').style.opacity = '0';
        document.getElementById('bottom-bar').style.opacity = '0';

        const menuCameraPosition = new THREE.Vector3(0, 1.5, 6);
        animateCamera(menuCameraPosition);

    } else {
        if (gameState !== 'menu') return;
        
        treeContainer.classList.remove('menu-view');
        document.getElementById('game-overlay').classList.remove('menu-mode-bg');
        document.getElementById('top-bar').style.opacity = '1';
        document.getElementById('bottom-bar').style.opacity = '1';
        
        const gameCameraPosition = new THREE.Vector3(0, 1.5, 9);
        animateCamera(gameCameraPosition, () => {
            if (previousGameState === 'playing') {
                gameState = 'playing';
                gameLoop();
            } else {
                gameState = 'paused';
            }
        });
    }
}

export { initThreeScene, updateTreeAppearance, updateOrbsLockState, toggleTreeMenu };

