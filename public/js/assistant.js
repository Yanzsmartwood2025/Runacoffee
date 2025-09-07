document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const openAssistantBtn = document.getElementById('open-assistant-btn');
    const assistantModal = document.getElementById('assistant-modal');
    const closeModalBtn = document.getElementById('close-assistant-modal-btn');
    const micButton = document.getElementById('mic-button');
    const transcriptionOutput = document.getElementById('transcription-output');
    const assistantResponse = document.getElementById('assistant-response');

    if (!openAssistantBtn || !assistantModal || !closeModalBtn || !micButton) {
        console.error("Assistant DOM elements not found. Aborting initialization.");
        return;
    }

    // --- Modal Logic ---
    const openModal = () => assistantModal.classList.remove('hidden');
    const closeModal = () => assistantModal.classList.add('hidden');

    openAssistantBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
        // Also close the main mobile menu if it's open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });
    closeModalBtn.addEventListener('click', closeModal);
    assistantModal.addEventListener('click', (event) => {
        if (event.target === assistantModal) {
            closeModal();
        }
    });

    // --- Web Speech API Logic ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micButton.disabled = true;
        assistantResponse.textContent = "Aria: Lo siento, tu navegador no soporta el reconocimiento de voz.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO'; // Spanish (Colombia)
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
        micButton.innerHTML = '...';
        transcriptionOutput.textContent = 'Escuchando...';
        assistantResponse.textContent = 'Aria: ...';
    };

    recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove('recording');
        micButton.innerHTML = '🎤';
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
        const lowerCaseCommand = command.toLowerCase().trim();
        let response = "No entendí ese comando. Prueba preguntando '¿qué puedes hacer?'.";
        let actionTaken = false;

        // --- Navigation Commands ---
        const navigationCommands = {
            'libro de origen': '#runa-book-interactive',
            'nuestra historia': '#runa-book-interactive',
            'experiencia 3d': '#experiencia-3d',
            'árbol 3d': '#experiencia-3d',
            'catálogo': '#catalogo',
            'nuestro café': '#catalogo',
            'contacto': '#contacto'
        };

        for (const [keyword, selector] of Object.entries(navigationCommands)) {
            if (lowerCaseCommand.includes(keyword)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    response = `Claro, llevándote a la sección ${keyword}.`;
                    actionTaken = true;
                    break;
                }
            }
        }

        if (actionTaken) {
            assistantResponse.textContent = `Aria: ${response}`;
            closeModal();
            return;
        }

        // --- External Page Navigation ---
        if (lowerCaseCommand.includes('juego') || lowerCaseCommand.includes('defenders')) {
            response = "Entendido, abriendo el juego Runa Defenders en una nueva pestaña.";
            window.open('/RunaDefenders/index.html', '_blank');
            actionTaken = true;
        } else if (lowerCaseCommand.includes('abrir el libro') || lowerCaseCommand.includes('leer el libro')) {
            response = "Perfecto, abriendo la experiencia completa del libro en una nueva pestaña.";
            window.open('/runa-libro/index.html', '_blank');
            actionTaken = true;
        }

        if (actionTaken) {
            assistantResponse.textContent = `Aria: ${response}`;
            closeModal();
            return;
        }

        // --- Knowledge & Q&A Commands ---
        const qaCommands = {
            'black caturra': "El Black Caturra es un café de proceso Black Honey, con notas intensas a frutos rojos, miel y caramelo. Se le añaden hongos funcionales para mejorar la concentración y el ánimo.",
            'blend geisha': "Es una fusión del Black Caturra con Geisha Natural. Tiene un perfil floral y complejo, con notas de jazmín, lavanda, melocotón y mandarina. Es una experiencia de taza muy elegante.",
            'qué puedes hacer': "Puedo llevarte a las secciones de la página, como 'catálogo' o 'experiencia 3D'. También puedo abrir el 'juego' o el 'libro' en otra pestaña, y responder preguntas sobre los tipos de café.",
            'hola aria': "¡Hola! ¿En qué puedo ayudarte hoy?",
            'gracias': "¡De nada! Estoy aquí para ayudarte."
        };

        for (const [keyword, answer] of Object.entries(qaCommands)) {
            if (lowerCaseCommand.includes(keyword)) {
                response = answer;
                actionTaken = true;
                break;
            }
        }

        assistantResponse.textContent = `Aria: ${response}`;
    };
});
