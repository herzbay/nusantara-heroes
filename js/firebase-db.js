/**
 * Firebase Database Operations
 * Menangani semua operasi database Firestore
 */

import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { appConfig } from './config.js';

let db = null;

/**
 * Initialize Firestore
 */
export const initDatabase = (app) => {
    db = getFirestore(app);
};

/**
 * Get user document reference
 */
export const getUserDocRef = (userId) => {
    return doc(db, `artifacts/${appConfig.appId}/users/${userId}/characterGame/data`);
};

/**
 * Save game data to Firestore
 */
export const saveGameData = async (userId, gameData) => {
    if (!userId || !gameData) {
        console.error("Invalid user ID or game data");
        return { success: false, error: "Invalid data" };
    }

    try {
        const userDocRef = getUserDocRef(userId);
        await setDoc(userDocRef, gameData);
        console.log("Game data saved successfully");
        return { success: true };
    } catch (error) {
        console.error("Error saving game data:", error);
        return { success: false, error: error };
    }
};

/**
 * Load game data from Firestore
 */
export const loadGameData = async (userId) => {
    if (!userId) {
        console.error("Invalid user ID");
        return { success: false, error: "Invalid user ID", data: null };
    }

    try {
        const userDocRef = getUserDocRef(userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            console.log("Game data loaded successfully");
            return { success: true, data: docSnap.data() };
        } else {
            console.log("No saved game data found");
            return { success: true, data: null };
        }
    } catch (error) {
        console.error("Error loading game data:", error);
        return { success: false, error: error, data: null };
    }
};

/**
 * Delete game data from Firestore
 */
export const deleteGameData = async (userId) => {
    if (!userId) {
        console.error("Invalid user ID");
        return { success: false, error: "Invalid user ID" };
    }

    try {
        const userDocRef = getUserDocRef(userId);
        await setDoc(userDocRef, {});
        console.log("Game data deleted successfully");
        return { success: true };
    } catch (error) {
        console.error("Error deleting game data:", error);
        return { success: false, error: error };
    }
};