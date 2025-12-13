class WeatherWidget extends HTMLElement {
  #settings = {
    enabled: true,
    location: '',
    useF: false,
    position: 'left'
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
          display: ${this.#settings.enabled ? 'flex' : 'none'};
          align-items: center;
          gap: var(--space);
          opacity: 0.8;
          transition: opacity var(--transition-speed);
          cursor: default;
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
        .weather-details {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75em;
          color: var(--color-text-subtle);
          margin-top: 0.25rem;
        }
        .weather-details span {
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .forecast-tooltip {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: var(--color-background);
          border: 1px solid rgba(136, 136, 136, 0.3);
          border-radius: 8px;
          padding: 0.75rem;
          margin-top: 0.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          z-index: 100;
          min-width: 180px;
        }
        .weather:hover .forecast-tooltip {
          display: block;
        }
        .forecast-title {
          font-size: 0.7em;
          color: var(--color-text-subtle);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .forecast-day {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 0;
          border-bottom: 1px solid rgba(136, 136, 136, 0.1);
          font-size: 0.85em;
        }
        .forecast-day:last-child {
          border-bottom: none;
        }
        .forecast-day .day-name {
          color: var(--color-text);
          min-width: 70px;
        }
        .forecast-day .day-temp {
          color: var(--color-text-subtle);
        }
        .forecast-day .day-icon {
          font-size: 1.1em;
        }
      </style>
      <div class="weather">
        <span class="weather-icon-text"></span>
        <div>
          <div class="temp">--°C</div>
          <div class="location">Loading...</div>
          <div class="weather-details">
            <span>💧 <span class="humidity">--</span>%</span>
            <span>💨 <span class="wind">--</span></span>
            <span>☀️ UV <span class="uv">--</span></span>
          </div>
        </div>
        <div class="forecast-tooltip">
          <div class="forecast-title">3-Day Forecast</div>
          <div class="forecast-days"></div>
        </div>
      </div>
    `;
  }

  async loadSettings() {
    const settings = await browser.storage.sync.get({
      weatherEnabled: true,
      weatherLocation: '',
      weatherF: false,
      weatherHumidity: true,
      weatherWind: true,
      weatherUV: true
    });

    this.#settings = {
      enabled: settings.weatherEnabled,
      location: settings.weatherLocation,
      useF: settings.weatherF,
      showHumidity: settings.weatherHumidity,
      showWind: settings.weatherWind,
      showUV: settings.weatherUV
    };

    this.shadowRoot.querySelector('.weather').style.display =
      this.#settings.enabled ? 'flex' : 'none';

    // Apply visibility to individual weather details
    const humidityEl = this.shadowRoot.querySelector('.weather-details span:nth-child(1)');
    const windEl = this.shadowRoot.querySelector('.weather-details span:nth-child(2)');
    const uvEl = this.shadowRoot.querySelector('.weather-details span:nth-child(3)');

    if (humidityEl) humidityEl.style.display = this.#settings.showHumidity ? '' : 'none';
    if (windEl) windEl.style.display = this.#settings.showWind ? '' : 'none';
    if (uvEl) uvEl.style.display = this.#settings.showUV ? '' : 'none';

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
      const humidity = this.shadowRoot.querySelector('.humidity');
      const wind = this.shadowRoot.querySelector('.wind');
      const uv = this.shadowRoot.querySelector('.uv');
      const forecastDays = this.shadowRoot.querySelector('.forecast-days');

      const current = data.current_condition[0];
      const area = data.nearest_area[0];

      const temperature = this.#settings.useF ? current.temp_F : current.temp_C;
      const unit = this.#settings.useF ? 'F' : 'C';
      temp.textContent = `${temperature}°${unit}`;

      // Show user-entered location if available, otherwise use API response
      if (this.#settings.location) {
        location.textContent = this.#settings.location;
      } else {
        const cityName = area.areaName[0].value;
        const countryCode = area.country[0].value;
        location.textContent = `${cityName}, ${countryCode}`;
      }

      const weatherCode = current.weatherCode;
      icon.textContent = this.getWeatherIcon(weatherCode);
      icon.title = current.weatherDesc[0].value;

      // Additional weather details
      humidity.textContent = current.humidity;
      const windSpeed = this.#settings.useF ? `${current.windspeedMiles}mph` : `${current.windspeedKmph}km/h`;
      wind.textContent = windSpeed;
      uv.textContent = current.uvIndex;

      // 3-day forecast
      if (data.weather && data.weather.length > 0) {
        const dayNames = ['Today', 'Tomorrow'];
        const forecast = data.weather.slice(0, 3).map((day, i) => {
          const dayName = i < 2 ? dayNames[i] : this.getDayName(day.date);
          const avgTemp = this.#settings.useF ? day.avgtempF : day.avgtempC;
          const dayWeatherCode = day.hourly?.[4]?.weatherCode || '113';
          return `
            <div class="forecast-day">
              <span class="day-name">${dayName}</span>
              <span class="day-temp">${avgTemp}°${unit}</span>
              <span class="day-icon">${this.getWeatherIcon(dayWeatherCode)}</span>
            </div>
          `;
        }).join('');
        forecastDays.innerHTML = forecast;
      }
    } catch (error) {
      console.error('Error updating weather:', error);
      this.showError();
    }
  }

  getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
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
    if (changes.weatherEnabled || changes.weatherLocation || changes.weatherF ||
      changes.weatherHumidity || changes.weatherWind || changes.weatherUV) {
      this.loadSettings();
    }
  };
}

customElements.define('weather-widget', WeatherWidget); 