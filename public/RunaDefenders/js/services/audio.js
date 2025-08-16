// js/services/audio.js

// Asegúrate de tener Tone.js importado en tu HTML principal.

/**
 * Contiene todas las instancias de sintetizadores y reproductores de audio del juego.
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
    
    // --- NUEVO: Música de fondo para el nivel 1 ---
    backgroundMusic: new Tone.Player({
        url: "https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/main/public/RunaDefenders/assets/audio/music/nivel1_musica.mp3",
        loop: true,
        volume: -12 // Volumen más bajo para que no moleste
    }).toDestination()
};

/**
 * Reproduce un efecto de sonido.
 * @param {string} sound - El nombre del sonido a reproducir (debe ser una clave en el objeto 'sounds').
 * @param {string} note - La nota musical a tocar (ej. 'C4').
 * @param {string} [duration='8n'] - La duración de la nota.
 */
export function playSound(sound, note, duration = '8n') {
    if (Tone.context.state !== 'running') return;
    if (sounds[sound]) {
        sounds[sound].triggerAttackRelease(note, duration);
    }
}

/**
 * Detiene la música de fondo si se está reproduciendo.
 */
export function stopMusic() {
    if (sounds.backgroundMusic.state === 'started') {
        sounds.backgroundMusic.stop();
    }
}
