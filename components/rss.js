class RssFeedWidget extends HTMLElement {
  #settings = {
    enabled: false,
    position: 'right',
    expanded: true,
    refreshInterval: 30,
    feeds: []
  };
  #refreshTimer;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.loadSettings();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadSettings() {
    const settings = await browser.storage.sync.get({
      rssEnabled: CONFIG.defaultSettings.rssEnabled,
      rssPosition: CONFIG.defaultSettings.rssPosition,
      rssExpanded: CONFIG.defaultSettings.rssExpanded,
      rssRefreshInterval: CONFIG.defaultSettings.rssRefreshInterval,
      rssFeeds: CONFIG.defaultSettings.rssFeeds
    });

    this.#settings = {
      enabled: settings.rssEnabled,
      position: settings.rssPosition,
      expanded: settings.rssExpanded,
      refreshInterval: settings.rssRefreshInterval,
      feeds: settings.rssFeeds
    };

    const widget = this.shadowRoot.querySelector('.rss-widget');
    if (widget) {
      widget.style.display = this.#settings.enabled ? 'flex' : 'none';
      widget.style[this.#settings.position] = 'var(--space)';
      widget.style[this.#settings.position === 'left' ? 'right' : 'left'] = 'auto';
    }

    if (this.#settings.enabled) {
      this.render();
    }

    if (this.#settings.enabled) {
      this.startFeedRefresh();
    } else {
      this.stopFeedRefresh();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .rss-widget {
          position: fixed;
          ${this.#settings.position}: var(--space);
          bottom: calc(var(--space) * 4);
          width: 350px;
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: var(--elevation-1);
          display: ${this.#settings.enabled ? 'flex' : 'none'};
          opacity: 0.8;
          transition: opacity var(--transition-speed);
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }
        .rss-widget:hover {
          opacity: 1;
        }
        .rss-header {
          padding: var(--space);
          border-bottom: 1px solid var(--color-text-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rss-content {
          padding: var(--space);
          display: ${this.#settings.expanded ? 'block' : 'none'};
          overflow-y: auto;
        }
        .feed-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feed-item {
          margin-bottom: var(--space);
          padding: calc(var(--space) / 2);
          border-radius: calc(var(--border-radius) / 2);
          background: var(--color-overlay);
        }
        .feed-item h3 {
          margin: 0 0 calc(var(--space) / 2) 0;
          font-size: 1em;
        }
        .feed-item a {
          color: var(--color-text);
          text-decoration: none;
        }
        .feed-item a:hover {
          text-decoration: underline;
        }
        .feed-meta {
          font-size: 0.8em;
          color: var(--color-text-subtle);
          display: flex;
          justify-content: space-between;
          margin-top: calc(var(--space) / 2);
        }
        .minimize {
          background: transparent;
          border: none;
          color: var(--color-text);
          cursor: pointer;
          font-size: 1.2em;
          padding: 0;
        }
        .feed-source {
          font-weight: bold;
        }
        .loading {
          text-align: center;
          padding: var(--space);
          color: var(--color-text-subtle);
        }
      </style>
      <div class="rss-widget">
        <div class="rss-header">
          <span>RSS Feeds</span>
          <button class="minimize">_</button>
        </div>
        <div class="rss-content">
          <div class="feed-list">
            <div class="loading">Loading feeds...</div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.loadFeeds();
  }

  async loadFeeds() {
    if (!this.#settings.enabled || !this.#settings.expanded) return;

    const feedList = this.shadowRoot.querySelector('.feed-list');
    if (!feedList) return;

    try {
      const allArticles = await Promise.all(
        this.#settings.feeds.map(async feed => {
          try {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
            const data = await response.json();
            return data.items.map(item => ({
              ...item,
              feedName: feed.name
            }));
          } catch (error) {
            console.error(`Failed to fetch feed ${feed.name}:`, error);
            return [];
          }
        })
      );

      const articles = allArticles
        .flat()
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 10);

      feedList.innerHTML = articles.map(article => `
        <div class="feed-item">
          <h3>
            <a href="${article.link}" target="_blank" rel="noopener noreferrer">
              ${article.title}
            </a>
          </h3>
          <div class="feed-meta">
            <span class="feed-source">${article.feedName}</span>
            <span class="feed-date">${new Date(article.pubDate).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('') || '<div class="loading">No articles found</div>';
    } catch (error) {
      console.error('Failed to load feeds:', error);
      feedList.innerHTML = '<div class="loading">Failed to load feeds</div>';
    }
  }

  setupEventListeners() {
    const minimize = this.shadowRoot.querySelector('.minimize');
    minimize?.addEventListener('click', () => {
      this.#settings.expanded = !this.#settings.expanded;
      browser.storage.sync.set({ rssExpanded: this.#settings.expanded });
      this.shadowRoot.querySelector('.rss-content').style.display = 
        this.#settings.expanded ? 'block' : 'none';
    });
  }

  startFeedRefresh() {
    this.stopFeedRefresh();
    this.loadFeeds();
    this.#refreshTimer = setInterval(() => {
      this.loadFeeds();
    }, this.#settings.refreshInterval * 60 * 1000);
  }

  stopFeedRefresh() {
    if (this.#refreshTimer) {
      clearInterval(this.#refreshTimer);
      this.#refreshTimer = null;
    }
  }

  #onStorageChange = (changes) => {
    if (changes.rssEnabled) {
      const widget = this.shadowRoot.querySelector('.rss-widget');
      if (widget) {
        widget.style.display = changes.rssEnabled.newValue ? 'flex' : 'none';
      }
      if (changes.rssEnabled.newValue) {
        this.startFeedRefresh();
      } else {
        this.stopFeedRefresh();
      }
    }

    if (changes.rssPosition || changes.rssExpanded || 
        changes.rssRefreshInterval || changes.rssFeeds) {
      this.loadSettings();
    }
  };

  disconnectedCallback() {
    this.stopFeedRefresh();
  }
}

customElements.define('rss-widget', RssFeedWidget); 