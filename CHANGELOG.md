# Changelog

## 1.2.2 - 2025-12-22

- Fix: The `0` localhost shortcut now correctly opens `https://localhost:PORT` (e.g. `0 3000` → `https://localhost:3000`), instead of inserting an extra slash.

## 1.2.1 - 2025-12-18

- Fix: Hidden commands in **Settings > Links** can now be edited and deleted correctly, just like visible commands.
- Fix: Hidden commands list now properly wires up edit/delete handlers alongside the main commands list.

## 1.2.0 - 2025-12-18

- Feature: Focus is now automatically set to the page content instead of the browser's address bar when opening a new tab. This works on both Chrome and Firefox.
- Feature: New "Focus page instead of address bar" toggle in Settings > Search section to enable/disable focus stealing.
- Added: New `newtab.html` and `newtab.js` files that handle the focus redirect technique.
- Added: `tabs` API support in browser polyfill for Chrome compatibility.
- Changed: New tab override now uses a two-step redirect to steal focus from the address bar.

## 1.1.1 - 2025-12-16

- Chore: Removed unused background scripts and the Firefox manifest background configuration to simplify the extension.
- Chore: Cleaned up search configuration by removing unused remote suggestion URLs and the local search history feature; search suggestions are now purely command-based.

## 1.1.0 - 2025-12-16

- Fix: Resolved a command collision that caused some links to appear twice in the **Settings > Links** section.
- Fix: The **"Open in new tab"** option is now correctly applied for both search results and the commands grid.

## 1.0 - Initial release

- First public release.


