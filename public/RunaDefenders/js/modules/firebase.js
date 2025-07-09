/*
* =================================================================
* ARCHIVO: js/modules/firebase.js
* =================================================================
* Propósito: Centraliza toda la comunicación con Firebase:
* autenticación, guardado y carga de datos.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let auth, db, userId = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export function initializeFirebase(onLoadSuccess, onLoadError, onAuthChange) {
    const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
    try {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        if (Object.keys(firebaseConfig).length === 0) {
            console.log("Firebase config not found. Starting new game.");
            onLoadError();
            return;
        }

        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, async (user) => {
            onAuthChange(user); // Actualiza la UI de autenticación
            if (user) {
                userId = user.uid;
                const savedData = await loadGameData();
                onLoadSuccess(savedData);
            } else {
                signInAnonymously(auth).catch(onLoadError);
            }
        });
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        onLoadError();
    }
}

export async function saveGameData(data) {
    if (!userId || !db) return;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    const dataToSave = { ...data, timestamp: new Date() };
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
    } catch (error) {
        console.error("Error loading game:", error);
        return null;
    }
}

export function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(error => console.error("Google Sign-In Error:", error));
}

export function handleSignOut() {
    signOut(auth).catch(error => console.error("Sign out error", error));
}
