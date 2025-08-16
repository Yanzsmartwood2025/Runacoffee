// js/services/audio.js

let isAudioReady = false;
let musicPlayer;

const sfxPlayers = {
    shoot: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }).toDestination(),
    collect: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
    enemyHit: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination(),
    baseHit: new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.01, decay: 0.3, sustain: 0.01, release: 0.4 } }).toDestination(),
};

export async function startAudioContext() {
    if (Tone.context.state === 'running') {
        isAudioReady = true;
        return;
    }
    try {
        await Tone.start();
        console.log('Audio context started successfully by user interaction.');
        isAudioReady = true;
    } catch (e) {
        console.error('Could not start audio context:', e);
        isAudioReady = false;
    }
}

export function playSound(soundName, note, duration = '8n') {
    if (!isAudioReady || !sfxPlayers[soundName]) {
        console.warn(`Cannot play sound "${soundName}". Audio not ready or sound not found.`);
        return;
    }
    try {
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        synth.set(sfxPlayers[soundName].get());
        synth.triggerAttackRelease(note, duration);
    } catch (e) {
        console.error(`Error playing sound: ${soundName}`, e);
    }
}

export function loadMusic(url) {
    return new Promise((resolve, reject) => {
        musicPlayer = new Tone.Player({
            url: url,
            loop: true,
            autostart: false,
            onload: () => {
                console.log("Music file loaded successfully.");
                resolve();
            },
            onerror: (err) => {
                console.error("ERROR: Failed to load music file. Check URL and CORS policy.", err);
                reject(err);
            }
        }).toDestination();
    });
}

export function playMusic() {
    if (!isAudioReady) {
        console.warn("Cannot play music: Audio context not ready. Waiting for user interaction.");
        return;
    }
    if (!musicPlayer || !musicPlayer.loaded) {
        console.warn("Cannot play music: Music player is not loaded yet.");
        return;
    }
    if (musicPlayer.state === 'started') {
        console.log("Music is already playing.");
        return;
    }
    musicPlayer.start();
    console.log("Music playback started.");
}

export function stopMusic() {
    if (musicPlayer && musicPlayer.state === 'started') {
        musicPlayer.stop();
        console.log("Music playback stopped.");
    }
}
