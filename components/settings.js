class SettingsPanel extends HTMLElement {
  #initialized = false;

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
      <style>
        * {
          box-sizing: border-box;
        }

        .settings-panel {
          animation: slideUp 200ms ease-out;
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: none;
          max-height: 70vh;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 1.5rem;
          position: fixed;
          right: var(--space);
          bottom: calc(var(--space) * 4);
          width: min(90vw, 360px);
          z-index: 99;
        }

        .settings-panel::-webkit-scrollbar {
          display: none;
        }

        .settings-panel.open {
          display: block;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(136, 136, 136, 0.2);
        }

        .header h2 {
          color: var(--color-text);
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--color-text-subtle);
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          padding: 0;
          transition: color 150ms;
        }

        .close-btn:hover {
          color: var(--color-text);
        }

        .section {
          margin-bottom: 1.5rem;
        }

        .section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          color: var(--color-text-subtle);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 0.75rem 0;
        }

        .option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .option-label {
          color: var(--color-text);
          font-size: 0.9rem;
        }

        /* Toggle Switch */
        .toggle {
          position: relative;
          width: 40px;
          height: 22px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          inset: 0;
          background: rgba(136, 136, 136, 0.3);
          border-radius: 11px;
          cursor: pointer;
          transition: background 150ms;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background: white;
          border-radius: 50%;
          transition: transform 150ms;
        }

        .toggle input:checked + .toggle-slider {
          background: var(--color-accent);
        }

        .toggle input:checked + .toggle-slider::before {
          transform: translateX(18px);
        }

        /* Select */
        select {
          appearance: none;
          background: rgba(136, 136, 136, 0.1);
          border: 1px solid rgba(136, 136, 136, 0.2);
          border-radius: 6px;
          color: var(--color-text);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.4rem 2rem 0.4rem 0.75rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
        }

        select:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        /* Text Input */
        input[type="text"],
        input[type="url"],
        input[type="number"] {
          background: rgba(136, 136, 136, 0.1);
          border: 1px solid rgba(136, 136, 136, 0.2);
          border-radius: 6px;
          color: var(--color-text);
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          width: 100%;
        }

        input[type="text"]:focus,
        input[type="url"]:focus,
        input[type="number"]:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        input[type="number"] {
          width: 60px;
          text-align: center;
          -moz-appearance: textfield;
        }

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input::placeholder {
          color: var(--color-text-subtle);
        }

        /* Commands List */
        .commands-list {
          margin-top: 0.5rem;
        }

        .command-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(136, 136, 136, 0.1);
        }

        .command-item:last-child {
          border-bottom: none;
        }

        .command-key {
          background: rgba(136, 136, 136, 0.15);
          border-radius: 4px;
          color: var(--color-text);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          min-width: 2rem;
          text-align: center;
        }

        .command-name {
          color: var(--color-text-subtle);
          font-size: 0.85rem;
          flex: 1;
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--color-text-subtle);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          opacity: 0.5;
          transition: opacity 150ms, color 150ms;
        }

        .delete-btn:hover {
          color: #ff4a4a;
          opacity: 1;
        }

        /* Add Command Form */
        .add-form {
          display: grid;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(136, 136, 136, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 3rem 1fr;
          gap: 0.5rem;
        }

        .add-btn {
          background: var(--color-accent);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: opacity 150ms;
        }

        .add-btn:hover {
          opacity: 0.9;
        }

        .input-small {
          text-align: center;
        }

        .subsection {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(136, 136, 136, 0.1);
        }

        .subsection-title {
          color: var(--color-text-subtle);
          font-size: 0.8rem;
          margin: 0 0 0.5rem 0;
        }

        /* Info tooltip */
        .info-wrapper {
          position: relative;
          display: inline-block;
        }

        .info-btn {
          background: rgba(136, 136, 136, 0.2);
          border: none;
          border-radius: 50%;
          color: var(--color-text-subtle);
          cursor: help;
          font-size: 0.7rem;
          font-weight: 600;
          width: 16px;
          height: 16px;
          padding: 0;
          line-height: 16px;
          text-align: center;
          margin-left: 0.5rem;
        }

        .info-tooltip {
          display: none;
          position: fixed;
          right: calc(var(--space) + 380px);
          bottom: 150px;
          background: var(--color-background);
          border: 1px solid rgba(136, 136, 136, 0.3);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          padding: 0.75rem;
          width: 260px;
          z-index: 1001;
          font-size: 0.75rem;
          color: var(--color-text);
        }

        .info-wrapper:hover .info-tooltip {
          display: block;
        }

        .info-tooltip h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
          color: var(--color-text);
        }

        .info-tooltip code {
          background: rgba(136, 136, 136, 0.15);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.7rem;
        }

        .info-tooltip ul {
          margin: 0;
          padding-left: 1rem;
        }

        .info-tooltip li {
          margin-bottom: 0.3rem;
          color: var(--color-text-subtle);
        }

        .optional-label {
          color: var(--color-text-subtle);
          font-size: 0.7rem;
          margin-left: 0.25rem;
        }
      </style>

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

          <div class="option">
            <input type="text" id="weatherLocation" placeholder="Location (auto-detect if empty)">
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
          
          <div class="commands-list" id="commandsList"></div>

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
            <button type="submit" class="add-btn">Add Link</button>
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
            </select>
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
      </div>
    `;

    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => {
      this.close();
    });

    // Export settings
    this.shadowRoot.getElementById('exportSettings').addEventListener('click', async () => {
      const settings = await browser.storage.sync.get();
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
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
          const settings = JSON.parse(text);
          await browser.storage.sync.set(settings);
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
  }

  async loadSettings() {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const settings = await browser.storage.sync.get({
      theme: CONFIG.defaultSettings.theme,
      defaultSearch: CONFIG.defaultSettings.defaultSearch,
      newTab: CONFIG.defaultSettings.newTab,
      weatherEnabled: CONFIG.defaultSettings.weatherEnabled,
      weatherLocation: CONFIG.defaultSettings.weatherLocation,
      weatherF: CONFIG.defaultSettings.weatherF,
      clockEnabled: CONFIG.defaultSettings.clockEnabled,
      clock24h: CONFIG.defaultSettings.clock24h,
      clockShowDate: CONFIG.defaultSettings.clockShowDate,
      commandsColumns: CONFIG.defaultSettings.commandsColumns
    });

    const elements = {
      theme: this.shadowRoot.getElementById('theme'),
      defaultSearch: this.shadowRoot.getElementById('defaultSearch'),
      newTab: this.shadowRoot.getElementById('newTab'),
      weatherEnabled: this.shadowRoot.getElementById('weatherEnabled'),
      weatherLocation: this.shadowRoot.getElementById('weatherLocation'),
      weatherF: this.shadowRoot.getElementById('weatherF'),
      clockEnabled: this.shadowRoot.getElementById('clockEnabled'),
      clock24h: this.shadowRoot.getElementById('clock24h'),
      clockShowDate: this.shadowRoot.getElementById('clockShowDate'),
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
    this.renderCommands();
  }

  setupEventListeners() {
    const elements = {
      theme: this.shadowRoot.getElementById('theme'),
      defaultSearch: this.shadowRoot.getElementById('defaultSearch'),
      newTab: this.shadowRoot.getElementById('newTab'),
      weatherEnabled: this.shadowRoot.getElementById('weatherEnabled'),
      weatherLocation: this.shadowRoot.getElementById('weatherLocation'),
      weatherF: this.shadowRoot.getElementById('weatherF'),
      clockEnabled: this.shadowRoot.getElementById('clockEnabled'),
      clock24h: this.shadowRoot.getElementById('clock24h'),
      clockShowDate: this.shadowRoot.getElementById('clockShowDate'),
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
  }

  applyTheme(theme) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
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

      if (COMMANDS.has(key)) {
        alert(`Key '${key}' already exists.`);
        return;
      }

      const { customCommands = {} } = await browser.storage.sync.get('customCommands');

      // Build command object - only include non-empty fields
      const command = { url };
      if (name) command.name = name;
      if (searchTemplate) command.searchTemplate = searchTemplate;

      customCommands[key] = command;
      await browser.storage.sync.set({ customCommands });
      this.renderCommands();
      form.reset();
    });
  }

  async renderCommands() {
    const list = this.shadowRoot.getElementById('commandsList');
    if (!list) return;

    const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
    const { customCommands = {} } = await browser.storage.sync.get('customCommands');

    // Combine built-in (non-deleted) and custom commands
    const allCommands = [];

    for (const [key, cmd] of COMMANDS) {
      if (!deletedCommands.includes(key)) {
        allCommands.push({ key, ...cmd, isBuiltin: true });
      }
    }

    for (const [key, cmd] of Object.entries(customCommands)) {
      allCommands.push({ key, ...cmd, isBuiltin: false });
    }

    list.innerHTML = allCommands.map(cmd => `
      <div class="command-item" data-key="${cmd.key}" data-builtin="${cmd.isBuiltin}">
        <span class="command-key">${cmd.key}</span>
        <span class="command-name">${cmd.name || '<em style="opacity:0.5">hidden</em>'}${cmd.searchTemplate ? ' <em style="opacity:0.5; font-size:0.7rem">🔍</em>' : ''}</span>
        <button class="delete-btn" title="Delete">×</button>
      </div>
    `).join('');

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