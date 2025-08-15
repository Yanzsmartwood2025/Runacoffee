// js/services/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { updateAuthUI } from "../ui/uiManager.js";
import { config } from "../config.js";

// --- Variables Globales de Firebase ---
let auth, db, userId = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';

/**
 * Inicializa Firebase y gestiona el estado de autenticación del usuario.
 * @param {Function} onDataLoaded - Callback que se ejecuta con los datos del juego cargados o con datos por defecto.
 */
export function initializeAndLoadGame(onDataLoaded) {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        if (Object.keys(firebaseConfig).length === 0) {
            console.warn("Firebase config not found. Starting a new local game.");
            updateAuthUI(null);
            onDataLoaded(0, 0, 0, config.base.health, true); // Carga un juego nuevo
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
                    onDataLoaded(savedData.level, savedData.specialPower, savedData.coffeeBeans, savedData.baseHealth, true);
                } else {
                    onDataLoaded(0, 0, 0, config.base.health, true); // Nuevo jugador, sin datos guardados
                }
            } else {
                // Si no hay usuario, inicia sesión anónimamente para poder guardar progreso localmente si se quisiera
                signInAnonymously(auth).catch(error => {
                    console.error("Anonymous sign-in failed:", error);
                    onDataLoaded(0, 0, 0, config.base.health, true);
                });
            }
        });

    } catch (e) {
        console.error("Firebase initialization failed:", e);
        updateAuthUI(null);
        onDataLoaded(0, 0, 0, config.base.health, true);
    }
}

/**
 * Guarda los datos del progreso del juego en Firestore.
 * @param {object} gameData - Objeto con los datos a guardar (level, specialPower, etc.).
 */
export async function saveGameData(gameData) {
    if (!userId || !db) {
        console.log("Cannot save game: User not logged in or DB not initialized.");
        return;
    }
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    const dataToSave = { ...gameData, timestamp: new Date() };
    try {
        await setDoc(gameDataRef, dataToSave, { merge: true });
        console.log("Game data saved successfully.");
    } catch (error) {
        console.error("Error saving game:", error);
    }
}

/**
 * Carga los datos del juego desde Firestore.
 * @returns {object|null} - Los datos del juego o null si no existen.
 */
async function loadGameData() {
    if (!userId || !db) return null;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    try {
        const docSnap = await getDoc(gameDataRef);
        if (docSnap.exists()) {
            console.log("Game data loaded:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("No saved game data found for this user.");
            return null;
        }
    } catch (error) {
        console.error("Error loading game:", error);
        return null;
    }
}

/**
 * Inicia el proceso de inicio de sesión con Google.
 */
export function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

/**
 * Cierra la sesión del usuario actual.
 */
export function signOutUser() {
    return signOut(auth);
}
