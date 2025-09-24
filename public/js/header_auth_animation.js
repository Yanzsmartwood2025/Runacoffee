// Define a global object to hold the auth animation logic
window.authAnimation = {
    providers: [
        { name: 'google', icon: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/imagenes/logo-google.png' },
        { name: 'facebook', icon: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/imagenes/Facebook.png' },
        { name: 'apple', icon: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/imagenes/Apple.png' }
    ],
    carouselInterval: null,
    currentProviderIndex: 0,
    authButton: null,
    iconImg: null,
    ring: null,

    init: function() {
        this.authButton = document.getElementById('user-profile-button');
        if (!this.authButton) return;

        this.iconImg = this.authButton.querySelector('img');
        this.ring = document.createElement('div');
        this.authButton.insertBefore(this.ring, this.iconImg);

        // The script now waits for an explicit call to start the carousel,
        // which will be done from the main page script based on auth state.
    },

    updateProviderIcon: function() {
        const provider = this.providers[this.currentProviderIndex];

        this.ring.className = `auth-icon-ring ring-${provider.name}`;
        this.iconImg.src = provider.icon;
        this.iconImg.alt = `Iniciar sesión con ${provider.name}`;

        this.iconImg.classList.remove('w-full', 'h-full', 'object-cover', 'zoom-fb-carousel');
        this.iconImg.classList.add('w-6', 'h-6', 'object-contain');


        if (provider.name === 'facebook') {
            this.iconImg.classList.add('zoom-fb-carousel');
        } else {
            // Ensure non-facebook icons are standard size
            this.iconImg.classList.add('w-6', 'h-6', 'object-contain');
        }

        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    },

    startLoginCarousel: function() {
        if (!this.authButton) return;
        // Clear any existing interval to prevent duplicates
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        // Run it once immediately to set the first icon
        this.updateProviderIcon();
        // Then set it to run every 3 seconds
        this.carouselInterval = setInterval(() => this.updateProviderIcon(), 3000);
    },

    stopLoginCarousel: function(providerName) {
        if (!this.authButton) return;
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
            this.carouselInterval = null;
        }

        const provider = this.providers.find(p => p.name === providerName);
        if (provider) {
            this.ring.className = `auth-icon-ring ring-${provider.name}`;
        } else {
            // If provider is not found or is null, hide the ring.
            this.ring.className = '';
        }
    }
};

// Initialize the animation object once the DOM is loaded.
// It will set up the elements but won't start the animation yet.
document.addEventListener('DOMContentLoaded', () => {
    window.authAnimation.init();
});
