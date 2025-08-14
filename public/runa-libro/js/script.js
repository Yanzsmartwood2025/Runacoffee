// Importa los servicios de Firebase que necesitarás
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Se asegura de que el DOM esté completamente cargado antes de ejecutar el script
$(document).ready(function () {
    // --- Inicialización de Firebase (COMENTADA PARA PRUEBAS LOCALES) ---
    // const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID" };
    // const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    // const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // const app = initializeApp(firebaseConfig);
    // const auth = getAuth(app);
    // const db = getFirestore(app);

    let currentUserId = "test-user";
    let isAuthReady = true;

    // --- Manejo de la Interfaz de Autenticación de Firebase ---
    const handleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Inicio de sesión con Google exitoso", result.user);
                $('#auth-modal').addClass('hidden');
            }).catch((error) => {
                console.error("Error en el inicio de sesión con Google", error);
            });
    };

    const updateAuthUI = (user) => {
        const authContainer = $('#auth-container');
        authContainer.empty();

        if (user && !user.isAnonymous) {
            // RUTA CORREGIDA para la imagen de fallback
            const fallbackImage = '../../assets/imagenes/logo-google.png';
            const photoURL = user.photoURL || fallbackImage;

            const userButton = $(`
                <button id="logout-button" class="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--runa-primary)] flex items-center justify-center bg-white p-1" title="Cerrar sesión: ${user.displayName || 'Usuario'}">
                    <img src="${photoURL}" alt="${user.displayName || 'Usuario'}" class="w-full h-full ${user.photoURL ? 'object-cover' : 'object-contain'}" onerror="this.onerror=null;this.src='${fallbackImage}';">
                </button>
            `);
            
            userButton.on('click', () => {
                signOut(auth).catch(error => console.error("Error al cerrar sesión", error));
            });
            authContainer.append(userButton);

        } else {
            // RUTA CORREGIDA para la imagen de login
            const loginButton = $(`
                <button id="open-auth-modal-button" class="p-1 rounded-full text-white" aria-label="Abrir modal de inicio de sesión">
                    <img src="../../assets/imagenes/logo-google.png" alt="Iniciar sesión" class="w-7 h-7">
                </button>
            `);
            loginButton.on('click', () => {
                $('#auth-modal').removeClass('hidden');
            });
            authContainer.append(loginButton);
        }
    };

    // onAuthStateChanged(auth, async (user) => {
    //     if (user) {
    //         currentUserId = user.uid;
    //     } else {
    //         try {
    //             const anonymousUser = await signInAnonymously(auth);
    //             currentUserId = anonymousUser.user.uid;
    //         } catch (error) {
    //             console.error("Falló el inicio de sesión anónimo:", error);
    //         }
    //     }
    //     isAuthReady = true;
    //     loadInitialPageData();
    //     updateAuthUI(user);
    // });

    // if (initialAuthToken) {
    //     signInWithCustomToken(auth, initialAuthToken).catch(err => {
    //         console.error("Falló el inicio de sesión con token personalizado, intentando anónimo.", err);
    //     });
    // }
    loadInitialPageData();
    updateAuthUI(null);

    $('#google-login-button-modal').on('click', handleSignIn);

    // --- Variables de Estado ---
    const flipbook = $('.flipbook');
    let currentTool = 'no-tool';
    let currentColor = 'rgb(0,0,0)';
    let baseColorFromWheel = { r: 0, g: 0, b: 0 };
    let currentLineWidth = 5;
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    // RUTA CORREGIDA para el sonido
    const pageFlipSound = new Audio('../../assets/mp3/page-flip.mp3');
    const visualTool = $('#visual-tool');
    
    // --- Constantes y Datos ---
    const fonts = [
        { name: 'Poppins', family: "'Poppins', sans-serif" }, { name: 'Roboto', family: "'Roboto', sans-serif" },
        { name: 'Lato', family: "'Lato', sans-serif" }, { name: 'Montserrat', family: "'Montserrat', sans-serif" },
        { name: 'Oswald', family: "'Oswald', sans-serif" }, { name: 'Raleway', family: "'Raleway', sans-serif" },
        { name: 'Merriweather', family: "'Merriweather', serif" }, { name: 'Playfair Display', family: "'Playfair Display', serif" },
        { name: 'Lora', family: "'Lora', serif" }, { name: 'Dancing Script', family: "'Dancing Script', cursive" },
        { name: 'Lobster', family: "'Lobster', cursive" }, { name: 'Pacifico', family: "'Pacifico', cursive" },
        { name: 'Caveat', family: "'Caveat', cursive" }, { name: 'Indie Flower', family: "'Indie Flower', cursive" },
        { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
    ];
    const videoSkins = [
        // RUTA CORREGIDA para el video
        { name: "Naturaleza y Café", url: "../../assets/videos/runa-fondo-video.mp4" }
    ];
    let currentVideoIndex = 0;
    const ambienceSounds = [
        // RUTAS CORREGIDAS para los GIFs
        { id: 'river-audio', name: 'Río', gifSrc: '../../assets/gif/river.gif' },
        { id: 'birds-audio', name: 'Pájaros', gifSrc: '../../assets/gif/birds.gif' },
        { id: 'rain-audio', name: 'Lluvia', gifSrc: '../../assets/gif/rain.gif' },
        { id: 'fire-audio', name: 'Fuego', gifSrc: '../../assets/gif/fire.gif' },
        { id: 'wind-audio', name: 'Viento', gifSrc: '../../assets/gif/wind.gif' },
        { id: 'storm-audio', name: 'Tormenta', gifSrc: '../../assets/gif/storm.gif' },
    ];

    // --- Definiciones de Funciones (sin cambios en la lógica interna) ---
    function getCanvasForPage(pageNumber) {
        let canvas = $(`#canvas-page-${pageNumber}`);
        const pageElement = flipbook.find(`.page[data-page-number=${pageNumber}]`);
        if (!pageElement.length || pageElement.data('drawing-enabled') !== true) return null;
        if (canvas.length === 0) {
            canvas = $('<canvas>').addClass('drawing-canvas').attr('id', `canvas-page-${pageNumber}`);
            pageElement.append(canvas);
            const canvasEl = canvas[0];
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
        if (!pageElement.length || pageElement.data('drawing-enabled') !== true) return null;
        if (textLayer.length === 0) {
            textLayer = $('<div>')
                .addClass('text-layer-container')
                .attr('id', `text-layer-page-${pageNumber}`)
                .attr('contenteditable', 'true')
                .attr('spellcheck', 'false');
            pageElement.append(textLayer);
            textLayer.on('input', () => saveTextForPage(pageNumber));
            textLayer.on('click', function() {
                if (currentTool !== 'text') setActiveTool('text');
            });
        }
        return textLayer[0];
    }

    function startDrawing(e) {
        if (currentTool !== 'pencil' && currentTool !== 'eraser') return;
        isDrawing = true;
        visualTool.show();
        const [x, y] = getCoords(e, $(e.target));
        [lastX, lastY] = [x, y];
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

    async function saveDrawingForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) return;
        const canvas = getCanvasForPage(pageNumber);
        if (canvas) {
            const dataURL = canvas.toDataURL();
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/runaLibroPages`, `page-${pageNumber}`);
                await setDoc(pageDocRef, { drawingData: dataURL }, { merge: true });
            } catch (e) { console.error("Error guardando el dibujo:", e); }
        }
    }

    async function loadDrawingForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) return;
        const canvas = getCanvasForPage(pageNumber);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/runaLibroPages`, `page-${pageNumber}`);
                const docSnap = await getDoc(pageDocRef);
                if (docSnap.exists() && docSnap.data().drawingData) {
                    const img = new Image();
                    img.onload = () => ctx.drawImage(img, 0, 0);
                    img.src = docSnap.data().drawingData;
                }
            } catch (e) { console.error("Error cargando el dibujo:", e); }
        }
    }
    
    async function saveTextForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) return;
        const textLayer = getTextLayerForPage(pageNumber);
        if (textLayer) {
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/runaLibroPages`, `page-${pageNumber}`);
                await setDoc(pageDocRef, { textData: textLayer.innerHTML }, { merge: true });
            } catch (e) { console.error("Error guardando el texto:", e); }
        }
    }

    async function loadTextForPage(pageNumber) {
        if (!isAuthReady || !currentUserId) return;
        const textLayer = getTextLayerForPage(pageNumber);
        if (textLayer) {
            textLayer.innerHTML = '';
            try {
                const pageDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/runaLibroPages`, `page-${pageNumber}`);
                const docSnap = await getDoc(pageDocRef);
                if (docSnap.exists() && docSnap.data().textData) {
                    textLayer.innerHTML = docSnap.data().textData;
                }
            } catch (e) { console.error("Error cargando el texto:", e); }
        }
    }

    async function loadInitialPageData() {
        const view = flipbook.turn('view');
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
        if (tool === 'pencil') $('body').addClass('drawing-tool-active');
        else if (tool === 'eraser') $('body').addClass('eraser-tool-active');
        else if (tool === 'text') $('body').addClass('text-tool-active');
        else $('body').addClass('no-tool-active');
        $(`#tool-${tool}`).addClass('active');
        if (tool === 'text') {
            $('#font-selector-container').removeClass('hidden');
            $('#color-picker-container').addClass('hidden');
            visualTool.hide();
            const textLayer = getTextLayerForPage(flipbook.turn('page'));
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
        if (theme === 'dark') {
            $('html').removeClass('light').addClass('dark');
            $('#theme-icon-sun').show();
            $('#theme-icon-moon').hide();
        } else {
            $('html').removeClass('dark').addClass('light');
            $('#theme-icon-sun').hide();
            $('#theme-icon-moon').show();
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
                if (newVolume > 0 && audioEl.paused) audioEl.play().catch(e => console.error(`Error al reproducir ${sound.id}:`, e));
                else if (newVolume === 0 && !audioEl.paused) audioEl.pause();
            });
            $(`#btn-${sound.id}`).on('click', function() {
                const currentVolume = parseFloat(slider.val());
                slider.val(currentVolume > 0 ? 0 : (slider.data('lastValue') || 0.5));
                if (currentVolume > 0) slider.data('lastValue', currentVolume);
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
                video[0].play().catch(e => console.error("La reproducción del video falló:", e));
                video.css('opacity', 1);
                localStorage.setItem('runaVideoSkin', currentVideoIndex);
                updateVideoListUI();
            }, 500);
        }
    }

    function updateVideoListUI() {
        $('#video-list button').each(function(index) {
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
        const percent = (($(slider).val() - $(slider).attr('min')) / ($(slider).attr('max') - $(slider).attr('min'))) * 100;
        $(slider).css('--value-percent', `${percent}%`);
    }

    // --- Configuración Inicial y Manejadores de Eventos ---
    $('.flipbook .page').each((index, el) => $(el).attr('data-page-number', index + 1));
    $(window).on('mouseup touchend', stopDrawing);
    flipbook.turn({
        width: $('.flipbook-container').width(), height: $('.flipbook-container').height(),
        display: 'single', elevation: 50, gradients: true, autoCenter: true,
        when: {
            turning: async (event, page, view) => {
                if ($(`.page[data-page-number=${page}]`).data('drawing-enabled')) {
                    await saveDrawingForPage(page);
                    await saveTextForPage(page);
                }
            },
            turned: async (event, page, view) => {
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
    
    // --- Manejadores de Eventos de Herramientas ---
    $('#tool-pencil').on('click', () => { setActiveTool('pencil'); closeAllPanels(); });
    $('#tool-text').on('click', () => setActiveTool('text'));
    $('#tool-eraser').on('click', () => { setActiveTool('eraser'); closeAllPanels(); });
    $('#tool-clear').on('click', async () => {
        const page = flipbook.turn('page');
        const canvas = getCanvasForPage(page);
        if (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            await saveDrawingForPage(page);
        }
        const textLayer = getTextLayerForPage(page);
        if (textLayer) {
            textLayer.innerHTML = '';
            await saveTextForPage(page);
        }
        closeAllPanels();
    });
    $('#tool-calc').on('click', () => { $('#calculator').fadeToggle(); closeAllPanels(); });
    $('#tool-add-page').on('click', () => {
        const newPage = $('<div class="page" data-drawing-enabled="true"><div class="page-number"></div></div>');
        const book = $('.flipbook');
        book.turn('addPage', newPage, book.turn('pages') + 1);
        $('.flipbook .page').each(function(index) {
            $(this).attr('data-page-number', index + 1).find('.page-number').text(index + 1);
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
        fontButton.data('fontFamily', font.family).on('click', function() {
            $('.font-button').removeClass('active');
            $(this).addClass('active');
            const page = flipbook.turn('page');
            const textLayer = getTextLayerForPage(page);
            if (textLayer) {
                document.execCommand('fontName', false, $(this).data('fontFamily'));
                $(textLayer).focus();
                saveTextForPage(page);
            }
            closeAllPanels();
        });
        fontPalette.append(fontButton);
    });
    fontPalette.find('button:first').addClass('active');
    
    $('#tool-print').on('click', () => { window.print(); closeAllPanels(); });
    
    $('#tool-share').on('click', async () => {
        try { await navigator.share({ title: 'RUNA Coffee - Runa Libro', text: '¡Te invito a explorar mi Runa Libro interactivo!', url: window.location.href }); }
        catch (err) { console.error("Falló la compartición:", err); }
        closeAllPanels();
    });
    
    $('<input type="file" id="image-uploader" accept="image/*" class="hidden">').appendTo('body').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const page = flipbook.turn('page');
                const canvas = getCanvasForPage(page);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const maxW = canvas.width * 0.8, maxH = canvas.height * 0.8;
                    let w = img.width, h = img.height, ratio = w / h;
                    if (w > maxW) { w = maxW; h = w / ratio; }
                    if (h > maxH) { h = maxH; w = h * ratio; }
                    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
                    await saveDrawingForPage(page);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        $(this).val('');
        closeAllPanels();
    });

    // --- Lógica del Selector de Color ---
    $('#tool-color').on('click', () => $('#color-picker-container').slideToggle());
    
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
            cwCtx.beginPath(); cwCtx.moveTo(0, 0); cwCtx.arc(0, 0, wheelRadius, startAngle, endAngle); cwCtx.closePath();
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
        const t = lum < 50 ? lum / 50 : (lum - 50) / 50;
        r = lum < 50 ? lerp(0, r, t) : lerp(r, 255, t);
        g = lum < 50 ? lerp(0, g, t) : lerp(g, 255, t);
        b = lum < 50 ? lerp(0, b, t) : lerp(b, 255, t);
        currentColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        colorPreview.style.backgroundColor = currentColor;
        if (currentTool === 'text') document.execCommand('foreColor', false, currentColor);
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
    }).on('mouseup mouseleave', () => $(colorWheel).off('mousemove', pickColorFromWheel));
    
    $(luminositySlider).on('input', updateFinalColor);

    // --- Lógica de la Calculadora ---
    const calculator = $('#calculator');
    const calcDisplay = $('#calc-display');
    $('#calc-close').on('click', () => calculator.fadeOut());

    async function sendToPage(value) {
        if (value && value !== 'Error') {
            setActiveTool('text');
            const page = flipbook.turn('page');
            const textLayer = getTextLayerForPage(page);
            if (textLayer) {
                $(textLayer).focus();
                document.execCommand('insertText', false, ` ${value} `);
                await saveTextForPage(page);
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
        calcDisplay.val(calcDisplay.val() + (key !== undefined ? key : func));
    });

    $('#calc-clear').on('click', () => calcDisplay.val(''));
    $('#calc-backspace').on('click', () => calcDisplay.val(calcDisplay.val().slice(0, -1)));
    
    $('#calc-equals').on('click', () => {
        try {
            let expression = calcDisplay.val().replace(/\^/g, '**');
            const result = new Function('return ' + expression)();
            calcDisplay.val(result);
        } catch (e) { calcDisplay.val('Error'); }
    });

    // --- Manejadores de Eventos de la UI Principal ---
    $('#theme-toggle').on('click', () => {
        const newTheme = $('html').hasClass('dark') ? 'light' : 'dark';
        localStorage.setItem('runaTheme', newTheme);
        applyTheme(newTheme);
    });

    $('#menu-button, #mixer-toggle-button, #video-skin-toggle').on('click', function(e) {
        e.stopPropagation();
        const panelId = $(this).attr('id').replace('-button', '-panel').replace('toggle-', '');
        const wasOpen = !$(`#${panelId}`).hasClass('hidden');
        closeAllPanels();
        if (!wasOpen) $(`#${panelId}`).removeClass('hidden');
    });

    $(window).on('click', (e) => { if (!$(e.target).closest('#main-header').length) closeAllPanels(); });
    $('.menu-section-header').on('click', function() { $(this).toggleClass('active').next('.menu-section-content').slideToggle(); });
    
    $('#open-cart-button').on('click', () => { renderCartModal(); $('#cart-modal').removeClass('hidden'); });
    $('#cart-modal').on('click', (event) => { if (event.target === $('#cart-modal')[0]) $('#cart-modal').addClass('hidden'); });
    $('#close-auth-modal-button').on('click', () => $('#auth-modal').addClass('hidden'));
    
    $(window).on('resize', () => {
        flipbook.turn('size', $('.flipbook-container').width(), $('.flipbook-container').height());
        $('.flipbook .page').each(function() {
            const canvas = getCanvasForPage($(this).data('page-number'));
            if (canvas) {
                canvas.width = $(this).width();
                canvas.height = $(this).height();
                loadDrawingForPage($(this).data('page-number'));
            }
        });
    }).trigger('resize');

    // --- Inicializaciones Finales ---
    const pageTurnHint = $('#page-turn-hint');
    if (localStorage.getItem('runaHintSeen') !== 'true') {
        setTimeout(() => pageTurnHint.addClass('visible'), 1500);
        flipbook.one('turned', () => { pageTurnHint.removeClass('visible'); localStorage.setItem('runaHintSeen', 'true'); });
    }

    setActiveTool('no-tool');
    applyTheme(localStorage.getItem('runaTheme') || 'light');
    initializeMixer();
    initializeVideoSelector();
    setVideoSkin(parseInt(localStorage.getItem('runaVideoSkin')) || 0);
    $('#line-width-slider').css('--thumb-color', 'var(--pencil-track-color)').css('--track-fill-color', 'var(--pencil-track-color)');
    updateSliderFill($('#line-width-slider')[0]);
    drawColorWheel();
    colorPreview.style.backgroundColor = currentColor;
});
