/**
 * Spirit Trial - Tactical Board Module
 * Mini-game tactical turn-based battle system
 */

import { getGameState, completeMission } from './game.js';
import { getCurrentCharacter } from './game.js';

// Monster definitions
const MONSTER_TYPES = {
    fire: {
        name: 'Roh Api',
        behavior: 'aggressive',
        type: 'physical',
        color: '#EF4444',
        icon: '🔥',
        baseStats: {
            hp: 30,
            atk: 8,
            def: 3,
            agi: 5
        }
    },
    stone: {
        name: 'Roh Batu',
        behavior: 'defensive',
        type: 'physical',
        color: '#78716C',
        icon: '🪨',
        baseStats: {
            hp: 50,
            atk: 5,
            def: 10,
            agi: 2
        }
    },
    wind: {
        name: 'Roh Angin',
        behavior: 'mobile',
        type: 'magical',
        color: '#06B6D4',
        icon: '💨',
        baseStats: {
            hp: 25,
            atk: 6,
            def: 4,
            agi: 8
        }
    }
};

// Battle state
let battleState = {
    hero: null,
    monsters: [],
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    currentTurn: 'player',
    actionPoints: 1,
    isDefending: false,
    gameOver: false,
    victory: false
};

/**
 * Initialize Spirit Trial battle
 */
export const startSpiritTrial = () => {
    const gameState = getGameState();
    const character = getCurrentCharacter();
    
    if (!gameState || !character) {
        console.error('No active character found');
        alert('Silakan pilih karakter terlebih dahulu!');
        return;
    }

    console.log('Starting Spirit Trial...', { gameState, character });

    // Initialize hero
    battleState.hero = {
        name: character.name,
        pos: { x: 2, y: 4 }, // Bottom center
        hp: 50 + (gameState.stats.pertahanan * 5),
        maxHp: 50 + (gameState.stats.pertahanan * 5),
        atk: gameState.stats.kekuatan,
        def: gameState.stats.pertahanan,
        agi: gameState.stats.kelincahan,
        mag: gameState.stats.sihir,
        icon: '⚔️'
    };

    // Generate 1-3 random monsters
    const monsterCount = Math.floor(Math.random() * 3) + 1;
    battleState.monsters = [];
    
    const monsterKeys = Object.keys(MONSTER_TYPES);
    for (let i = 0; i < monsterCount; i++) {
        const type = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
        const monsterData = MONSTER_TYPES[type];
        
        battleState.monsters.push({
            id: i,
            type: type,
            name: monsterData.name,
            behavior: monsterData.behavior,
            attackType: monsterData.type,
            color: monsterData.color,
            icon: monsterData.icon,
            pos: getRandomTopPosition(i),
            hp: monsterData.baseStats.hp,
            maxHp: monsterData.baseStats.hp,
            atk: monsterData.baseStats.atk,
            def: monsterData.baseStats.def,
            agi: monsterData.baseStats.agi
        });
    }

    // Initialize board
    battleState.board = Array(5).fill(null).map(() => Array(5).fill(null));
    battleState.board[battleState.hero.pos.y][battleState.hero.pos.x] = 'hero';
    
    battleState.monsters.forEach(monster => {
        battleState.board[monster.pos.y][monster.pos.x] = `monster-${monster.id}`;
    });

    battleState.currentTurn = 'player';
    battleState.actionPoints = 1;
    battleState.isDefending = false;
    battleState.gameOver = false;
    battleState.victory = false;

    console.log('Battle state initialized:', battleState);

    // Show battle UI - import dynamically to avoid circular dependency
    import('./spirit-trial-ui.js').then(module => {
        module.showBattleScreen();
    });
};

/**
 * Get random position in top rows
 */
const getRandomTopPosition = (index) => {
    const positions = [
        { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 },
        { x: 1, y: 1 }, { x: 3, y: 1 }
    ];
    return positions[index % positions.length];
};

