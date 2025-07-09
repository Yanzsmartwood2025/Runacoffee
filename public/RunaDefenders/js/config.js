/*
* =================================================================
* ARCHIVO: RunaDefenders/js/config.js (El Libro de Reglas)
* =================================================================
* Propósito: Contiene todos los datos de configuración, niveles, enemigos, etc.
* para que puedas ajustar el juego sin tocar la lógica principal.
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
    base: {
        health: 1000,
        maxHealth: 1000
    },
    player: {
        image: {
            // RUTA CORREGIDA: Ahora busca dentro de la carpeta de imágenes del juego.
            idle: 'imagenes/player.png',
            attack: 'imagenes/player.png'
        },
        projectileImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iI2Q0NzUwMCIvPjwvc3ZnPg=='
    },
    resources: {
        // RUTA CORREGIDA:
        grainImage: 'imagenes/collectible_coffee_bean.png',
        orbImage: 'imagenes/collectible_power_orb.png'
    },
    enemies: [
        // RUTAS CORREGIDAS:
        { name: 'Broca Débil', health: 20, speed: 0.5, grainChance: 0.8, orbChance: 0.1, image: 'imagenes/enemy_broca_1.png' },
        { name: 'Broca Normal', health: 60, speed: 0.4, grainChance: 0.5, orbChance: 0.2, image: 'imagenes/enemy_broca_2.png' },
        { name: 'Broca Fuerte', health: 300, speed: 0.3, grainChance: 0.2, orbChance: 0.5, image: 'imagenes/enemy_broca_3.png' },
    ],
    levels: [
        // Nivel 1
        { duration: 180, waves: [ { startTime: 5, enemyType: 0, spawnInterval: 240 }, { startTime: 40, enemyType: 0, spawnInterval: 180 }, { startTime: 90, enemyType: 0, spawnInterval: 150 }, { startTime: 120, enemyType: 0, spawnInterval: 100 } ]},
        // ... (el resto de los 10 niveles)
    ]
};
