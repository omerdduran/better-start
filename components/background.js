class BackgroundManager extends HTMLElement {
  constructor() {
    super();
    this.loadSettings();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadSettings() {
    const { background = CONFIG.defaultSettings.background } = await browser.storage.sync.get('background');
    this.applyBackground(background);
  }

  applyBackground(settings) {
    const { type, value, blur, opacity } = settings;

    // Reset all styles first
    document.body.style.background = '';
    document.body.style.backgroundColor = '';
    document.body.style.backgroundImage = '';
    document.body.style.backdropFilter = '';

    // Apply new background
    if (type === 'color') {
      document.body.style.backgroundColor = value;
    } else if (type === 'image' && value) {
      document.body.style.backgroundImage = `url('${value}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    }

    // Apply effects
    if (blur > 0) {
      document.body.style.backdropFilter = `blur(${blur}px)`;
    }

    // Apply opacity
    document.body.style.opacity = opacity;
  }

  #onStorageChange = (changes) => {
    if (changes.background) {
      this.applyBackground(changes.background.newValue);
    }
  };
}

customElements.define('background-manager', BackgroundManager); 