/**
 * Calculate distance between two positions
 */
const getDistance = (pos1, pos2) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

/**
 * Check if position is valid and empty
 */
const isValidMove = (x, y) => {
    return x >= 0 && x < 5 && y >= 0 && y < 5 && battleState.board[y][x] === null;
};

/**
 * Move hero to position
 */
const battleEventBus = new EventTarget();
export { battleEventBus };

export const moveHero = (newX, newY) => {
    if (battleState.currentTurn !== 'player' || battleState.actionPoints <= 0) return false;
    
    const distance = getDistance(battleState.hero.pos, { x: newX, y: newY });
    const maxMove = Math.min(Math.floor(battleState.hero.agi / 3) + 1, 2);
    
    if (distance > maxMove || !isValidMove(newX, newY)) {
        showMessage('Gerakan tidak valid!');
        return false;
    }

    // Update board
    battleState.board[battleState.hero.pos.y][battleState.hero.pos.x] = null;
    battleState.hero.pos = { x: newX, y: newY };
    battleState.board[newY][newX] = 'hero';

    battleState.actionPoints--;
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
    
    if (battleState.actionPoints <= 0) {
        endPlayerTurn();
    }
    
    return true;
};

/**
 * Hero attacks monster
 */
export const attackMonster = (monsterId) => {
    if (battleState.currentTurn !== 'player' || battleState.actionPoints <= 0) return false;
    
    const monster = battleState.monsters.find(m => m.id === monsterId && m.hp > 0);
    if (!monster) return false;

    const distance = getDistance(battleState.hero.pos, monster.pos);
    if (distance > 1) {
        showMessage('Target terlalu jauh!');
        return false;
    }

    // Calculate damage
    const baseDamage = battleState.hero.atk * (0.8 + Math.random() * 0.4);
    const damage = Math.max(1, Math.floor(baseDamage - monster.def * 0.5));
    
    monster.hp = Math.max(0, monster.hp - damage);
    
    showMessage(`${battleState.hero.name} menyerang ${monster.name} sebesar ${damage} damage!`);
    
    if (monster.hp <= 0) {
        // Monster defeated
        battleState.board[monster.pos.y][monster.pos.x] = null;
        showMessage(`${monster.name} telah dikalahkan!`);
        
        // Check victory
        if (battleState.monsters.every(m => m.hp <= 0)) {
            endBattle(true);
            return true;
        }
    }

    battleState.actionPoints--;
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
    
    if (battleState.actionPoints <= 0) {
        endPlayerTurn();
    }
    
    return true;
};

/**
 * Hero uses magic
 */
export const useMagic = () => {
    if (battleState.currentTurn !== 'player' || battleState.actionPoints <= 0) return false;
    
    const magPower = battleState.hero.mag;
    
    if (magPower >= 7) {
        // Strong magic - area damage
        const damage = Math.floor(magPower * 2);
        battleState.monsters.forEach(monster => {
            if (monster.hp > 0) {
                monster.hp = Math.max(0, monster.hp - damage);
                if (monster.hp <= 0) {
                    battleState.board[monster.pos.y][monster.pos.x] = null;
                }
            }
        });
        showMessage(`Sihir area! Semua monster terkena ${damage} damage!`);
    } else if (magPower >= 4) {
        // Moderate magic - heal
        const heal = Math.floor(magPower * 3);
        battleState.hero.hp = Math.min(battleState.hero.maxHp, battleState.hero.hp + heal);
        showMessage(`Penyembuhan! ${heal} HP dipulihkan.`);
    } else {
        showMessage('Sihir terlalu lemah!');
        return false;
    }

    battleState.actionPoints--;
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
    
    if (battleState.actionPoints <= 0) {
        endPlayerTurn();
    }
    
    // Check victory after magic
    if (battleState.monsters.every(m => m.hp <= 0)) {
        endBattle(true);
    }
    
    return true;
};

/**
 * Hero defends
 */
