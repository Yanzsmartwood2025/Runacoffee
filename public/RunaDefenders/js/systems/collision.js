// systems/collision.js - Lógica de detección de colisiones

import { playSound } from '../modules/audio.js';
import { triggerDamageFlash } from '../modules/ui.js';
import { Player, Projectile, Enemy, Resource } from '../entities/index.js';
import {
    base, enemies, projectiles, resources,
    isPowerActive, specialPowerPoints,
    updateState, getState
} from '../main.js';

function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/**
 * Maneja todas las colisiones en el juego.
 */
function handleCollisions() {
    // Colisiones entre proyectiles y enemigos
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                playSound('enemyHit');

                if (enemies[j].health <= 0) {
                    const enemy = enemies[j];
                    const dropX = Math.min(enemy.x, canvas.width - enemy.width);
                    const dropY = enemy.y;

                    if (Math.random() < enemy.type.grainChance) {
                        resources.push(new Resource(dropX, dropY, 'grain'));
                    }
                    if (Math.random() < enemy.type.orbChance) {
                        resources.push(new Resource(dropX, dropY, 'orb'));
                    }
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }

    // Colisiones entre enemigos y la base
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x < player.x + player.width) {
            base.health -= 50;
            updateTreeAppearance();
            triggerDamageFlash();
            playSound('baseHit', 'C2', '4n');
            enemies.splice(i, 1);
            if (base.health <= 0) {
                gameState = 'game_over';
                playSound('gameOver', 'C3', '1n');
            }
        }
    }
}

export { handleCollisions };

