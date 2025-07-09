/*
* =================================================================
* ARCHIVO: js/config.js
* =================================================================
* Propósito: Contiene toda la configuración estática del juego.
* Valores, velocidades, imágenes, datos de niveles, etc.
* Esto facilita ajustar el balance del juego sin tocar la lógica.
*/

export const config = {
    lanes: 4, 
    playerSpeed: 5, 
    projectileSpeed: 8, 
    shootCooldown: 40,
    fastShootCooldown: 15,
    specialPowerMax: 100, 
    powerDrainRate: 20,
    orbValue: 10, 
    healingValue: 25,
    base: { health: 1000 },
    // --- RUTAS DE IMAGEN CORREGIDAS (sin ../) ---
    grainImage: 'imagenes/collectible_coffee_bean.png',
    orbImage: 'imagenes/collectible_power_orb.png',
    player: {
        image: { 
            idle: 'imagenes/player.png',
            attack: 'imagenes/player.png'
        },
        projectileImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI2Q0NzUwMCIvPjwvc3ZnPg=='
    },
    enemies: [
        { name: 'Broca Débil', health: 20, speed: 0.5, grainChance: 0.8, orbChance: 0.1, image: 'imagenes/enemy_broca_1.png' },
        { name: 'Broca Normal', health: 60, speed: 0.4, grainChance: 0.5, orbChance: 0.2, image: 'imagenes/enemy_broca_2.png' },
        { name: 'Broca Fuerte', health: 300, speed: 0.3, grainChance: 0.2, orbChance: 0.5, image: 'imagenes/enemy_broca_3.png' },
    ],
    levels: [
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 240 }, { startTime: 40, enemyType: 0, spawnInterval: 180 }, { startTime: 90, enemyType: 0, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 100 } ]},
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 180 }, { startTime: 30, enemyType: 1, spawnInterval: 480 }, { startTime: 70, enemyType: 0, spawnInterval: 120 }, { startTime: 120, enemyType: 1, spawnInterval: 300 } ]},
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 120 }, { startTime: 20, enemyType: 1, spawnInterval: 300 }, { startTime: 60, enemyType: 0, spawnInterval: 90 }, { startTime: 100, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 1, spawnInterval: 180 } ]},
        { duration: 300, waves: [ { startTime: 10, enemyType: 0, spawnInterval: 150 }, { startTime: 40, enemyType: 1, spawnInterval: 240 }, { startTime: 120, enemyType: 0, spawnInterval: 100 }, { startTime: 180, enemyType: 1, spawnInterval: 180 }, { startTime: 240, enemyType: 1, spawnInterval: 150 } ]},
        { duration: 300, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 240 }, { startTime: 50, enemyType: 0, spawnInterval: 100 }, { startTime: 120, enemyType: 1, spawnInterval: 180 }, { startTime: 180, enemyType: 2, spawnInterval: 900 }, { startTime: 240, enemyType: 1, spawnInterval: 120 } ]},
        { duration: 300, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 180 }, { startTime: 45, enemyType: 1, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 60 }, { startTime: 180, enemyType: 2, spawnInterval: 600 }, { startTime: 240, enemyType: 1, spawnInterval: 100 } ]},
        { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 150 }, { startTime: 60, enemyType: 0, spawnInterval: 80 }, { startTime: 180, enemyType: 1, spawnInterval: 120 }, { startTime: 240, enemyType: 2, spawnInterval: 600 }, { startTime: 300, enemyType: 1, spawnInterval: 100 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]},
        { duration: 420, waves: [ { startTime: 10, enemyType: 1, spawnInterval: 120 }, { startTime: 50, enemyType: 2, spawnInterval: 720 }, { startTime: 180, enemyType: 1, spawnInterval: 100 }, { startTime: 240, enemyType: 0, spawnInterval: 40 }, { startTime: 300, enemyType: 1, spawnInterval: 80 }, { startTime: 360, enemyType: 2, spawnInterval: 480 } ]},
        { duration: 420, waves: [ { startTime: 5, enemyType: 2, spawnInterval: 600 }, { startTime: 30, enemyType: 1, spawnInterval: 90 }, { startTime: 180, enemyType: 0, spawnInterval: 30 }, { startTime: 240, enemyType: 1, spawnInterval: 60 }, { startTime: 300, enemyType: 2, spawnInterval: 400 }, { startTime: 360, enemyType: 1, spawnInterval: 50 } ]},
        { duration: 420, waves: [ { startTime: 5, enemyType: 1, spawnInterval: 60 }, { startTime: 45, enemyType: 2, spawnInterval: 480 }, { startTime: 180, enemyType: 1, spawnInterval: 50 }, { startTime: 240, enemyType: 2, spawnInterval: 300 }, { startTime: 300, enemyType: 1, spawnInterval: 40 }, { startTime: 360, enemyType: 2, spawnInterval: 180 } ]}
    ]
};