export const defendHero = () => {
    if (battleState.currentTurn !== 'player' || battleState.actionPoints <= 0) return false;
    
    battleState.isDefending = true;
    showMessage(`${battleState.hero.name} bertahan! Pertahanan meningkat 50%`);
    
    battleState.actionPoints--;
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
    
    if (battleState.actionPoints <= 0) {
        endPlayerTurn();
    }
    
    return true;
};

/**
 * End player turn and start AI turn
 */
const endPlayerTurn = () => {
    battleState.currentTurn = 'ai';
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
    
    setTimeout(() => {
        executeAITurns();
    }, 500);
};

/**
 * Execute all AI monster turns
 */
const executeAITurns = () => {
    const aliveMonsters = battleState.monsters.filter(m => m.hp > 0);
    
    let delay = 0;
    aliveMonsters.forEach((monster, index) => {
        setTimeout(() => {
            aiMonsterTurn(monster);
            
            if (index === aliveMonsters.length - 1) {
                // Last monster, end AI turn
                setTimeout(() => {
                    startPlayerTurn();
                }, 800);
            }
        }, delay);
        delay += 1000;
    });
};

/**
 * AI monster turn logic
 */
const aiMonsterTurn = (monster) => {
    const distance = getDistance(monster.pos, battleState.hero.pos);
    
    if (distance === 1) {
        // Adjacent - attack hero
        const baseDamage = monster.atk * (0.8 + Math.random() * 0.4);
        const defMultiplier = battleState.isDefending ? 1.5 : 1;
        const damage = Math.max(1, Math.floor(baseDamage - (battleState.hero.def * 0.5 * defMultiplier)));
        
        battleState.hero.hp = Math.max(0, battleState.hero.hp - damage);
        showMessage(`${monster.name} menyerang! ${damage} damage!`);
        
        if (battleState.hero.hp <= 0) {
            endBattle(false);
        }
    } else {
        // Move closer to hero
        moveMonsterToward(monster, battleState.hero.pos);
    }
    
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
};

/**
 * Move monster toward target
 */
const moveMonsterToward = (monster, targetPos) => {
    const dx = targetPos.x - monster.pos.x;
    const dy = targetPos.y - monster.pos.y;
    
    let newX = monster.pos.x;
    let newY = monster.pos.y;
    
    // Prioritize larger distance
    if (Math.abs(dx) > Math.abs(dy)) {
        newX += dx > 0 ? 1 : -1;
    } else {
        newY += dy > 0 ? 1 : -1;
    }
    
    // Check if move is valid
    if (isValidMove(newX, newY)) {
        battleState.board[monster.pos.y][monster.pos.x] = null;
        monster.pos = { x: newX, y: newY };
        battleState.board[newY][newX] = `monster-${monster.id}`;
        showMessage(`${monster.name} bergerak mendekat...`);
    }
};

/**
 * Start new player turn
 */
const startPlayerTurn = () => {
    battleState.currentTurn = 'player';
    battleState.actionPoints = 1;
    battleState.isDefending = false;
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
    showMessage('Giliran Anda!');
};

/**
 * End battle
 */
const endBattle = async (victory) => {
    battleState.gameOver = true;
    battleState.victory = victory;
    
    if (victory) {
        showMessage('🎉 Kemenangan! Anda telah mengalahkan semua roh!');
        await completeMission();
    } else {
        showMessage('💀 Kekalahan! Anda telah dikalahkan...');
    }
    
    battleEventBus.dispatchEvent(new CustomEvent('battleStateChanged'));
};

/**
 * Show message to player
 */
const showMessage = (message) => {
    const msgEl = document.getElementById('battle-message');
    if (msgEl) {
        msgEl.textContent = message;
        msgEl.classList.add('animate-pulse');
        setTimeout(() => msgEl.classList.remove('animate-pulse'), 500);
    }
};

/**
 * Get battle state for UI
 */
export const getBattleState = () => battleState;
