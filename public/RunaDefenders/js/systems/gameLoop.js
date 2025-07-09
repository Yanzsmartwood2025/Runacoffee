
/*
* =================================================================
* ARCHIVO: RunaDefenders/js/systems/gameLoop.js
* =================================================================
* Propósito: Contiene el bucle principal del juego y la función de dibujado.
* Es el corazón que late del juego.
*/

let globalAnimationTimer = 0;

// La función principal que se llama en cada fotograma
export function gameLoop(gameContext) {
    // Si el juego no está en estado 'playing', no hace nada.
    if (gameContext.gameState !== 'playing') return;

    // Actualiza el temporizador global para animaciones
    globalAnimationTimer += 0.02;

    // Llama a las funciones de actualización de los otros sistemas
    handleGameLogic(gameContext, globalAnimationTimer);
    gameContext.updateUI();
    
    // Dibuja todo en la pantalla
    draw(gameContext, globalAnimationTimer);

    // Si el juego no ha terminado o está pausado, solicita el siguiente fotograma
    if (gameContext.gameState !== 'game_over' && gameContext.gameState !== 'level_complete' && gameContext.gameState !== 'paused') {
        gameContext.animationFrameId = requestAnimationFrame(() => gameLoop(gameContext));
    } else {
        // Si el juego termina, muestra la pantalla correspondiente
        gameContext.showOverlay(gameContext.gameState);
    }
}

// La función que se encarga de toda la lógica del juego en cada fotograma
function handleGameLogic(gameContext, timer) {
    if (gameContext.shootTimer > 0) gameContext.shootTimer--;
    gameContext.levelTimer += 1 / 60;

    // Actualiza todas las entidades del juego
    gameContext.player.update();
    gameContext.player.projectiles.forEach((p, i) => {
        p.update();
        if (p.x > gameContext.canvas.width) gameContext.player.projectiles.splice(i, 1);
    });
    gameContext.enemies.forEach(e => e.update());
    gameContext.resources.forEach((r, i) => {
        r.update();
        if (r.life <= 0) gameContext.resources.splice(i, 1);
    });

    // Llama a los sistemas de colisiones y progresión de nivel
    gameContext.handleCollisions();
    gameContext.handleLevelProgression();
}

// La función que dibuja todo en el lienzo
function draw(gameContext, timer) {
    const { ctx, canvas, player, enemies, resources } = gameContext;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (player) {
        player.draw(ctx, timer);
        player.projectiles.forEach(p => p.draw(ctx));
    }
    enemies.forEach(e => e.draw(ctx, timer));
    resources.forEach(r => r.draw(ctx, timer));
}
