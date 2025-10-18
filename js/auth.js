/**
 * Authentication Module
 * Menangani semua operasi autentikasi
 */

import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let auth = null;
let googleProvider = null;
let currentUser = null;

/**
 * Initialize authentication
 */
export const initAuth = (app) => {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        return { success: false, error: error };
    }
};

/**
 * Sign in as guest (anonymous)
 */
export const signInAsGuest = async () => {
    try {
        const result = await signInAnonymously(auth);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Guest Sign-In Error:", error);
        return { success: false, error: error };
    }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Sign Out Error:", error);
        return { success: false, error: error };
    }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        currentUser = user;
        callback(user);
    });
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    return currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return currentUser !== null;
};

/**
 * Get user display info
 */
export const getUserDisplayInfo = () => {
    if (!currentUser) return null;
    
    return {
        uid: currentUser.uid,
        email: currentUser.email,
        isAnonymous: currentUser.isAnonymous,
        displayText: currentUser.isAnonymous 
            ? `${currentUser.uid.substring(0, 8)}... (Tamu)`
            : currentUser.email
    };
};