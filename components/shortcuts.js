class ShortcutsManager {
  static #shortcuts = new Map();

  static register(key, callback) {
    this.#shortcuts.set(key, callback);
  }

  static handleKeyPress(event) {
    const key = `${event.ctrlKey ? 'Ctrl+' : ''}${event.key}`;
    const callback = this.#shortcuts.get(key);
    if (callback) {
      event.preventDefault();
      callback();
    }
  }
} 