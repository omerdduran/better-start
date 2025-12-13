const commandsTemplate = document.createElement('template');
commandsTemplate.innerHTML = `
  <style>
    .commands {
      border-radius: var(--border-radius);
      column-gap: 0;
      columns: 3;
      list-style: none;
      margin: 0 auto;
      overflow: hidden;
      padding: 0;
      width: 100%;
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
  #columns = 'auto';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadCommands();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadCommands() {
    // Start with built-in commands
    // Load deleted commands state
    const { deletedCommands = [] } = await browser.storage.sync.get('deletedCommands');
    this.#commands = new Map(
      Array.from(COMMANDS).filter(([key]) => !deletedCommands.includes(key))
    );

    // Add custom commands
    const { customCommands = {} } = await browser.storage.sync.get('customCommands');
    for (const [key, command] of Object.entries(customCommands)) {
      this.#commands.set(key, command);
    }

    // Load columns setting and order
    const { commandsColumns = 4, commandsOrder = [] } =
      await browser.storage.sync.get(['commandsColumns', 'commandsOrder']);
    this.#columns = commandsColumns;

    // Apply order if exists
    if (commandsOrder.length > 0) {
      const orderedCommands = new Map();
      // First add ordered items
      for (const key of commandsOrder) {
        if (this.#commands.has(key)) {
          orderedCommands.set(key, this.#commands.get(key));
        }
      }
      // Then add any remaining items not in order
      for (const [key, cmd] of this.#commands) {
        if (!orderedCommands.has(key)) {
          orderedCommands.set(key, cmd);
        }
      }
      this.#commands = orderedCommands;
    }

    this.render();
  }

  render() {
    const clone = commandsTemplate.content.cloneNode(true);
    const commands = clone.querySelector('.commands');

    // Apply columns setting
    commands.style.columns = this.#columns;

    for (const [key, { name, url }] of this.#commands.entries()) {
      if (!name || !url) continue;
      const clone = commandTemplate.content.cloneNode(true);
      const command = clone.querySelector('.command');
      command.href = url;
      if (CONFIG.openLinksInNewTab) command.target = '_blank';
      clone.querySelector('.key').innerText = key;
      clone.querySelector('.name').innerText = name;

      commands.append(clone);
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(clone);
  }

  #onStorageChange = (changes) => {
    if (changes.customCommands || changes.deletedCommands || changes.commandsColumns || changes.commandsOrder) {
      this.loadCommands();
    }
  };
}

customElements.define('commands-component', Commands); 