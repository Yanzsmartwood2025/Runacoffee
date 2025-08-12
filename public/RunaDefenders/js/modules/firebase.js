// modules/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { config } from '../config.js';
import { init, getState, setUserId } from '../main.js';

let auth, db;
const authContainer = document.getElementById('auth-container');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';

export function getFirebaseAuth() { return auth; }

export async function initializeAndLoadGame() {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        if (Object.keys(firebaseConfig).length === 0) {
            console.warn("Firebase config not found. Starting new game.");
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
                setUserId(user.uid);
                const savedData = await loadGameData(user.uid);
                if (savedData) {
                    init(savedData.level, savedData.specialPower, savedData.coffeeBeans, savedData.baseHealth, true);
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
        const photoURL = user.photoURL || 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png';
        authContainer.innerHTML = `<button id="logout-btn" title="Cerrar sesión de ${user.displayName || 'Usuario'}"><img src="${photoURL}" alt="Foto de Usuario" style="object-fit: cover; background-color: white;" onerror="this.src='https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png';"></button>`;
    } else {
        authContainer.innerHTML = `<button id="open-login-modal-btn" title="Iniciar Sesión"><img src="https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png" alt="Iniciar Sesión con Google"></button>`;
    }
}

export async function saveGameData() {
    const state = getState();
    if (!state.userId || !db) return;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${state.userId}/runa_defenders_h`, 'progress');
    const dataToSave = {
        level: state.currentLevelIndex,
        specialPower: state.specialPowerPoints,
        coffeeBeans: state.coffeeBeanCount,
        baseHealth: state.base.health,
        timestamp: new Date()
    };
    try {
        await setDoc(gameDataRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving game:", error);
    }
}

async function loadGameData(userId) {
    if (!userId || !db) return null;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    try {
        const docSnap = await getDoc(gameDataRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error loading game:", error);
        return null;
    }
}
