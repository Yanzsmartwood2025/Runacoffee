// js/modules.js
// Este archivo importa todo desde la carpeta 'modules' y lo exporta
// para que main.js pueda acceder a todo desde un solo lugar.

export { playSound } from './modules/audio.js';
export { initializeAndLoadGame, saveGameData, getFirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut } from './modules/firebase.js';
export { initThreeScene, updateTreeAppearance, toggleTreeMenu } from './modules/scene3d.js';
export { getState, setState } from './modules/store.js';
export { updateUI, showOverlay, showWaveMessage, triggerDamageFlash, animateResourceToBag } from './modules/ui.js';
