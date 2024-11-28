class TodoWidget extends HTMLElement {
  #settings = {
    enabled: true,
    position: 'right',
    expanded: true,
    categories: ['Personal', 'Work', 'Shopping']
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadSettings();
    chrome.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      todoEnabled: CONFIG.defaultSettings.todoEnabled,
      todoPosition: CONFIG.defaultSettings.todoPosition,
      todoExpanded: CONFIG.defaultSettings.todoExpanded,
      todoCategories: CONFIG.defaultSettings.todoCategories
    });

    this.#settings = {
      enabled: settings.todoEnabled,
      position: settings.todoPosition,
      expanded: settings.todoExpanded,
      categories: settings.todoCategories || ['Personal', 'Work', 'Shopping']
    };

    const widget = this.shadowRoot.querySelector('.todo-widget');
    if (widget) {
      widget.style.display = this.#settings.enabled ? 'block' : 'none';
      widget.style[this.#settings.position] = 'var(--space)';
      widget.style[this.#settings.position === 'left' ? 'right' : 'left'] = 'auto';
    }

    this.render();
    if (this.#settings.enabled) {
      this.loadTodos();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .todo-widget {
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
        }
        .todo-widget:hover {
          opacity: 1;
        }
        .todo-header {
          padding: var(--space);
          border-bottom: 1px solid var(--color-text-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .todo-content {
          padding: var(--space);
          display: ${this.#settings.expanded ? 'block' : 'none'};
        }
        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .todo-item {
          display: flex;
          align-items: center;
          gap: var(--space);
          margin-bottom: calc(var(--space) / 2);
          padding: calc(var(--space) / 2);
          border-radius: calc(var(--border-radius) / 2);
          background: var(--color-overlay);
        }
        .todo-item.done {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .todo-item input[type="checkbox"] {
          margin: 0;
        }
        .todo-item button {
          background: var(--color-error);
          border: none;
          border-radius: calc(var(--border-radius) / 4);
          color: white;
          cursor: pointer;
          padding: 2px 6px;
          margin-left: auto;
        }
        .add-todo {
          display: flex;
          gap: var(--space);
          margin-top: var(--space);
        }
        .add-todo input {
          flex: 1;
          background: transparent;
          border: 1px solid var(--color-text-subtle);
          border-radius: calc(var(--border-radius) / 2);
          color: var(--color-text);
          padding: calc(var(--space) / 2);
        }
        .add-todo select {
          background: transparent;
          border: 1px solid var(--color-text-subtle);
          border-radius: calc(var(--border-radius) / 2);
          color: var(--color-text);
          padding: calc(var(--space) / 2);
        }
        .minimize {
          background: transparent;
          border: none;
          color: var(--color-text);
          cursor: pointer;
          font-size: 1.2em;
          padding: 0;
        }
      </style>
      <div class="todo-widget">
        <div class="todo-header">
          <span>Todo List</span>
          <button class="minimize">_</button>
        </div>
        <div class="todo-content">
          <ul class="todo-list"></ul>
          <div class="add-todo">
            <input type="text" placeholder="Add new todo...">
            <select>
              ${this.#settings.categories.map(cat => 
                `<option value="${cat}">${cat}</option>`
              ).join('')}
            </select>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  async loadTodos() {
    const { todos = [] } = await chrome.storage.sync.get('todos');
    const list = this.shadowRoot.querySelector('.todo-list');
    
    list.innerHTML = todos.map(todo => `
      <li class="todo-item ${todo.done ? 'done' : ''}" data-id="${todo.id}">
        <input type="checkbox" ${todo.done ? 'checked' : ''}>
        <span>${todo.text}</span>
        <small>${todo.category}</small>
        <button>×</button>
      </li>
    `).join('');
  }

  setupEventListeners() {
    // Toggle expanded state
    const minimize = this.shadowRoot.querySelector('.minimize');
    minimize?.addEventListener('click', () => {
      this.#settings.expanded = !this.#settings.expanded;
      chrome.storage.sync.set({ todoExpanded: this.#settings.expanded });
      this.shadowRoot.querySelector('.todo-content').style.display = 
        this.#settings.expanded ? 'block' : 'none';
    });

    // Add new todo
    const input = this.shadowRoot.querySelector('.add-todo input');
    const select = this.shadowRoot.querySelector('.add-todo select');
    
    input?.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const { todos = [] } = await chrome.storage.sync.get('todos');
        const newTodo = {
          id: Date.now(),
          text: input.value.trim(),
          category: select.value,
          done: false
        };
        
        todos.push(newTodo);
        await chrome.storage.sync.set({ todos });
        this.loadTodos();
        input.value = '';
      }
    });

    // Handle todo actions (checkbox and remove)
    const list = this.shadowRoot.querySelector('.todo-list');
    list?.addEventListener('click', async (e) => {
      const item = e.target.closest('.todo-item');
      if (!item) return;

      const { todos = [] } = await chrome.storage.sync.get('todos');
      const id = parseInt(item.dataset.id);
      const index = todos.findIndex(t => t.id === id);
      
      if (e.target.matches('input[type="checkbox"]')) {
        todos[index].done = e.target.checked;
        await chrome.storage.sync.set({ todos });
        this.loadTodos();
      } else if (e.target.matches('button')) {
        todos.splice(index, 1);
        await chrome.storage.sync.set({ todos });
        this.loadTodos();
      }
    });
  }

  #onStorageChange = (changes) => {
    if (changes.todoEnabled || changes.todoPosition || changes.todoExpanded || changes.todoCategories) {
      this.loadSettings();
    } else if (changes.todos) {
      this.loadTodos();
    }
  };
}

customElements.define('todo-widget', TodoWidget); 