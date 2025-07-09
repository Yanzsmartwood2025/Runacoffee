// Usamos 'export' para que estos datos puedan ser importados en otros archivos.

// Definimos los tipos de enemigos como un objeto.
// La "clave" (ej: 'broca_1') es un nombre fácil de recordar.
// El "valor" es un objeto con todas las estadísticas de ese enemigo.
export const enemyTypes = {
    'broca_1': {
        name: 'Broca Débil',
        imageSrc: 'imagenes/enemy_broca_1.png',
        health: 20,
        speed: 1.5,
        width: 80,
        height: 80,
    },
    'broca_2': {
        name: 'Broca Normal',
        imageSrc: 'imagenes/enemy_broca_2.png',
        health: 60,
        speed: 1,
        width: 90,
        height: 90,
    },
    'broca_3': {
        name: 'Broca Fuerte',
        imageSrc: 'imagenes/enemy_broca_3.png',
        health: 300,
        speed: 0.5,
        width: 100,
        height: 100,
    },
    // ¡AÑADIR UN NUEVO ENEMIGO ES ASÍ DE FÁCIL!
    // Mañana, si quieres un enemigo humano, solo añades esto:
    /*
    'humano_1': {
        name: 'Deforestador',
        imageSrc: 'imagenes/enemigo_humano.png', // <-- Necesitarías esta imagen
        health: 100,
        speed: 0.8,
        width: 100,
        height: 120,
    }
    */
};
