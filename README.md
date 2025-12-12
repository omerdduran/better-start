# Better Startpage 🚀

A customizable startpage browser extension for quick navigation and search. Works on both **Chrome** and **Firefox**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **🔍 Multi-Search Engine** - DuckDuckGo, Google, Bing with autocomplete suggestions
- **⌨️ Quick Commands** - Single-key shortcuts for your favorite sites
- **🕐 Clock Widget** - 12/24 hour format with date display
- **🌤️ Weather** - Current weather based on location
- **📝 Quick Notes** - Persistent notepad
- **✅ Todo List** - Task management with categories
- **📰 RSS Reader** - Follow your favorite feeds
- **📅 Calendar** - Monthly calendar view
- **🔖 Bookmarks Bar** - Quick access to recent bookmarks
- **🎨 Themes** - Light/Dark mode with system preference support

## 📦 Installation

### Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the project folder (or `dist/chrome` if built)
6. Open a new tab to see Better Startpage!

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `manifest.firefox.json` from the project folder (or from `dist/firefox`)
5. Open a new tab to see Better Startpage!

> **Note**: Temporary add-ons in Firefox are removed when Firefox is closed. For permanent installation, the extension needs to be signed by Mozilla.

## 🔧 Building

Run the build script to create distribution packages:

```bash
chmod +x build.sh
./build.sh
```

This creates:
- `dist/chrome/` - Chrome extension folder
- `dist/firefox/` - Firefox extension folder
- `dist/better-startpage-chrome.zip` - Chrome package
- `dist/better-startpage-firefox.zip` - Firefox package

## ⚙️ Configuration

Click the ⚙️ settings button in the bottom right corner to customize:

- **Theme**: Light, Dark, or System preference
- **Search Engine**: Default search engine
- **Widgets**: Enable/disable and position widgets
- **Commands**: Add custom keyboard shortcuts
- **RSS Feeds**: Add your favorite feeds

## 🏗️ Project Structure

```
better-start/
├── index.html           # Main page
├── styles.css           # Global styles
├── config.js            # Configuration & settings
├── app.js               # Main app logic
├── background.js        # Background service worker
├── browser-polyfill.js  # Cross-browser API compatibility
├── manifest.json        # Chrome manifest (MV3)
├── manifest.firefox.json # Firefox manifest (MV2)
├── build.sh             # Build script
├── components/
│   ├── bookmarks.js     # Bookmarks bar
│   ├── calendar.js      # Calendar widget
│   ├── clock.js         # Clock display
│   ├── commands.js      # Quick commands
│   ├── notes.js         # Notes widget
│   ├── rss.js           # RSS feed reader
│   ├── search.js        # Search component
│   ├── settings.js      # Settings panel
│   ├── todo.js          # Todo list
│   └── weather.js       # Weather widget
└── icons/               # Extension icons
```

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Core functionality | ✅ | ✅ |
| Storage sync | ✅ | ✅ |
| Bookmarks | ✅ | ✅ |
| Favicons | ✅ | ✅ (via Google) |

## 📄 License

MIT License - feel free to use and modify as you wish!

## 👤 Author

**Ömer Duran**
