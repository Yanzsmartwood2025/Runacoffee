/*
* =================================================================
* ARCHIVO: RunaDefenders/js/systems/collision.js
* =================================================================
* Propósito: Gestiona toda la detección de colisiones del juego.
*/

import { Resource } from '../entities/Resource.js';

// Función auxiliar para detectar si dos rectángulos se solapan
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Gestiona todas las colisiones en cada fotograma
export function handleCollisions(gameContext) {
    const { player, enemies, resources, base } = gameContext;

    // Colisiones: Proyectiles vs Enemigos
    for (let i = player.projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (player.projectiles[i] && enemies[j] && isColliding(player.projectiles[i], enemies[j])) {
                enemies[j].health -= player.projectiles[i].power;
                player.projectiles.splice(i, 1);
                gameContext.playSound('enemyHit');

                if (enemies[j].health <= 0) {
                    const enemy = enemies[j];
                    const dropX = Math.min(enemy.x, gameContext.canvas.width - enemy.width);
                    const dropY = enemy.y;

                    if (Math.random() < enemy.type.grainChance) {
                        resources.push(new Resource(dropX, dropY, 'grain'));
                    }
                    if (Math.random() < enemy.type.orbChance) {
                        resources.push(new Resource(dropX, dropY, 'orb'));
                    }
                    enemies.splice(j, 1);
                }
                break; // El proyectil solo puede golpear a un enemigo
            }
        }
    }

    // Colisiones: Enemigos vs Base
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x < player.x + player.width) {
            base.health -= 50;
            gameContext.updateTreeAppearance();
            gameContext.triggerDamageFlash();
            gameContext.playSound('baseHit', 'C2', '4n');
            enemies.splice(i, 1);

            if (base.health <= 0) {
                gameContext.gameState = 'game_over';
                gameContext.playSound('gameOver', 'C3', '1n');
            }
        }
    }
}

