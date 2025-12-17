# AGENTS.md — AI Agent Guidelines for Better Start

This document provides comprehensive guidance for AI coding assistants working on the Better Start browser extension project.

## 🎯 Project Overview

**Better Start** is a minimal, keyboard-focused new tab browser extension for Chrome and Firefox. It replaces the default new tab page with a customizable startpage featuring:

- Quick command shortcuts (single-key navigation)
- Smart search with multiple engines
- Clock and weather widgets
- Theme customization

**Core Philosophy**: Simplicity, keyboard-driven UX, no external dependencies (vanilla JS), cross-browser compatibility.

---

## 🏗️ Architecture Overview

### Technology Stack

| Layer | Technology |
|-------|------------|
| UI Components | Web Components (Custom Elements v1) |
| Style Encapsulation | Shadow DOM |
| Theming | CSS Custom Properties (`:root` variables) |
| State Persistence | `browser.storage.sync` API |
| Cross-Browser | Custom polyfill (`browser-polyfill.js`) |
| Build | Shell script (`build.sh`) |

### Manifest Versions

- **Chrome**: Manifest V3 (`manifest.json`)
- **Firefox**: Manifest V2 (`manifest.firefox.json`)

Changes to permissions or extension configuration must be reflected in **both** manifests.

---

## 📁 File Structure & Responsibilities

```
better-start/
├── index.html              # Entry point, loads all scripts
├── styles.css              # Global styles, CSS variables, themes
├── app.js                  # App initialization, global event handlers
├── config.js               # CONFIG object, COMMANDS Map, defaults
├── browser-polyfill.js     # Browser API abstraction layer
├── manifest.json           # Chrome MV3 manifest
├── manifest.firefox.json   # Firefox MV2 manifest
├── build.sh                # Build script for distribution
└── components/
    ├── commands.js         # <commands-component>
    ├── search.js           # <search-component>
    ├── clock.js            # <clock-widget>
    ├── weather.js          # <weather-widget>
    ├── settings.js         # <settings-panel>
    └── settings-styles.js  # CSS string for settings panel
```

### Key File Details

#### `config.js`
Contains:
- `CONFIG` object with all default settings and search engine templates
- `COMMANDS` Map with built-in command definitions

**When adding new settings**: Add defaults to `CONFIG.defaultSettings`.

#### `browser-polyfill.js`
Provides unified `browser.*` API:
- Wraps Chrome's callback-based API with Promises
- Handles Firefox's sync storage limitations (falls back to local)
- Must be loaded **before** any component scripts

#### `styles.css`
Defines:
- CSS custom properties (variables) for theming
- Theme variants: `[data-theme="light|dark|catppuccin|high-contrast"]`
- Base styles and animations

**When adding themes**: Add variables under new `[data-theme="themename"]` selector.

---

## 🧩 Component Patterns

All UI is built with **Web Components**. Follow these patterns:

### Standard Component Structure

```javascript
class MyComponent extends HTMLElement {
  #privateField;  // Private class fields for encapsulation
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Minimal setup, defer heavy work
  }
  
  connectedCallback() {
    this.render();
    this.loadSettings();
    browser.storage.onChanged.addListener(this.#onStorageChange);
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>/* Component styles */</style>
      <div class="container"><!-- Markup --></div>
    `;
  }
  
  async loadSettings() {
    const settings = await browser.storage.sync.get({
      // Always provide defaults
      mySetting: CONFIG.defaultSettings.mySetting
    });
    // Apply settings to component
  }
  
  #onStorageChange = (changes) => {
    // React to relevant setting changes
    if (changes.mySetting) {
      this.loadSettings();
    }
  };
  
  disconnectedCallback() {
    // Cleanup: remove listeners, clear intervals
  }
}

