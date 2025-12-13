const searchTemplate = document.createElement('template');
searchTemplate.innerHTML = `
  <style>
    input,
    button {
      -moz-appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      display: block;
      outline: 0;
    }

    .dialog {
      align-items: center;
      background: var(--color-background);
      border: none;
      display: none;
      flex-direction: column;
      height: 100%;
      justify-content: center;
      left: 0;
      padding: 0;
      top: 0;
      width: 100%;
    }

    .dialog[open] {
      display: flex;
    }

    .form {
      width: 100%;
    }

    .input {
      color: var(--color-text);
      font-size: 3rem;
      font-weight: var(--font-weight-bold);
      padding: 0;
      text-align: center;
      width: 100%;
    }

    .suggestions {
      align-items: center;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      justify-content: center;
      list-style: none;
      margin: var(--space) 0 0;
      overflow: hidden;
      padding: 0;
    }

    .suggestion {
      color: var(--color-text);
      cursor: pointer;
      font-size: 1rem;
      padding: var(--space);
      position: relative;
      transition: color var(--transition-speed);
      white-space: nowrap;
      z-index: 1;
    }

    .suggestion:where(:focus, :hover) {
      color: var(--color-background);
    }

    .suggestion::before {
      background-color: var(--color-text);
      border-radius: calc(var(--border-radius) / 5);
      content: ' ';
      inset: calc(var(--space) / 1.5) calc(var(--space) / 3);
      opacity: 0;
      position: absolute;
      transform: translateY(0.5em);
      transition: all var(--transition-speed);
      z-index: -1;
    }

    .suggestion:where(:focus, :hover)::before {
      opacity: 1;
      transform: translateY(0);
    }

    .match {
      color: var(--color-text-subtle);
      transition: color var(--transition-speed);
    }

    .suggestion:where(:focus, :hover) .match {
      color: var(--color-background);
    }

    @media (min-width: 700px) {
      .suggestions {
        flex-direction: row;
      }
    }
  </style>
  <dialog class="dialog">
    <form autocomplete="off" class="form" method="dialog" spellcheck="false">
      <input class="input" title="search" type="text" />
      <menu class="suggestions"></menu>
    </form>
  </dialog>
`;

const suggestionTemplate = document.createElement('template');
suggestionTemplate.innerHTML = `
  <li>
    <button class="suggestion" type="button"></button>
  </li>
`;

const matchTemplate = document.createElement('template');
matchTemplate.innerHTML = `
  <span class="match"></span>
`;

class Search extends HTMLElement {
  #dialog;
  #form;
  #input;
  #suggestions;
  #searchEngine;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const clone = searchTemplate.content.cloneNode(true);
    this.#dialog = clone.querySelector('.dialog');
    this.#form = clone.querySelector('.form');
    this.#input = clone.querySelector('.input');
    this.#suggestions = clone.querySelector('.suggestions');
    this.#form.addEventListener('submit', this.#onSubmit, false);
    this.#input.addEventListener('input', this.#onInput);
    this.#suggestions.addEventListener('click', this.#onSuggestionClick);
    document.addEventListener('keydown', this.#onKeydown);
    this.loadSearchEngine();
    this.shadowRoot.append(clone);
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }

  async loadSearchEngine() {
    const {
      defaultSearch = 'duckduckgo',
      customSearchEngines = {},
      customCommands = {}
    } = await browser.storage.sync.get(['defaultSearch', 'customSearchEngines', 'customCommands']);

    if (customSearchEngines[defaultSearch]) {
      this.#searchEngine = customSearchEngines[defaultSearch];
    } else {
      this.#searchEngine = CONFIG.searchEngines[defaultSearch];
    }

    for (const [key, command] of Object.entries(customCommands)) {
      COMMANDS.set(key, command);
    }
  }

