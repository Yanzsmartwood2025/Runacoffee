/*
* =================================================================
* ARCHIVO: js/systems/collision.js
* =================================================================
* Propósito: Maneja toda la lógica de detección de colisiones.
*/

import { Resource } from '../entities/Resource.js';
import { animateResourceToBag } from '../modules/ui.js';

function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

export function handleCollisions(gameContext) {
    const { projectiles, enemies, player, base, playSound, triggerDamageFlash, resources, config } = gameContext;

    // Proyectiles vs Enemigos
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power; 
                projectiles.splice(i, 1); 
                playSound('enemyHit', 'C3', '16n');

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
                break; 
            }
        }
    }

    // Enemigos vs Base
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x < player.x + player.width) { 
            base.health -= 50;
            gameContext.updateTreeAppearance();
            triggerDamageFlash();
            playSound('baseHit', 'C2', '4n');
            enemies.splice(i, 1);

            if (base.health <= 0) {
                gameContext.gameState = 'game_over';
                playSound('gameOver', 'C3', '1n');
            }
        }
    }
}

// --- CORRECCIÓN: Exportamos esta función ---
export function checkResourceClick(x, y, gameContext) {
    const { resources, playSound, config } = gameContext;
    for (let i = resources.length - 1; i >= 0; i--) {
        const r = resources[i];
        if (r.isFlying) continue;

        const dist = Math.sqrt(Math.pow(x - (r.x + r.size / 2), 2) + Math.pow(y - (r.y + r.size / 2), 2));
        
        if (dist < r.size) { 
            if (r.type === 'grain') {
                r.isFlying = true;
                animateResourceToBag(r, gameContext);
            } else {
                gameContext.specialPowerPoints = Math.min(config.specialPowerMax, gameContext.specialPowerPoints + config.orbValue);
                playSound('collect', 'G5');
                resources.splice(i, 1);
            }
            break;
        }
    }
}