customElements.define('my-component', MyComponent);
```

### Component Communication

Components are **independent** and communicate via:
1. **Storage changes**: Update `browser.storage.sync`, other components react via `onChanged`
2. **Custom events** (rare): Use standard DOM events if needed

**Do NOT** create direct references between components.

---

## 💾 Storage API

### Reading Settings

```javascript
// Always provide defaults
const settings = await browser.storage.sync.get({
  mySetting: CONFIG.defaultSettings.mySetting,
  anotherSetting: 'default'
});
```

### Writing Settings

```javascript
await browser.storage.sync.set({ mySetting: newValue });
// Other components will receive onChanged event automatically
```

### Listening to Changes

```javascript
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;  // Important for Firefox
  
  if (changes.mySetting) {
    // changes.mySetting.oldValue
    // changes.mySetting.newValue
  }
});
```

### Storage Schema

Key settings and their types:

| Key | Type | Description |
|-----|------|-------------|
| `theme` | `string` | 'system', 'light', 'dark', 'catppuccin', 'high-contrast', 'custom' |
| `defaultSearch` | `string` | Search engine key from CONFIG.searchEngines |
| `newTab` | `boolean` | Open links in new tab |
| `customCommands` | `object` | `{ key: { name, url, searchTemplate?, suggestions? } }` |
| `deletedCommands` | `string[]` | Keys of deleted built-in commands |
| `commandsOrder` | `string[]` | Ordered array of command keys |
| `clockSecondaryTimezones` | `string` | Newline-separated "Label=IANA/Zone" |

---

## 🎨 Theming System

### CSS Variables

Core variables defined in `:root`:

```css
--color-background
--color-text
--color-text-subtle
--color-accent
--color-overlay
--border-radius
--space
--transition-speed
```

### Adding a New Theme

1. Add variables in `styles.css`:
   ```css
   :root[data-theme="mytheme"] {
     --color-background: #xxx;
     --color-text: #xxx;
     /* ... */
   }
   ```

2. Add option in `settings.js` (theme select):
   ```html
   <option value="mytheme">My Theme</option>
   ```

3. Handle in `applyTheme()` method if needed.

---

## 🔍 Search System

### Query Parsing Flow

1. **URL detection**: If input matches URL pattern → navigate directly
2. **Exact command match**: If input matches command key → go to URL
3. **Command + search**: `key search` → Use command's searchTemplate
4. **Command + path**: `key/path` → Append path to command URL
5. **Fallback**: Use default search engine

### Adding Search Engines

Add to `CONFIG.searchEngines` in `config.js`:

```javascript
myengine: {
  name: 'My Engine',
  template: 'https://example.com/search?q={}'  // {} = query placeholder
}
```

Then add option in settings.js search engine select.

---

## ⚡ Performance Guidelines

1. **Defer heavy operations**: Use `connectedCallback`, not constructor
2. **Batch DOM updates**: Rebuild innerHTML once, not incrementally
3. **Debounce API calls**: Weather, location search use debouncing
4. **Lazy loading**: Components load settings asynchronously
5. **No external libraries**: Keep bundle size minimal

---

## 🐛 Common Pitfalls

### 1. Firefox Storage Sync
Firefox temporary add-ons can't use sync storage. The polyfill handles this, but test on Firefox.

### 2. Shadow DOM Event Bubbling
Events from Shadow DOM need `composed: true` to bubble out:
```javascript
this.dispatchEvent(new CustomEvent('myevent', { 
  bubbles: true, 
  composed: true 
}));
```

### 3. Settings Panel Input Events
The settings panel handles both `change` and `input` events. For text inputs that should save on every keystroke, use `input`.

### 4. Manifest Differences
- Chrome MV3: `content_security_policy` is an object
- Firefox MV2: `content_security_policy` is a string
- Firefox requires `browser_specific_settings.gecko.id`

### 5. Command Collisions
When adding/editing commands, check both `COMMANDS` (built-in) and `customCommands` (user) to avoid duplicates.

---

## ✅ Testing Checklist

Before submitting changes:

- [ ] Test on Chrome (Developer mode, Load unpacked)
- [ ] Test on Firefox (about:debugging, Load Temporary Add-on)
- [ ] Verify settings persist after browser restart
- [ ] Check all themes render correctly
- [ ] Test keyboard navigation (no mouse)
- [ ] Run `./build.sh` successfully
- [ ] Verify both zip files are valid

---

## 📝 Code Style

### General
- Use modern ES6+ syntax
- Private class fields with `#` prefix
- Arrow functions for callbacks/event handlers
- Template literals for HTML/CSS strings
- Async/await over .then() chains

### Naming
- `camelCase` for variables and functions
- `PascalCase` for classes
- `SCREAMING_CASE` for constants
- `kebab-case` for CSS classes and custom element names

### Comments
- JSDoc for public methods
- Inline comments for complex logic
- No commented-out code

---

## 🚀 Adding New Features

### New Widget

1. Create `components/mywidget.js`
2. Define Custom Element extending `HTMLElement`
3. Use Shadow DOM for encapsulation
4. Add default settings to `CONFIG.defaultSettings`
5. Add toggle in settings panel
6. Register element: `customElements.define('my-widget', MyWidget)`
7. Add `<my-widget>` to `index.html`
8. Add script to `index.html` (before `app.js`)
9. Update `build.sh` if new files

### New Setting

1. Add default to `CONFIG.defaultSettings` in `config.js`
2. Add UI control in `settings.js` render method
3. Load setting in component's `loadSettings()`
4. Listen for changes in `#onStorageChange`
5. Apply setting effect

### New Theme

1. Add CSS variables in `styles.css`
2. Add option to theme select in `settings.js`
3. Test with all components

---

## 📋 Version & Changelog

Current version: **1.1.0**

When updating version:
1. Update `version` in `manifest.json`
2. Update `version` in `manifest.firefox.json`
3. Add entry to `CHANGELOG.md`
4. Update version badge in `README.md`

---

## 🆘 Debugging Tips

### Chrome
```javascript
// In DevTools console
chrome.storage.sync.get(null, console.log);  // View all settings
```

### Firefox
```javascript
browser.storage.local.get().then(console.log);  // May use local fallback
```

### Component Inspection
```javascript
// Access shadow DOM
document.querySelector('my-component').shadowRoot
```

---

## 📚 External Resources

- [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Firefox Extension Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [wttr.in API](https://github.com/chubin/wttr.in)
- [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)

---

*This document should be updated when significant architectural changes are made.*