  #escapeRegexCharacters(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  #formatSearchUrl(template, search) {
    return template.replace(/{}/g, encodeURIComponent(search));
  }

  #hasProtocol(s) {
    return /^[a-zA-Z]+:\/\//i.test(s);
  }

  #isUrl(s) {
    return /^((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)$/i.test(s);
  }

  #parseQuery(raw) {
    const query = raw.trim();

    if (this.#isUrl(query)) {
      const url = this.#hasProtocol(query) ? query : `https://${query}`;
      return { query, url };
    }

    if (COMMANDS.has(query)) {
      const { key, url } = COMMANDS.get(query);
      return { key, query, url };
    }

    let splitBy = CONFIG.commandSearchDelimiter;
    const [searchKey, rawSearch] = query.split(new RegExp(`${splitBy}(.*)`));

    if (COMMANDS.has(searchKey)) {
      const command = COMMANDS.get(searchKey);
      const search = rawSearch.trim();
      // If URL contains {} or ends with : (like localhost:), format directly without URL constructor
      if (command.url.includes('{}') || command.url.endsWith(':')) {
        const fullUrl = command.url + (command.searchTemplate || '');
        const url = this.#formatSearchUrl(fullUrl, search);
        return { key: searchKey, query, search, splitBy, url };
      }
      const template = new URL(command.searchTemplate ?? '', command.url);
      const url = this.#formatSearchUrl(decodeURI(template.href), search);
      return { key: searchKey, query, search, splitBy, url };
    }

    splitBy = CONFIG.commandPathDelimiter;
    const [pathKey, path] = query.split(new RegExp(`${splitBy}(.*)`));

    if (COMMANDS.has(pathKey)) {
      const command = COMMANDS.get(pathKey);
      const url = `${new URL(command.url).origin}/${path}`;
      return { key: pathKey, path, query, splitBy, url };
    }

    const template = this.#searchEngine?.template || CONFIG.defaultSearchTemplate;
    const url = this.#formatSearchUrl(template, query);
    return { query, search: query, url };
  }

  async fetchSuggestions(search) {
    const engine = this.#searchEngine || CONFIG.searchEngines.duckduckgo;
    try {
      const { searchHistory = [] } = await browser.storage.sync.get('searchHistory');
      return searchHistory
        .filter(item => item.toLowerCase().includes(search.toLowerCase()))
        .filter(item => item.toLowerCase() !== search.toLowerCase())
        .slice(0, CONFIG.suggestionLimit);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      return [];
    }
  }

  async #saveToHistory(query) {
    const { searchHistory = [] } = await browser.storage.sync.get('searchHistory');
    const newHistory = [
      query,
      ...searchHistory.filter(q => q !== query)
    ].slice(0, CONFIG.defaultSettings.searchHistoryLimit);
    await browser.storage.sync.set({ searchHistory: newHistory });
  }

  #close() {
    this.#input.value = '';
    this.#input.blur();
    this.#dialog.close();
    this.#suggestions.innerHTML = '';
  }

  #execute(query) {
    const target = CONFIG.openLinksInNewTab ? '_blank' : '_self';
    window.open(this.#parseQuery(query).url, target, 'noopener noreferrer');
    this.#saveToHistory(query);
    this.#close();
  }

  #focusNextSuggestion(previous = false) {
    const active = this.shadowRoot.activeElement;
    let nextIndex;

    if (active.dataset.index) {
      const activeIndex = Number(active.dataset.index);
      nextIndex = previous ? activeIndex - 1 : activeIndex + 1;
    } else {
      nextIndex = previous ? this.#suggestions.childElementCount - 1 : 0;
    }

    const next = this.#suggestions.children[nextIndex];
    if (next) next.querySelector('.suggestion').focus();
    else this.#input.focus();
  }

  #onInput = async () => {
    const oq = this.#parseQuery(this.#input.value);

    if (!oq.query) {
      this.#close();
      return;
    }

    let suggestions = COMMANDS.get(oq.query)?.suggestions ?? [];

    if (oq.search && suggestions.length < CONFIG.suggestionLimit) {
      const res = await this.fetchSuggestions(oq.search);
      suggestions = suggestions.concat(
        oq.splitBy
          ? res.map((search) => `${oq.key}${oq.splitBy}${search}`)
          : res
      );
    }

    const nq = this.#parseQuery(this.#input.value);
    if (nq.query !== oq.query) return;
    this.#renderSuggestions(suggestions, oq.query);
  };

  #onKeydown = (e) => {
    // Check if event originates from an input (including shadow DOM)
    const path = e.composedPath();
    const isFromInput = path.some(el =>
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'SELECT'
    );

    if (isFromInput) {
      return;
    }

    if (!this.#dialog.open) {
      this.#dialog.show();
      this.#input.focus();

      requestAnimationFrame(() => {
        if (!this.#input.value) this.#close();
      });

      return;
    }

    if (e.key === 'Escape') {
      this.#close();
      return;
    }

    const alt = e.altKey ? 'alt-' : '';
    const ctrl = e.ctrlKey ? 'ctrl-' : '';
    const meta = e.metaKey ? 'meta-' : '';
    const shift = e.shiftKey ? 'shift-' : '';
    const modifierPrefixedKey = `${alt}${ctrl}${meta}${shift}${e.key}`;

    if (/^(ArrowDown|Tab|ctrl-n)$/.test(modifierPrefixedKey)) {
      e.preventDefault();
      this.#focusNextSuggestion();
      return;
    }

    if (/^(ArrowUp|ctrl-p|shift-Tab)$/.test(modifierPrefixedKey)) {
      e.preventDefault();
      this.#focusNextSuggestion(true);
    }
  };

  #onSubmit = () => {
    this.#execute(this.#input.value);
  };

  #onSuggestionClick = (e) => {
    const ref = e.target.closest('.suggestion');
    if (!ref) return;
    this.#execute(ref.dataset.suggestion);
  };

  #renderSuggestions(suggestions, query) {
    this.#suggestions.innerHTML = '';
    const sliced = suggestions.slice(0, CONFIG.suggestionLimit);

    for (const [index, suggestion] of sliced.entries()) {
      const clone = suggestionTemplate.content.cloneNode(true);
      const ref = clone.querySelector('.suggestion');
      ref.dataset.index = index;
      ref.dataset.suggestion = suggestion;
      const escapedQuery = this.#escapeRegexCharacters(query);
      const matched = suggestion.match(new RegExp(escapedQuery, 'i'));

      if (matched) {
        const clone = matchTemplate.content.cloneNode(true);
        const matchRef = clone.querySelector('.match');
        const pre = suggestion.slice(0, matched.index);
        const post = suggestion.slice(matched.index + matched[0].length);
        matchRef.innerText = matched[0];
        matchRef.insertAdjacentHTML('beforebegin', pre);
        matchRef.insertAdjacentHTML('afterend', post);
        ref.append(clone);
      } else {
        ref.innerText = suggestion;
      }

      this.#suggestions.append(clone);
    }
  }

  #onStorageChange = (changes) => {
    if (changes.defaultSearch || changes.customSearchEngines || changes.customCommands) {
      this.loadSearchEngine();
    }
  };
}

customElements.define('search-component', Search); 