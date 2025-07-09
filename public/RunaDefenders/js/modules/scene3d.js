/*
* =================================================================
* ARCHIVO: js/modules/scene3d.js
* =================================================================
* Propósito: Maneja toda la lógica de la escena 3D del árbol
* usando Three.js.
*/

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let treeScene, treeCamera, treeRenderer, treeModel;
const damagedColor = new THREE.Color(0xff0000);

export function initThreeScene(container) {
    treeScene = new THREE.Scene();

    const { width, height } = container.getBoundingClientRect();
    treeCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    treeCamera.position.set(0, 1.2, 7);
    treeCamera.lookAt(0, 0.8, 0);

    treeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    treeRenderer.setClearColor(0x000000, 0);
    treeRenderer.setSize(width, height);
    treeRenderer.setPixelRatio(window.devicePixelRatio);
    treeRenderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(treeRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    treeScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    treeScene.add(directionalLight);
    
    const loader = new GLTFLoader();
    
    // --- RUTA DEL MODELO 3D ACTUALIZADA A LA URL RAW DE GITHUB ---
    const modelUrl = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/776b9c0c5a976bff5e8077da365a60a5e5c3e616/public/assets%20/3D/arbol_final.glb';

    loader.load(modelUrl, (gltf) => {
        treeModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(treeModel);
        const center = box.getCenter(new THREE.Vector3());
        treeModel.position.y -= box.min.y;
        treeModel.position.add(center.multiplyScalar(-1));
        
        treeModel.scale.set(1.6, 1.6, 1.6);
        treeScene.add(treeModel);
    }, undefined, (error) => {
        console.error("No se pudo cargar el modelo 3D desde la URL:", error);
    });

    function animateTree() {
        requestAnimationFrame(animateTree);
        treeRenderer.render(treeScene, treeCamera);
    }
    animateTree();
    
    const resizeObserver = new ResizeObserver(() => {
        const { width, height } = container.getBoundingClientRect();
        if (width > 0 && height > 0) {
            treeCamera.aspect = width / height;
            treeCamera.updateProjectionMatrix();
            treeRenderer.setSize(width, height);
        }
    });
    resizeObserver.observe(container);
}

export function updateTreeAppearance(base, healthBarElement) {
    if (!base || !treeModel) return;
    const healthPercent = Math.max(0, base.health / base.maxHealth);
    
    if (healthBarElement) {
        healthBarElement.style.height = `${healthPercent * 100}%`;
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
