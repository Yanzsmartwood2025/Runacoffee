// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

    if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config not found. Auth will not work.");
        return;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // --- DOM Elements ---
    const authContainer = document.getElementById('auth-container');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalButton = document.getElementById('close-auth-modal-button');
    const googleLoginButton = document.getElementById('google-login-button-modal');
    const facebookLoginButton = document.getElementById('facebook-login-button-modal');
    const appleLoginButton = document.getElementById('apple-login-button-modal');

    // --- Firebase Auth UI Management ---
    const handleSignIn = (provider) => {
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Signed in successfully", result.user);
                if (authModal) authModal.classList.add('hidden');
            }).catch((error) => {
                console.error("Sign-in error", error);
                if (error.code === 'auth/account-exists-with-different-credential') {
                    alert('An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.');
                }
            });
    };

    let authCarouselInterval = null;

    const updateAuthUI = (user) => {
        if (!authContainer) return;

        // Clear any existing carousel interval
        if (authCarouselInterval) {
            clearInterval(authCarouselInterval);
            authCarouselInterval = null;
        }

        authContainer.innerHTML = ''; // Clear previous content

        if (user && !user.isAnonymous) {
            // User is signed in
            const fallbackImage = 'assets/imagenes/logo-google.png';
            const photoURL = user.photoURL || fallbackImage;

            const userButtonHTML = `
                <button id="user-profile-button" class="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[var(--runa-primary)] transition-colors flex items-center justify-center ${user.photoURL ? '' : 'bg-white p-1'}" title="Cerrar sesión: ${user.displayName || 'Usuario'}">
                    <img id="user-profile-picture" src="${photoURL}" alt="${user.displayName || 'Usuario'}" class="w-full h-full ${user.photoURL ? 'object-cover' : 'object-contain'}" onerror="this.onerror=null;this.src='${fallbackImage}';">
                </button>
            `;
            authContainer.insertAdjacentHTML('beforeend', userButtonHTML);

            const userProfileButton = document.getElementById('user-profile-button');
            if (userProfileButton) {
                userProfileButton.addEventListener('click', () => {
                    signOut(auth).catch(error => console.error("Sign out error", error));
                });
            }

        } else {
            // User is signed out or anonymous, setup carousel
            const providers = [
                { name: 'Google', icon: 'assets/imagenes/logo-google.png', ringClass: 'google-ring' },
                { name: 'Facebook', icon: 'assets/imagenes/Facebook.png', ringClass: 'facebook-ring' },
                { name: 'Apple', icon: 'assets/imagenes/Apple.png', ringClass: 'apple-ring' }
            ];
            let currentProviderIndex = 0;

            const loginButtonHTML = `
                 <button id="user-profile-button" class="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent transition-colors flex items-center justify-center bg-white">
                    <div class="auth-ring"></div>
                    <img id="user-profile-picture" src="${providers[0].icon}" alt="Iniciar sesión con ${providers[0].name}" class="w-6 h-6 object-contain">
                </button>
            `;
            authContainer.insertAdjacentHTML('beforeend', loginButtonHTML);

            const userProfileButton = document.getElementById('user-profile-button');
            const userProfilePicture = document.getElementById('user-profile-picture');
            const authRing = userProfileButton.querySelector('.auth-ring');

            const updateCarousel = () => {
                currentProviderIndex = (currentProviderIndex + 1) % providers.length;
                const provider = providers[currentProviderIndex];

                userProfilePicture.src = provider.icon;
                userProfilePicture.alt = `Iniciar sesión con ${provider.name}`;

                authRing.className = 'auth-ring'; // Reset classes
                authRing.classList.add(provider.ringClass);
            };

            // Set initial state
            authRing.classList.add(providers[0].ringClass);

            // Start carousel
            authCarouselInterval = setInterval(updateCarousel, 5000);

            if (userProfileButton) {
                 userProfileButton.addEventListener('click', () => {
                    if (authModal) authModal.classList.remove('hidden');
                });
            }
        }
    };

    // Attach listener to auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User state changed:", user.uid, "Anonymous:", user.isAnonymous);
        } else {
            console.log("No user signed in. Attempting anonymous sign-in.");
            signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
        }
        updateAuthUI(user);

        if (window.updateUIAfterLogin && user && !user.isAnonymous) {
            window.updateUIAfterLogin(user);
        } else if (window.updateUIAfterLogout && (!user || user.isAnonymous)) {
            window.updateUIAfterLogout();
        }
    });

    // --- Modal and Button Event Listeners ---
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', () => handleSignIn(new GoogleAuthProvider()));
    }
    if (facebookLoginButton) {
        facebookLoginButton.addEventListener('click', () => handleSignIn(new FacebookAuthProvider()));
    }
    if (appleLoginButton) {
        appleLoginButton.addEventListener('click', () => handleSignIn(new OAuthProvider('apple.com')));
    }

    if (closeAuthModalButton) {
        closeAuthModalButton.addEventListener('click', () => authModal.classList.add('hidden'));
    }

    if (authModal) {
        authModal.addEventListener('click', (event) => {
            if (event.target === authModal) {
                authModal.classList.add('hidden');
            }
        });
    }
});
