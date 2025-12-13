class ClockWidget extends HTMLElement {
  #settings = {
    enabled: true,
    use24h: false,
    showDate: true,
    secondaryTimezones: []
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
        .secondary-timezones {
          margin-top: 0.25rem;
        }
        .secondary-item {
          font-size: 0.8em;
          color: var(--color-text-subtle);
          display: flex;
          gap: 0.4rem;
          justify-content: flex-end;
          white-space: nowrap;
        }
        .secondary-label {
          opacity: 0.9;
        }
        .secondary-time {
          font-variant-numeric: tabular-nums;
        }
        .secondary-day {
          opacity: 0.7;
        }
        .secondary-separator {
          opacity: 0.5;
        }
      </style>
      <div class="clock">
        <div class="time">00:00</div>
        <div class="date">Loading...</div>
        <div class="secondary-timezones"></div>
      </div>
    `;
  }

  async loadSettings() {
    await new Promise(resolve => requestAnimationFrame(resolve));

    const settings = await browser.storage.sync.get({
      clockEnabled: CONFIG.defaultSettings.clockEnabled,
      clock24h: CONFIG.defaultSettings.clock24h,
      clockShowDate: CONFIG.defaultSettings.clockShowDate,
      clockSecondaryTimezones: CONFIG.defaultSettings.clockSecondaryTimezones
    });

    this.#settings = {
      enabled: settings.clockEnabled,
      use24h: settings.clock24h,
      showDate: settings.clockShowDate,
      secondaryTimezones: this.#parseSecondaryTimezones(settings.clockSecondaryTimezones)
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
    const secondaryContainer = this.shadowRoot.querySelector('.secondary-timezones');

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

    if (secondaryContainer) {
      secondaryContainer.innerHTML = '';

      const localDateKey = now.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      this.#settings.secondaryTimezones.forEach((tz) => {
        try {
          const secondaryTime = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !this.#settings.use24h,
            timeZone: tz.timeZone
          });

          const tzDateKey = now.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: tz.timeZone
          });

          let dayLabel = '';
          if (tzDateKey !== localDateKey) {
            dayLabel = now.toLocaleDateString([], {
              weekday: 'short',
              timeZone: tz.timeZone
            });
          }

          const item = document.createElement('div');
          item.className = 'secondary-item';
          item.innerHTML = `
            <span class="secondary-label">${tz.label}</span>
            <span class="secondary-time">${secondaryTime}</span>
            ${dayLabel ? `<span class="secondary-separator">·</span><span class="secondary-day">${dayLabel}</span>` : ''}
          `;
          secondaryContainer.appendChild(item);
        } catch (e) {
          // Ignore invalid time zone identifiers
        }
      });
    }
  }

  #onStorageChange = (changes) => {
    if (changes.clockEnabled || changes.clock24h || changes.clockShowDate || changes.clockSecondaryTimezones) {
      this.loadSettings();
    }
  };

  #parseSecondaryTimezones(raw) {
    if (!raw || typeof raw !== 'string') return [];

    return raw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const hasSeparator = line.includes('=');
        if (!hasSeparator) {
          return {
            label: line,
            timeZone: line
          };
        }

        const parts = line.split('=');
        const label = parts[0].trim();
        const timeZone = parts.slice(1).join('=').trim();

        if (!timeZone) {
          return {
            label: label || line,
            timeZone: label || line
          };
        }

        return {
          label: label || timeZone,
          timeZone
        };
      });
  }

  // Clean up when element is removed
  disconnectedCallback() {
    this.stopClock();
  }
}

customElements.define('clock-widget', ClockWidget); 