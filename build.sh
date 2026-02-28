#!/bin/bash
set -e

VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
NAME="BatchCopyLinks-v${VERSION}"

echo "Building ${NAME}..."

rm -rf dist
mkdir -p dist

TMP="dist/${NAME}"
mkdir -p "$TMP"

cp manifest.json popup.html popup.js popup.css "$TMP/"
cp sidepanel.html sidepanel.js sidepanel.css "$TMP/"
cp content.js i18n.js "$TMP/"
cp -r _locales "$TMP/"
cp -r icon "$TMP/"

(cd dist && zip -r "${NAME}.zip" "${NAME}")
echo "✓ dist/${NAME}.zip"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PEM_FILE="BatchCopyLinks.pem"
ABS_TMP="$(cd "$TMP" && pwd)"

if [ -f "$CHROME" ]; then
  if [ -f "$PEM_FILE" ]; then
    ABS_PEM="$(cd "$(dirname "$PEM_FILE")" && pwd)/$(basename "$PEM_FILE")"
    "$CHROME" --pack-extension="$ABS_TMP" --pack-extension-key="$ABS_PEM" 2>/dev/null
  else
    "$CHROME" --pack-extension="$ABS_TMP" 2>/dev/null
    mv "dist/${NAME}.pem" "$PEM_FILE"
    echo "⚠  Key saved to ${PEM_FILE} — keep this file safe, do not share it!"
  fi
  echo "✓ dist/${NAME}.crx"
else
  echo "✗ Chrome not found, skipping CRX"
fi

rm -rf "$TMP"
echo "Done:"
ls dist/
