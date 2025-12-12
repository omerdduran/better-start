class BookmarksBar extends HTMLElement {
  #settings = {
    enabled: true,
    position: 'top',
    limit: 10,
    showFavicons: true
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadSettings();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadSettings() {
    const settings = await browser.storage.sync.get({
      bookmarksEnabled: CONFIG.defaultSettings.bookmarksEnabled,
      bookmarksPosition: CONFIG.defaultSettings.bookmarksPosition,
      bookmarksLimit: CONFIG.defaultSettings.bookmarksLimit,
      bookmarksShowFavicons: CONFIG.defaultSettings.bookmarksShowFavicons
    });

    this.#settings = {
      enabled: settings.bookmarksEnabled,
      position: settings.bookmarksPosition,
      limit: settings.bookmarksLimit,
      showFavicons: settings.bookmarksShowFavicons
    };

    this.render();
    if (this.#settings.enabled) {
      this.loadBookmarks();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .bookmarks-bar {
          position: fixed;
          left: 0;
          right: 0;
          padding: var(--space);
          display: ${this.#settings.enabled ? 'flex' : 'none'};
          gap: var(--space);
          background: var(--color-background);
          box-shadow: var(--elevation-1);
          z-index: 10;
          ${this.#settings.position === 'top' ? 'top: 0;' : 'bottom: 0;'}
        }
        .bookmark {
          display: flex;
          align-items: center;
          gap: calc(var(--space) / 2);
          color: var(--color-text);
          text-decoration: none;
          opacity: 0.8;
          transition: opacity var(--transition-speed);
        }
        .bookmark:hover {
          opacity: 1;
        }
        .favicon {
          width: 16px;
          height: 16px;
          ${this.#settings.showFavicons ? '' : 'display: none;'}
        }
      </style>
      <nav class="bookmarks-bar"></nav>
    `;
  }

  async loadBookmarks() {
    try {
      const bookmarks = await browser.bookmarks.getRecent(this.#settings.limit);
      const container = this.shadowRoot.querySelector('.bookmarks-bar');

      container.innerHTML = bookmarks.map(bookmark => `
        <a href="${bookmark.url}" class="bookmark" title="${bookmark.title}">
          ${this.#settings.showFavicons ?
          `<img class="favicon" src="${window.BrowserInfo.getFaviconUrl(bookmark.url)}" alt="">` :
          ''
        }
          <span>${bookmark.title}</span>
        </a>
      `).join('');
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }

  #onStorageChange = (changes) => {
    if (changes.bookmarksEnabled ||
      changes.bookmarksPosition ||
      changes.bookmarksLimit ||
      changes.bookmarksShowFavicons) {
      this.loadSettings();
    }
  };
}

customElements.define('bookmarks-bar', BookmarksBar); 