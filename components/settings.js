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
        this.setupCustomSearchEngines();
        this.setupCustomCommands();
        this.setupRssFeeds();
        this.#initialized = true;
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .settings-panel {
          animation: slideUp var(--animation-duration) ease-out;
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: var(--elevation-2);
          display: none;
          max-height: 80vh;
          overflow-y: auto;
          padding: var(--space);
          position: fixed;
          right: var(--space);
          bottom: calc(var(--space) * 4);
          width: min(90vw, 400px);
          z-index: 99;
        }

        .settings-panel.open {
          display: block;
        }

        .settings-section {
          border-bottom: 1px solid var(--color-text-subtle);
          padding: calc(var(--space) * 1.5) 0;
        }

        .settings-section:last-child {
          border-bottom: none;
        }

        h2, h3 {
          color: var(--color-text);
          margin: 0;
          font-size: 1.2em;
          font-weight: 600;
          margin-bottom: var(--space);
        }

        h4 {
          color: var(--color-text);
          margin: var(--space) 0;
          font-size: 0.9em;
          opacity: 0.8;
        }

        .form-group {
          margin: calc(var(--space) * 0.75) 0;
        }

        .form-group input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid var(--color-text-subtle);
          border-radius: 4px;
          margin: 0;
          cursor: pointer;
          position: relative;
          transition: all var(--transition-speed);
        }

        .form-group input[type="checkbox"]:checked {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }

        .form-group input[type="checkbox"]:checked::after {
          content: '✓';
          color: white;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
        }

        .form-group input[type="checkbox"]:hover {
          border-color: var(--color-accent);
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: calc(var(--space) / 2);
          color: var(--color-text);
          font-size: 0.9em;
          cursor: pointer;
          user-select: none;
        }

        .form-group input,
        .form-group select {
          background: transparent;
          border: 1px solid var(--color-text-subtle);
          border-radius: calc(var(--border-radius) / 2);
          color: var(--color-text);
          padding: calc(var(--space) / 3);
          width: 100%;
          font-size: 0.9em;
          transition: border-color var(--transition-speed);
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: var(--color-accent);
          outline: none;
        }

        .settings-grid {
          display: grid;
          gap: calc(var(--space) / 2);
          margin-top: var(--space);
        }

        button {
          background: var(--color-accent);
          border: none;
          border-radius: calc(var(--border-radius) / 2);
          color: white;
          cursor: pointer;
          padding: calc(var(--space) / 3) var(--space);
          font-size: 0.9em;
          opacity: 0.85;
          transition: opacity var(--transition-speed);
        }

        button:hover {
          opacity: 1;
        }

        .close-button {
          position: absolute;
          top: var(--space);
          right: var(--space);
          background: transparent;
          color: var(--color-text);
          opacity: 0.6;
          font-size: 1.5em;
          padding: 0;
        }

        .settings-panel::-webkit-scrollbar {
          width: 6px;
        }

        .settings-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .settings-panel::-webkit-scrollbar-thumb {
          background: var(--color-text-subtle);
          border-radius: 3px;
          opacity: 0.5;
        }

        .custom-list,
        .custom-search-list {
          list-style: none;
          padding: 0;
          margin: var(--space) 0;
        }

        .custom-item,
        .custom-search-item {
          display: flex;
          align-items: center;
          gap: var(--space);
          padding: calc(var(--space) / 2);
          background: var(--color-overlay);
          border-radius: calc(var(--border-radius) / 2);
          margin-bottom: calc(var(--space) / 2);
        }
      </style>
      <div class="settings-panel">
        <button class="close-button" aria-label="Close settings">×</button>
        <h2>Settings</h2>
        
        <div class="settings-section">
          <h3>Appearance</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label for="theme">Theme</label>
              <select id="theme">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div class="form-group">
              <label for="layout">Layout</label>
              <select id="layout">
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Commands</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label for="commandsColumns">Grid Columns</label>
              <select id="commandsColumns">
                <option value="auto">Auto</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="6">6</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="commandsShowKeys">
                Show Command Keys
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="commandsShowNames">
                Show Command Names
              </label>
            </div>
          </div>
          <div class="form-group">
            <h4>Deleted Built-in Commands</h4>
            <div id="hiddenCommandsList"></div>
          </div>
          <div class="form-group">
            <h4>Built-in Commands</h4>
            <div id="builtinCommandsList"></div>
          </div>
          <div class="form-group">
            <h4>Custom Commands</h4>
            <ul class="custom-list" id="customCommandList"></ul>
            <form class="add-form" id="addCommandForm">
              <div class="form-group">
                <label for="commandKey">Key (shortcut)</label>
                <input type="text" id="commandKey" maxlength="10" required>
              </div>
              <div class="form-group">
                <label for="commandName">Name</label>
                <input type="text" id="commandName" required>
              </div>
              <div class="form-group">
                <label for="commandUrl">URL</label>
                <input type="url" id="commandUrl" required>
              </div>
              <div class="form-group">
                <label for="commandSearchTemplate">Search Template (optional)</label>
                <input type="text" id="commandSearchTemplate" 
                  placeholder="?q={} or /search?q={}">
              </div>
              <button type="submit">Add Command</button>
            </form>
          </div>
        </div>

        <div class="settings-section">
          <h3>Search</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label for="defaultSearch">Default Search Engine</label>
              <select id="defaultSearch">
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <optgroup label="Custom" id="customSearchOptions"></optgroup>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="newTab">
                Open links in new tab
              </label>
            </div>
          </div>
          <div class="form-group">
            <h4>Custom Search Engines</h4>
            <ul class="custom-search-list" id="customSearchList"></ul>
            <form class="add-form" id="addSearchForm">
              <div class="form-group">
                <label for="searchName">Name</label>
                <input type="text" id="searchName" required>
              </div>
              <div class="form-group">
                <label for="searchUrl">Search URL (use {} for query)</label>
                <input type="text" id="searchUrl" 
                  placeholder="https://example.com/search?q={}" required>
              </div>
              <button type="submit">Add Search Engine</button>
            </form>
          </div>
        </div>

        <div class="settings-section">
          <h3>Weather</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="weatherEnabled">
                Show weather widget
              </label>
            </div>
            <div class="form-group">
              <label for="weatherLocation">Custom Location</label>
              <input type="text" id="weatherLocation" 
                placeholder="e.g., London or Paris,France">
              <small class="help-text">Leave empty for auto-detection</small>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="weatherF">
                Use Fahrenheit
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Clock</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="clockEnabled">
                Show clock widget
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="clock24h">
                Use 24-hour format
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="clockShowDate">
                Show date
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Notes</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="notesEnabled">
                Show notes widget
              </label>
            </div>
            <div class="form-group">
              <label for="notesPosition">Position</label>
              <select id="notesPosition">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="notesExpanded">
                Start expanded
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Data</h3>
          <button id="exportData">Export Settings</button>
          <button id="importData">Import Settings</button>
          <button id="resetData">Reset to Default</button>
        </div>

        <div class="settings-section">
          <h3>Bookmarks</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="bookmarksEnabled">
                Show bookmarks bar
              </label>
            </div>
            <div class="form-group">
              <label for="bookmarksPosition">Position</label>
              <select id="bookmarksPosition">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
            <div class="form-group">
              <label for="bookmarksLimit">Number of bookmarks</label>
              <input type="number" id="bookmarksLimit" min="1" max="20">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="bookmarksShowFavicons">
                Show favicons
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Todo List</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="todoEnabled">
                Show todo widget
              </label>
            </div>
            <div class="form-group">
              <label for="todoPosition">Position</label>
              <select id="todoPosition">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="form-group">
              <label>Categories</label>
              <div id="todoCategories"></div>
              <button id="addTodoCategory">Add Category</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>RSS Feeds</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="rssEnabled">
                Show RSS widget
              </label>
            </div>
            <div class="form-group">
              <label for="rssPosition">Position</label>
              <select id="rssPosition">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="form-group">
              <label for="rssRefreshInterval">Refresh interval (minutes)</label>
              <input type="number" id="rssRefreshInterval" min="5" max="120" step="5">
            </div>
          </div>
          <div class="form-group">
            <h4>Feed Sources</h4>
            <ul class="feed-list" id="rssFeedList"></ul>
            <form class="add-form" id="addRssFeedForm">
              <div class="form-group">
                <label for="feedName">Feed Name</label>
                <input type="text" id="feedName" required>
              </div>
              <div class="form-group">
                <label for="feedUrl">Feed URL</label>
                <input type="url" id="feedUrl" required 
                  placeholder="https://example.com/feed.xml">
              </div>
              <button type="submit">Add Feed</button>
            </form>
          </div>
        </div>

        <div class="settings-section">
          <h3>Calendar</h3>
          <div class="settings-grid">
            <div class="form-group">
              <label>
                <input type="checkbox" id="calendarEnabled">
                Show calendar widget
              </label>
            </div>
            <div class="form-group">
              <label for="calendarPosition">Position</label>
              <select id="calendarPosition">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="form-group">
              <label for="calendarView">Default View</label>
              <select id="calendarView">
                <option value="month">Month</option>
                <option value="week">Week</option>
              </select>
            </div>
            <div class="form-group">
              <label for="calendarFirstDay">First Day of Week</label>
              <select id="calendarFirstDay">
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="calendarShowEvents">
                Show events
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.close-button').addEventListener('click', () => {
      this.shadowRoot.querySelector('.settings-panel').classList.remove('open');
    });
  }

  async loadSettings() {
    // Wait for DOM to be ready
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Load all settings with defaults from CONFIG
    const settings = await browser.storage.sync.get({
      theme: CONFIG.defaultSettings.theme,
      layout: CONFIG.defaultSettings.layout,
      defaultSearch: CONFIG.defaultSettings.defaultSearch,
      newTab: CONFIG.defaultSettings.newTab,
      weatherEnabled: CONFIG.defaultSettings.weatherEnabled,
      weatherLocation: CONFIG.defaultSettings.weatherLocation,
      weatherF: CONFIG.defaultSettings.weatherF,
      clockEnabled: CONFIG.defaultSettings.clockEnabled,
      clock24h: CONFIG.defaultSettings.clock24h,
      clockShowDate: CONFIG.defaultSettings.clockShowDate,
      notesEnabled: CONFIG.defaultSettings.notesEnabled,
      notesPosition: CONFIG.defaultSettings.notesPosition,
      notesExpanded: CONFIG.defaultSettings.notesExpanded,
      commandsColumns: CONFIG.defaultSettings.commandsColumns,
      commandsShowKeys: CONFIG.defaultSettings.commandsShowKeys,
      commandsShowNames: CONFIG.defaultSettings.commandsShowNames,
      exportBtn: CONFIG.defaultSettings.exportBtn,
      importBtn: CONFIG.defaultSettings.importBtn,
      resetBtn: CONFIG.defaultSettings.resetBtn,
      backgroundType: CONFIG.defaultSettings.backgroundType,
      backgroundColor: CONFIG.defaultSettings.backgroundColor,
      backgroundColorText: CONFIG.defaultSettings.backgroundColorText,
      backgroundImage: CONFIG.defaultSettings.backgroundImage,
      backgroundBlur: CONFIG.defaultSettings.backgroundBlur,
      backgroundOpacity: CONFIG.defaultSettings.backgroundOpacity,
      bookmarksEnabled: CONFIG.defaultSettings.bookmarksEnabled,
      bookmarksPosition: CONFIG.defaultSettings.bookmarksPosition,
      bookmarksLimit: CONFIG.defaultSettings.bookmarksLimit,
      bookmarksShowFavicons: CONFIG.defaultSettings.bookmarksShowFavicons,
      todoEnabled: CONFIG.defaultSettings.todoEnabled,
      todoPosition: CONFIG.defaultSettings.todoPosition,
      addTodoCategory: CONFIG.defaultSettings.addTodoCategory,
      rssEnabled: CONFIG.defaultSettings.rssEnabled,
      rssPosition: CONFIG.defaultSettings.rssPosition,
      rssRefreshInterval: CONFIG.defaultSettings.rssRefreshInterval,
      rssFeeds: CONFIG.defaultSettings.rssFeeds,
      calendarEnabled: CONFIG.defaultSettings.calendarEnabled,
      calendarPosition: CONFIG.defaultSettings.calendarPosition,
      calendarView: CONFIG.defaultSettings.calendarView,
      calendarFirstDay: CONFIG.defaultSettings.calendarFirstDay,
      calendarShowEvents: CONFIG.defaultSettings.calendarShowEvents
    });

    // Get all setting elements
    const elements = {
      // Theme settings
      theme: this.shadowRoot.getElementById('theme'),
      layout: this.shadowRoot.getElementById('layout'),
      
      // Search settings
      defaultSearch: this.shadowRoot.getElementById('defaultSearch'),
      newTab: this.shadowRoot.getElementById('newTab'),
      
      // Weather settings
      weatherEnabled: this.shadowRoot.getElementById('weatherEnabled'),
      weatherLocation: this.shadowRoot.getElementById('weatherLocation'),
      weatherF: this.shadowRoot.getElementById('weatherF'),
      
      // Clock settings
      clockEnabled: this.shadowRoot.getElementById('clockEnabled'),
      clock24h: this.shadowRoot.getElementById('clock24h'),
      clockShowDate: this.shadowRoot.getElementById('clockShowDate'),
      
      // Notes settings
      notesEnabled: this.shadowRoot.getElementById('notesEnabled'),
      notesPosition: this.shadowRoot.getElementById('notesPosition'),
      notesExpanded: this.shadowRoot.getElementById('notesExpanded'),
      
      // Commands settings
      commandsColumns: this.shadowRoot.getElementById('commandsColumns'),
      commandsShowKeys: this.shadowRoot.getElementById('commandsShowKeys'),
      commandsShowNames: this.shadowRoot.getElementById('commandsShowNames'),
      
      // Data management
      exportBtn: this.shadowRoot.getElementById('exportData'),
      importBtn: this.shadowRoot.getElementById('importData'),
      resetBtn: this.shadowRoot.getElementById('resetData'),
      
      // Background settings
      backgroundType: this.shadowRoot.getElementById('backgroundType'),
      backgroundColor: this.shadowRoot.getElementById('backgroundColor'),
      backgroundColorText: this.shadowRoot.getElementById('backgroundColorText'),
      backgroundImage: this.shadowRoot.getElementById('backgroundImage'),
      backgroundBlur: this.shadowRoot.getElementById('backgroundBlur'),
      backgroundOpacity: this.shadowRoot.getElementById('backgroundOpacity'),
      
      // Bookmarks settings
      bookmarksEnabled: this.shadowRoot.getElementById('bookmarksEnabled'),
      bookmarksPosition: this.shadowRoot.getElementById('bookmarksPosition'),
      bookmarksLimit: this.shadowRoot.getElementById('bookmarksLimit'),
      bookmarksShowFavicons: this.shadowRoot.getElementById('bookmarksShowFavicons'),
      
      // Todo settings
      todoEnabled: this.shadowRoot.getElementById('todoEnabled'),
      todoPosition: this.shadowRoot.getElementById('todoPosition'),
      addTodoCategory: this.shadowRoot.getElementById('addTodoCategory'),
      
      // RSS settings
      rssEnabled: this.shadowRoot.getElementById('rssEnabled'),
      rssPosition: this.shadowRoot.getElementById('rssPosition'),
      rssRefreshInterval: this.shadowRoot.getElementById('rssRefreshInterval'),
      
      // Calendar settings
      calendarEnabled: this.shadowRoot.getElementById('calendarEnabled'),
      calendarPosition: this.shadowRoot.getElementById('calendarPosition'),
      calendarView: this.shadowRoot.getElementById('calendarView'),
      calendarFirstDay: this.shadowRoot.getElementById('calendarFirstDay'),
      calendarShowEvents: this.shadowRoot.getElementById('calendarShowEvents')
    };

    // Set initial values for all elements
    Object.entries(elements).forEach(([key, element]) => {
      if (!element) return;
      
      if (element.type === 'checkbox') {
        element.checked = settings[key];
      } else if (element.tagName === 'SELECT' || element.type === 'text') {
        element.value = settings[key];
      }
    });

    // Render todo categories
    this.renderTodoCategories(settings.todoCategories || []);

    // Render RSS feeds
    this.renderRssFeeds(settings.rssFeeds || []);

    // Render deleted commands
    const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
    this.renderDeletedCommands(deletedCommands);
    this.renderBuiltinCommands();

    // Apply initial settings
    this.applyTheme(settings.theme);
    this.applyLayout(settings.layout);
  }

  setupEventListeners() {
    // Get all elements
    const elements = {
      // Theme settings
      theme: this.shadowRoot.getElementById('theme'),
      layout: this.shadowRoot.getElementById('layout'),
      
      // Search settings
      defaultSearch: this.shadowRoot.getElementById('defaultSearch'),
      newTab: this.shadowRoot.getElementById('newTab'),
      
      // Weather settings
      weatherEnabled: this.shadowRoot.getElementById('weatherEnabled'),
      weatherLocation: this.shadowRoot.getElementById('weatherLocation'),
      weatherF: this.shadowRoot.getElementById('weatherF'),
      
      // Clock settings
      clockEnabled: this.shadowRoot.getElementById('clockEnabled'),
      clock24h: this.shadowRoot.getElementById('clock24h'),
      clockShowDate: this.shadowRoot.getElementById('clockShowDate'),
      
      // Notes settings
      notesEnabled: this.shadowRoot.getElementById('notesEnabled'),
      notesPosition: this.shadowRoot.getElementById('notesPosition'),
      notesExpanded: this.shadowRoot.getElementById('notesExpanded'),
      
      // Commands settings
      commandsColumns: this.shadowRoot.getElementById('commandsColumns'),
      commandsShowKeys: this.shadowRoot.getElementById('commandsShowKeys'),
      commandsShowNames: this.shadowRoot.getElementById('commandsShowNames'),
      
      // Data management
      exportBtn: this.shadowRoot.getElementById('exportData'),
      importBtn: this.shadowRoot.getElementById('importData'),
      resetBtn: this.shadowRoot.getElementById('resetData'),
      
      // Background settings
      backgroundType: this.shadowRoot.getElementById('backgroundType'),
      backgroundColor: this.shadowRoot.getElementById('backgroundColor'),
      backgroundColorText: this.shadowRoot.getElementById('backgroundColorText'),
      backgroundImage: this.shadowRoot.getElementById('backgroundImage'),
      backgroundBlur: this.shadowRoot.getElementById('backgroundBlur'),
      backgroundOpacity: this.shadowRoot.getElementById('backgroundOpacity'),
      
      // Bookmarks settings
      bookmarksEnabled: this.shadowRoot.getElementById('bookmarksEnabled'),
      bookmarksPosition: this.shadowRoot.getElementById('bookmarksPosition'),
      bookmarksLimit: this.shadowRoot.getElementById('bookmarksLimit'),
      bookmarksShowFavicons: this.shadowRoot.getElementById('bookmarksShowFavicons'),
      
      // Todo settings
      todoEnabled: this.shadowRoot.getElementById('todoEnabled'),
      todoPosition: this.shadowRoot.getElementById('todoPosition'),
      addTodoCategory: this.shadowRoot.getElementById('addTodoCategory'),
      
      // RSS settings
      rssEnabled: this.shadowRoot.getElementById('rssEnabled'),
      rssPosition: this.shadowRoot.getElementById('rssPosition'),
      rssRefreshInterval: this.shadowRoot.getElementById('rssRefreshInterval'),
      
      // Calendar settings
      calendarEnabled: this.shadowRoot.getElementById('calendarEnabled'),
      calendarPosition: this.shadowRoot.getElementById('calendarPosition'),
      calendarView: this.shadowRoot.getElementById('calendarView'),
      calendarFirstDay: this.shadowRoot.getElementById('calendarFirstDay'),
      calendarShowEvents: this.shadowRoot.getElementById('calendarShowEvents')
    };

    // Theme handling
    elements.theme?.addEventListener('change', (e) => {
      this.setTheme(e.target.value);
    });

    // Layout handling
    elements.layout?.addEventListener('change', (e) => {
      this.setLayout(e.target.value);
    });

    // Add event listeners for all checkbox and select elements
    Object.entries(elements).forEach(([key, element]) => {
      if (!element || ['exportBtn', 'importBtn', 'resetBtn', 'addTodoCategory', 'addRssFeed'].includes(key)) return;

      element.addEventListener('change', (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        console.log(`Setting ${key} to:`, value); // Debug log
        browser.storage.sync.set({ [key]: value });
      });
    });

    // Data management
    elements.exportBtn?.addEventListener('click', () => this.exportSettings());
    elements.importBtn?.addEventListener('click', () => this.importSettings());
    elements.resetBtn?.addEventListener('click', () => this.resetSettings());

    // Todo Categories
    elements.addTodoCategory?.addEventListener('click', async () => {
      const category = prompt('Enter category name:');
      if (!category) return;

      const { todoCategories = [] } = await browser.storage.sync.get('todoCategories');
      if (!todoCategories.includes(category)) {
        todoCategories.push(category);
        await browser.storage.sync.set({ todoCategories });
        this.renderTodoCategories(todoCategories);
      }
    });

    // RSS Feeds
    elements.addRssFeed?.addEventListener('click', async () => {
      const name = prompt('Enter feed name:');
      if (!name) return;
      
      const url = prompt('Enter feed URL:');
      if (!url) return;

      const { rssFeeds = [] } = await browser.storage.sync.get('rssFeeds');
      rssFeeds.push({ name, url });
      await browser.storage.sync.set({ rssFeeds });
      this.renderRssFeeds(rssFeeds);
    });
  }

  setTheme(theme) {
    this.applyTheme(theme);
    browser.storage.sync.set({ theme });
  }

  applyTheme(theme) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  setLayout(layout) {
    this.applyLayout(layout);
    browser.storage.sync.set({ layout });
  }

  applyLayout(layout) {
    document.documentElement.setAttribute('data-layout', layout);
    // Dispatch event for other components to update their layout
    window.dispatchEvent(new CustomEvent('layoutchange', { detail: { layout } }));
  }

  async exportSettings() {
    const settings = await browser.storage.sync.get();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'startpage-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        const text = await file.text();
        const settings = JSON.parse(text);
        await browser.storage.sync.set(settings);
        this.loadSettings(); // Reload settings without page refresh
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    input.click();
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings?')) {
      await browser.storage.sync.set(CONFIG.defaultSettings);
      this.loadSettings();
    }
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

  async setupCustomSearchEngines() {
    // Wait for DOM to be ready
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const { customSearchEngines = {} } = await browser.storage.sync.get('customSearchEngines');
    this.renderCustomSearchEngines(customSearchEngines);

    // Add search engine form
    const form = this.shadowRoot.getElementById('addSearchForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = this.shadowRoot.getElementById('searchName').value;
      const url = this.shadowRoot.getElementById('searchUrl').value;

      const { customSearchEngines = {} } = await browser.storage.sync.get('customSearchEngines');
      const key = name.toLowerCase().replace(/\s+/g, '-');

      customSearchEngines[key] = {
        name,
        template: url,
      };

      await browser.storage.sync.set({ customSearchEngines });
      this.renderCustomSearchEngines(customSearchEngines);
      form.reset();
    });
  }

  async renderCustomSearchEngines(engines) {
    const list = this.shadowRoot.getElementById('customSearchList');
    const optgroup = this.shadowRoot.getElementById('customSearchOptions');
    list.innerHTML = '';
    optgroup.innerHTML = '';

    for (const [key, engine] of Object.entries(engines)) {
      // Add to list
      const li = document.createElement('li');
      li.className = 'custom-search-item';
      li.innerHTML = `
        <span>${engine.name}</span>
        <button type="button" data-key="${key}">Remove</button>
      `;
      list.appendChild(li);

      // Add to select options
      const option = document.createElement('option');
      option.value = key;
      option.textContent = engine.name;
      optgroup.appendChild(option);
    }

    // Add remove handlers
    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.key;
        const { customSearchEngines = {} } = await browser.storage.sync.get('customSearchEngines');
        delete customSearchEngines[key];
        await browser.storage.sync.set({ customSearchEngines });
        this.renderCustomSearchEngines(customSearchEngines);
      });
    });
  }

  async setupCustomCommands() {
    // Wait for DOM to be ready
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const { customCommands = {} } = await browser.storage.sync.get('customCommands');
    this.renderCustomCommands(customCommands);

    // Add command form
    const form = this.shadowRoot.getElementById('addCommandForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const key = this.shadowRoot.getElementById('commandKey').value.trim();
      const name = this.shadowRoot.getElementById('commandName').value;
      const url = this.shadowRoot.getElementById('commandUrl').value;
      const searchTemplate = this.shadowRoot.getElementById('commandSearchTemplate').value;

      const { customCommands = {} } = await browser.storage.sync.get('customCommands');

      // Check if key already exists in built-in commands
      if (COMMANDS.has(key)) {
        alert(`Command key '${key}' already exists in built-in commands.`);
        return;
      }

      customCommands[key] = {
        name,
        url,
        ...(searchTemplate && { searchTemplate })
      };

      await browser.storage.sync.set({ customCommands });
      this.renderCustomCommands(customCommands);
      form.reset();
    });
  }

  async renderCustomCommands(commands) {
    const list = this.shadowRoot.getElementById('customCommandList');
    list.innerHTML = '';

    for (const [key, command] of Object.entries(commands)) {
      const li = document.createElement('li');
      li.className = 'custom-item';
      li.innerHTML = `
        <span class="command-key">${key}</span>
        <span>${command.name}</span>
        ${command.searchTemplate ? '<span>(with search)</span>' : ''}
        <button type="button" data-key="${key}">Remove</button>
      `;
      list.appendChild(li);
    }

    // Add remove handlers
    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.key;
        const { customCommands = {} } = await browser.storage.sync.get('customCommands');
        delete customCommands[key];
        await browser.storage.sync.set({ customCommands });
        this.renderCustomCommands(customCommands);
      });
    });
  }

  async renderTodoCategories(categories) {
    const container = this.shadowRoot.getElementById('todoCategories');
    container.innerHTML = categories.map(category => `
      <div class="todo-category">
        <span>${category}</span>
        <button data-category="${category}">×</button>
      </div>
    `).join('');

    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const category = btn.dataset.category;
        const { todoCategories = [] } = await browser.storage.sync.get('todoCategories');
        const newCategories = todoCategories.filter(c => c !== category);
        await browser.storage.sync.set({ todoCategories: newCategories });
        this.renderTodoCategories(newCategories);
      });
    });
  }

  async renderRssFeeds(feeds) {
    const list = this.shadowRoot.getElementById('rssFeedList');
    if (!list) return;

    list.innerHTML = feeds.map(feed => `
      <li class="feed-item">
        <div>
          <strong>${feed.name}</strong>
          <small>${feed.url}</small>
        </div>
        <button type="button" data-url="${feed.url}">Remove</button>
      </li>
    `).join('');

    // Add remove handlers
    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = btn.dataset.url;
        const { rssFeeds = [] } = await browser.storage.sync.get('rssFeeds');
        const newFeeds = rssFeeds.filter(f => f.url !== url);
        await browser.storage.sync.set({ rssFeeds: newFeeds });
        this.renderRssFeeds(newFeeds);
      });
    });
  }

  setupRssFeeds() {
    // Add RSS feed form handler
    const form = this.shadowRoot.getElementById('addRssFeedForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = this.shadowRoot.getElementById('feedName');
      const urlInput = this.shadowRoot.getElementById('feedUrl');
      
      if (!nameInput || !urlInput) return;
      
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      
      if (!name || !url) return;

      const { rssFeeds = [] } = await browser.storage.sync.get('rssFeeds');
      if (!rssFeeds.some(f => f.url === url)) {
        const newFeeds = [...rssFeeds, { name, url }];
        await browser.storage.sync.set({ rssFeeds: newFeeds });
        this.renderRssFeeds(newFeeds);
        nameInput.value = '';
        urlInput.value = '';
      }
    });
  }

  async renderDeletedCommands(deletedCommands) {
    const container = this.shadowRoot.getElementById('hiddenCommandsList');
    if (!container) return;
    
    container.innerHTML = deletedCommands.map(key => {
      const command = COMMANDS.get(key);
      if (!command) return '';
      return `
        <div class="custom-item">
          <span class="command-key">${key}</span>
          <span>${command.name}</span>
          <button type="button" data-key="${key}">Restore Command</button>
        </div>
      `;
    }).join('');
    
    // Add restore handlers
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.key;
        const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
        const newDeletedCommands = deletedCommands.filter(k => k !== key);
        await browser.storage.sync.set({ deletedCommands: newDeletedCommands });
        this.renderDeletedCommands(newDeletedCommands);
        this.renderBuiltinCommands();
      });
    });
  }

  async renderBuiltinCommands() {
    const container = this.shadowRoot.getElementById('builtinCommandsList');
    if (!container) return;
    
    // Get deleted commands
    const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
    
    container.innerHTML = Array.from(COMMANDS)
      .filter(([key]) => !deletedCommands.includes(key))
      .map(([key, command]) => `
        <div class="custom-item">
          <span class="command-key">${key}</span>
          <span>${command.name}</span>
          <span>${command.url}</span>
          ${command.searchTemplate ? '<span>(with search)</span>' : ''}
          <button type="button" data-key="${key}">Delete</button>
        </div>
      `).join('');
    
    // Add delete handlers
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.key;
        const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
        if (!deletedCommands.includes(key)) {
          const newDeletedCommands = [...deletedCommands, key];
          await browser.storage.sync.set({ deletedCommands: newDeletedCommands });
          this.renderDeletedCommands(newDeletedCommands);
          this.renderBuiltinCommands();
        }
      });
    });
  }
}

customElements.define('settings-panel', SettingsPanel); 