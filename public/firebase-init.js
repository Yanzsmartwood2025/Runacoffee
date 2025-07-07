/**
 * firebase-init.js
 * -----------------
 * Este es el único archivo encargado de inicializar Firebase para todo el sitio web.
 * Se conecta a Firebase y exporta las herramientas necesarias (auth, db)
 * para que cualquier otra página o script pueda usarlas.
 */

// Paso 1: Importar las funciones que necesitamos de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Paso 2: Obtener la configuración de Firebase
// Este código busca las variables de configuración que se proporcionan en el entorno.
// Es importante que estas variables (__firebase_config) estén disponibles en tus páginas.
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
const firebaseConfig = JSON.parse(firebaseConfigStr);

// Paso 3: Declarar las variables que vamos a compartir
let app, auth, db;

// Paso 4: Inicializar Firebase solo si la configuración es válida
if (Object.keys(firebaseConfig).length > 0) {
    // Inicializa los servicios de Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase inicializado correctamente desde el archivo central.");

    // Escuchador para saber si el usuario ya inició sesión
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // El usuario ya tiene una sesión (anónima o real)
            console.log("Usuario detectado:", user.uid);
        } else {
            // No hay usuario, intentamos iniciar sesión de forma anónima
            console.log("Ningún usuario detectado, iniciando sesión anónima...");
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (initialAuthToken) {
                 signInWithCustomToken(auth, initialAuthToken).catch(error => console.error("Error con token personalizado:", error));
            } else {
                 signInAnonymously(auth).catch(error => console.error("Error en inicio de sesión anónimo:", error));
            }
        }
    });

} else {
    console.error("❌ Error: La configuración de Firebase no fue encontrada. La base de datos no funcionará.");
}

// Paso 5: Exportar las herramientas de Firebase para que otros scripts las puedan usar
// Esto es lo que permite que tus otras páginas accedan a la misma conexión.
export { app, auth, db };
