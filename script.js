document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Navigation
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sideNav = document.getElementById('side-nav');
    const closeNavBtn = document.getElementById('close-nav-btn');
    const openAssistantBtn = document.getElementById('open-assistant-btn');

    // Modal
    const assistantModal = document.getElementById('assistant-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Assistant Interface
    const micButton = document.getElementById('mic-button');
    const transcriptionOutput = document.getElementById('transcription-output');
    const assistantResponse = document.getElementById('assistant-response');

    // Views
    const views = {
        home: document.getElementById('view-home'),
        book: document.getElementById('view-book'),
        game: document.getElementById('view-game'),
        equalizer: document.getElementById('view-equalizer'),
        whatsapp: document.getElementById('view-whatsapp')
    };

    // --- Navigation Logic ---
    hamburgerMenu.addEventListener('click', () => {
        sideNav.style.width = '250px';
    });

    closeNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sideNav.style.width = '0';
    });

    // --- Modal Logic ---
    openAssistantBtn.addEventListener('click', (e) => {
        e.preventDefault();
        assistantModal.style.display = 'block';
        sideNav.style.width = '0'; // Close nav when modal opens
    });

    closeModalBtn.addEventListener('click', () => {
        assistantModal.style.display = 'none';
    });

    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target == assistantModal) {
            assistantModal.style.display = 'none';
        }
    });

    // --- Web Speech API Logic ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micButton.disabled = true;
        transcriptionOutput.textContent = "Lo siento, tu navegador no soporta el reconocimiento de voz.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isRecording = false;

    micButton.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
            return;
        }
        recognition.start();
    });

    recognition.onstart = () => {
        isRecording = true;
        micButton.classList.add('recording');
        micButton.textContent = '...';
        transcriptionOutput.textContent = 'Escuchando...';
        assistantResponse.textContent = '';
    };

    recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove('recording');
        micButton.textContent = '🎤';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptionOutput.textContent = `Tú dijiste: "${transcript}"`;
        handleCommand(transcript);
    };

    recognition.onerror = (event) => {
        transcriptionOutput.textContent = 'Error en el reconocimiento: ' + event.error;
    };

    // --- Assistant Command Handling ---
    function showView(viewName) {
        for (const key in views) {
            views[key].style.display = 'none';
            views[key].classList.remove('active');
        }
        if (views[viewName]) {
            views[viewName].style.display = 'block';
            views[viewName].classList.add('active');
        }
    }

    function handleCommand(command) {
        const lowerCaseCommand = command.toLowerCase();
        let response = "No entendí ese comando. Prueba preguntando '¿qué puedes hacer?'.";

        // Knowledge Commands FIRST, as they are more specific
        if (lowerCaseCommand.includes('de qué trata el libro')) {
            response = "El libro trata sobre inteligencia artificial y aprendizaje automático. ¿Quieres que te lleve a esa sección?";
        } else if (lowerCaseCommand.includes('cómo se juega') || lowerCaseCommand.includes('aventura espacial')) {
            response = "Aventura Espacial es un juego de exploración galáctica. ¿Quieres ir a la sección del juego?";
        } else if (lowerCaseCommand.includes('para qué sirve el ecualizador')) {
            response = "Sirve para ajustar las frecuencias de audio. ¿Te gustaría verlo?";
        } else if (lowerCaseCommand.includes('qué puedes hacer')) {
            response = "Puedo llevarte a las secciones de Libro, Juego, Ecualizador y WhatsApp. También puedo contarte de qué trata cada una. ¿Qué te gustaría hacer?";
        }

        // Navigation Commands SECOND, as they are more general
        else if (lowerCaseCommand.includes('libro')) {
            showView('book');
            response = "Claro, aquí tienes la sección del libro.";
        } else if (lowerCaseCommand.includes('juego')) {
            showView('game');
            response = "Entendido, abriendo la sección del juego.";
        } else if (lowerCaseCommand.includes('ecualizador')) {
            showView('equalizer');
            response = "Perfecto, aquí está el ecualizador.";
        } else if (lowerCaseCommand.includes('whatsapp')) {
            showView('whatsapp');
            response = "Abriendo la sección de WhatsApp.";
        } else if (lowerCaseCommand.includes('inicio') || lowerCaseCommand.includes('casa')) {
            showView('home');
            response = "Volviendo a la página principal.";
        }

        assistantResponse.textContent = `Aria: ${response}`;
    }

    // Initialize
    showView('home');
});
