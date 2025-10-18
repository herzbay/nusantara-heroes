/**
 * Main Application Entry Point
 * Inisialisasi dan koordinasi semua modul
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { firebaseConfig, gameConstants } from './config.js';
import { initAuth, signInWithGoogle, signInAsGuest, signOutUser, onAuthChange, getUserDisplayInfo } from './auth.js';
import { initDatabase, saveGameData, loadGameData } from './firebase-db.js';
import { initGameState, setGameState, resetGameState, upgradeStat, completeMission, isGameStateInitialized } from './game.js';
import { 
    showScreen, 
    toggleLoading, 
    showErrorModal, 
    hideErrorModal,
    updateUserDisplay,
    renderCharacterSelection,
    renderGameUI,
    setMissionButtonState,
    getElements
} from './ui.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initAuth(app);
initDatabase(app);

// Get UI elements
const uiElements = getElements();

/**
 * Initialize the application
 */
const initApp = () => {
    // Render character selection (prepare it even if not shown)
    renderCharacterSelection(handleCharacterSelect);

    // Setup event listeners
    setupEventListeners();

    // Listen for auth state changes
    onAuthChange(handleAuthStateChange);

    // Hide loading screen
    toggleLoading(false);
};

/**
 * Setup all event listeners
 */
const setupEventListeners = () => {
    // Start button
    if (uiElements.startBtn) {
        uiElements.startBtn.addEventListener('click', () => {
            showScreen('auth');
        });
    }

    // Google sign in
    if (uiElements.googleSignInBtn) {
        uiElements.googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }

    // Guest sign in
    if (uiElements.guestSignInBtn) {
        uiElements.guestSignInBtn.addEventListener('click', handleGuestSignIn);
    }

    // Logout
    if (uiElements.logoutBtn) {
        uiElements.logoutBtn.addEventListener('click', handleLogout);
    }

    // Mission button
    if (uiElements.missionBtn) {
        uiElements.missionBtn.addEventListener('click', handleMission);
    }

    // Change character button
    if (uiElements.changeCharacterBtn) {
        uiElements.changeCharacterBtn.addEventListener('click', handleChangeCharacter);
    }

    // Close error modal
    if (uiElements.closeErrorModalBtn) {
        uiElements.closeErrorModalBtn.addEventListener('click', hideErrorModal);
    }
};

/**
 * Handle authentication state changes
 */
const handleAuthStateChange = async (user) => {
    if (user) {
        // User is signed in
        const displayInfo = getUserDisplayInfo();
        updateUserDisplay(displayInfo.displayText);

        // Try to load saved game data
        const result = await loadGameData(user.uid);
        
        if (result.success && result.data && result.data.characterId) {
            // Has saved data, load game
            setGameState(result.data);
            showScreen('game');
            renderGameUI(handleStatUpgrade);
        } else {
            // No saved data, show character selection
            showScreen('characterSelection');
        }
    } else {
        // User is signed out
        resetGameState();
        updateUserDisplay('');
        showScreen('landing');
    }
};

/**
 * Handle Google sign in
 */
const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    
    if (!result.success) {
        if (result.error.code === 'auth/unauthorized-domain') {
            showErrorModal();
        } else {
            alert('Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.');
        }
    }
};

/**
 * Handle guest sign in
 */
const handleGuestSignIn = async () => {
    const result = await signInAsGuest();
    
    if (!result.success) {
        alert('Terjadi kesalahan saat masuk sebagai tamu. Silakan coba lagi.');
    }
};

/**
 * Handle logout
 */
const handleLogout = async () => {
    const result = await signOutUser();
    
    if (!result.success) {
        alert('Terjadi kesalahan saat keluar. Silakan coba lagi.');
    }
};

/**
 * Handle character selection
 */
const handleCharacterSelect = async (characterId) => {
    const state = initGameState(characterId);
    
    if (!state) {
        alert('Terjadi kesalahan saat memilih karakter.');
        return;
    }

    // Save initial state
    const displayInfo = getUserDisplayInfo();
    if (displayInfo) {
        await saveGameData(displayInfo.uid, state);
    }

    // Show game screen
    showScreen('game');
    renderGameUI(handleStatUpgrade);
};

/**
 * Handle stat upgrade
 */
const handleStatUpgrade = async (statName) => {
    const result = await upgradeStat(statName);
    
    if (result.success) {
        renderGameUI(handleStatUpgrade);
    } else {
        console.error('Failed to upgrade stat:', result.error);
    }
};

/**
 * Handle mission completion
 */
const handleMission = async () => {
    setMissionButtonState(true);

    // Simulate mission duration
    await new Promise(resolve => setTimeout(resolve, gameConstants.MISSION_DURATION));

    const result = await completeMission();

    if (result.success) {
        renderGameUI(handleStatUpgrade);
    } else {
        alert('Terjadi kesalahan saat menjalankan misi.');
    }

    setMissionButtonState(false);
};

/**
 * Handle change character
 */
const handleChangeCharacter = () => {
    const btn = uiElements.changeCharacterBtn;
    
    if (btn.dataset.confirming) {
        // User confirmed, reset game
        delete btn.dataset.confirming;
        btn.textContent = 'Ganti Karakter';
        btn.classList.remove('bg-red-600');
        btn.classList.add('btn-secondary');
        
        resetGameState();
        const displayInfo = getUserDisplayInfo();
        if (displayInfo) {
            saveGameData(displayInfo.uid, {});
        }
        
        showScreen('characterSelection');
    } else {
        // Ask for confirmation
        btn.dataset.confirming = 'true';
        btn.textContent = 'Yakin? (Data akan di-reset)';
        btn.classList.remove('btn-secondary');
        btn.classList.add('bg-red-600');
        
        // Reset confirmation after 3 seconds
        setTimeout(() => {
            if (btn.dataset.confirming) {
                delete btn.dataset.confirming;
                btn.textContent = 'Ganti Karakter';
                btn.classList.remove('bg-red-600');
                btn.classList.add('btn-secondary');
            }
        }, 3000);
    }
};

// Start the application
initApp();