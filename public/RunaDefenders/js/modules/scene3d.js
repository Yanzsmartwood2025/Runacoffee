// modules/scene3d.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getState, setState, getGlobalAnimationTimer } from '../main.js';
import { gameLoop } from '../systems.js';

let treeScene, treeCamera, treeRenderer, treeModel;
const treeContainer = document.getElementById('tree-container');
const treeCanvasContainer = document.getElementById('tree-canvas-container');
const gameOverlay = document.getElementById('game-overlay');
const damagedColor = new THREE.Color(0xff0000);

export function initThreeScene() {
    treeScene = new THREE.Scene();
    const { width, height } = treeCanvasContainer.getBoundingClientRect();
    treeCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    treeCamera.position.set(0, 1.5, 9);
    treeCamera.lookAt(0, 1, 0);

    treeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
        treeModel.scale.set(1.9, 1.9, 1.9);
        treeScene.add(treeModel);
        updateTreeAppearance();
    }, undefined, (error) => console.error('Error loading tree model:', error));

    function animateTree() {
        requestAnimationFrame(animateTree);
        if (treeRenderer) treeRenderer.render(treeScene, treeCamera);
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

export function updateTreeAppearance() {
    const state = getState();
    if (!state.base || !treeModel) return;
    const healthPercent = Math.max(0, state.base.health / state.base.maxHealth);
    document.getElementById('tree-health-bar').style.height = `${healthPercent * 100}%`;
    treeModel.traverse((node) => {
        if (node.isMesh && node.material) {
            if (!node.material.originalColor) node.material.originalColor = node.material.color.clone();
            node.material.color.copy(node.material.originalColor).lerp(damagedColor, 1 - healthPercent);
        }
    });
}

export function toggleTreeMenu(show) {
    const state = getState();
    if (show) {
        if (state.gameState !== 'playing' && state.gameState !== 'paused') return;
        setState('menu', state.gameState);
        treeContainer.classList.add('menu-view');
        gameOverlay.classList.add('menu-mode-bg');
    } else {
        if (state.gameState !== 'menu') return;
        treeContainer.classList.remove('menu-view');
        gameOverlay.classList.remove('menu-mode-bg');
        const previousState = state.previousGameState;
        setState(previousState);
        if (previousState === 'playing') {
            gameLoop();
        }
    }
}
