document.addEventListener('DOMContentLoaded', () => {
    const providers = [
    {
        name: 'google',
        icon: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/imagenes/logo-google.png',
    },
    {
        name: 'facebook',
        icon: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/imagenes/Facebook.png',
    },
    {
        name: 'apple',
        icon: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/assets/imagenes/Apple.png',
    },
    ];

    const authButton = document.getElementById('user-profile-button');
    if (authButton) {
        const iconImg = authButton.querySelector('img');
        // Creamos el elemento del aro una sola vez
        const ring = document.createElement('div');
        // Lo insertamos antes de la imagen para que quede detrás (por el z-index)
        authButton.insertBefore(ring, iconImg);

        let currentProviderIndex = 0;
        const updateProviderIcon = () => {
            const provider = providers[currentProviderIndex];

            // Simplemente actualizamos la clase del aro en cada cambio
            ring.className = `auth-icon-ring ring-${provider.name}`;

            iconImg.src = provider.icon;
            iconImg.alt = `Iniciar sesión con ${provider.name}`;

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
             setInterval(updateProviderIcon, 3000);
        }
    }
});
