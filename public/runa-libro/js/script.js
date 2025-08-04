// Importa todos los servicios de Firebase necesarios
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
 
$(document).ready(function () {
    // --- Firebase Initialization ---
    // Estas variables se esperan que sean proporcionadas por el entorno.
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID" };
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Usa el ID de la app proporcionado

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app); // Inicializa Firestore

    let currentUserId = null;
    let isAuthReady = false; // Flag para asegurar que las operaciones de Firestore esperen a la autenticación

    // --- Firebase Auth UI Management ---
    const handleSignIn = () => {
        signInWithPopup(auth, new GoogleAuthProvider()) // Usa GoogleAuthProvider directamente
            .then((result) => {
                console.log("Signed in successfully with Google", result.user);
                $('#auth-modal').addClass('hidden'); // Cierra el modal al tener éxito
            }).catch((error) => {
                console.error("Google sign-in error", error);
            });
    };

    const updateAuthUI = (user) => {
        const authContainer = $('#auth-container');
        authContainer.empty(); // Limpia el contenido anterior

        if (user && !user.isAnonymous) {
            // El usuario ha iniciado sesión con un proveedor (ej. Google)
            const fallbackImage = 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png';
            const photoURL = user.photoURL || fallbackImage;

            const userButton = $(`
                <button id="logout-button" class="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--runa-primary)] flex items-center justify-center bg-white p-1" title="Cerrar sesión: ${user.displayName || 'Usuario'}">
                    <img src="${photoURL}" alt="${user.displayName || 'Usuario'}" class="w-full h-full ${user.photoURL ? 'object-cover' : 'object-contain'}" onerror="this.onerror=null;this.src='${fallbackImage}';">
                </button>
            `);
            
            userButton.on('click', () => {
                signOut(auth).catch(error => console.error("Sign out error", error));
            });
            authContainer.append(userButton);

        } else {
            // El usuario ha cerrado sesión o es anónimo
            const loginButton = $(`
                <button id="open-auth-modal-button" class="p-1 rounded-full text-white" aria-label="Abrir modal de inicio de sesión">
                    <img src="https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/52282681aa9e33511cedc3f7bb1281b0151528bb/public/assets/imagenes/logo-google.png" alt="Iniciar sesión" class="w-7 h-7">
                </button>
            `);
            // Este botón ahora SÓLO abre el modal
            loginButton.on('click', () => {
                $('#auth-modal').removeClass('hidden');
            });
            authContainer.append(loginButton);
        }
    };

    // Adjuntar el listener para los cambios en el estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("User signed in:", user.uid);
        } else {
            // Inicia sesión de forma anónima si no hay un usuario logueado
            try {
                const anonymousUser = await signInAnonymously(auth);
                currentUserId = anonymousUser.user.uid;
                console.log("Signed in anonymously:", currentUserId);
            } catch (error) {
                console.error("Anonymous sign-in failed:", error);
            }
        }
        isAuthReady = true;
        // Ahora que la autenticación está lista, carga los datos iniciales para las páginas visibles
        loadInitialPageData();
        updateAuthUI(user);
    });

    // Flujo de inicio de sesión inicial
    if (initialAuthToken) {
        signInWithCustomToken(auth, initialAuthToken).catch(err => {
            console.error("Custom token sign-in failed, trying anonymous.", err);
            // El listener de onAuthStateChanged manejará signInAnonymously si es necesario
        });
    } else {
        // El listener de onAuthStateChanged manejará signInAnonymously
    }

    // El botón dentro del modal maneja el inicio de sesión real
    $('#google-login-button-modal').on('click', handleSignIn);


    // --- State Variables ---
    const flipbook = $('.flipbook');
    // los estados de dibujo y texto se gestionan ahora por Firestore
    let currentTool = 'no-tool';
    let currentColor = 'rgb(0,0,0)';
    let baseColorFromWheel = { r: 0, g: 0, b: 0 };
    let currentLineWidth = 5;
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    const pageFlipSound = new Audio('https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/c2acd6b2dd569ae8ee33f2441eaacb2386e7490d/public/assets/mp3/pasar-hoja-de-libro.mp3');
    const visualTool = $('#visual-tool');
    
    const fonts = [
        { name: 'Poppins', family: "'Poppins', sans-serif" },
        { name: 'Roboto', family: "'Roboto', sans-serif" },
        { name: 'Lato', family: "'Lato', sans-serif" },
        { name: 'Montserrat', family: "'Montserrat', sans-serif" },
        { name: 'Oswald', family: "'Oswald', sans-serif" },
        { name: 'Raleway', family: "'Raleway', sans-serif" },
        { name: 'Merriweather', family: "'Merriweather', serif" },
        { name: 'Playfair Display', family: "'Playfair Display', serif" },
        { name: 'Lora', family: "'Lora', serif" },
        { name: 'Dancing Script', family: "'Dancing Script', cursive" },
        { name: 'Lobster', family: "'Lobster', cursive" },
        { name: 'Pacifico', family: "'Pacifico', cursive" },
        { name: 'Caveat', family: "'Caveat', cursive" },
        { name: 'Indie Flower', family: "'Indie Flower', cursive" },
        { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
    ];

    const videoSkins = [
        { name: "Naturaleza y Café", url: "https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/abb2e1a716439dd1ba47f48c0bba176ff72e197e/public/assets/videos/runa-fondo-video.mp4" }
    ];
    let currentVideoIndex = 0;

    const ambienceSounds = [
        { id: 'music-audio', name: 'Música', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/741d48f54473497390f1b028f4e2a2b874459088/public/assets/gif/music.gif' },
        { id: 'river-audio', name: 'Río', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/741d48f54473497390f1b028f4e2a2b874459088/public/assets/gif/river.gif' },
        { id: 'birds-audio', name: 'Pájaros', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/741d48f54473497390f1b028f4e2a2b874459088/public/assets/gif/birds.gif' },
        { id: 'rain-audio', name: 'Lluvia', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/1502311c7a2daf5ee882bb36da3e6555680fd5e8/public/assets/gif/rain.gif' },
        { id: 'fire-audio', name: 'Fuego', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/1502311c7a2daf5ee882bb36da3e6555680fd5e8/public/assets/gif/fire.gif' },
        { id: 'wind-audio', name: 'Viento', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/1502311c7a2daf5ee882bb36da3e6555680fd5e8/public/assets/gif/wind.gif' },
        { id: 'storm-audio', name: 'Tormenta', gifSrc: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/1502311c7a2daf5ee882bb36da3e6555680fd5e8/public/assets/gif/storm.gif' },
    ];

    // --- Function Definitions ---

    function getCanvasForPage(pageNumber) {
        let canvas = $(`#canvas-page-${pageNumber}`);
        const pageElement = flipbook.find(`.page[data-page-number=${pageNumber}]`);
        if (!pageElement.length || pageElement.data('drawing-enabled') !== true) return null; // Ensure drawing is enabled

        if (canvas.length === 0) {
            canvas = $('<canvas>').addClass('drawing-canvas').attr('id', `canvas-page-${pageNumber}`);
            pageElement.append(canvas);
            const canvasEl = canvas[0];
            // Set canvas dimensions to match the page element
            canvasEl.width = pageElement.width();
            canvasEl.height = pageElement.height();

            canvas.on('mousedown touchstart', startDrawing);
            canvas.on('mousemove touchmove', draw);
        }
        return canvas[0];
    }

    function getTextLayerForPage(pageNumber) {
        let textLayer = $(`#text-layer-page-${pageNumber}`);
        const pageElement = flipbook.find(`.page[data-page-number=${pageNumber}]`);
        if (!pageElement.length || pageElement.data('drawing-enabled') !== true) return null; // Ensure drawing is enabled

        if (textLayer.length === 0) {
            textLayer = $('<div>')
                .addClass('text-layer-container') // Changed to match CSS
                .attr('id', `text-layer-page-${pageNumber}`)
                .attr('contenteditable', 'true')
                .attr('spellcheck', 'false');
            pageElement.append(textLayer);

            textLayer.on('input', () => saveTextForPage(pageNumber));
            
            textLayer.on('click', function(e) {
                if (currentTool !== 'text') {
                    setActiveTool('text');
                }
            });
        }
        return textLayer[0];
    }

    function startDrawing(e) {
        if (currentTool !== 'pencil' && currentTool !== 'eraser') return;
        isDrawing = true;
        visualTool.show();
        const [x, y] = getCoords(e, $(e.target));
        lastX = x;
        lastY = y;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const page = flipbook.turn('page');
        const canvas = getCanvasForPage(page);
        if (!canvas) return;
        
        const [x, y] = getCoords(e, $(canvas));
        const canvasRect = canvas.getBoundingClientRect();
        visualTool.css({ top: canvasRect.top + y, left: canvasRect.left + x });

        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = (currentTool === 'eraser') ? 'destination-out' : 'source-over';
        ctx.lineWidth = (currentTool === 'eraser') ? 25 : currentLineWidth;
        ctx.strokeStyle = currentColor;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        [lastX, lastY] = [x, y];
    }

    function stopDrawing() {
        if(isDrawing) {
            const page = flipbook.turn('page');
            saveDrawingForPage(page);
        }
        isDrawing = false;
        visualTool.hide();
    }

    function getCoords(e, target) {
        const rect = target[0].getBoundingClientRect();
        const event = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
        return [event.clientX - rect.left, event.clientY - rect.top];
    }

    // --- Firestore Save/Load Functions ---
    async function saveDrawingForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) {
            console.warn("Auth not ready or user not identified. Cannot save drawing.");
            return;
        }
        const canvas = getCanvasForPage(pageNumber);
        if (canvas) {
            const dataURL = canvas.toDataURL();
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/notebookPages`, `page-${pageNumber}`);
                await setDoc(pageDocRef, { drawingData: dataURL }, { merge: true });
                console.log(`Drawing saved for page ${pageNumber}`);
            } catch (e) {
                console.error("Error saving drawing:", e);
            }
        }
    }

    async function loadDrawingForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) {
            console.warn("Auth not ready or user not identified. Cannot load drawing.");
            return;
        }
        const canvas = getCanvasForPage(pageNumber);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before loading

            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/notebookPages`, `page-${pageNumber}`);
                const docSnap = await getDoc(pageDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.drawingData) {
                        const img = new Image();
                        img.onload = () => ctx.drawImage(img, 0, 0);
                        img.src = data.drawingData;
                        console.log(`Drawing loaded for page ${pageNumber}`);
                    }
                }
            } catch (e) {
                console.error("Error loading drawing:", e);
            }
        }
    }
    
    async function saveTextForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) {
            console.warn("Auth not ready or user not identified. Cannot save text.");
            return;
        }
        const textLayer = getTextLayerForPage(pageNumber);
        if (textLayer) {
            const textContent = textLayer.innerHTML;
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/notebookPages`, `page-${pageNumber}`);
                await setDoc(pageDocRef, { textData: textContent }, { merge: true });
                console.log(`Text saved for page ${pageNumber}`);
            } catch (e) {
                console.error("Error saving text:", e);
            }
        }
    }

    async function loadTextForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) {
            console.warn("Auth not ready or user not identified. Cannot load text.");
            return;
        }
        const textLayer = getTextLayerForPage(pageNumber);
        if (textLayer) {
            textLayer.innerHTML = ''; // Clear before loading
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/notebookPages`, `page-${pageNumber}`);
                const docSnap = await getDoc(pageDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.textData) {
                        textLayer.innerHTML = data.textData;
                        console.log(`Text loaded for page ${pageNumber}`);
                    }
                }
            } catch (e) {
                console.error("Error loading text:", e);
            }
        }
    }
    
    async function loadInitialPageData() {
        // Load data for the currently visible pages after auth is ready
        const view = flipbook.turn('view'); // Get currently visible pages
        for (const p of view) {
            if (p > 0 && $(`.page[data-page-number=${p}]`).data('drawing-enabled')) {
                await loadDrawingForPage(p);
                await loadTextForPage(p);
            }
        }
    }
    
    function setActiveTool(tool) {
        $('.tool-button').removeClass('active');
        visualTool.removeClass('pencil eraser');
        $('body').removeClass('drawing-tool-active text-tool-active eraser-tool-active no-tool-active');
        
        currentTool = tool;
        
        if (tool === 'pencil') {
            $('body').addClass('drawing-tool-active');
        } else if (tool === 'eraser') {
            $('body').addClass('eraser-tool-active');
        } else if (tool === 'text') {
            $('body').addClass('text-tool-active');
        } else {
            $('body').addClass('no-tool-active');
        }

        $(`#tool-${tool}`).addClass('active');

        if (tool === 'text') {
            $('#font-selector-container').removeClass('hidden');
            $('#color-picker-container').addClass('hidden');
            visualTool.hide();
            const page = flipbook.turn('page');
            const textLayer = getTextLayerForPage(page);
            if (textLayer) {
                $(textLayer).focus();
                document.execCommand('foreColor', false, currentColor);
            }
        } else {
            $('#font-selector-container').addClass('hidden');
            if (tool === 'pencil' || tool === 'eraser') {
                visualTool.html(tool === 'pencil' ? '<i class="fas fa-pencil"></i>' : '<i class="fas fa-eraser"></i>').addClass(tool);
            } else {
                visualTool.hide();
            }
        }
    }

    function applyTheme(theme) {
        const sunIcon = $('#theme-icon-sun');
        const moonIcon = $('#theme-icon-moon');
        if (theme === 'dark') {
            $('html').removeClass('light').addClass('dark');
            sunIcon.show();
            moonIcon.hide();
        } else {
            $('html').removeClass('dark').addClass('light');
            sunIcon.hide();
            moonIcon.show();
        }
    }

    function closeAllPanels() {
        $('#main-menu, #mixer-panel, #video-skin-panel').addClass('hidden');
    }

    function initializeMixer() {
        const soundControlsContainer = $('#sound-controls');
        soundControlsContainer.html('');
        ambienceSounds.forEach(sound => {
            const audioEl = document.getElementById(sound.id);
            if (!audioEl) return;
            
            const controlHTML = `<div class="flex items-center gap-4 text-sm text-white"><button id="btn-${sound.id}" class="mixer-icon-button relative w-10 h-10 rounded-full shadow-md flex-shrink-0 overflow-hidden"><img src="${sound.gifSrc}" alt="${sound.name}"></button><span class="font-medium w-20 truncate">${sound.name}</span><input type="range" id="volume-${sound.id}" min="0" max="1" step="0.01" value="0" class="styled-slider" style="--thumb-color: var(--runa-primary); --track-fill-color: var(--slider-track-color);"></div>`;
            soundControlsContainer.append(controlHTML);
            
            const slider = $(`#volume-${sound.id}`);
            slider.on('input', function() {
                const newVolume = parseFloat($(this).val());
                audioEl.volume = newVolume;
                $(`#btn-${sound.id}`).toggleClass('active', newVolume > 0);
                updateSliderFill(this);
                if (newVolume > 0 && audioEl.paused) { audioEl.play().catch(e => console.error(`Error playing ${sound.id}:`, e)); } 
                else if (newVolume === 0 && !audioEl.paused) { audioEl.pause(); }
            });

            $(`#btn-${sound.id}`).on('click', function() {
                const currentVolume = parseFloat(slider.val());
                if (currentVolume > 0) { 
                    slider.data('lastValue', currentVolume); 
                    slider.val(0); 
                } else { 
                    slider.val(slider.data('lastValue') || 0.5); 
                }
                slider.trigger('input');
            });
            updateSliderFill(slider[0]);
        });
    }

    function setVideoSkin(index) {
        const video = $('#video-background');
        const source = $('#video-source');
        if(video.length && source.length){
            video.css('opacity', 0);
            setTimeout(() => {
                currentVideoIndex = index;
                source.attr('src', videoSkins[currentVideoIndex].url);
                video[0].load();
                video[0].play().catch(e => console.error("Video play failed:", e));
                video.css('opacity', 1);
                localStorage.setItem('runaVideoSkin', currentVideoIndex);
                updateVideoListUI();
            }, 500);
        }
    }

    function updateVideoListUI() {
        const videoListContainer = $('#video-list');
        if (!videoListContainer.length) return;
        videoListContainer.find('button').each(function(index) {
            $(this).toggleClass('active', index === currentVideoIndex);
        });
    }
    
    function initializeVideoSelector() {
        const videoListContainer = $('#video-list');
        videoListContainer.html('');
        videoSkins.forEach((skin, index) => {
            const button = $(`<button class="video-list-button w-full text-left p-2 rounded-lg transition-colors duration-200 text-white">${skin.name}</button>`);
            button.on('click', () => setVideoSkin(index));
            videoListContainer.append(button);
        });
        updateVideoListUI();
    }

    function renderCartModal() {
        const cartModal = $('#cart-modal');
        let contentHTML = `<div class="p-8 flex-grow flex flex-col items-center justify-center text-center"><svg class="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg><h3 class="font-semibold text-lg text-white">Tu carrito está vacío</h3><p class="text-sm text-gray-400">Añade productos para verlos aquí.</p></div>`;
        cartModal.html(`<div class="translucent-panel w-full max-w-sm h-full sm:h-auto sm:rounded-2xl shadow-2xl flex flex-col ml-auto"><header class="p-4 border-b border-white/10 flex justify-between items-center"><h2 class="text-xl font-bold text-white">Tu Carrito</h2><button id="close-cart-button" class="p-1 rounded-full text-white hover:bg-white/10 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></header>${contentHTML}</div>`);
        $('#close-cart-button').on('click', () => $('#cart-modal').addClass('hidden'));
    }

    function updateSliderFill(slider) {
        const min = $(slider).attr('min') || 0;
        const max = $(slider).attr('max') || 100;
        const value = $(slider).val();
        const percent = ((value - min) / (max - min)) * 100;
        $(slider).css('--value-percent', `${percent}%`);
    }

    // --- Initial Setup and Event Handlers ---

    // This loop now handles the re-numbering correctly after new pages are added in HTML
    $('.flipbook .page').each((index, el) => $(el).attr('data-page-number', index + 1));
    
    $(window).on('mouseup touchend', stopDrawing);

    flipbook.turn({
        width: $('.flipbook-container').width(),
        height: $('.flipbook-container').height(),
        display: 'single',
        elevation: 50,
        gradients: true,
        autoCenter: true,
        when: {
            turning: async (event, page, view) => { // Before the turn animation starts
                // Save the state of the page that is about to turn away
                if ($(`.page[data-page-number=${page}]`).data('drawing-enabled')) {
                    await saveDrawingForPage(page);
                    await saveTextForPage(page);
                }
            },
            turned: async (event, page, view) => { // After the turn animation completes
                // Load the state of the newly visible pages
                for (const p of view) {
                    if (p > 0 && $(`.page[data-page-number=${p}]`).data('drawing-enabled')) {
                        await loadDrawingForPage(p);
                        await loadTextForPage(p);
                    }
                }
                if(currentTool === 'text') getTextLayerForPage(page)?.focus();
                if (page > 1) {
                    pageFlipSound.currentTime = 2.2;
                    pageFlipSound.play().catch(console.error);
                    setTimeout(() => pageFlipSound.pause(), 1000);
                }
            }
        }
    });
    
    // --- Tool Event Handlers ---
    $('#tool-pencil').on('click', () => { setActiveTool('pencil'); closeAllPanels(); });
    $('#tool-text').on('click', () => { 
        setActiveTool('text'); 
        // Don't close panel, let user pick font
    });
    $('#tool-eraser').on('click', () => { setActiveTool('eraser'); closeAllPanels(); });
    $('#tool-clear').on('click', async () => { // Made async for Firestore operations
        const page = flipbook.turn('page');
        const canvas = getCanvasForPage(page);
        if (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            await saveDrawingForPage(page); // Save cleared state
        }
        const textLayer = getTextLayerForPage(page);
        if (textLayer) {
            textLayer.innerHTML = '';
            await saveTextForPage(page); // Save cleared state
        }
        closeAllPanels();
    });
    $('#tool-calc').on('click', () => { $('#calculator').fadeToggle(); closeAllPanels(); });
    $('#tool-add-page').on('click', () => {
        const newPage = $('<div class="page" data-drawing-enabled="true"><div class="page-number"></div></div>');
        const book = $('.flipbook');
        book.turn('addPage', newPage, book.turn('pages') + 1);
        // Re-number pages
        $('.flipbook .page').each(function(index) {
            $(this).attr('data-page-number', index + 1); // Ensure data attribute is updated
            $(this).find('.page-number').text(index + 1);
        });
        closeAllPanels();
    });

    $('#line-width-slider').on('input', function() {
        currentLineWidth = $(this).val();
        setActiveTool('pencil');
        updateSliderFill(this);
    });

    const fontPalette = $('#font-palette');
    fonts.forEach(font => {
        const fontButton = $(`<button class="font-button" style="font-family: ${font.family};">${font.name}</button>`);
        fontButton.data('fontFamily', font.family);
        fontButton.on('click', function() {
            $('.font-button').removeClass('active');
            $(this).addClass('active');
            const page = flipbook.turn('page');
            const textLayer = getTextLayerForPage(page);
            if (textLayer) {
                document.execCommand('fontName', false, $(this).data('fontFamily'));
                $(textLayer).focus();
                saveTextForPage(page); // Save font change
            }
            closeAllPanels();
        });
        fontPalette.append(fontButton);
    });
    fontPalette.find('button:first').addClass('active');
    
    $('#tool-print').on('click', () => { window.print(); closeAllPanels(); });
    
    $('#tool-share').on('click', async () => {
        const shareData = {
            title: 'RUNA Coffee - Cuaderno Digital',
            text: '¡Bienvenido a RUNA Coffee! Te invito a explorar mi cuaderno digital interactivo.',
            url: window.location.href,
        };
        try { await navigator.share(shareData); }
        catch (err) { console.error("Share failed:", err); }
        closeAllPanels();
    });
    
    $('#tool-upload').on('click', () => $('#image-uploader').click());
    $('<input type="file" id="image-uploader" accept="image/*" class="hidden">').appendTo('body').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => { // Made async for Firestore
            const img = new Image();
            img.onload = async () => { // Made async for Firestore
                const page = flipbook.turn('page');
                const canvas = getCanvasForPage(page);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const maxW = canvas.width * 0.8, maxH = canvas.height * 0.8;
                    let w = img.width, h = img.height, ratio = w / h;
                    if (w > maxW) { w = maxW; h = w / ratio; }
                    if (h > maxH) { h = maxH; w = h * ratio; }
                    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
                    await saveDrawingForPage(page); // Save image to Firestore
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        $(this).val('');
        closeAllPanels();
    });

    // --- Color Picker Logic ---
    $('#tool-color').on('click', () => {
        $('#color-picker-container').slideToggle();
    });
    
    const colorWheel = document.getElementById('color-wheel');
    const colorPreview = document.getElementById('color-preview');
    const luminositySlider = document.getElementById('luminosity-slider');
    const cwCtx = colorWheel.getContext('2d');
    const wheelRadius = colorWheel.width / 2;
    cwCtx.translate(wheelRadius, wheelRadius);

    function drawColorWheel() {
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 2) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;
            cwCtx.beginPath();
            cwCtx.moveTo(0, 0);
            cwCtx.arc(0, 0, wheelRadius, startAngle, endAngle);
            cwCtx.closePath();
            const gradient = cwCtx.createRadialGradient(0, 0, 0, 0, 0, wheelRadius);
            gradient.addColorStop(0, "white");
            gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
            cwCtx.fillStyle = gradient;
            cwCtx.fill();
        }
    }
    
    function updateFinalColor() {
        const lum = luminositySlider.value;
        let {r, g, b} = baseColorFromWheel;

        const lerp = (a, b, t) => a + (b - a) * t;

        if (lum < 50) {
            const t = lum / 50;
            r = lerp(0, r, t);
            g = lerp(0, g, t);
            b = lerp(0, b, t);
        } else {
            const t = (lum - 50) / 50;
            r = lerp(r, 255, t);
            g = lerp(g, 255, t);
            b = lerp(b, 255, t);
        }
        
        currentColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        colorPreview.style.backgroundColor = currentColor;
        if (currentTool === 'text') {
            document.execCommand('foreColor', false, currentColor);
        }
    }

    function pickColorFromWheel(e) {
        const rect = colorWheel.getBoundingClientRect();
        const x = e.clientX - rect.left - wheelRadius;
        const y = e.clientY - rect.top - wheelRadius;
        const pixel = cwCtx.getImageData(x + wheelRadius, y + wheelRadius, 1, 1).data;
        baseColorFromWheel = { r: pixel[0], g: pixel[1], b: pixel[2] };
        luminositySlider.style.setProperty('--track-fill-color', `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`);
        updateFinalColor();
    }

    $(colorWheel).on('mousedown', (e) => {
        pickColorFromWheel(e);
        $(colorWheel).on('mousemove', pickColorFromWheel);
    }).on('mouseup mouseleave', () => {
        $(colorWheel).off('mousemove', pickColorFromWheel);
    });
    
    $(luminositySlider).on('input', updateFinalColor);

    // --- TI-89 Calculator Logic ---
    const calculator = $('#calculator');
    const calcDisplay = $('#calc-display');

    $('#calc-close').on('click', () => calculator.fadeOut());

    async function sendToPage(value) { // Made async for Firestore
        if (value && value !== 'Error') {
            setActiveTool('text');
            const page = flipbook.turn('page');
            const textLayer = getTextLayerForPage(page);
            if (textLayer) {
                $(textLayer).focus();
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(textLayer);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);

                document.execCommand('insertText', false, ` ${value} `);
                await saveTextForPage(page); // Save text to Firestore
            }
        }
    }
    
    $('#calc-send').on('click', () => {
        sendToPage(calcDisplay.val());
        calculator.fadeOut();
    });

    $('.calc-keys').on('click', '.calc-btn', function() {
        const key = $(this).data('key');
        const func = $(this).data('func');
        
        if (key !== undefined) {
            calcDisplay.val(calcDisplay.val() + key);
        } else if (func !== undefined) {
            calcDisplay.val(calcDisplay.val() + func);
        }
    });

    $('#calc-clear').on('click', () => calcDisplay.val(''));
    $('#calc-backspace').on('click', () => calcDisplay.val(calcDisplay.val().slice(0, -1)));
    
    $('#calc-equals').on('click', () => {
        try {
            let expression = calcDisplay.val();
            // Replace common math function representations with Math object methods
            expression = expression.replace(/sin\(/g, 'Math.sin(')
                                     .replace(/cos\(/g, 'Math.cos(')
                                     .replace(/tan\(/g, 'Math.tan(')
                                     .replace(/sqrt\(/g, 'Math.sqrt(')
                                     .replace(/log\(/g, 'Math.log10(') // Assuming log base 10
                                     .replace(/ln\(/g, 'Math.log(') // Natural log
                                     .replace(/\^/g, '**'); // Power operator

            const result = new Function('return ' + expression)();
            calcDisplay.val(result);
        } catch (e) {
            console.error("Calculator error:", e);
            calcDisplay.val('Error');
        }
    });


    // --- UI Panel Handlers ---
    $('#theme-toggle').on('click', () => {
        const newTheme = $('html').hasClass('dark') ? 'light' : 'dark';
        localStorage.setItem('runaTheme', newTheme);
        applyTheme(newTheme);
    });

    $('#menu-button').on('click', (e) => { e.stopPropagation(); const wasOpen = !$('#main-menu').hasClass('hidden'); closeAllPanels(); if (!wasOpen) $('#main-menu').removeClass('hidden'); });
    $('#mixer-toggle-button').on('click', (e) => { e.stopPropagation(); const wasOpen = !$('#mixer-panel').hasClass('hidden'); closeAllPanels(); if (!wasOpen) $('#mixer-panel').removeClass('hidden'); });
    $('#video-skin-toggle').on('click', (e) => { e.stopPropagation(); const wasOpen = !$('#video-skin-panel').hasClass('hidden'); closeAllPanels(); if (!wasOpen) $('#video-skin-panel').removeClass('hidden'); });
    $(window).on('click', (e) => { if (!$(e.target).closest('#main-header').length) closeAllPanels(); });
    $('.menu-section-header').on('click', function() { $(this).toggleClass('active').next('.menu-section-content').slideToggle(); });
    
    // --- Cart ---
    $('#open-cart-button').on('click', () => { renderCartModal(); $('#cart-modal').removeClass('hidden'); });
    $('#cart-modal').on('click', (event) => { if (event.target === $('#cart-modal')[0]) $('#cart-modal').addClass('hidden'); });
    
    // --- Auth Modal Handlers ---
    $('#close-auth-modal-button').on('click', () => $('#auth-modal').addClass('hidden'));
    
    // --- Resizing ---
    $(window).on('resize', () => {
        // Re-initialize flipbook on resize to ensure correct dimensions
        flipbook.turn('size', $('.flipbook-container').width(), $('.flipbook-container').height());
        // Re-size canvases on pages that have them
        $('.flipbook .page').each(function() {
            const pageNumber = $(this).data('page-number');
            const canvas = getCanvasForPage(pageNumber);
            if (canvas) {
                const pageElement = $(this);
                canvas.width = pageElement.width();
                canvas.height = pageElement.height();
                // Reload drawing to fit new canvas size if necessary
                loadDrawingForPage(pageNumber);
            }
        });
    }).trigger('resize'); // Trigger resize on load to set initial state

    // --- Page Turn Hint ---
    const pageTurnHint = $('#page-turn-hint');
    if (localStorage.getItem('runaHintSeen') !== 'true') {
        setTimeout(() => pageTurnHint.addClass('visible'), 1500);
        flipbook.one('turned', () => { pageTurnHint.removeClass('visible'); localStorage.setItem('runaHintSeen', 'true'); });
    }

    // --- Final Initializations ---
    setActiveTool('no-tool');
    // Initial page data loading is now handled by onAuthStateChanged -> loadInitialPageData()
    applyTheme(localStorage.getItem('runaTheme') || 'light');
    initializeMixer();
    initializeVideoSelector();
    setVideoSkin(parseInt(localStorage.getItem('runaVideoSkin')) || 0);
    $('#line-width-slider').css('--thumb-color', 'var(--pencil-track-color)').css('--track-fill-color', 'var(--pencil-track-color)');
    updateSliderFill($('#line-width-slider')[0]);
    drawColorWheel();
    colorPreview.style.backgroundColor = currentColor;
});
