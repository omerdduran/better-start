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

  // Settings button visibility handling
  const applySettingsButtonMode = (hoverOnly) => {
    if (hoverOnly) {
      document.body.classList.add('settings-hover-only');
    } else {
      document.body.classList.remove('settings-hover-only');
    }
  };

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
    browser.storage.sync
      .get({
        pageTitle: CONFIG.defaultSettings.pageTitle,
        settingsIconHoverOnly: CONFIG.defaultSettings.settingsIconHoverOnly
      })
      .then(({ pageTitle, settingsIconHoverOnly }) => {
        applyPageTitle(pageTitle);
        applySettingsButtonMode(settingsIconHoverOnly);
      })
      .catch(() => {
        applyPageTitle(CONFIG.defaultSettings.pageTitle);
        applySettingsButtonMode(CONFIG.defaultSettings.settingsIconHoverOnly);
      });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;

      if (changes.pageTitle) {
        applyPageTitle(changes.pageTitle.newValue);
      }
      if (changes.settingsIconHoverOnly) {
        applySettingsButtonMode(changes.settingsIconHoverOnly.newValue);
      }
    });
  } else {
    applyPageTitle(CONFIG.defaultSettings.pageTitle);
    applySettingsButtonMode(CONFIG.defaultSettings.settingsIconHoverOnly);
  }
});