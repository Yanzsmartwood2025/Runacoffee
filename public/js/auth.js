// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const authModal = document.getElementById('auth-modal');
    const userProfileButton = document.getElementById('user-profile-button');
    const userProfilePicture = document.getElementById('user-profile-picture');
    const closeAuthModalButton = document.getElementById('close-auth-modal-button');
    const googleLoginButton = document.getElementById('google-login-button-modal');
    const facebookLoginButton = document.getElementById('facebook-login-button-modal');
    const appleLoginButton = document.getElementById('apple-login-button-modal');

    // --- Firebase Initialization ---
    // These variables are expected to be provided by the environment.
    const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
    const firebaseConfig = JSON.parse(firebaseConfigStr);

    if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey) {
        console.error("Firebase config not found or is invalid. Auth features will be disabled.");
        return;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // --- Auth Providers ---
    const googleProvider = new GoogleAuthProvider();
    const facebookProvider = new FacebookAuthProvider();
    const appleProvider = new OAuthProvider('apple.com');

    // --- Carousel Logic ---
    let carouselInterval = null;
    const loginProviders = [
        {
            name: 'Google',
            iconSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png',
            ringClass: 'ring-google'
        },
        {
            name: 'Facebook',
            iconSrc: '/assets/imagenes/Facebook.png', // Root-relative path
            ringClass: 'ring-facebook'
        },
        {
            name: 'Apple',
            iconSrc: '/assets/imagenes/Apple.png', // Root-relative path
            ringClass: 'ring-apple'
        }
    ];
    let currentProviderIndex = 0;

    function startLoginCarousel() {
        if (carouselInterval) clearInterval(carouselInterval);

        const updateCarousel = () => {
            const provider = loginProviders[currentProviderIndex];
            userProfilePicture.src = provider.iconSrc;
            userProfilePicture.alt = `Iniciar sesión con ${provider.name}`;

            // Reset ring classes
            userProfileButton.classList.remove('ring-google', 'ring-facebook', 'ring-apple');
            // Add the new ring class after a short delay to ensure removal is processed
            setTimeout(() => userProfileButton.classList.add(provider.ringClass), 10);

            currentProviderIndex = (currentProviderIndex + 1) % loginProviders.length;
        };

        updateCarousel(); // Initial update
        carouselInterval = setInterval(updateCarousel, 5000);
    }

    function stopLoginCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
        userProfileButton.classList.remove('ring-google', 'ring-facebook', 'ring-apple');
    }


    // --- UI Update Functions ---
    const updateUIAfterLogin = (user) => {
        stopLoginCarousel();
        userProfilePicture.src = user.photoURL;
        userProfilePicture.alt = user.displayName || 'Foto de perfil';
        // Adjust classes for a logged-in user's profile picture
        userProfilePicture.classList.remove('w-6', 'h-6', 'object-contain');
        userProfilePicture.classList.add('w-full', 'h-full', 'object-cover');
        userProfileButton.classList.remove('bg-white'); // Remove white background
        userProfileButton.setAttribute('aria-label', `Menú de ${user.displayName}`);
        closeModal();
    };

    const updateUIAfterLogout = () => {
        // Restore classes for the logged-out state icon container
        userProfilePicture.classList.add('w-6', 'h-6', 'object-contain');
        userProfilePicture.classList.remove('w-full', 'h-full', 'object-cover');
        userProfileButton.classList.add('bg-white');
        userProfileButton.setAttribute('aria-label', 'Iniciar sesión');
        startLoginCarousel();
    };

    // --- Firebase Auth State Change Handler ---
    onAuthStateChanged(auth, async (user) => {
        if (user && !user.isAnonymous) {
            console.log('User is signed in:', user);
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: new Date()
            }, { merge: true });
            updateUIAfterLogin(user);
        } else {
            console.log('User is signed out or anonymous.');
            updateUIAfterLogout();
            if (!auth.currentUser) {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
            }
        }
    });

    // --- Modal Handling ---
    const openModal = () => authModal?.classList.remove('hidden');
    const closeModal = () => authModal?.classList.add('hidden');

    // --- Event Listeners ---
    userProfileButton?.addEventListener('click', () => {
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
            signOut(auth).catch(error => console.error('Sign out error', error));
        } else {
            openModal();
        }
    });

    closeAuthModalButton?.addEventListener('click', closeModal);
    authModal?.addEventListener('click', (event) => {
        if (event.target === authModal) closeModal();
    });

    const handleSignIn = (provider) => {
        signInWithPopup(auth, provider)
            .catch((error) => {
                console.error(`Sign-in error with ${provider.providerId}:`, error);
                // Handle specific errors like account existing with different credential
                if (error.code === 'auth/account-exists-with-different-credential') {
                    alert('Ya existe una cuenta con esta dirección de correo electrónico pero con un método de inicio de sesión diferente. Intenta iniciar sesión con el método original.');
                }
            });
    };

    googleLoginButton?.addEventListener('click', () => handleSignIn(googleProvider));
    facebookLoginButton?.addEventListener('click', () => handleSignIn(facebookProvider));
    appleLoginButton?.addEventListener('click', () => handleSignIn(appleProvider));
});
