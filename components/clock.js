class ClockWidget extends HTMLElement {
  #settings = {
    enabled: true,
    use24h: false,
    showDate: true
  };
  #updateInterval;
  #initialized = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.render();
      this.loadSettings().then(() => {
        this.#initialized = true;
      });
      browser.storage.onChanged.addListener(this.#onStorageChange);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .clock {
          position: fixed;
          top: var(--space);
          right: var(--space);
          padding: var(--space);
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: var(--elevation-1);
          text-align: right;
          opacity: 0.8;
          transition: opacity var(--transition-speed);
        }
        .clock:hover {
          opacity: 1;
        }
        .time {
          font-size: 1.5em;
          color: var(--color-text);
        }
        .date {
          color: var(--color-text-subtle);
          font-size: 0.9em;
        }
      </style>
      <div class="clock">
        <div class="time">00:00</div>
        <div class="date">Loading...</div>
      </div>
    `;
  }

  async loadSettings() {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const settings = await browser.storage.sync.get({
      clockEnabled: CONFIG.defaultSettings.clockEnabled,
      clock24h: CONFIG.defaultSettings.clock24h,
      clockShowDate: CONFIG.defaultSettings.clockShowDate
    });

    this.#settings = {
      enabled: settings.clockEnabled,
      use24h: settings.clock24h,
      showDate: settings.clockShowDate
    };

    // Update visibility
    const clock = this.shadowRoot.querySelector('.clock');
    if (clock) {
      clock.style.display = this.#settings.enabled ? 'block' : 'none';
    }
    
    // Start/stop clock updates
    if (this.#settings.enabled) {
      this.startClock();
    } else {
      this.stopClock();
    }
  }

  startClock() {
    // Clear any existing interval
    this.stopClock();
    
    // Update immediately
    this.updateClock();
    
    // Set new interval
    this.#updateInterval = setInterval(() => this.updateClock(), 1000);
  }

  stopClock() {
    if (this.#updateInterval) {
      clearInterval(this.#updateInterval);
      this.#updateInterval = null;
    }
  }

  updateClock() {
    const now = new Date();
    const time = this.shadowRoot.querySelector('.time');
    const date = this.shadowRoot.querySelector('.date');
    
    if (time && date) {
      // Update time with format preference
      time.textContent = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: !this.#settings.use24h
      });
      
      // Show/hide date based on settings
      date.style.display = this.#settings.showDate ? 'block' : 'none';
      if (this.#settings.showDate) {
        date.textContent = now.toLocaleDateString([], { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    }
  }

  #onStorageChange = (changes) => {
    if (changes.clockEnabled || changes.clock24h || changes.clockShowDate) {
      this.loadSettings();
    }
  };

  // Clean up when element is removed
  disconnectedCallback() {
    this.stopClock();
  }
}

customElements.define('clock-widget', ClockWidget); 