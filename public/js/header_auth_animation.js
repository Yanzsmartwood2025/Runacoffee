document.addEventListener('DOMContentLoaded', () => {
  // Configuration for the providers
  const providers = [
    {
      name: 'google',
      icon: 'assets/imagenes/logo-google.png',
      ringClass: 'ring-google',
    },
    {
      name: 'facebook',
      icon: 'assets/imagenes/Facebook.png',
      ringClass: 'ring-facebook',
    },
    {
      name: 'apple',
      icon: 'assets/imagenes/Apple.png',
      ringClass: 'ring-apple',
    },
  ];

  // --- Function to find the authentication container and button ---
  // This needs to be robust to work across all three pages.
  const getAuthElements = () => {
    // For index.html
    let authContainer = document.getElementById('auth-container');
    if (authContainer) {
      // The button might be directly inside or nested in another div after login
      let authButton = authContainer.querySelector('button');
      if (authButton) {
        return { container: authContainer, button: authButton };
      }
    }
    return null;
  };

  const authElements = getAuthElements();
  // If we can't find the auth elements, we can't do anything.
  if (!authElements) {
    // console.log('Auth container or button not found. Carousel will not start.');
    return;
  }

  const { button } = authElements;
  let iconImg = button.querySelector('img');

  // Create the ring element once and add it to the button
  const ring = document.createElement('div');
  ring.className = 'auth-icon-ring';
  button.insertBefore(ring, iconImg); // Insert ring before the image

  let currentProviderIndex = 0;
  let intervalId = null;

  const updateProviderIcon = () => {
    const provider = providers[currentProviderIndex];

    // Update image source
    // The game page (RunaDefenders) is in a subdirectory, so paths need adjustment.
    const isGamePage = window.location.pathname.includes('RunaDefenders');
    iconImg.src = (isGamePage ? '../' : '') + provider.icon;

    // Add a specific class for the Facebook icon to apply zoom
    if (provider.name === 'facebook') {
      iconImg.classList.add('facebook-icon-zoom');
    } else {
      iconImg.classList.remove('facebook-icon-zoom');
    }

    // Update alt text
    iconImg.alt = `Iniciar sesión con ${provider.name}`;

    // Update ring class
    ring.className = 'auth-icon-ring'; // Reset classes
    ring.classList.add(provider.ringClass);

    // Move to the next provider
    currentProviderIndex = (currentProviderIndex + 1) % providers.length;
  };

  const startCarousel = () => {
    if (intervalId) clearInterval(intervalId);
    // Check if the user is logged in. We'll approximate this by checking the image src.
    // A logged-in user will likely have a photoURL from their profile, not a local asset.
    const isLoggedIn = iconImg && !iconImg.src.includes('assets/imagenes/');

    if (!isLoggedIn) {
        updateProviderIcon(); // Show the first one immediately
        intervalId = setInterval(updateProviderIcon, 5000);
    }
  };

  // This is a failsafe. The core logic in each page should handle showing/hiding
  // the login button vs the user profile. But if this script runs, we want to
  // make sure we respect the logged-in state.
  const observer = new MutationObserver((mutations) => {
    // When the content of the auth-container changes (e.g., on login/logout),
    // we need to re-evaluate whether to run the carousel.
    // A simple way is to just try to start it again. The function itself
    // checks if the user is logged in.

    // We need to re-find the elements as they might have been replaced.
    const newAuthElements = getAuthElements();
    if(newAuthElements) {
        iconImg = newAuthElements.button.querySelector('img');
        if (iconImg) {
            // Check if the ring is still there, if not, re-add it.
            if (!newAuthElements.button.querySelector('.auth-icon-ring')) {
                newAuthElements.button.insertBefore(ring, iconImg);
            }
            startCarousel();
        } else {
             if (intervalId) clearInterval(intervalId);
        }
    } else {
        if (intervalId) clearInterval(intervalId);
    }
  });

  // Start observing the auth container for changes.
  observer.observe(authElements.container, {
    childList: true, // Watch for addition/removal of children
    subtree: true,   // Watch descendants as well
  });

  // Initial start
  startCarousel();
});
