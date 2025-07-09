/*
* =================================================================
* ARCHIVO: RunaDefenders/js/systems/sfx.js
* =================================================================
* Propósito: Gestiona toda la música y los efectos de sonido del juego.
*/

// Objeto que contiene todas las instancias de sintetizadores de Tone.js
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
    powerDown: new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, detune: 0, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, modulation: { type: "sawtooth" }, modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0, release: 0.5 } }).toDestination()
};

// Función principal para reproducir un sonido
export function playSound(sound, note, duration = '8n') {
    // Comprueba si el contexto de audio ha sido iniciado por el usuario
    if (Tone.context.state !== 'running') return;
    
    if (sounds[sound]) {
        sounds[sound].triggerAttackRelease(note, duration);
    }
}

