/*
* =================================================================
* ARCHIVO: RunaDefenders/js/modules/scene3d.js
* =================================================================
* Propósito: Encapsula toda la lógica de Three.js para renderizar
* y gestionar la escena del Árbol Runa.
*/

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Variables para la escena 3D
let treeScene, treeCamera, treeRenderer, treeModel;
let powerOrbsGroup, powerOrbs = [], powerSelectButton;
let isRotationPaused = false;
const healthyColor = new THREE.Color(0xffffff);
const damagedColor = new THREE.Color(0xff0000);

// Inicializa toda la escena 3D
export function initThreeScene(treeCanvasContainer) {
    treeScene = new THREE.Scene();

    const { width, height } = treeCanvasContainer.getBoundingClientRect();
    treeCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    treeCamera.position.set(0, 1.2, 7);
    treeCamera.lookAt(0, 0.8, 0);

    treeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    treeRenderer.setClearColor(0x000000, 0);
    treeRenderer.setSize(width, height);
    treeRenderer.setPixelRatio(window.devicePixelRatio);
    treeRenderer.outputColorSpace = THREE.SRGBColorSpace;
    treeCanvasContainer.appendChild(treeRenderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    treeScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    treeScene.add(directionalLight);

    // Cargar modelo del árbol
    const loader = new GLTFLoader();
    loader.load(
        '../assets/3D/arbol_runa.glb', // RUTA CORREGIDA: Apunta a la carpeta de assets compartidos
        (gltf) => {
            treeModel = gltf.scene;
            const box = new THREE.Box3().setFromObject(treeModel);
            treeModel.position.y -= box.min.y;
            treeModel.scale.set(1.6, 1.6, 1.6);
            treeScene.add(treeModel);
        },
        undefined,
        (error) => console.error('Error loading tree model:', error)
    );

    // Bucle de animación
    function animateTree() {
        requestAnimationFrame(animateTree);
        if (treeModel && !isRotationPaused) {
            treeModel.rotation.y += 0.005;
        }
        treeRenderer.render(treeScene, treeCamera);
    }
    animateTree();

    // Observador para redimensionar
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

// Actualiza la apariencia del árbol según su vida
export function updateTreeAppearance(base, treeHealthBar) {
    if (!base || !treeModel) return;
    const healthPercent = Math.max(0, base.health / base.maxHealth);

    if (treeHealthBar) {
        treeHealthBar.style.height = `${healthPercent * 100}%`;
    }

    treeModel.traverse((node) => {
        if (node.isMesh && node.material) {
            if (!node.material.originalColor) {
                node.material.originalColor = node.material.color.clone();
            }
            node.material.color.copy(node.material.originalColor).lerp(damagedColor, 1 - healthPercent);
        }
    });
}

// Lógica para los orbes de poder (aún no implementada, pero el espacio está aquí)
export function updatePowerOrbsVisuals(unlockedPowers) {
    // Aquí irá la lógica para mostrar los orbes desbloqueados
}

