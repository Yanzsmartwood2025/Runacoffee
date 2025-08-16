import { config } from './config.js';

let musicPlayer;

export function loadMusic(url) {
    console.log("Loading music...");
    return new Promise((resolve, reject) => {
        musicPlayer = new Tone.Player({
            url: url,
            loop: true,
            autostart: false,
            onload: () => {
                console.log("Music loaded successfully");
                resolve();
            },
            onerror: (error) => {
                console.error("Error loading music:", error);
                reject(error);
            }
        }).toDestination();
    });
}

export function playMusic() {
    if (musicPlayer && musicPlayer.loaded) {
        console.log("Playing music");
        musicPlayer.start();
    }
}

export function stopMusic() {
    if (musicPlayer) {
        console.log("Stopping music");
        musicPlayer.stop();
    }
}

// Existing sound functions
const sounds = {
    shoot: new Tone.Synth().toDestination(),
    enemyHit: new Tone.Synth().toDestination(),
    baseHit: new Tone.Synth().toDestination(),
    collect: new Tone.Synth().toDestination(),
    powerUp: new Tone.Synth().toDestination()
};

export function playSound(sound, note, duration = '8n') {
    if (typeof Tone !== 'undefined' && Tone.context.state === 'running' && sounds[sound]) {
        sounds[sound].triggerAttackRelease(note, duration);
    }
}

export async function startAudioContext() {
    if (Tone.context.state !== 'running') {
        try {
            await Tone.start();
            console.log("Audio context started successfully");
        } catch (error) {
            console.error("Could not start audio context:", error);
        }
    }
}
