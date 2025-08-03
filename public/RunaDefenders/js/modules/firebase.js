// modules/firebase.js - Integración con Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { init } from '../main.js';
import { config } from '../config.js';

let auth, db, userId = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';

async function initializeAndLoadGame() {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigStr);
        if (Object.keys(firebaseConfig).length === 0) {
            console.log("Firebase config not found. Starting new game.");
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
                userId = user.uid;
                const savedData = await loadGameData();
                if (savedData) {
                    init(
                        savedData.level || 0,
                        savedData.specialPower || 0,
                        savedData.coffeeBeans || 0,
                        savedData.baseHealth || config.base.health,
                        true
                    );
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

async function saveGameData() {
    if (!userId || !db) return;
    const gameDataRef = doc(db, `artifacts/${appId}/users/${userId}/runa_defenders_h`, 'progress');
    const dataToSave = {
        level: currentLevelIndex,
        specialPower: specialPowerPoints,
        coffeeBeans: coffeeBeanCount,
        baseHealth: base.health,
        timestamp: new Date()
    };
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
    } catch (error)
    {
        console.error("Error loading game:", error);
        return null;
    }
}

export { initializeAndLoadGame, saveGameData, loadGameData, auth, db, userId };

