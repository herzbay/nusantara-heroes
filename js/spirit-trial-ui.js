/**
 * Spirit Trial UI Module
 * Handles rendering and user interaction for the battle screen
 */

import { getBattleState, moveHero, attackMonster, useMagic, defendHero, battleEventBus } from './spirit-trial.js';

let selectedCell = null;

/**
 * Show battle screen
 */
export const showBattleScreen = () => {
    const battleScreen = document.getElementById('battle-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (battleScreen) {
        battleScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        renderMonsterCards();
        renderBattleBoard();
        updateBattleUI();
    }
};

/**
 * Render monster cards
 */
const renderMonsterCards = () => {
    const monstersListEl = document.getElementById('monsters-list');
    if (!monstersListEl) return;

    const state = getBattleState();
    monstersListEl.innerHTML = '';

    state.monsters.forEach(monster => {
        const card = document.createElement('div');
        card.id = `monster-card-${monster.id}`;
        card.className = 'card p-3 border transition-all';
        card.style.borderColor = monster.color;
        card.style.backgroundColor = `${monster.color}20`;
        
        card.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">${monster.icon}</span>
                <div class="flex-1">
                    <h4 class="font-semibold text-sm">${monster.name}</h4>
                    <p class="text-xs text-gray-400">${monster.behavior}</p>
                </div>
            </div>
            <div>
                <div class="flex justify-between text-xs mb-1">
                    <span>HP</span>
                    <span id="monster-${monster.id}-hp">${monster.hp} / ${monster.maxHp}</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div id="monster-${monster.id}-hp-bar" class="h-full rounded-full transition-all duration-300" style="width: 100%; background-color: ${monster.color}"></div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-1 mt-2 text-xs text-gray-400">
                <div>⚔️ ${monster.atk}</div>
                <div>🛡️ ${monster.def}</div>
                <div>⚡ ${monster.agi}</div>
            </div>
        `;

        monstersListEl.appendChild(card);
    });
};
/**
 * Hide battle screen
 */
export const hideBattleScreen = () => {
    const battleScreen = document.getElementById('battle-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (battleScreen) {
        battleScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');

        // Prefer a global renderGameUI if provided by the main game module
        if (typeof window !== 'undefined' && typeof window.renderGameUI === 'function') {
            try {
                window.renderGameUI(window.handleStatUpgrade);
            } catch (err) {
                console.warn('window.renderGameUI threw an error:', err);
            }
        } else {
            // dispatch an event so the main app can refresh UI if it wants
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('spiritTrial:returnToGame'));
            }
            console.warn('renderGameUI not found; returned to game screen without UI refresh.');
        }
    }
};

/**
 * Render the battle board
 */
export const renderBattleBoard = () => {
    const boardEl = document.getElementById('battle-board');
    if (!boardEl) return;

    const state = getBattleState();
    boardEl.innerHTML = '';

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const cell = document.createElement('div');
            cell.className = 'battle-cell relative bg-gray-700/50 border border-gray-600 rounded hover:bg-gray-600/50 transition-all cursor-pointer aspect-square flex items-center justify-center';
            cell.dataset.x = x;
            cell.dataset.y = y;

            const cellContent = state.board[y][x];
            
            if (cellContent === 'hero') {
                cell.innerHTML = `<div class="text-4xl animate-pulse">${state.hero.icon}</div>`;
                cell.classList.add('bg-blue-900/50', 'border-blue-500');
            } else if (cellContent && cellContent.startsWith('monster-')) {
                const monsterId = parseInt(cellContent.split('-')[1]);
                const monster = state.monsters.find(m => m.id === monsterId);
                if (monster && monster.hp > 0) {
                    cell.innerHTML = `<div class="text-4xl" style="filter: drop-shadow(0 0 10px ${monster.color})">${monster.icon}</div>`;
                    cell.classList.add('bg-red-900/50', 'border-red-500');
                    cell.dataset.monsterId = monsterId;
                }
            }

            cell.addEventListener('click', () => handleCellClick(x, y));
            boardEl.appendChild(cell);
        }
    }
};

/**
 * Handle cell click
 */
const handleCellClick = (x, y) => {
    const state = getBattleState();
    
    if (state.gameOver || state.currentTurn !== 'player' || state.actionPoints <= 0) {
        return;
    }

    const cellContent = state.board[y][x];
    
    if (cellContent === null) {
        // Empty cell - try to move
        moveHero(x, y);
    } else if (cellContent && cellContent.startsWith('monster-')) {
        // Monster cell - try to attack
        const monsterId = parseInt(cellContent.split('-')[1]);
        attackMonster(monsterId);
    }
};

/**
 * Update battle UI
 */
export const updateBattleUI = () => {
    const state = getBattleState();
    
    // Update hero HP
    const heroHpEl = document.getElementById('hero-hp');
    const heroHpBarEl = document.getElementById('hero-hp-bar');
    if (heroHpEl && heroHpBarEl) {
        heroHpEl.textContent = `${state.hero.hp} / ${state.hero.maxHp}`;
        const hpPercent = (state.hero.hp / state.hero.maxHp) * 100;
        heroHpBarEl.style.width = `${hpPercent}%`;
        
        if (hpPercent > 50) {
            heroHpBarEl.className = 'h-full bg-green-500 rounded-full transition-all duration-300';
        } else if (hpPercent > 25) {
            heroHpBarEl.className = 'h-full bg-yellow-500 rounded-full transition-all duration-300';
        } else {
            heroHpBarEl.className = 'h-full bg-red-500 rounded-full transition-all duration-300 animate-pulse';
        }
    }

    // Update monsters HP
    state.monsters.forEach(monster => {
        const monsterHpEl = document.getElementById(`monster-${monster.id}-hp`);
        const monsterHpBarEl = document.getElementById(`monster-${monster.id}-hp-bar`);
        
        if (monsterHpEl && monsterHpBarEl) {
            monsterHpEl.textContent = `${monster.hp} / ${monster.maxHp}`;
            const hpPercent = (monster.hp / monster.maxHp) * 100;
            monsterHpBarEl.style.width = `${hpPercent}%`;
            
            if (monster.hp <= 0) {
                const monsterCard = document.getElementById(`monster-card-${monster.id}`);
                if (monsterCard) {
                    monsterCard.style.opacity = '0.3';
                    monsterCard.style.filter = 'grayscale(100%)';
                }
            }
        }
    });

    // Update turn indicator
    const turnEl = document.getElementById('turn-indicator');
    if (turnEl) {
        if (state.gameOver) {
            turnEl.textContent = state.victory ? '🎉 Kemenangan!' : '💀 Kekalahan';
            turnEl.className = state.victory 
                ? 'text-xl font-bold text-green-400 animate-bounce'
                : 'text-xl font-bold text-red-400';
        } else {
            turnEl.textContent = state.currentTurn === 'player' ? '⚔️ Giliran Anda' : '🎯 Giliran Musuh';
            turnEl.className = state.currentTurn === 'player'
                ? 'text-xl font-bold text-blue-400'
                : 'text-xl font-bold text-red-400 animate-pulse';
        }
    }

    // Update action points
    const apEl = document.getElementById('action-points');
    if (apEl) {
        apEl.textContent = state.actionPoints;
    }

    // Update action buttons
    const buttons = ['btn-magic', 'btn-defend'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = state.currentTurn !== 'player' || state.actionPoints <= 0 || state.gameOver;
            btn.classList.toggle('disabled-btn', btn.disabled);
        }
    });

    // Show/hide game over buttons
    const gameOverButtons = document.getElementById('battle-gameover-buttons');
    if (gameOverButtons) {
        gameOverButtons.classList.toggle('hidden', !state.gameOver);
    }

    const actionButtons = document.getElementById('battle-action-buttons');
    if (actionButtons) {
        actionButtons.classList.toggle('hidden', state.gameOver);
    }

    // Re-render board
    renderBattleBoard();
};

/**
 * Initialize battle screen event listeners
 */
export const initBattleEventListeners = () => {
    // Magic button
    const magicBtn = document.getElementById('btn-magic');
    if (magicBtn) {
        magicBtn.addEventListener('click', () => {
            useMagic();
        });
    }

    // Defend button
    const defendBtn = document.getElementById('btn-defend');
    if (defendBtn) {
        defendBtn.addEventListener('click', () => {
            defendHero();
        });
    }

    // Continue button (after victory)
    const continueBtn = document.getElementById('btn-battle-continue');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            hideBattleScreen();
        });
    }

    // Retry button (after defeat)
    const retryBtn = document.getElementById('btn-battle-retry');
    if (retryBtn) {
        retryBtn.addEventListener('click', async () => {
            const spiritTrialModule = await import('./spirit-trial.js');
            spiritTrialModule.startSpiritTrial();
        });
    }

    // Exit button
    const exitBtn = document.getElementById('btn-battle-exit');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            hideBattleScreen();
        });
    }

    // Add battle state change listener
    battleEventBus.addEventListener('battleStateChanged', () => {
        updateBattleUI();
    });
};

// Make startSpiritTrial available globally for retry
if (typeof window !== 'undefined') {
    window.retrySpiritTrial = async () => {
        const spiritTrialModule = await import('./spirit-trial.js');
        spiritTrialModule.startSpiritTrial();
    };

    // Expose renderGameUI and handleStatUpgrade if they exist
    if (typeof renderGameUI === 'function') {
        window.renderGameUI = renderGameUI;
    }
    if (typeof handleStatUpgrade === 'function') {
        window.handleStatUpgrade = handleStatUpgrade;
    }
}