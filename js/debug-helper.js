/**
 * Debug Helper
 * Fungsi-fungsi untuk membantu debugging Spirit Trial integration
 * 
 * Cara pakai: Buka console browser (F12) dan panggil fungsi-fungsi ini
 */

// Check if mission button exists and has correct text
window.checkMissionButton = () => {
    const btn = document.getElementById('mission-btn');
    console.log('=== Mission Button Check ===');
    console.log('Button exists:', !!btn);
    if (btn) {
        console.log('Button text:', btn.textContent);
        console.log('Expected text:', '🌟 Mulai Spirit Trial');
        console.log('Text matches:', btn.textContent.trim() === '🌟 Mulai Spirit Trial');
        console.log('Button element:', btn);
        
        // Check event listeners (this won't show the actual functions, but useful info)
        console.log('Button has onclick:', !!btn.onclick);
        console.log('Button has addEventListener listeners:', 'Check Elements tab in DevTools');
    }
    console.log('===========================');
};

// Force setup mission button
window.forceSetupMissionButton = async () => {
    console.log('=== Force Setup Mission Button ===');
    const { setMissionButtonHandler } = await import('./ui.js');
    const { startSpiritTrial } = await import('./spirit-trial.js');
    
    setMissionButtonHandler(() => {
        console.log('🎮 SPIRIT TRIAL TRIGGERED!');
        startSpiritTrial();
    });
    
    console.log('✅ Mission button forcefully setup with Spirit Trial');
    console.log('Try clicking the button now!');
    console.log('==================================');
};

// Test Spirit Trial directly
window.testSpiritTrial = async () => {
    console.log('=== Testing Spirit Trial Directly ===');
    const { startSpiritTrial } = await import('./spirit-trial.js');
    const { getGameState } = await import('./game.js');
    
    const gameState = getGameState();
    console.log('Current game state:', gameState);
    
    if (!gameState || !gameState.characterId) {
        console.error('❌ No character selected! Please select a character first.');
        return;
    }
    
    console.log('✅ Starting Spirit Trial...');
    startSpiritTrial();
    console.log('====================================');
};

// Check all imports
window.checkImports = async () => {
    console.log('=== Checking Module Imports ===');
    
    try {
        const spiritTrial = await import('./spirit-trial.js');
        console.log('✅ spirit-trial.js loaded');
        console.log('   - startSpiritTrial:', typeof spiritTrial.startSpiritTrial);
        console.log('   - getBattleState:', typeof spiritTrial.getBattleState);
    } catch (e) {
        console.error('❌ spirit-trial.js failed:', e);
    }
    
    try {
        const spiritTrialUI = await import('./spirit-trial-ui.js');
        console.log('✅ spirit-trial-ui.js loaded');
        console.log('   - showBattleScreen:', typeof spiritTrialUI.showBattleScreen);
        console.log('   - updateBattleUI:', typeof spiritTrialUI.updateBattleUI);
    } catch (e) {
        console.error('❌ spirit-trial-ui.js failed:', e);
    }
    
    try {
        const ui = await import('./ui.js');
        console.log('✅ ui.js loaded');
        console.log('   - setMissionButtonHandler:', typeof ui.setMissionButtonHandler);
    } catch (e) {
        console.error('❌ ui.js failed:', e);
    }
    
    console.log('===============================');
};

// Show battle screen status
window.checkBattleScreen = () => {
    const battleScreen = document.getElementById('battle-screen');
    console.log('=== Battle Screen Status ===');
    console.log('Element exists:', !!battleScreen);
    if (battleScreen) {
        console.log('Is hidden:', battleScreen.classList.contains('hidden'));
        console.log('Element:', battleScreen);
    }
    console.log('===========================');
};

// Complete diagnostic
window.runDiagnostics = async () => {
    console.log('\n🔍 ========== SPIRIT TRIAL DIAGNOSTICS ==========\n');
    
    window.checkMissionButton();
    console.log('\n');
    
    await window.checkImports();
    console.log('\n');
    
    window.checkBattleScreen();
    console.log('\n');
    
    console.log('💡 Quick Fixes:');
    console.log('1. Run: forceSetupMissionButton()');
    console.log('2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
    console.log('3. Clear cache and reload');
    console.log('4. Check console for any red errors');
    
    console.log('\n🔍 ============================================\n');
};

console.log('🛠️ Debug Helper Loaded!');
console.log('Available commands:');
console.log('  - runDiagnostics()        : Run full diagnostic');
console.log('  - checkMissionButton()    : Check mission button status');
console.log('  - forceSetupMissionButton(): Force setup Spirit Trial');
console.log('  - testSpiritTrial()       : Test Spirit Trial directly');
console.log('  - checkImports()          : Check if all modules load');
console.log('  - checkBattleScreen()     : Check battle screen element');