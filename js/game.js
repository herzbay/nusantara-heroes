/**
 * Game Logic Module
 * Menangani semua logika game utama
 */

import { characters, getCharacter } from './characters.js';
import { gameConstants } from './config.js';
import { saveGameData } from './firebase-db.js';
import { getCurrentUser } from './auth.js';

// Game State
let gameState = {};

/**
 * Initialize game state with a character
 */
export const initGameState = (characterId) => {
    const char = getCharacter(characterId);
    if (!char) {
        console.error("Invalid character ID");
        return null;
    }

    gameState = {
        characterId: characterId,
        stats: { ...char.stats },
        level: 1,
        exp: 0,
        upgradePoints: 0
    };

    return gameState;
};

/**
 * Load existing game state
 */
export const setGameState = (state) => {
    gameState = state;
};

/**
 * Get current game state
 */
export const getGameState = () => {
    return gameState;
};

/**
 * Reset game state
 */
export const resetGameState = () => {
    gameState = {};
};

/**
 * Calculate EXP needed for next level
 */
export const getExpForNextLevel = (level) => {
    return Math.floor(gameConstants.EXP_BASE * Math.pow(level, gameConstants.EXP_MULTIPLIER));
};

/**
 * Upgrade a stat
 */
export const upgradeStat = async (statName) => {
    if (!gameState.stats || !gameState.stats.hasOwnProperty(statName)) {
        console.error("Invalid stat name");
        return { success: false, error: "Invalid stat" };
    }

    if (gameState.upgradePoints <= 0) {
        console.error("No upgrade points available");
        return { success: false, error: "No points" };
    }

    gameState.upgradePoints--;
    gameState.stats[statName]++;

    // Save to database
    const user = getCurrentUser();
    if (user) {
        await saveGameData(user.uid, gameState);
    }

    return { success: true, gameState: gameState };
};

/**
 * Complete a mission
 */
export const completeMission = async () => {
    // Add rewards
    gameState.upgradePoints += gameConstants.MISSION_REWARD_POINTS;
    gameState.exp += gameConstants.MISSION_REWARD_EXP;

    // Check for level up
    const expForNext = getExpForNextLevel(gameState.level);
    if (gameState.exp >= expForNext) {
        gameState.level++;
        gameState.exp -= expForNext;
        gameState.upgradePoints += gameConstants.LEVEL_UP_BONUS_POINTS;
    }

    // Save to database
    const user = getCurrentUser();
    if (user) {
        await saveGameData(user.uid, gameState);
    }

    return { 
        success: true, 
        gameState: gameState,
        leveledUp: gameState.exp < gameConstants.MISSION_REWARD_EXP
    };
};

/**
 * Get character info for current game state
 */
export const getCurrentCharacter = () => {
    if (!gameState.characterId) return null;
    return getCharacter(gameState.characterId);
};

/**
 * Check if game state is initialized
 */
export const isGameStateInitialized = () => {
    return gameState && gameState.characterId !== undefined;
};

// place in main game module initialization
if (typeof window !== 'undefined') {
    window.addEventListener('spiritTrial:returnToGame', () => {
        if (typeof window.renderGameUI === 'function') {
            try { window.renderGameUI(window.handleStatUpgrade); }
            catch (e) { console.error('renderGameUI handler failed:', e); }
        } else {
            console.warn('renderGameUI not defined; no UI refresh performed.');
        }
    });
}

function renderGameUI(callback) {
    const state = getGameState();
    const character = getCurrentCharacter();

    // Basic guards
    if (!state || !character) return;

    // Optional: allow caller to provide custom upgrade handler
    if (typeof callback === 'function') {
        window.handleStatUpgrade = callback;
    }

    // Header info
    const nameEl = document.getElementById('char-name');
    const levelEl = document.getElementById('char-level');
    const expEl = document.getElementById('char-exp');
    const upgradePointsEl = document.getElementById('upgrade-points');

    if (nameEl) nameEl.textContent = character.name || 'N/A';
    if (levelEl) levelEl.textContent = `Lv ${state.level || 1}`;
    if (expEl) expEl.textContent = `${state.exp || 0} / ${getExpForNextLevel(state.level || 1)}`;
    if (upgradePointsEl) upgradePointsEl.textContent = `${state.upgradePoints || 0}`;

    // Stats area (expects elements with ids stat-<name> and btn-upgrade-<name>)
    const stats = state.stats || {};
    Object.keys(stats).forEach(statName => {
        const statEl = document.getElementById(`stat-${statName}`);
        const btnEl = document.getElementById(`btn-upgrade-${statName}`);
        if (statEl) statEl.textContent = String(stats[statName]);
        if (btnEl) {
            // Create a fresh clone, set state on the clone, replace original, then attach listener to clone
            const cloneBtn = btnEl.cloneNode(true);
            cloneBtn.disabled = !(state.upgradePoints > 0);
            btnEl.replaceWith(cloneBtn);

            // Attach listener to the new node
            cloneBtn.addEventListener('click', async () => {
                if (typeof window.handleStatUpgrade === 'function') {
                    await window.handleStatUpgrade(statName);
                } else {
                    await handleStatUpgrade(statName);
                }
                // Ensure UI refresh after upgrade
                try { renderGameUI(); } catch (e) { console.warn('renderGameUI failed after upgrade', e); }
            });
        }
    });
}

function handleStatUpgrade(statName) {
    return (async () => {
        if (!statName) {
            console.warn('handleStatUpgrade called without statName');
            return { success: false, error: 'no-stat' };
        }

        try {
            const result = await upgradeStat(statName);
            if (!result || !result.success) {
                console.warn('Stat upgrade failed', result && result.error);
                return result;
            }

            // Re-render UI so player sees updated stats and points
            try { renderGameUI(); } catch (e) { console.warn('renderGameUI failed after upgrade', e); }

            return result;
        } catch (err) {
            console.error('handleStatUpgrade error', err);
            return { success: false, error: err.message || 'exception' };
        }
    })();
}

// Make them available to other modules that call window.renderGameUI
if (typeof window !== 'undefined') {
    window.renderGameUI = renderGameUI;
    window.handleStatUpgrade = handleStatUpgrade;
}