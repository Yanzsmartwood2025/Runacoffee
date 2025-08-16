// js/services/audio.js

// Asegúrate de haber importado Tone.js en tu index.html
// <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>

let isAudioReady = false;
let musicPlayer; // Variable para nuestro reproductor de música de fondo

// Objeto para los efectos de sonido (SFX)
const sfxPlayers = {
    shoot: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
    collect: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
    enemyHit: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination(),
    baseHit: new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.01, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination(),
    // Puedes añadir más efectos de sonido aquí
};

/**
 * Inicia el contexto de audio. Debe ser llamado por una interacción del usuario.
 */
export async function startAudioContext() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Audio context started successfully.');
    }
    isAudioReady = true;
}

/**
 * Reproduce un EFECTO DE SONIDO específico.
 * @param {string} soundName - El nombre del sonido a reproducir (ej. 'shoot').
 * @param {string} note - La nota musical (ej. 'C5').
 * @param {string} [duration='8n'] - La duración de la nota.
 */
export function playSound(soundName, note, duration = '8n') {
    if (!isAudioReady || !sfxPlayers[soundName]) return;
    try {
        // Usamos un PolySynth temporal para evitar que los sonidos se corten entre sí
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        synth.set(sfxPlayers[soundName].get());
        synth.triggerAttackRelease(note, duration);
    } catch (e) {
        console.error(`Error playing sound: ${soundName}`, e);
    }
}

// --- FUNCIONES PARA MÚSICA DE FONDO ---

/**
 * Carga la música de fondo desde una URL.
 * @param {string} url - La URL del archivo de música.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la música está cargada.
 */
export function loadMusic(url) {
    return new Promise((resolve, reject) => {
        musicPlayer = new Tone.Player({
            url: url,
            loop: true,
            autostart: false,
            onload: () => {
                console.log("Música de fondo cargada exitosamente.");
                resolve();
            },
            onerror: (err) => {
                console.error("Error al cargar la música de fondo:", err);
                reject(err);
            }
        }).toDestination();
    });
}

/**
 * Reproduce la música de fondo que ya fue cargada.
 */
export function playMusic() {
    if (isAudioReady && musicPlayer && musicPlayer.loaded && musicPlayer.state !== 'started') {
        musicPlayer.start();
        console.log("Reproduciendo música de fondo.");
    }
}

/**
 * Detiene la música de fondo.
 */
export function stopMusic() {
    if (musicPlayer && musicPlayer.state === 'started') {
        musicPlayer.stop();
        console.log("Música de fondo detenida.");
    }
}
