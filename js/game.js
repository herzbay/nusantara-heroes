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