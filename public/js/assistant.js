document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const openAssistantBtn = document.getElementById('open-assistant-btn'); // Mobile button
    const desktopAssistantBtn = document.getElementById('desktop-assistant-button'); // Desktop button
    const assistantBanner = document.getElementById('assistant-banner');
    const closeAssistantBtn = document.getElementById('close-assistant-modal-btn');
    const micButton = document.getElementById('mic-button');
    const transcriptionOutput = document.getElementById('transcription-output');
    const assistantResponse = document.getElementById('assistant-response');

    if (!assistantBanner || !closeAssistantBtn || !micButton) {
        console.error("Assistant banner elements not found. Aborting initialization.");
        return;
    }

    // --- Banner Logic (Simplified Tailwind Toggle) ---
    const openBanner = () => {
        if (!assistantBanner) return;
        assistantBanner.classList.remove('opacity-0', 'translate-y-full', 'pointer-events-none');
    };

    const closeBanner = () => {
        if (!assistantBanner) return;
        assistantBanner.classList.add('opacity-0', 'translate-y-full', 'pointer-events-none');
    };

    // --- Event Listeners ---
    if (openAssistantBtn) {
        openAssistantBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openBanner();
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) mobileMenu.classList.add('hidden');
        });
    }
    if (desktopAssistantBtn) {
        desktopAssistantBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openBanner();
        });
    }
    closeAssistantBtn.addEventListener('click', closeBanner);

    // --- Web Speech API Logic ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micButton.disabled = true;
        assistantResponse.textContent = "Aria: Lo siento, tu navegador no soporta el reconocimiento de voz.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isRecording = false;

    micButton.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        isRecording = true;
        micButton.classList.add('recording');
        micButton.innerHTML = '';
        transcriptionOutput.textContent = 'Escuchando...';
        assistantResponse.textContent = 'Aria: ...';
    };

    recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove('recording');
        micButton.innerHTML = '';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptionOutput.textContent = `Tú dijiste: "${transcript}"`;
        handleCommand(transcript);
    };

    recognition.onerror = (event) => {
        assistantResponse.textContent = 'Aria: Error en el reconocimiento: ' + event.error;
    };

    // --- Assistant Command Handling ---
    const handleCommand = (command) => {
        const text = command.toLowerCase().trim();
        let response = "No entendí ese comando. Prueba preguntando '¿qué puedes hacer?'.";
        let actionTaken = false;
        let shouldCloseBanner = false;

        const qaCommands = {
            'qué puedes hacer': "Puedo llevarte a las secciones de la página como 'catálogo' o 'experiencia 3D'. También puedo abrir el 'juego' o el 'libro' en otra pestaña, y responder preguntas sobre los tipos de café.",
            'de qué trata el black caturra': "El Black Caturra es un café de proceso Black Honey, con notas intensas a frutos rojos, miel y caramelo.",
            'de qué trata el blend geisha': "Es una fusión del Black Caturra con Geisha Natural. Tiene un perfil floral y complejo, con notas de jazmín, lavanda, melocotón y mandarina.",
            'hola': "¡Hola! ¿En qué puedo ayudarte hoy?",
            'gracias': "¡De nada! Estoy aquí para ayudarte."
        };

        for (const [keyword, answer] of Object.entries(qaCommands)) {
            if (text.includes(keyword)) {
                response = answer;
                actionTaken = true;
                assistantResponse.textContent = `Aria: ${response}`;
                return;
            }
        }

        const externalNavCommands = {
            'juego': ['juego', 'defenders'],
            'libro': ['abrir libro', 'leer libro', 'muéstrame el libro completo']
        };

        if (externalNavCommands.juego.some(term => text.includes(term))) {
            response = "Entendido, abriendo el juego Runa Defenders en una nueva pestaña.";
            window.open('/RunaDefenders/index.html', '_blank');
            actionTaken = true;
            shouldCloseBanner = true;
        } else if (externalNavCommands.libro.some(term => text.includes(term))) {
            response = "Perfecto, abriendo la experiencia completa del libro en una nueva pestaña.";
            window.open('/runa-libro/index.html', '_blank');
            actionTaken = true;
            shouldCloseBanner = true;
        }

        if (actionTaken) {
            assistantResponse.textContent = `Aria: ${response}`;
            if (shouldCloseBanner) closeBanner();
            return;
        }

        const internalNavCommands = {
            '#runa-book-interactive': ['libro de origen', 'nuestra historia', 'libro 3d'],
            '#experiencia-3d': ['experiencia 3d', 'árbol 3d', 'ver el árbol'],
            '#catalogo': ['catálogo', 'nuestro café', 'ver los productos'],
            '#contacto': ['contacto', 'contactarnos']
        };

        for (const [selector, keywords] of Object.entries(internalNavCommands)) {
            if (keywords.some(term => text.includes(term))) {
                const element = document.querySelector(selector);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    response = `Claro, llevándote a la sección correspondiente.`;
                    actionTaken = true;
                    shouldCloseBanner = true;
                    break;
                }
            }
        }

        if (!actionTaken && text.includes('libro')) {
            document.querySelector('#runa-book-interactive').scrollIntoView({ behavior: 'smooth', block: 'start' });
            response = `Claro, te llevo a la sección del libro en esta página. También puedes pedirme que 'abra el libro completo'.`;
            actionTaken = true;
            shouldCloseBanner = true;
        }

        assistantResponse.textContent = `Aria: ${response}`;
        if (actionTaken && shouldCloseBanner) {
            closeBanner();
        }
    };
});
