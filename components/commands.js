const commandsTemplate = document.createElement('template');
commandsTemplate.innerHTML = `
  <style>
    .commands {
      border-radius: var(--border-radius);
      column-gap: 0;
      columns: 3;
      list-style: none;
      margin: 0 auto;
      max-width: 23rem;
      overflow: hidden;
      padding: 0;
      width: 100vw;
    }

    .command {
      display: flex;
      gap: var(--space);
      outline: 0;
      padding: var(--space);
      position: relative;
      text-decoration: none;
    }

    .command::after {
      background: var(--color-text-subtle);
      content: ' ';
      inset: 1px;
      opacity: 0.05;
      position: absolute;
      transition: opacity var(--transition-speed);
    }

    .command:where(:focus, :hover)::after {
      opacity: 0.1;
    }

    .key {
      color: var(--color-text);
      display: inline-block;
      text-align: center;
      width: 3ch;
    }

    .name {
      color: var(--color-text-subtle);
      transition: color var(--transition-speed);
    }

    .command:where(:focus, :hover) .name {
      color: var(--color-text);
    }

    @media (min-width: 40rem) {
      .commands {
        columns: 4;
        max-width: 30rem;
      }
    }

    @media (min-width: 70rem) {
      .commands {
        columns: 6;
        max-width: 60rem;
      }
    }

    .remove-command {
      background: transparent;
      border: none;
      color: var(--color-error);
      cursor: pointer;
      font-size: 1.2em;
      opacity: 0;
      padding: 0;
      position: absolute;
      right: var(--space);
      top: 50%;
      transform: translateY(-50%);
      transition: opacity var(--transition-speed);
    }

    .command:hover .remove-command {
      opacity: 1;
    }
  </style>
  <nav>
    <menu class="commands"></menu>
  </nav>
`;

const commandTemplate = document.createElement('template');
commandTemplate.innerHTML = `
  <li>
    <a class="command" rel="noopener noreferrer">
      <span class="key"></span>
      <span class="name"></span>
    </a>
  </li>
`;

class Commands extends HTMLElement {
  #commands = new Map();
  #settings = {
    columns: 'auto'
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadCommands();
    chrome.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadCommands() {
    // Start with built-in commands
    // Load deleted commands state
    const { deletedCommands = [] } = await chrome.storage.sync.get('deletedCommands');
    this.#commands = new Map(
      Array.from(COMMANDS).filter(([key]) => !deletedCommands.includes(key))
    );
    
    // Add custom commands
    const { customCommands = {} } = await chrome.storage.sync.get('customCommands');
    for (const [key, command] of Object.entries(customCommands)) {
      this.#commands.set(key, command);
    }
    
    // Load settings
    const { commandsColumns = CONFIG.defaultSettings.commandsColumns } = 
      await chrome.storage.sync.get('commandsColumns');
    this.#settings.columns = commandsColumns;
    
    this.render();
  }

  render() {
    const clone = commandsTemplate.content.cloneNode(true);
    const commands = clone.querySelector('.commands');

    // Apply columns setting
    if (this.#settings.columns !== 'auto') {
      commands.style.columns = this.#settings.columns;
    } else {
      commands.style.removeProperty('columns');
    }

    for (const [key, { name, url }] of this.#commands.entries()) {
      if (!name || !url) continue;
      const clone = commandTemplate.content.cloneNode(true);
      const command = clone.querySelector('.command');
      command.href = url;
      if (CONFIG.openLinksInNewTab) command.target = '_blank';
      clone.querySelector('.key').innerText = key;
      clone.querySelector('.name').innerText = name;
      // Add delete button for built-in commands
      if (COMMANDS.has(key)) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'remove-command';
        deleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (confirm(`Are you sure you want to delete the "${name}" command?`)) {
            const { deletedCommands = [] } = await chrome.storage.sync.get('deletedCommands');
            await chrome.storage.sync.set({ 
              deletedCommands: [...deletedCommands, key] 
            });
            this.loadCommands();
          }
        });
        command.appendChild(deleteBtn);
      }
      commands.append(clone);
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(clone);
  }

  #onStorageChange = (changes) => {
    if (changes.customCommands || changes.commandsColumns || changes.deletedCommands) {
      this.loadCommands();
    }
  };
}

customElements.define('commands-component', Commands); 