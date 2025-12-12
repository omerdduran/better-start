class WeatherWidget extends HTMLElement {
  #settings = {
    enabled: true,
    location: '',
    useF: false
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.loadSettings();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .weather {
          position: fixed;
          ${this.#settings.position}: var(--space);
          top: var(--space);
          padding: var(--space);
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: var(--elevation-1);
          display: ${this.#settings.enabled ? 'flex' : 'none'};
          align-items: center;
          gap: var(--space);
          opacity: 0.8;
          transition: opacity var(--transition-speed);
        }
        .weather:hover {
          opacity: 1;
        }
        .temp {
          font-size: 1.2em;
          color: var(--color-text);
        }
        .location {
          color: var(--color-text-subtle);
          font-size: 0.9em;
        }
        .weather-icon-text {
          font-size: 1.5em;
          line-height: 1;
        }
      </style>
      <div class="weather">
        <span class="weather-icon-text"></span>
        <div>
          <div class="temp">--°C</div>
          <div class="location">Loading...</div>
        </div>
      </div>
    `;
  }

  async loadSettings() {
    const settings = await browser.storage.sync.get({
      weatherEnabled: true,
      weatherLocation: '',
      weatherF: false
    });
    
    this.#settings = {
      enabled: settings.weatherEnabled,
      location: settings.weatherLocation,
      useF: settings.weatherF
    };

    this.shadowRoot.querySelector('.weather').style.display = 
      this.#settings.enabled ? 'flex' : 'none';

    if (this.#settings.enabled) {
      this.loadWeather();
    }
  }

  async loadWeather() {
    try {
      const weather = await this.fetchWeather();
      this.updateWeather(weather);
      
      // Update weather every 30 minutes
      setTimeout(() => this.loadWeather(), 30 * 60 * 1000);
    } catch (error) {
      console.error('Weather error:', error);
      this.showError();
    }
  }

  async fetchWeather() {
    const location = this.#settings.location || '';
    const response = await fetch(`https://wttr.in/${location}?format=j1`);
    return response.json();
  }

  updateWeather(data) {
    try {
      const temp = this.shadowRoot.querySelector('.temp');
      const location = this.shadowRoot.querySelector('.location');
      const icon = this.shadowRoot.querySelector('.weather-icon-text');
      
      const current = data.current_condition[0];
      const area = data.nearest_area[0];
      
      const temperature = this.#settings.useF ? current.temp_F : current.temp_C;
      const unit = this.#settings.useF ? 'F' : 'C';
      temp.textContent = `${temperature}°${unit}`;
      
      const cityName = area.areaName[0].value;
      const countryCode = area.country[0].value;
      location.textContent = `${cityName}, ${countryCode}`;
      
      const weatherCode = current.weatherCode;
      icon.textContent = this.getWeatherIcon(weatherCode);
      icon.title = current.weatherDesc[0].value;
    } catch (error) {
      console.error('Error updating weather:', error);
      this.showError();
    }
  }

  showError() {
    const temp = this.shadowRoot.querySelector('.temp');
    const location = this.shadowRoot.querySelector('.location');
    const icon = this.shadowRoot.querySelector('.weather-icon-text');
    
    temp.textContent = '--°C';
    location.textContent = 'Weather unavailable';
    icon.style.display = 'none';
  }

  getWeatherIcon(code) {
    const weatherIcons = {
      '113': '☀️', // Clear/Sunny
      '116': '⛅️', // Partly cloudy
      '119': '☁️', // Cloudy
      '122': '☁️', // Overcast
      '176': '🌦', // Patchy rain
      '200': '⛈', // Thundery outbreaks
      '266': '🌧', // Light drizzle
      '293': '🌧', // Patchy light rain
      '296': '🌧', // Light rain
      '299': '🌧', // Moderate rain
      '302': '🌧', // Heavy rain
      '311': '🌧', // Light freezing rain
      '314': '🌧', // Heavy freezing rain
      '353': '🌦', // Light rain shower
      '356': '🌧', // Moderate or heavy rain shower
      '359': '🌧', // Torrential rain shower
      '371': '❄️', // Moderate or heavy snow showers
      '377': '🌨', // Moderate or heavy sleet
      '386': '⛈', // Patchy light rain with thunder
      '389': '⛈', // Moderate or heavy rain with thunder
      '392': '⛈', // Patchy light snow with thunder
      '395': '⛈'  // Moderate or heavy snow with thunder
    };

    const codeStr = code.toString();
    return weatherIcons[codeStr] || '☀️';
  }

  #onStorageChange = (changes) => {
    if (changes.weatherEnabled || changes.weatherLocation || changes.weatherF) {
      this.loadSettings();
    }
  };
}

customElements.define('weather-widget', WeatherWidget); 