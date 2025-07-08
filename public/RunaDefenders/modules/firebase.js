/*
* =================================================================
* ARCHIVO: RunaDefenders/js/modules/firebase.js
* =================================================================
* Propósito: Gestiona toda la interacción con Firebase, incluyendo
* autenticación y guardado/carga de datos en Firestore.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let auth, db, userId;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Inicializa Firebase y configura el listener de autenticación
export function initializeFirebase(onDataLoaded, onNoData) {
    const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
    try {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        if (Object.keys(firebaseConfig).length === 0) {
            console.log("Firebase config not found. Starting new game.");
            onNoData(); // Llama a la función para iniciar un juego nuevo
            return;
        }

        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, async (user) => {
            // Lógica para actualizar la UI de autenticación (la moveremos a ui.js)
            updateAuthUI(user); 

            if (user) {
                userId = user.uid;
                const savedData = await loadGameData();
                onDataLoaded(savedData); // Llama a la función con los datos cargados
            } else {
                signInAnonymously(auth).catch(error => {
                    console.error("Anonymous sign-in failed:", error);
                    onNoData();
                });
            }
        });

    } catch (e) {
        console.error("Firebase initialization failed:", e);
        onNoData();
    }
}

// Guarda los datos del juego en Firestore
export async function saveGameData(gameData) {
    if (!userId || !db) return;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    const dataToSave = { ...gameData, timestamp: new Date() };
    try {
        await setDoc(gameDataRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving game:", error);
    }
}

// Carga los datos del juego desde Firestore
async function loadGameData() {
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

// Lógica de autenticación con Google
export function handleGoogleLogin() {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .catch(error => console.error("Google Sign-In Error:", error));
}

export function handleSignOut() {
    if (auth) {
        signOut(auth).catch(error => console.error("Sign out error", error));
    }
}

// Función temporal para actualizar la UI (se moverá a ui.js)
function updateAuthUI(user) {
    // ... aquí iría la lógica para mostrar el botón de login o la foto del usuario
}

