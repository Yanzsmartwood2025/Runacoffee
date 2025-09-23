document.addEventListener('DOMContentLoaded', () => {
    const providers = [
        {
            name: 'google',
            icon: 'assets/imagenes/logo-google.png',
            ringClass: 'ring-google'
        },
        {
            name: 'facebook',
            icon: 'assets/imagenes/Facebook.png',
            ringClass: 'ring-facebook'
        },
        {
            name: 'apple',
            icon: 'assets/imagenes/Apple.png',
            ringClass: 'ring-apple'
        },
    ];

    const authButton = document.getElementById('user-profile-button');
    if (authButton) {
        const iconImg = authButton.querySelector('img');

        let currentProviderIndex = 0;
        const updateProviderIcon = () => {
            const provider = providers[currentProviderIndex];

            const baseButtonClasses = "w-10 h-10 rounded-full overflow-hidden transition-colors flex items-center justify-center";
            authButton.className = `${baseButtonClasses} ${provider.ringClass}`;

            const isGamePage = window.location.pathname.includes('RunaDefenders');
            const iconPath = (isGamePage ? '../' : '') + provider.icon;

            iconImg.src = iconPath;
            iconImg.alt = `Iniciar sesión con ${provider.name}`;

            // Reset classes before applying the correct ones
            iconImg.classList.remove('w-6', 'h-6', 'object-contain', 'zoom-fb-carousel');

            if (provider.name === 'facebook') {
                iconImg.classList.add('zoom-fb-carousel');
            } else {
                iconImg.classList.add('w-6', 'h-6', 'object-contain');
            }

            currentProviderIndex = (currentProviderIndex + 1) % providers.length;
        };

        const isLoggedIn = iconImg && !iconImg.src.includes('assets/imagenes/');
        if (!isLoggedIn) {
             updateProviderIcon();
             setInterval(updateProviderIcon, 2500);
        }
    }
});
