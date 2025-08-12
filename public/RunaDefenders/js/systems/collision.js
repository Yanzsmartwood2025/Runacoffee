// systems/collision.js
import { getProjectiles, getEnemies, getResources, getPlayer, getState, setBaseHealth } from '../main.js';
import { Resource } from '../entities.js';
import { playSound } from './sfx.js';
import { triggerDamageFlash } from '../modules/ui.js';

function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function handleCollisions() {
    const projectiles = getProjectiles();
    const enemies = getEnemies();
    const resources = getResources();
    const player = getPlayer();
    
    // Proyectiles vs Enemigos
    for (let i = projectiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (projectiles[i] && enemies[j] && isColliding(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                playSound('enemyHit');

                if (enemies[j].health <= 0) {
                    const enemy = enemies[j];
                    const canvas = document.getElementById('game-canvas');
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

    // Enemigos vs Base
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x < player.x + player.width) {
            const currentBaseHealth = getState().base.health;
            setBaseHealth(currentBaseHealth - 50);
            triggerDamageFlash();
            playSound('baseHit', 'C2', '4n');
            enemies.splice(i, 1);
        }
    }
}
