// js/services/audio.js

// Asegúrate de tener Tone.js importado en tu HTML principal.

/**
 * Contiene todas las instancias de sintetizadores y reproductores de audio del juego.
 * La música de fondo se inicializa en null y se carga dinámicamente.
 */
export const sounds = {
    shoot: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
    collect: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
    heal: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 } }).toDestination(),
    baseHit: new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.01, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination(),
    enemyHit: new Tone.PolySynth(Tone.NoiseSynth, { noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination(),
    gameOver: new Tone.PolySynth(Tone.Synth).toDestination(),
    levelUp: new Tone.PolySynth(Tone.Synth).toDestination(),
    waveWarning: new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 5, envelope: { attack: 0.01, decay: 0.5, sustain: 0.01, release: 0.8 } }).toDestination(),
    powerUp: new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 10, detune: 0, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }, modulation: { type: "square" }, modulationEnvelope: { attack: 0.1, decay: 0.1, sustain: 0.3, release: 0.5 } }).toDestination(),
    powerDown: new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, detune: 0, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, modulation: { type: "sawtooth" }, modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0, release: 0.5 } }).toDestination(),
    
    // La música se cargará aquí después de la inicialización.
    backgroundMusic: null 
};

/**
 * Inicia el contexto de audio del navegador. Debe ser llamado por una interacción del usuario.
 */
export async function startAudioContext() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("Audio context started successfully.");
    }
}

/**
 * Carga el archivo de música de fondo. Devuelve una promesa que se resuelve cuando la música está lista.
 * @param {string} url - La URL del archivo de música.
 */
export function loadMusic(url) {
    return new Promise((resolve, reject) => {
        const musicPlayer = new Tone.Player({
            url: url,
            loop: true,
            volume: -12,
            onload: () => {
                console.log("Music loaded successfully!");
                sounds.backgroundMusic = musicPlayer.toDestination();
                resolve(); // Resuelve la promesa cuando el archivo está cargado
            },
            onerror: (error) => {
                console.error("Error loading music:", error);
                reject(error); // Rechaza la promesa si hay un error
            }
        });
    });
}

/**
 * Reproduce la música de fondo si está cargada.
 */
export function playMusic() {
    if (sounds.backgroundMusic && sounds.backgroundMusic.loaded && sounds.backgroundMusic.state !== 'started') {
        sounds.backgroundMusic.start();
    }
}

/**
 * Detiene la música de fondo si se está reproduciendo.
 */
export function stopMusic() {
    if (sounds.backgroundMusic && sounds.backgroundMusic.state === 'started') {
        sounds.backgroundMusic.stop();
    }
}

/**
 * Reproduce un efecto de sonido.
 */
export function playSound(sound, note, duration = '8n') {
    if (Tone.context.state !== 'running' || !sounds[sound]) return;
    sounds[sound].triggerAttackRelease(note, duration);
}
