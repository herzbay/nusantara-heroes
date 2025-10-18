/**
 * UI Management Module
 * Menangani semua rendering dan navigasi UI
 */

import { getAllCharacters } from './characters.js';
import { getGameState, getExpForNextLevel, getCurrentCharacter } from './game.js';

// DOM Elements
const screens = {
    loading: document.getElementById('loading-screen'),
    app: document.getElementById('app-container'),
    landing: document.getElementById('landing-page'),
    auth: document.getElementById('auth-screen'),
    characterSelection: document.getElementById('character-selection'),
    game: document.getElementById('game-screen'),
    errorModal: document.getElementById('error-modal')
};

const elements = {
    characterList: document.getElementById('character-list'),
    characterArt: document.getElementById('character-art'),
    characterName: document.getElementById('character-name'),
    characterTitle: document.getElementById('character-title'),
    levelValue: document.getElementById('level-value'),
    upgradePoints: document.getElementById('upgrade-points'),
    expBar: document.getElementById('exp-bar'),
    expText: document.getElementById('exp-text'),
    statsContainer: document.getElementById('stats-container'),
    userIdDisplay: document.getElementById('user-id-display'),
    missionBtn: document.getElementById('mission-btn'),
    changeCharacterBtn: document.getElementById('change-character-btn')
};

/**
 * Show specific screen and hide others
 */
export const showScreen = (screenName) => {
    Object.values(screens).forEach(screen => {
        if (screen && screen !== screens.loading && screen !== screens.app && screen !== screens.errorModal) {
            screen.classList.add('hidden');
        }
    });

    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
    }
};

/**
 * Show/hide loading screen
 */
export const toggleLoading = (show) => {
    if (show) {
        screens.loading.style.opacity = '1';
        screens.loading.classList.remove('hidden');
    } else {
        screens.loading.style.opacity = '0';
        setTimeout(() => {
            screens.loading.classList.add('hidden');
            screens.app.style.opacity = '1';
        }, 500);
    }
};

/**
 * Show error modal
 */
export const showErrorModal = () => {
    screens.errorModal.classList.remove('hidden');
};

/**
 * Hide error modal
 */
export const hideErrorModal = () => {
    screens.errorModal.classList.add('hidden');
};

/**
 * Update user ID display
 */
export const updateUserDisplay = (displayText) => {
    if (elements.userIdDisplay) {
        elements.userIdDisplay.textContent = displayText || '';
    }
};

/**
 * Render character selection screen
 */
export const renderCharacterSelection = (onSelectCharacter) => {
    if (!elements.characterList) return;

    elements.characterList.innerHTML = '';
    const chars = getAllCharacters();

    for (const id in chars) {
        const char = chars[id];
        const card = document.createElement('div');
        card.className = "card rounded-xl p-6 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg cursor-pointer";
        
        card.innerHTML = `
            <div class="w-24 h-24 mx-auto mb-4">${char.svg}</div>
            <h3 class="text-2xl font-bold">${char.name}</h3>
            <p class="text-indigo-400 text-sm mb-4">${char.title}</p>
            <div class="text-left text-sm text-gray-400 space-y-1">
                <p>Kekuatan: ${char.stats.kekuatan}</p>
                <p>Pertahanan: ${char.stats.pertahanan}</p>
                <p>Kelincahan: ${char.stats.kelincahan}</p>
                <p>Sihir: ${char.stats.sihir}</p>
            </div>
            <button class="select-char-btn mt-6 w-full btn-primary text-white font-semibold py-2 px-4 rounded-lg">
                Pilih ${char.name}
            </button>
        `;

        const selectBtn = card.querySelector('.select-char-btn');
        selectBtn.addEventListener('click', () => onSelectCharacter(id));

        elements.characterList.appendChild(card);
    }
};

/**
 * Render game UI with current game state
 */
export const renderGameUI = (onUpgrade) => {
    const state = getGameState();
    const char = getCurrentCharacter();

    if (!char || !state) return;

    const expForNext = getExpForNextLevel(state.level);
    const expPercentage = (state.exp / expForNext) * 100;

    // Update character info
    if (elements.characterArt) elements.characterArt.innerHTML = char.svg;
    if (elements.characterName) elements.characterName.textContent = char.name;
    if (elements.characterTitle) elements.characterTitle.textContent = char.title;
    if (elements.levelValue) elements.levelValue.textContent = state.level;
    if (elements.upgradePoints) elements.upgradePoints.textContent = state.upgradePoints;

    // Update EXP bar
    if (elements.expBar) elements.expBar.style.width = `${expPercentage}%`;
    if (elements.expText) elements.expText.textContent = `${state.exp} / ${expForNext} EXP`;

    // Render stats
    renderStats(state, onUpgrade);
};

/**
 * Render stats with upgrade buttons
 */
const renderStats = (state, onUpgrade) => {
    if (!elements.statsContainer) return;

    elements.statsContainer.innerHTML = '';

    for (const stat in state.stats) {
        const statEl = document.createElement('div');
        statEl.className = 'flex items-center justify-between';
        
        const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
        
        statEl.innerHTML = `
            <span class="text-lg">${statName}</span>
            <div class="flex items-center gap-4">
                <span class="text-xl font-bold text-indigo-300 w-8 text-center">${state.stats[stat]}</span>
                <button class="upgrade-btn bg-green-500 text-white rounded-full w-8 h-8 font-bold text-xl flex items-center justify-center hover:bg-green-400 transition transform hover:scale-110" data-stat="${stat}">
                    +
                </button>
            </div>
        `;

        const upgradeBtn = statEl.querySelector('.upgrade-btn');
        upgradeBtn.disabled = state.upgradePoints <= 0;
        upgradeBtn.classList.toggle('disabled-btn', state.upgradePoints <= 0);
        upgradeBtn.addEventListener('click', () => onUpgrade(stat));

        elements.statsContainer.appendChild(statEl);
    }
};

/**
 * Set mission button state
 */
export const setMissionButtonState = (isLoading) => {
    if (!elements.missionBtn) return;

    if (isLoading) {
        elements.missionBtn.disabled = true;
        elements.missionBtn.textContent = 'Menjalankan Misi...';
    } else {
        elements.missionBtn.disabled = false;
        elements.missionBtn.textContent = 'Lakukan Misi (+1 Poin)';
    }
};

/**
 * Get DOM elements for event binding
 */
export const getElements = () => {
    return {
        startBtn: document.getElementById('start-btn'),
        googleSignInBtn: document.getElementById('google-signin-btn'),
        guestSignInBtn: document.getElementById('guest-signin-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        missionBtn: document.getElementById('mission-btn'),
        changeCharacterBtn: document.getElementById('change-character-btn'),
        closeErrorModalBtn: document.getElementById('close-error-modal-btn')
    };
};