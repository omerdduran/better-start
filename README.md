# Better Start 🚀

A minimal, keyboard-focused new tab extension for **Chrome** and **Firefox** with a command grid, smart search, clock, weather, and elegant customization options.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/Chrome-MV3-yellow.svg)
![Firefox](https://img.shields.io/badge/Firefox-MV2-orange.svg)

- [Install on Chrome Web Store](https://chromewebstore.google.com/detail/ilnagcflpnafjkihcdeeeendjpoghlab?utm_source=item-share-cb)
- [Install on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/better-start/)

## ✨ Features

### ⌨️ Quick Commands
- Single-key shortcuts for instant navigation to your favorite sites
- Customizable command grid with drag-and-drop reordering
- Hidden commands (accessible via search, not shown in grid)
- Search templates for each command (e.g., `t hello` → translates "hello")
- Command suggestions for related shortcuts

### 🔍 Smart Search
- **8 Search Engines**: DuckDuckGo (default), Google, Bing, Yahoo, Brave, Ecosia, Startpage, Yandex
- **Direct URL navigation**: Type any URL to go directly
- **Command search**: Type a command key to trigger it
- **Path navigation**: Use `/` delimiter for direct paths (e.g., `g/omerduran` → github.com/omerduran)
- **Search with commands**: Use space delimiter for command-specific search (e.g., `r startpage` → Reddit search)

### 🕐 Clock Widget
- 12-hour or 24-hour format
- Optional date display (weekday, month, day)
- Optional seconds display
- **Secondary time zones**: Track multiple time zones with custom labels

### 🌤️ Weather Widget
- Real-time weather from [wttr.in](https://wttr.in) (free, no API key required)
- Auto-detect location or set custom location
- Celsius/Fahrenheit toggle
- **Additional stats**: Humidity, wind speed, UV index (individually toggleable)
- **3-day forecast** on hover

### 🎨 Themes
- **System**: Follows OS preference
- **Light**: Clean light theme
- **Dark**: Easy on the eyes
- **Catppuccin**: Popular Mocha-inspired palette
- **High Contrast**: Maximum readability
- **Custom**: Build your own theme with color pickers

### ⚙️ Customization
- Custom page title
- Show/hide settings button (hover-only mode)
- Configurable grid columns
- Import/Export all settings as JSON
- Reset to defaults

## 🖼️ Screenshots

![Better Start – Command grid and widgets](images/Screenshot%202025-12-18%20at%2023.02.43.png)

![Better Start – Search and commands](images/Screenshot%202025-12-18%20at%2023.02.56.png)

![Better Start – Settings panel](images/Screenshot%202025-12-18%20at%2023.03.16.png)

## 📦 Installation

### Chrome

1. Download or clone this repository:
   ```bash
   git clone https://github.com/omerduran/better-start.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the project root folder (or `dist/chrome` if built)
6. Open a new tab to see Better Start!

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `manifest.firefox.json` from the project folder
5. Open a new tab to see Better Start!

> **Note**: Temporary add-ons in Firefox are removed when Firefox is closed. For permanent installation, the extension needs to be signed by Mozilla and installed from Firefox Add-ons.

## 🔧 Building

Create distribution packages for both browsers:

```bash
chmod +x build.sh
./build.sh
```

**Output:**
- `dist/chrome/` — Chrome extension folder (for unpacked loading)
- `dist/firefox/` — Firefox extension folder
- `dist/better-startpage-chrome.zip` — Chrome Web Store package
- `dist/better-startpage-firefox.zip` — Firefox Add-ons package

## 🎯 Usage

### Keyboard-Driven Workflow

1. **Open new tab** — Better Start appears automatically
2. **Start typing** — Search dialog opens immediately (no click needed)
3. **Type a command** — Single letter shortcuts (e.g., `g` → GitHub)
4. **Search with command** — `r linux` → Search "linux" on Reddit
5. **Navigate paths** — `g/omerduran/better-start` → Direct GitHub path
6. **Global search** — Any text → Uses default search engine
7. **Direct URL** — Type `example.com` → Navigate directly
8. **Arrow keys** — Navigate suggestions
9. **Escape** — Close search dialog

### Default Commands

| Key | Name | URL | Features |
|-----|------|-----|----------|
| `a` | Chat | chatgpt.com | Search template |
| `c` | Cloud | dash.cloudflare.com | — |
| `d` | Drive | drive.google.com | — |
| `g` | GitHub | github.com | — |
| `f` | Figma | figma.com | — |
| `u` | Udemy | udemy.com | — |
| `t` | Translate | deepl.com | Search + suggestions |
| `r` | Reddit | reddit.com | Search template |

**Hidden commands** (accessible via search):
- `google` → Google with search
- `0` → localhost with port (e.g., `0 3000` → localhost:3000)
- `t-de`, `t-fr`, `t-es` → DeepL language variants

## 🏗️ Architecture

### Tech Stack
- **Vanilla JavaScript** with Web Components (Custom Elements)
- **Shadow DOM** for style encapsulation
- **CSS Variables** for theming
- **Browser Storage API** (sync) for persistence

### Project Structure

```
better-start/
├── index.html              # Entry point
├── styles.css              # Global styles & theme definitions
├── app.js                  # Main app initialization
├── config.js               # Configuration & default commands
├── browser-polyfill.js     # Chrome/Firefox API compatibility
├── manifest.json           # Chrome Manifest V3
├── manifest.firefox.json   # Firefox Manifest V2
├── build.sh                # Build script
├── components/
│   ├── commands.js         # Command grid component
│   ├── search.js           # Search dialog component
│   ├── clock.js            # Clock widget component
│   ├── weather.js          # Weather widget component
│   ├── settings.js         # Settings panel component
│   └── settings-styles.js  # Settings panel styles
├── icons/
│   └── generate.js         # Icon generation script
└── dist/                   # Build output
    ├── chrome/             # Chrome package
    ├── firefox/            # Firefox package
    └── *.zip               # Distribution archives
```

### Component Overview

| Component | Element | Description |
|-----------|---------|-------------|
| `Commands` | `<commands-component>` | Renders command grid, handles drag-reorder |
| `Search` | `<search-component>` | Full-screen search dialog with suggestions |
| `ClockWidget` | `<clock-widget>` | Time/date display with secondary zones |
| `WeatherWidget` | `<weather-widget>` | Weather info with forecast tooltip |
| `SettingsPanel` | `<settings-panel>` | Full settings UI with all options |

### Storage Schema

All settings are stored via `browser.storage.sync`:

```javascript
{
  // Theme & Appearance
  theme: 'system',              // system | light | dark | catppuccin | high-contrast | custom
  pageTitle: 'Better Start',    // Browser tab title
  settingsIconHoverOnly: false, // Hide settings button until hover
  
  // Custom Theme Colors
  customThemeBackground: '',
  customThemeText: '',
  customThemeTextSubtle: '',
  customThemeAccent: '',
  
  // Search
  defaultSearch: 'duckduckgo',  // Search engine key
  newTab: true,                 // Open links in new tab
  
  // Commands
  commandsColumns: 4,           // Grid columns
  customCommands: {},           // User-added commands
  deletedCommands: [],          // Removed built-in commands
  commandsOrder: [],            // Custom order array
  
  // Clock
  clockEnabled: true,
  clock24h: false,
  clockShowDate: true,
  clockShowSeconds: false,
  clockSecondaryTimezones: '',  // Newline-separated: "Label=Zone"
  
  // Weather
  weatherEnabled: true,
  weatherLocation: '',          // Empty = auto-detect
  weatherF: false,              // Fahrenheit
  weatherHumidity: true,
  weatherWind: true,
  weatherUV: true
}
```

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Core functionality | ✅ MV3 | ✅ MV2 |
| Storage sync | ✅ Native | ✅ Polyfilled (local fallback) |
| New tab override | ✅ | ✅ |
| All widgets | ✅ | ✅ |
| Themes | ✅ | ✅ |

## 🔐 Permissions

This extension requires the following permissions:

| Permission | Justification |
|-----------|---------------|
| **storage** | Saves user preferences, custom commands, theme settings, and widget configurations. All data is stored locally in the browser's sync storage. |
| **tabs** | Required for the "Focus page instead of address bar" feature. When enabled, the extension creates a new tab with the startpage and removes the temporary redirect tab to ensure focus is set on the page content rather than the address bar. This provides a better keyboard-focused user experience. The extension does not access, read, or modify any tab content or browsing history. |

## 🔌 External APIs

| API | Usage | Rate Limits |
|-----|-------|-------------|
| [wttr.in](https://wttr.in) | Weather data | Free, no key |
| [Open-Meteo Geocoding](https://open-meteo.com) | Location autocomplete | Free, no key |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Tips

- Test on both Chrome and Firefox
- Run `./build.sh` before submitting PRs
- Keep the extension minimal and focused
- Follow existing code style (Web Components, Shadow DOM)

## 📄 License

MIT License — feel free to use and modify as you wish!


<p align="center">
  Made with ❤️ for keyboard enthusiasts
</p>
