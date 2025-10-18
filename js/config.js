/**
 * Firebase Configuration
 * 
 * PENTING: Ganti dengan konfigurasi Firebase Anda sendiri!
 * Dapatkan dari Firebase Console > Project Settings > General
 */

export const firebaseConfig = {
    apiKey: "AIzaSyBzgV3s3xX53jhSmXw18_qzEBJlaHIf9Qg",
    authDomain: "pahlawan-nusantara-app.web.app",
    projectId: "pahlawan-nusantara-app",
    storageBucket: "pahlawan-nusantara-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

/**
 * App Configuration
 */
export const appConfig = {
    appId: 'pahlawan-nusantara-game',
    version: '1.0.0',
    environment: 'production'
};

/**
 * Game Constants
 */
export const gameConstants = {
    EXP_BASE: 10,
    EXP_MULTIPLIER: 1.5,
    MISSION_REWARD_POINTS: 1,
    MISSION_REWARD_EXP: 5,
    LEVEL_UP_BONUS_POINTS: 3,
    MISSION_DURATION: 1500 
};