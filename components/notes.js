class NotesWidget extends HTMLElement {
  #settings = {
    enabled: true,
    position: 'left',
    expanded: true
  };
  #initialized = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.render();
      this.loadSettings().then(() => {
        this.loadNotes();
        this.#initialized = true;
      });
      chrome.storage.onChanged.addListener(this.#onStorageChange);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .notes {
          position: fixed;
          bottom: calc(var(--space) * 4);
          padding: var(--space);
          background: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: var(--elevation-1);
          opacity: 0.8;
          transition: all var(--transition-speed);
          width: 300px;
        }
        .notes:hover {
          opacity: 1;
        }
        .notes-header {
          padding: var(--space);
          border-bottom: 1px solid var(--color-text-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--color-text);
        }
        .notes-content {
          padding: var(--space);
        }
        textarea {
          width: 100%;
          min-height: 100px;
          background: transparent;
          border: none;
          color: var(--color-text);
          resize: vertical;
          font-family: inherit;
        }
        textarea:focus {
          outline: none;
        }
        .minimize {
          background: transparent;
          border: none;
          color: var(--color-text);
          cursor: pointer;
          padding: 0;
          font-size: 1.2em;
        }
      </style>
      <div class="notes">
        <div class="notes-header">
          <span>Quick Notes</span>
          <button class="minimize" aria-label="Toggle notes">_</button>
        </div>
        <div class="notes-content">
          <textarea placeholder="Type your notes here..."></textarea>
        </div>
      </div>
    `;
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      notesEnabled: CONFIG.defaultSettings.notesEnabled,
      notesPosition: CONFIG.defaultSettings.notesPosition,
      notesExpanded: CONFIG.defaultSettings.notesExpanded
    });

    this.#settings = {
      enabled: settings.notesEnabled,
      position: settings.notesPosition,
      expanded: settings.notesExpanded
    };

    this.updateDisplay();
  }

  updateDisplay() {
    const notes = this.shadowRoot.querySelector('.notes');
    const content = this.shadowRoot.querySelector('.notes-content');
    
    if (!notes || !content) return;

    // Update visibility
    notes.style.display = this.#settings.enabled ? 'block' : 'none';

    // Update position
    notes.style.left = this.#settings.position === 'left' ? 'var(--space)' : 'auto';
    notes.style.right = this.#settings.position === 'right' ? 'var(--space)' : 'auto';

    // Update expanded state
    content.style.display = this.#settings.expanded ? 'block' : 'none';
  }

  async loadNotes() {
    const { notes = '' } = await chrome.storage.sync.get('notes');
    const textarea = this.shadowRoot.querySelector('textarea');
    if (textarea) {
      textarea.value = notes;
      
      // Save notes on input
      textarea.addEventListener('input', () => {
        chrome.storage.sync.set({ notes: textarea.value });
      });
    }

    // Toggle expanded state
    const minimize = this.shadowRoot.querySelector('.minimize');
    if (minimize) {
      minimize.addEventListener('click', () => {
        this.#settings.expanded = !this.#settings.expanded;
        chrome.storage.sync.set({ notesExpanded: this.#settings.expanded });
        this.updateDisplay();
      });
    }
  }

  #onStorageChange = (changes) => {
    if (changes.notesEnabled || changes.notesPosition || changes.notesExpanded) {
      this.loadSettings();
    }
  };
}

customElements.define('notes-widget', NotesWidget); 