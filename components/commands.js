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
      user-select: none;
      -webkit-user-select: none;
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
  #openInNewTab = CONFIG.defaultSettings.newTab;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadCommands();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadCommands() {
    // Load global settings that affect commands behavior
    const {
      deletedCommands = [],
      customCommands = {},
      commandsColumns = 4,
      commandsOrder = [],
      newTab = CONFIG.defaultSettings.newTab
    } = await browser.storage.sync.get([
      'deletedCommands',
      'customCommands',
      'commandsColumns',
      'commandsOrder',
      'newTab'
    ]);

    // Apply "open in new tab" setting for commands grid
    this.#openInNewTab = Boolean(newTab);

    // Start with built-in commands
    this.#commands = new Map(
      Array.from(COMMANDS).filter(([key]) => !deletedCommands.includes(key))
    );

    // Add custom commands
    for (const [key, command] of Object.entries(customCommands)) {
      this.#commands.set(key, command);
    }

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

    // Ensure clicks behave correctly when Better Start is running inside an iframe
    // (focusPage disabled). In that case, we want same-tab navigations to break
    // out of the iframe and load in the top-level tab.
    commands.addEventListener('click', this.#onCommandClick);

    for (const [key, { name, url }] of this.#commands.entries()) {
      if (!name || !url) continue;
      const clone = commandTemplate.content.cloneNode(true);
      const command = clone.querySelector('.command');
      command.href = url;
      if (this.#openInNewTab) command.target = '_blank';
      clone.querySelector('.key').innerText = key;
      clone.querySelector('.name').innerText = name;

      commands.append(clone);
    }

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(clone);
  }

  #onCommandClick = (e) => {
    const link = e.target.closest('.command');
    if (!link) return;

    // Only override behavior when "open in new tab" is disabled
    if (!this.#openInNewTab && window.top !== window.self) {
      e.preventDefault();
      try {
        window.top.location.href = link.href;
      } catch (err) {
        window.location.href = link.href;
      }
    }
  };

  #onStorageChange = (changes) => {
    if (changes.customCommands || changes.deletedCommands || changes.commandsColumns || changes.commandsOrder) {
      this.loadCommands();
    }
  };
}

customElements.define('commands-component', Commands); 