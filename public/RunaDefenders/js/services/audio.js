// js/services/audio.js

// Asegúrate de haber importado Tone.js en tu index.html
// <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>

let isAudioReady = false;

// --- Definición de los Sintetizadores para cada Sonido ---
const sounds = {
    shoot: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
    collect: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
    heal: new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 } }).toDestination(),
    baseHit: new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.01, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination(),
    enemyHit: new Tone.PolySynth(Tone.NoiseSynth, { noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination(),
    gameOver: new Tone.PolySynth(Tone.Synth).toDestination(),
    levelUp: new Tone.PolySynth(Tone.Synth).toDestination(),
    waveWarning: new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 5, envelope: { attack: 0.01, decay: 0.5, sustain: 0.01, release: 0.8 } }).toDestination(),
    powerUp: new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 10, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 } }).toDestination(),
    powerDown: new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 } }).toDestination()
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
 * Reproduce un sonido específico.
 * @param {string} soundName - El nombre del sonido a reproducir (ej. 'shoot', 'collect').
 * @param {string} note - La nota musical (ej. 'C5').
 * @param {string} [duration='8n'] - La duración de la nota.
 */
export function playSound(soundName, note, duration = '8n') {
    if (!isAudioReady || !sounds[soundName]) return;
    try {
        sounds[soundName].triggerAttackRelease(note, duration);
    } catch (e) {
        console.error(`Error playing sound: ${soundName}`, e);
    }
}
