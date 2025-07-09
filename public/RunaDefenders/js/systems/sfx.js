/*
* =================================================================
* ARCHIVO: js/systems/sfx.js
* =================================================================
* Propósito: Centraliza la creación y reproducción de todos los
* efectos de sonido del juego usando la librería Tone.js.
*/

// Este objeto contendrá todas las instancias de sintetizadores de Tone.js
const sounds = {};

// Inicializamos los sonidos una sola vez para no crearlos repetidamente.
export function initSounds() {
    sounds.shoot = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination();
    sounds.collect = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination();
    sounds.heal = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 } }).toDestination();
    sounds.baseHit = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.01, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination();
    sounds.enemyHit = new Tone.PolySynth(Tone.NoiseSynth, { noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination();
    sounds.gameOver = new Tone.PolySynth(Tone.Synth).toDestination();
    sounds.levelUp = new Tone.PolySynth(Tone.Synth).toDestination();
    sounds.waveWarning = new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 5, envelope: { attack: 0.01, decay: 0.5, sustain: 0.01, release: 0.8 } }).toDestination();
    sounds.powerUp = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 10, detune: 0, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }, modulation: { type: "square" }, modulationEnvelope: { attack: 0.1, decay: 0.1, sustain: 0.3, release: 0.5 } }).toDestination();
    sounds.powerDown = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, detune: 0, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, modulation: { type: "sawtooth" }, modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0, release: 0.5 } }).toDestination();
}

// Función para reproducir un sonido
export function playSound(sound, note, duration = '8n') {
    if (Tone.context.state !== 'running') return;
    if (sounds[sound]) {
        sounds[sound].triggerAttackRelease(note, duration);
    }
}

// Llama a la inicialización para que los sonidos estén listos.
initSounds();
