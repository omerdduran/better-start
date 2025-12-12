class CalendarWidget extends HTMLElement {
  #settings = {
    enabled: false,
    position: 'right',
    view: 'month',
    firstDay: 1,
    showEvents: true
  };
  #currentDate = new Date();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadSettings();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadSettings() {
    const settings = await browser.storage.sync.get({
      calendarEnabled: CONFIG.defaultSettings.calendarEnabled,
      calendarPosition: CONFIG.defaultSettings.calendarPosition,
      calendarView: CONFIG.defaultSettings.calendarView,
      calendarFirstDay: CONFIG.defaultSettings.calendarFirstDay,
      calendarShowEvents: CONFIG.defaultSettings.calendarShowEvents
    });

    this.#settings = {
      enabled: settings.calendarEnabled,
      position: settings.calendarPosition,
      view: settings.calendarView,
      firstDay: settings.calendarFirstDay,
      showEvents: settings.calendarShowEvents
    };

    this.render();

    const widget = this.shadowRoot.querySelector('.calendar-widget');
    if (widget) {
      widget.style.display = this.#settings.enabled ? 'block' : 'none';
      widget.style[this.#settings.position] = 'var(--space)';
      widget.style[this.#settings.position === 'left' ? 'right' : 'left'] = 'auto';
    }
  }

  render() {
    const today = new Date();
    const calendar = this.generateCalendar(today);

    this.shadowRoot.innerHTML = `
      <style>
        .calendar-widget {
          position: fixed;
          ${this.#settings.position}: var(--space);
          bottom: calc(var(--space) * 4);
          width: 300px;
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: var(--elevation-1);
          display: ${this.#settings.enabled ? 'block' : 'none'};
          opacity: 0.8;
          transition: opacity var(--transition-speed);
          z-index: 10;
        }
        .calendar-widget:hover {
          opacity: 1;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space);
          border-bottom: 1px solid var(--color-text-subtle);
        }
        .month-nav {
          display: flex;
          gap: var(--space);
        }
        .month-nav button {
          background: transparent;
          border: none;
          color: var(--color-text);
          cursor: pointer;
          font-size: 1.2em;
          padding: 0;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          padding: var(--space);
        }
        .weekday {
          text-align: center;
          color: var(--color-text-subtle);
          font-size: 0.8em;
          padding: calc(var(--space) / 2);
        }
        .day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: calc(var(--border-radius) / 2);
          cursor: pointer;
          color: var(--color-text);
        }
        .day:hover {
          background: var(--color-overlay);
        }
        .day.today {
          background: var(--color-accent);
          color: white;
        }
        .day.other-month {
          color: var(--color-text-subtle);
        }
      </style>
      <div class="calendar-widget">
        <div class="calendar-header">
          <div class="month-nav">
            <button class="prev-month">←</button>
            <span>${calendar.monthName} ${calendar.year}</span>
            <button class="next-month">→</button>
          </div>
        </div>
        <div class="calendar-grid">
          ${this.getWeekdayHeaders()}
          ${calendar.days.map(day => this.getDayCell(day)).join('')}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const monthName = date.toLocaleString('default', { month: 'long' });
    
    let startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() - this.#settings.firstDay + 7) % 7));
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(startDate),
        isCurrentMonth: startDate.getMonth() === month,
        isToday: this.isToday(startDate)
      });
      startDate.setDate(startDate.getDate() + 1);
    }

    return { year, monthName, days };
  }

  getWeekdayHeaders() {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const reorderedWeekdays = [
      ...weekdays.slice(this.#settings.firstDay),
      ...weekdays.slice(0, this.#settings.firstDay)
    ];
    
    return reorderedWeekdays
      .map(day => `<div class="weekday">${day}</div>`)
      .join('');
  }

  getDayCell(day) {
    const classes = [
      'day',
      day.isToday ? 'today' : '',
      day.isCurrentMonth ? '' : 'other-month'
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}" data-date="${day.date.toISOString()}">
        ${day.date.getDate()}
      </div>
    `;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  setupEventListeners() {
    const prevMonth = this.shadowRoot.querySelector('.prev-month');
    const nextMonth = this.shadowRoot.querySelector('.next-month');
    
    prevMonth?.addEventListener('click', () => {
      this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
      this.render();
    });
    
    nextMonth?.addEventListener('click', () => {
      this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
      this.render();
    });
  }

  #onStorageChange = (changes) => {
    if (changes.calendarEnabled) {
      const widget = this.shadowRoot.querySelector('.calendar-widget');
      if (widget) {
        widget.style.display = changes.calendarEnabled.newValue ? 'block' : 'none';
      }
      if (changes.calendarEnabled.newValue) {
        this.render();
      }
    }
    
    if (changes.calendarPosition || changes.calendarView || 
        changes.calendarFirstDay || changes.calendarShowEvents) {
      Object.entries(changes).forEach(([key, { newValue }]) => {
        const settingKey = key.replace('calendar', '').toLowerCase();
        if (settingKey in this.#settings) {
          this.#settings[settingKey] = newValue;
        }
      });
      if (this.#settings.enabled) {
        this.render();
      }
    }
  };
}

customElements.define('calendar-widget', CalendarWidget); 