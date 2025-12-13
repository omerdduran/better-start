#!/bin/bash

# Build script for Better Startpage extension
# Creates separate packages for Chrome and Firefox

set -e

DIST_DIR="dist"
CHROME_DIR="$DIST_DIR/chrome"
FIREFOX_DIR="$DIST_DIR/firefox"

echo "🧹 Cleaning previous builds..."
rm -rf "$DIST_DIR"
mkdir -p "$CHROME_DIR" "$FIREFOX_DIR"

# Files to include in both builds
FILES=(
  "index.html"
  "styles.css"
  "config.js"
  "app.js"
  "background.js"
  "browser-polyfill.js"
  "components"
  "icons"
)

echo "📦 Building Chrome extension..."
for file in "${FILES[@]}"; do
  cp -r "$file" "$CHROME_DIR/"
done
cp manifest.json "$CHROME_DIR/"

echo "🦊 Building Firefox extension..."
for file in "${FILES[@]}"; do
  cp -r "$file" "$FIREFOX_DIR/"
done
cp manifest.firefox.json "$FIREFOX_DIR/manifest.json"

# Create zip files (manifest.json must be at the root of the zip)
echo "🗜️  Creating zip packages..."
(
  cd "$CHROME_DIR"
  zip -r -q "../better-startpage-chrome.zip" .
)
(
  cd "$FIREFOX_DIR"
  zip -r -q "../better-startpage-firefox.zip" .
)

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Output files:"
echo "   Chrome:  $DIST_DIR/better-startpage-chrome.zip"
echo "   Firefox: $DIST_DIR/better-startpage-firefox.zip"
echo ""
echo "📌 Installation:"
echo "   Chrome:  Load unpacked from $CHROME_DIR"
echo "   Firefox: Load temporary addon from $FIREFOX_DIR"
