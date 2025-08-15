// js/config.js

/**
 * Exporta el objeto de configuración principal del juego.
 * Contiene todos los parámetros ajustables como velocidades, salud,
 * configuración de niveles, rutas de imágenes, etc.
 */
export const config = {
    // --- Parámetros Generales del Juego ---
    lanes: 4,
    playerSpeed: 5,
    projectileSpeed: 8,
    shootCooldown: 40, // En frames
    fastShootCooldown: 15, // En frames

    // --- Poder Especial ---
    specialPowerMax: 100,
    powerDrainRate: 20, // Puntos por segundo

    // --- Recursos y Coleccionables ---
    orbValue: 10, // Puntos de poder por orbe
    healingValue: 25, // Salud recuperada por grano de café

    // --- Base (El Árbol) ---
    base: {
        health: 1000,
        maxHealth: 1000
    },

    // --- Rutas de Assets (Imágenes) ---
    grainImage: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/collectible_coffee_bean.png',
    orbImage: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/collectible_power_orb.png',

    // --- Configuración del Jugador ---
    player: {
        image: {
            idle: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/player.png',
            attack: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/player.png'
        },
        projectileImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI2Q0NzUwMCIvPjwvc3ZnPg=='
    },

    // --- Tipos de Enemigos ---
    enemies: [
        { name: 'Broca Débil', health: 20, speed: 0.5, grainChance: 0.8, orbChance: 0.1, image: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/enemy_broca_1.png' },
        { name: 'Broca Normal', health: 60, speed: 0.4, grainChance: 0.5, orbChance: 0.2, image: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/enemy_broca_2.png' },
        { name: 'Broca Fuerte', health: 300, speed: 0.3, grainChance: 0.2, orbChance: 0.5, image: 'https://raw.githubusercontent.com/Yanzsmartwood2025/Runacoffee/83b2c2b337c8d090db5bc039cacfd59228f2747a/public/assets/imagenes/enemy_broca_3.png' },
    ],

    // --- Definición de Niveles y Oleadas ---
    levels: [
        // Nivel 1
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 240 }, { startTime: 40, enemyType: 0, spawnInterval: 180 }, { startTime: 90, enemyType: 0, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 100 } ]},
        // Nivel 2
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 180 }, { startTime: 30, enemyType: 1, spawnInterval: 480 }, { startTime: 70, enemyType: 0, spawnInterval: 120 }, { startTime: 120, enemyType: 1, spawnInterval: 300 } ]},
        // Nivel 3
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 120 }, { startTime: 20, enemyType: 1, spawnInterval: 300 }, { startTime: 60, enemyType: 0, spawnInterval: 90 }, { startTime: 100, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 1, spawnInterval: 180 } ]},
        // Nivel 4
        { duration: 300, waves: [ { startTime: 10, enemyType: 0, spawnInterval: 150 }, { startTime: 40, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 0, spawnInterval: 100 }, { startTime: 180, enemyType: 1, spawnInterval: 180 }, { startTime: 240, enemyType: 1, spawnInterval: 150 } ]},
        // Nivel 5
        { duration: 300, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 240 }, { startTime: 50, enemyType: 0, spawnInterval: 100 }, { startTime: 120, enemyType: 1, spawnInterval: 180 }, { startTime: 180, enemyType: 2, spawnInterval: 900 }, { startTime: 240, enemyType: 1, spawnInterval: 120 } ]},
        // Nivel 6
        { duration: 300, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 180 }, { startTime: 45, enemyType: 1, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 60 }, { startTime: 180, enemyType: 2, spawnInterval: 600 }, { startTime: 240, enemyType: 1, spawnInterval: 100 } ]},
        // Nivel 7
        { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 150 }, { startTime: 60, enemyType: 0, spawnInterval: 80 }, { startTime: 180, enemyType: 1, spawnInterval: 120 }, { startTime: 240, enemyType: 2, spawnInterval: 600 }, { startTime: 300, enemyType: 1, spawnInterval: 100 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]},
        // Nivel 8
        { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 120 }, { startTime: 50, enemyType: 2, spawnInterval: 720 }, { startTime: 180, enemyType: 1, spawnInterval: 100 }, { startTime: 240, enemyType: 0, spawnInterval: 40 }, { startTime: 300, enemyType: 1, spawnInterval: 80 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]},
        // Nivel 9
        { duration: 420, waves: [ { startTime: 5, enemyType: 2, spawnInterval: 600 }, { startTime: 30, enemyType: 1, spawnInterval: 90 }, { startTime: 180, enemyType: 0, spawnInterval: 30 }, { startTime: 240, enemyType: 1, spawnInterval: 60 }, { startTime: 300, enemyType: 2, spawnInterval: 400 }, { startTime: 360, enemyType: 1, spawnInterval: 50 } ]},
        // Nivel 10
        { duration: 420, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 60 }, { startTime: 45, enemyType: 2, spawnInterval: 480 }, { startTime: 180, enemyType: 1, spawnInterval: 50 }, { startTime: 240, enemyType: 2, spawnInterval: 300 }, { startTime: 300, enemyType: 1, spawnInterval: 40 }, { startTime: 360, enemyType: 2, spawnInterval: 180 } ]}
    ]
};
