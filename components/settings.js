class SettingsPanel extends HTMLElement {
  #initialized = false;
  #editingCommand = null; // Stores original command data when editing

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.render();
      this.loadSettings().then(() => {
        this.setupEventListeners();
        this.setupCustomCommands();
        this.#initialized = true;
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${SETTINGS_STYLES}</style>
      <div class="settings-panel">
        <div class="header">
          <h2>Settings</h2>
          <button class="close-btn" aria-label="Close">×</button>
        </div>

        <!-- Widgets Section -->
        <div class="section">
          <h3 class="section-title">Widgets</h3>
          
          <div class="option">
            <span class="option-label">Weather</span>
            <label class="toggle">
              <input type="checkbox" id="weatherEnabled">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">Fahrenheit</span>
            <label class="toggle">
              <input type="checkbox" id="weatherF">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option" style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="location-wrapper">
              <input type="text" id="weatherLocation" placeholder="Location (auto-detect if empty)" autocomplete="off">
              <div class="location-suggestions" id="locationSuggestions"></div>
            </div>
            <span class="info-wrapper">
              <button type="button" class="info-btn">?</button>
              <div class="info-tooltip">
                <h4>Weather Location</h4>
                <ul>
                  <li>Leave empty to auto-detect your location</li>
                  <li>Start typing to see suggestions</li>
                  <li>Uses free wttr.in API</li>
                </ul>
              </div>
            </span>
          </div>

          <div class="option">
            <span class="option-label">💧 Humidity</span>
            <label class="toggle">
              <input type="checkbox" id="weatherHumidity">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">💨 Wind</span>
            <label class="toggle">
              <input type="checkbox" id="weatherWind">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">☀️ UV Index</span>
            <label class="toggle">
              <input type="checkbox" id="weatherUV">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">Clock</span>
            <label class="toggle">
              <input type="checkbox" id="clockEnabled">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">24-hour format</span>
            <label class="toggle">
              <input type="checkbox" id="clock24h">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">Show date</span>
            <label class="toggle">
              <input type="checkbox" id="clockShowDate">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option">
            <span class="option-label">Show seconds</span>
            <label class="toggle">
              <input type="checkbox" id="clockShowSeconds">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="option" style="align-items: flex-start; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; gap: 0.5rem;">
              <span class="option-label">Secondary time zones</span>
              <span class="info-wrapper">
                <button type="button" class="info-btn">?</button>
                <div class="info-tooltip">
                  <h4>Secondary time zones</h4>
                  <ul>
                    <li>One per line</li>
                    <li>Format: <code>Label=IANA/Time_Zone</code></li>
                    <li>Example: <code>London=Europe/London</code></li>
                    <li>If you only write the time zone, it will be used as the label</li>
                  </ul>
                </div>
              </span>
            </div>
            <textarea id="clockSecondaryTimezones" rows="3" placeholder="London=Europe/London&#10;New York=America/New_York" style="width: 100%; resize: vertical;"></textarea>
          </div>
        </div>

        <!-- Search Section -->
        <div class="section">
          <h3 class="section-title">Search</h3>
          
          <div class="option">
            <span class="option-label">Engine</span>
            <select id="defaultSearch">
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="yahoo">Yahoo</option>
              <option value="brave">Brave</option>
              <option value="ecosia">Ecosia</option>
              <option value="startpage">Startpage</option>
              <option value="yandex">Yandex</option>
            </select>
          </div>

          <div class="option">
            <span class="option-label">Open in new tab</span>
            <label class="toggle">
              <input type="checkbox" id="newTab">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Links Section -->
        <div class="section">
          <h3 class="section-title">Links</h3>
          
          <div class="option">
            <span class="option-label">Grid Columns</span>
            <input type="number" id="commandsColumns" min="1" max="12">
          </div>
          
          <input type="text" id="commandsSearch" placeholder="Search bookmarks..." style="margin-bottom: 0.5rem;">
          <div class="commands-list" id="commandsList"></div>
          <button
            type="button"
            class="add-btn"
            id="toggleHiddenCommandsList"
            style="width: 100%; background: rgba(136, 136, 136, 0.3); margin-top: 0.25rem; font-size: 0.8rem; display: none;"
          >
            Show hidden commands
          </button>
          <div class="commands-list" id="hiddenCommandsList" style="display: none;"></div>

          <form class="add-form" id="addCommandForm">
            <div class="form-row">
              <input type="text" id="commandKey" class="input-small" placeholder="Key" maxlength="10" required>
              <input type="text" id="commandName" placeholder="Name (empty = hidden)">
            </div>
            <input type="url" id="commandUrl" placeholder="URL" required>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="text" id="commandSearchTemplate" placeholder="Search Template" style="flex: 1;">
              <span class="info-wrapper">
                <button type="button" class="info-btn">?</button>
                <div class="info-tooltip">
                  <h4>Search Template Usage</h4>
                  <ul>
                    <li><code>{}</code> = search query</li>
                    <li><code>?q={}</code> → url.com?q=test</li>
                    <li><code>/search?q={}</code> → url.com/search?q=test</li>
                    <li><code>#en/tr/{}</code> → url.com#en/tr/test</li>
                    <li><code>:{}</code> → localhost:3000</li>
                  </ul>
                  <p style="margin: 0.5rem 0 0; color: var(--color-text-subtle);">If Name is empty, link won't appear in grid but can be used via search.</p>
                </div>
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="text" id="commandSuggestions" placeholder="Suggestions (comma-separated keys)" style="flex: 1;">
              <span class="info-wrapper">
                <button type="button" class="info-btn">?</button>
                <div class="info-tooltip">
                  <h4>Suggestions</h4>
                  <ul>
                    <li>When you type this command key, these suggestions appear</li>
                    <li>Enter comma-separated keys: <code>t-de, t-fr</code></li>
                    <li>Each suggestion should be a separate command</li>
                  </ul>
                  <p style="margin: 0.5rem 0 0; color: var(--color-text-subtle);">Example: Command "t" with suggestions "t-de, t-fr" → typing "t" shows t-de and t-fr as options.</p>
                </div>
              </span>
            </div>
            <div class="form-buttons">
              <button type="button" class="cancel-btn" id="cancelEdit">Cancel</button>
              <button type="submit" class="add-btn">Add Link</button>
            </div>
          </form>
        </div>

        <!-- Theme Section -->
        <div class="section">
          <h3 class="section-title">Theme</h3>
          
          <div class="option">
            <span class="option-label">Appearance</span>
            <select id="theme">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="catppuccin">Catppuccin</option>
              <option value="high-contrast">High Contrast</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="option">
            <span class="option-label">Page title</span>
            <input type="text" id="pageTitle" placeholder="New Tab">
          </div>

          <div class="option">
            <span class="option-label">Hide settings button (show on hover)</span>
            <label class="toggle">
              <input type="checkbox" id="settingsIconHoverOnly">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="subsection">
            <h4 class="subsection-title">Advanced theme editor</h4>
            <button
              type="button"
              class="add-btn"
              id="toggleCustomTheme"
              style="width: 100%; background: rgba(136, 136, 136, 0.3); font-size: 0.8rem;"
            >
              Show advanced theme editor
            </button>
            <div class="custom-theme-editor" id="customThemeEditor">
              <div class="custom-theme-row">
                <label for="customThemeBackground">Background</label>
                <input type="color" id="customThemeBackground">
              </div>
              <div class="custom-theme-row">
                <label for="customThemeText">Text</label>
                <input type="color" id="customThemeText">
              </div>
              <div class="custom-theme-row">
                <label for="customThemeTextSubtle">Subtle text</label>
                <input type="color" id="customThemeTextSubtle">
              </div>
              <div class="custom-theme-row">
                <label for="customThemeAccent">Accent</label>
                <input type="color" id="customThemeAccent">
              </div>
              <div class="form-buttons" style="margin-top: 0.5rem;">
                <button
                  type="button"
                  id="resetCustomTheme"
                  style="background: rgba(136, 136, 136, 0.3); border: none; border-radius: 6px; color: var(--color-text); cursor: pointer; font-size: 0.8rem; padding: 0.4rem 0.75rem;"
                >
                  Reset custom theme
                </button>
                <button type="button" class="add-btn" id="saveCustomTheme" style="font-size: 0.8rem;">
                  Save & use Custom theme
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Section -->
        <div class="section">
          <h3 class="section-title">Data</h3>
          
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="add-btn" id="exportSettings" style="flex: 1; background: rgba(136, 136, 136, 0.3);">Export</button>
            <button type="button" class="add-btn" id="importSettings" style="flex: 1; background: rgba(136, 136, 136, 0.3);">Import</button>
          </div>
        </div>

        <!-- Reset Section -->
        <div class="section" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(136, 136, 136, 0.2);">
          <button type="button" class="add-btn" id="resetSettings" style="width: 100%; background: #dc3545;">Reset to Default</button>
        </div>
      </div>

      <!-- Confirm Modal -->
      <div class="confirm-modal" id="confirmModal">
        <div class="confirm-box">
          <h3>Reset Settings?</h3>
          <p>This will remove all your custom links, preferences, and ordering. This action cannot be undone.</p>
          <div class="confirm-buttons">
            <button class="confirm-cancel" id="confirmCancel">Cancel</button>
            <button class="confirm-ok" id="confirmOk">Reset</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => {
      this.close();
    });

    // Export settings
    this.shadowRoot.getElementById('exportSettings').addEventListener('click', async () => {
      // Get saved settings
      const savedSettings = await browser.storage.sync.get();

      // Build full commands object from COMMANDS map
      const builtinCommands = {};
      for (const [key, cmd] of COMMANDS) {
        builtinCommands[key] = { ...cmd };
      }

      // Merge with defaults so export is never empty
      const exportData = {
        // Settings
        settings: {
          ...CONFIG.defaultSettings,
          ...savedSettings
        },
        // Built-in commands (from config.js)
        builtinCommands,
        // Custom commands (user-added)
        customCommands: savedSettings.customCommands || {},
        // Deleted built-in commands
        deletedCommands: savedSettings.deletedCommands || [],
        // Commands order
        commandsOrder: savedSettings.commandsOrder || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'better-startpage-settings.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import settings
    this.shadowRoot.getElementById('importSettings').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          const text = await file.text();
          const data = JSON.parse(text);

          // Handle new format (with settings object) or old format
          if (data.settings) {
            // New format
            const toSave = { ...data.settings };
            if (data.customCommands) toSave.customCommands = data.customCommands;
            if (data.deletedCommands) toSave.deletedCommands = data.deletedCommands;
            if (data.commandsOrder) toSave.commandsOrder = data.commandsOrder;
            await browser.storage.sync.set(toSave);
          } else {
            // Old format - direct settings
            await browser.storage.sync.set(data);
          }

          this.loadSettings();
          this.renderCommands();
          alert('Settings imported successfully!');
        } catch (error) {
          console.error('Failed to import settings:', error);
          alert('Failed to import settings. Please check the file format.');
        }
      };
      input.click();
    });

    // Reset to default settings - using custom modal for Firefox compatibility
    const confirmModal = this.shadowRoot.getElementById('confirmModal');
    const confirmCancel = this.shadowRoot.getElementById('confirmCancel');
    const confirmOk = this.shadowRoot.getElementById('confirmOk');

    this.shadowRoot.getElementById('resetSettings').addEventListener('click', () => {
      confirmModal.classList.add('visible');
    });

    confirmCancel.addEventListener('click', () => {
      confirmModal.classList.remove('visible');
    });

    confirmOk.addEventListener('click', async () => {
      await browser.storage.sync.clear();
      location.reload();
    });
  }

  async loadSettings() {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const settings = await browser.storage.sync.get({
      theme: CONFIG.defaultSettings.theme,
      defaultSearch: CONFIG.defaultSettings.defaultSearch,
      newTab: CONFIG.defaultSettings.newTab,
      pageTitle: CONFIG.defaultSettings.pageTitle,
      settingsIconHoverOnly: CONFIG.defaultSettings.settingsIconHoverOnly,
      weatherEnabled: CONFIG.defaultSettings.weatherEnabled,
      weatherLocation: CONFIG.defaultSettings.weatherLocation,
      weatherF: CONFIG.defaultSettings.weatherF,
      weatherHumidity: CONFIG.defaultSettings.weatherHumidity,
      weatherWind: CONFIG.defaultSettings.weatherWind,
      weatherUV: CONFIG.defaultSettings.weatherUV,
      clockEnabled: CONFIG.defaultSettings.clockEnabled,
      clock24h: CONFIG.defaultSettings.clock24h,
      clockShowDate: CONFIG.defaultSettings.clockShowDate,
      clockShowSeconds: CONFIG.defaultSettings.clockShowSeconds,
      clockSecondaryTimezones: CONFIG.defaultSettings.clockSecondaryTimezones,
      commandsColumns: CONFIG.defaultSettings.commandsColumns,
      customThemeBackground: '',
      customThemeText: '',
      customThemeTextSubtle: '',
      customThemeAccent: ''
    });

    const elements = {
      theme: this.shadowRoot.getElementById('theme'),
      defaultSearch: this.shadowRoot.getElementById('defaultSearch'),
      newTab: this.shadowRoot.getElementById('newTab'),
      pageTitle: this.shadowRoot.getElementById('pageTitle'),
      settingsIconHoverOnly: this.shadowRoot.getElementById('settingsIconHoverOnly'),
      weatherEnabled: this.shadowRoot.getElementById('weatherEnabled'),
      weatherLocation: this.shadowRoot.getElementById('weatherLocation'),
      weatherF: this.shadowRoot.getElementById('weatherF'),
      weatherHumidity: this.shadowRoot.getElementById('weatherHumidity'),
      weatherWind: this.shadowRoot.getElementById('weatherWind'),
      weatherUV: this.shadowRoot.getElementById('weatherUV'),
      clockEnabled: this.shadowRoot.getElementById('clockEnabled'),
      clock24h: this.shadowRoot.getElementById('clock24h'),
      clockShowDate: this.shadowRoot.getElementById('clockShowDate'),
      clockShowSeconds: this.shadowRoot.getElementById('clockShowSeconds'),
      clockSecondaryTimezones: this.shadowRoot.getElementById('clockSecondaryTimezones'),
      commandsColumns: this.shadowRoot.getElementById('commandsColumns')
    };

    Object.entries(elements).forEach(([key, element]) => {
      if (!element) return;
      if (element.type === 'checkbox') {
        element.checked = settings[key];
      } else {
        element.value = settings[key];
      }
    });

    this.applyTheme(settings.theme);

    // Pre-fill custom theme inputs (if any saved)
    const bgInput = this.shadowRoot.getElementById('customThemeBackground');
    const textInput = this.shadowRoot.getElementById('customThemeText');
    const textSubtleInput = this.shadowRoot.getElementById('customThemeTextSubtle');
    const accentInput = this.shadowRoot.getElementById('customThemeAccent');

    if (bgInput && settings.customThemeBackground) bgInput.value = settings.customThemeBackground;
    if (textInput && settings.customThemeText) textInput.value = settings.customThemeText;
    if (textSubtleInput && settings.customThemeTextSubtle) textSubtleInput.value = settings.customThemeTextSubtle;
    if (accentInput && settings.customThemeAccent) accentInput.value = settings.customThemeAccent;

    this.renderCommands();
  }

  setupEventListeners() {
    const elements = {
      theme: this.shadowRoot.getElementById('theme'),
      defaultSearch: this.shadowRoot.getElementById('defaultSearch'),
      newTab: this.shadowRoot.getElementById('newTab'),
      pageTitle: this.shadowRoot.getElementById('pageTitle'),
      settingsIconHoverOnly: this.shadowRoot.getElementById('settingsIconHoverOnly'),
      weatherEnabled: this.shadowRoot.getElementById('weatherEnabled'),
      weatherLocation: this.shadowRoot.getElementById('weatherLocation'),
      weatherF: this.shadowRoot.getElementById('weatherF'),
      weatherHumidity: this.shadowRoot.getElementById('weatherHumidity'),
      weatherWind: this.shadowRoot.getElementById('weatherWind'),
      weatherUV: this.shadowRoot.getElementById('weatherUV'),
      clockEnabled: this.shadowRoot.getElementById('clockEnabled'),
      clock24h: this.shadowRoot.getElementById('clock24h'),
      clockShowDate: this.shadowRoot.getElementById('clockShowDate'),
      clockShowSeconds: this.shadowRoot.getElementById('clockShowSeconds'),
      clockSecondaryTimezones: this.shadowRoot.getElementById('clockSecondaryTimezones'),
      commandsColumns: this.shadowRoot.getElementById('commandsColumns')
    };

    elements.theme?.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
      browser.storage.sync.set({ theme: e.target.value });
    });

    Object.entries(elements).forEach(([key, element]) => {
      if (!element || key === 'theme') return;
      element.addEventListener('change', (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        browser.storage.sync.set({ [key]: value });
      });
    });

    // Save secondary timezones as user types so closing the panel without blur still persists
    const secondaryTzEl = elements.clockSecondaryTimezones;
    if (secondaryTzEl) {
      secondaryTzEl.addEventListener('input', (e) => {
        browser.storage.sync.set({ clockSecondaryTimezones: e.target.value });
      });
    }

    // Search/filter bookmarks
    const searchInput = this.shadowRoot.getElementById('commandsSearch');
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = this.shadowRoot.querySelectorAll('.command-item');
      items.forEach(item => {
        const key = item.dataset.key.toLowerCase();
        const name = (item.dataset.name || '').toLowerCase();
        const matches = key.includes(query) || name.includes(query);
        item.style.display = matches ? '' : 'none';
      });
    });

    // Location autocomplete
    const locationInput = this.shadowRoot.getElementById('weatherLocation');
    const suggestionsEl = this.shadowRoot.getElementById('locationSuggestions');
    let debounceTimer = null;

    locationInput?.addEventListener('input', async (e) => {
      const query = e.target.value.trim();

      // Clear previous timer
      if (debounceTimer) clearTimeout(debounceTimer);

      // Hide suggestions if query is short
      if (query.length < 2) {
        suggestionsEl.classList.remove('visible');
        return;
      }

      // Debounce API call
      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            suggestionsEl.innerHTML = data.results.map(r => `
              <div class="location-suggestion" data-name="${r.name}, ${r.country}">
                ${r.name}<span class="country">${r.country}</span>
              </div>
            `).join('');
            suggestionsEl.classList.add('visible');

            // Add click handlers
            suggestionsEl.querySelectorAll('.location-suggestion').forEach(suggestion => {
              suggestion.addEventListener('click', () => {
                locationInput.value = suggestion.dataset.name;
                suggestionsEl.classList.remove('visible');
                browser.storage.sync.set({ weatherLocation: suggestion.dataset.name });
              });
            });
          } else {
            suggestionsEl.classList.remove('visible');
          }
        } catch (error) {
          console.error('Location search error:', error);
          suggestionsEl.classList.remove('visible');
        }
      }, 300);
    });

    // Hide suggestions on blur (with delay for click)
    locationInput?.addEventListener('blur', () => {
      setTimeout(() => suggestionsEl.classList.remove('visible'), 200);
    });

    // Custom theme editor toggle
    const toggleCustomTheme = this.shadowRoot.getElementById('toggleCustomTheme');
    const customThemeEditor = this.shadowRoot.getElementById('customThemeEditor');
    const bgInput = this.shadowRoot.getElementById('customThemeBackground');
    const textInput = this.shadowRoot.getElementById('customThemeText');
    const textSubtleInput = this.shadowRoot.getElementById('customThemeTextSubtle');
    const accentInput = this.shadowRoot.getElementById('customThemeAccent');
    const saveCustomTheme = this.shadowRoot.getElementById('saveCustomTheme');
    const resetCustomTheme = this.shadowRoot.getElementById('resetCustomTheme');
    const hiddenToggleListBtn = this.shadowRoot.getElementById('toggleHiddenCommandsList');
    const hiddenList = this.shadowRoot.getElementById('hiddenCommandsList');

    if (toggleCustomTheme && customThemeEditor) {
      toggleCustomTheme.addEventListener('click', () => {
        const isOpen = customThemeEditor.classList.toggle('open');
        toggleCustomTheme.textContent = isOpen
          ? 'Hide advanced theme editor'
          : 'Show advanced theme editor';
      });
    }

    if (saveCustomTheme) {
      saveCustomTheme.addEventListener('click', async () => {
        const values = {
          customThemeBackground: bgInput?.value || '',
          customThemeText: textInput?.value || '',
          customThemeTextSubtle: textSubtleInput?.value || '',
          customThemeAccent: accentInput?.value || ''
        };

        await browser.storage.sync.set({
          ...values,
          theme: 'custom'
        });

        const themeSelect = this.shadowRoot.getElementById('theme');
        if (themeSelect) {
          themeSelect.value = 'custom';
        }

        this.applyTheme('custom');
      });
    }

    if (resetCustomTheme) {
      resetCustomTheme.addEventListener('click', async () => {
        await browser.storage.sync.set({
          customThemeBackground: '',
          customThemeText: '',
          customThemeTextSubtle: '',
          customThemeAccent: ''
        });

        if (bgInput) bgInput.value = '';
        if (textInput) textInput.value = '';
        if (textSubtleInput) textSubtleInput.value = '';
        if (accentInput) accentInput.value = '';

        // If currently on custom theme, fall back to system
        const themeSelect = this.shadowRoot.getElementById('theme');
        if (themeSelect && themeSelect.value === 'custom') {
          themeSelect.value = 'system';
          this.applyTheme('system');
          browser.storage.sync.set({ theme: 'system' });
        } else {
          // Clear any custom overrides if not using custom
          this.applyTheme(elements.theme?.value || CONFIG.defaultSettings.theme);
        }
      });
    }

    if (hiddenToggleListBtn && hiddenList) {
      hiddenToggleListBtn.addEventListener('click', () => {
        const nowHidden = hiddenList.style.display === 'none' || hiddenList.style.display === '';
        hiddenList.style.display = nowHidden ? 'block' : 'none';

        // Extract count from existing text, preserve it
        const match = hiddenToggleListBtn.textContent.match(/\((\d+)\)/);
        const countText = match ? ` (${match[1]})` : '';
        hiddenToggleListBtn.textContent = `${nowHidden ? 'Hide' : 'Show'} hidden commands${countText}`;
      });
    }
  }

  applyTheme(theme) {
    const root = document.documentElement;

    const clearCustomOverrides = () => {
      root.style.removeProperty('--color-background');
      root.style.removeProperty('--color-text');
      root.style.removeProperty('--color-text-subtle');
      root.style.removeProperty('--color-accent');
    };

    if (theme === 'system') {
      clearCustomOverrides();
      root.removeAttribute('data-theme');
      return;
    }

    if (theme === 'custom') {
      // Use dark as a base and then override with user values
      root.setAttribute('data-theme', 'dark');
      browser.storage.sync.get({
        customThemeBackground: '',
        customThemeText: '',
        customThemeTextSubtle: '',
        customThemeAccent: ''
      }).then((values) => {
        if (values.customThemeBackground) {
          root.style.setProperty('--color-background', values.customThemeBackground);
        }
        if (values.customThemeText) {
          root.style.setProperty('--color-text', values.customThemeText);
        }
        if (values.customThemeTextSubtle) {
          root.style.setProperty('--color-text-subtle', values.customThemeTextSubtle);
        }
        if (values.customThemeAccent) {
          root.style.setProperty('--color-accent', values.customThemeAccent);
        }
      });
      return;
    }

    clearCustomOverrides();
    root.setAttribute('data-theme', theme);
  }

  async setupCustomCommands() {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const form = this.shadowRoot.getElementById('addCommandForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const key = this.shadowRoot.getElementById('commandKey').value.trim().toLowerCase();
      const name = this.shadowRoot.getElementById('commandName').value.trim();
      const url = this.shadowRoot.getElementById('commandUrl').value;
      const searchTemplate = this.shadowRoot.getElementById('commandSearchTemplate').value.trim();
      const suggestionsInput = this.shadowRoot.getElementById('commandSuggestions').value.trim();

      const { deletedCommands = [], customCommands = {} } = await browser.storage.sync.get(['deletedCommands', 'customCommands']);

      // Check if key already exists (but allow if it's being edited - in deletedCommands or already in customCommands being overwritten)
      const isBuiltinActive = COMMANDS.has(key) && !deletedCommands.includes(key);
      const isCustomExisting = customCommands.hasOwnProperty(key);

      if (isBuiltinActive) {
        alert(`Key '${key}' is a built-in command. Delete it first to override.`);
        return;
      }

      // Build command object - only include non-empty fields
      const command = { url };
      if (name) command.name = name;
      if (searchTemplate) command.searchTemplate = searchTemplate;
      if (suggestionsInput) {
        command.suggestions = suggestionsInput.split(',').map(s => s.trim()).filter(s => s);
      }

      customCommands[key] = command;
      await browser.storage.sync.set({ customCommands });

      // Clear editing state and hide cancel button
      this.#editingCommand = null;
      this.shadowRoot.getElementById('cancelEdit').classList.remove('visible');

      this.renderCommands();
      form.reset();
    });

    // Cancel edit button handler
    const cancelBtn = this.shadowRoot.getElementById('cancelEdit');
    cancelBtn.addEventListener('click', async () => {
      if (!this.#editingCommand) return;

      const { key, isBuiltin, name, url, searchTemplate, suggestions } = this.#editingCommand;

      // Restore the original command
      if (isBuiltin) {
        // Remove from deletedCommands to restore built-in
        const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
        await browser.storage.sync.set({
          deletedCommands: deletedCommands.filter(k => k !== key)
        });
      } else {
        // Re-add the custom command
        const { customCommands = {} } = await browser.storage.sync.get('customCommands');
        const command = { url };
        if (name) command.name = name;
        if (searchTemplate) command.searchTemplate = searchTemplate;
        if (suggestions?.length) command.suggestions = suggestions;
        customCommands[key] = command;
        await browser.storage.sync.set({ customCommands });
      }

      // Clear form and editing state
      this.#editingCommand = null;
      cancelBtn.classList.remove('visible');
      this.shadowRoot.getElementById('addCommandForm').reset();
      this.renderCommands();
    });
  }

  async renderCommands() {
    const list = this.shadowRoot.getElementById('commandsList');
    const hiddenList = this.shadowRoot.getElementById('hiddenCommandsList');
    const hiddenToggle = this.shadowRoot.getElementById('toggleHiddenCommandsList');
    if (!list || !hiddenList || !hiddenToggle) return;

    const { deletedCommands = [], customCommands = {}, commandsOrder = [] } =
      await browser.storage.sync.get(['deletedCommands', 'customCommands', 'commandsOrder']);

    // Combine built-in (non-deleted) and custom commands.
    // Use a Map so custom commands with the same key override built-ins,
    // matching the behavior of the grid component and avoiding duplicates.
    const allCommandsMap = new Map();

    for (const [key, cmd] of COMMANDS) {
      if (!deletedCommands.includes(key)) {
        allCommandsMap.set(key, { key, ...cmd, isBuiltin: true });
      }
    }

    for (const [key, cmd] of Object.entries(customCommands)) {
      allCommandsMap.set(key, { key, ...cmd, isBuiltin: false });
    }

    let allCommands = Array.from(allCommandsMap.values());

    // Sort by saved order (if exists), otherwise keep as-is
    if (commandsOrder.length > 0) {
      allCommands.sort((a, b) => {
        const indexA = commandsOrder.indexOf(a.key);
        const indexB = commandsOrder.indexOf(b.key);
        // Items not in order go to end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    const visibleCommands = allCommands.filter(cmd => !!cmd.name);
    const hiddenCommands = allCommands.filter(cmd => !cmd.name);

    const renderItem = (cmd, { draggable }) => {
      const icons = [];
      if (cmd.searchTemplate) icons.push('🔍');
      if (cmd.suggestions?.length) icons.push('📋');
      const iconStr = icons.length ? ` <em style="opacity:0.5; font-size:0.7rem">${icons.join('')}</em>` : '';

      return `
        <div class="command-item" draggable="${draggable}" data-key="${cmd.key}" data-builtin="${cmd.isBuiltin}" 
             data-name="${cmd.name || ''}" data-url="${cmd.url || ''}" 
             data-template="${cmd.searchTemplate || ''}" 
             data-suggestions="${(cmd.suggestions || []).join(',')}">
          ${draggable ? '<span class="drag-handle" title="Drag to reorder">⋮⋮</span>' : ''}
          <span class="command-key">${cmd.key}</span>
          <span class="command-name">${cmd.name || '<em style="opacity:0.5">hidden</em>'}${iconStr}</span>
          <div class="command-actions">
            <button class="edit-btn" title="Edit">✎</button>
            <button class="delete-btn" title="Delete">×</button>
          </div>
        </div>
      `;
    };

    list.innerHTML = visibleCommands.map(cmd => renderItem(cmd, { draggable: true })).join('');
    hiddenList.innerHTML = hiddenCommands.map(cmd => renderItem(cmd, { draggable: false })).join('');

    // Update hidden toggle state
    if (hiddenCommands.length === 0) {
      hiddenToggle.style.display = 'none';
      hiddenList.style.display = 'none';
    } else {
      hiddenToggle.style.display = 'block';
      // Preserve current open/closed state but update label with count
      const isOpen = hiddenList.style.display !== 'none';
      hiddenToggle.textContent = `${isOpen ? 'Hide' : 'Show'} hidden commands (${hiddenCommands.length})`;
    }

    // Drag and drop handlers
    let draggedItem = null;

    list.querySelectorAll('.command-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        list.querySelectorAll('.command-item').forEach(i => i.classList.remove('drag-over'));
        draggedItem = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedItem && draggedItem !== item) {
          item.classList.add('drag-over');
        }
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', async (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');

        if (draggedItem && draggedItem !== item) {
          // Determine if dropping above or below the target based on mouse position
          const rect = item.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;

          if (e.clientY < midY) {
            // Drop on top half -> insert before
            item.before(draggedItem);
          } else {
            // Drop on bottom half -> insert after
            item.after(draggedItem);
          }

          // Save new order
          const newOrder = [...list.querySelectorAll('.command-item')].map(i => i.dataset.key);
          await browser.storage.sync.set({ commandsOrder: newOrder });
        }
      });
    });

    // Edit button handlers
    list.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const item = btn.closest('.command-item');
        const key = item.dataset.key;
        const isBuiltin = item.dataset.builtin === 'true';

        // Store original command data for cancel
        this.#editingCommand = {
          key,
          isBuiltin,
          name: item.dataset.name,
          url: item.dataset.url,
          searchTemplate: item.dataset.template,
          suggestions: item.dataset.suggestions ? item.dataset.suggestions.split(',') : []
        };

        // Show cancel button
        this.shadowRoot.getElementById('cancelEdit').classList.add('visible');

        // Populate form with existing values
        const keyInput = this.shadowRoot.getElementById('commandKey');
        keyInput.value = key;
        this.shadowRoot.getElementById('commandName').value = item.dataset.name;
        this.shadowRoot.getElementById('commandUrl').value = item.dataset.url;
        this.shadowRoot.getElementById('commandSearchTemplate').value = item.dataset.template;
        this.shadowRoot.getElementById('commandSuggestions').value = item.dataset.suggestions;

        // Scroll to form and focus
        const form = this.shadowRoot.getElementById('addCommandForm');
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        keyInput.focus();

        // If editing, delete the old entry first (will be re-added on submit)
        if (isBuiltin) {
          const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
          await browser.storage.sync.set({ deletedCommands: [...deletedCommands, key] });
        } else {
          const { customCommands = {} } = await browser.storage.sync.get('customCommands');
          delete customCommands[key];
          await browser.storage.sync.set({ customCommands });
        }
        this.renderCommands();
      });
    });

    // Delete button handlers
    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const item = btn.closest('.command-item');
        const key = item.dataset.key;
        const isBuiltin = item.dataset.builtin === 'true';

        if (isBuiltin) {
          const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
          await browser.storage.sync.set({ deletedCommands: [...deletedCommands, key] });
        } else {
          const { customCommands = {} } = await browser.storage.sync.get('customCommands');
          delete customCommands[key];
          await browser.storage.sync.set({ customCommands });
        }
        this.renderCommands();
      });
    });
  }

  toggle() {
    const panel = this.shadowRoot.querySelector('.settings-panel');
    if (panel) {
      panel.classList.toggle('open');
    }
  }

  close() {
    const panel = this.shadowRoot.querySelector('.settings-panel');
    if (panel) {
      panel.classList.remove('open');
    }
  }
}

customElements.define('settings-panel', SettingsPanel);