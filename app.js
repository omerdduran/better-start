// Initialize settings panel toggle
document.addEventListener('DOMContentLoaded', () => {
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.querySelector('settings-panel');
    
    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.toggle();
    });
    
    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.id !== 'settingsButton' && !e.target.closest('settings-panel')) {
            settingsPanel.close();
        }
    });
}); 