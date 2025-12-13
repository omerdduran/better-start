// Initialize settings panel toggle and global behaviors
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

  // Page title handling
  const applyPageTitle = (rawTitle) => {
    const title = (rawTitle || '').trim();
    document.title = title || CONFIG.defaultSettings.pageTitle || 'New Tab';
  };

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
    browser.storage.sync
      .get({
        pageTitle: CONFIG.defaultSettings.pageTitle
      })
      .then(({ pageTitle }) => {
        applyPageTitle(pageTitle);
      })
      .catch(() => {
        applyPageTitle(CONFIG.defaultSettings.pageTitle);
      });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.pageTitle) {
        applyPageTitle(changes.pageTitle.newValue);
      }
    });
  } else {
    applyPageTitle(CONFIG.defaultSettings.pageTitle);
  }
});