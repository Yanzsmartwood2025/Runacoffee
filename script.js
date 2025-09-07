document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('mic-button');
    const transcriptionOutput = document.getElementById('transcription-output');
    const assistantResponse = document.getElementById('assistant-response');

    // Comprobar si el navegador soporta la Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micButton.disabled = true;
        transcriptionOutput.textContent = "Lo siento, tu navegador no soporta el reconocimiento de voz.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Establecer el idioma a español
    recognition.interimResults = false; // No queremos resultados provisionales
    recognition.maxAlternatives = 1; // Solo la mejor transcripción

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
        // Aquí llamaremos a la lógica del asistente en el futuro
        handleCommand(transcript);
    };

    recognition.onerror = (event) => {
        transcriptionOutput.textContent = 'Error en el reconocimiento: ' + event.error;
    };

    // --- Lógica de navegación y manejo de comandos (Pasos 3 y 4) ---
    // La dejaremos lista para los siguientes pasos

    const views = {
        home: document.getElementById('view-home'),
        book: document.getElementById('view-book'),
        game: document.getElementById('view-game'),
        equalizer: document.getElementById('view-equalizer'),
        whatsapp: document.getElementById('view-whatsapp')
    };

    const navButtons = {
        book: document.getElementById('nav-book'),
        game: document.getElementById('nav-game'),
        equalizer: document.getElementById('nav-equalizer'),
        whatsapp: document.getElementById('nav-whatsapp')
    };

    function showView(viewName) {
        // Ocultar todas las vistas
        for (const key in views) {
            views[key].style.display = 'none';
        }
        // Mostrar la vista solicitada
        if (views[viewName]) {
            views[viewName].style.display = 'block';
        }
    }

    // Navegación con botones
    navButtons.book.addEventListener('click', () => showView('book'));
    navButtons.game.addEventListener('click', () => showView('game'));
    navButtons.equalizer.addEventListener('click', () => showView('equalizer'));
    navButtons.whatsapp.addEventListener('click', () => showView('whatsapp'));


    // Función para manejar los comandos de voz (Paso 3)
    function handleCommand(command) {
        const lowerCaseCommand = command.toLowerCase();
        let response = "No entendí ese comando. Intenta de nuevo.";

        if (lowerCaseCommand.includes('libro')) {
            showView('book');
            response = "Claro, te llevo a la sección del libro.";
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

        assistantResponse.textContent = `Asistente: ${response}`;
    }

    // Iniciar en la vista de home
    showView('home');
});
