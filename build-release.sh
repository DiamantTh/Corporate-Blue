#!/usr/bin/env bash
# =============================================================================
#  build-release.sh — Corporate Blue Release-Tarball
# -----------------------------------------------------------------------------
#  Plattform-neutral: läuft lokal, in GitHub Actions und in Gitea Actions.
#  Erzeugt ein installations-fertiges KeyHelp-Theme-Archiv.
#
#  Verwendung:
#     ./build-release.sh              # Version aus _settings.json
#     ./build-release.sh 1.0.1        # Version explizit setzen
#
#  Ergebnis: dist/corporate-blue-v<version>.tar.bz2
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# --- Version ermitteln -------------------------------------------------------
if [[ $# -ge 1 ]]; then
    VERSION="$1"
else
    VERSION="$(grep -oE '"version"[[:space:]]*:[[:space:]]*"[^"]+"' _settings.json \
                | head -n1 | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
fi
if [[ -z "${VERSION:-}" ]]; then
    echo "FEHLER: Version konnte nicht aus _settings.json ermittelt werden." >&2
    exit 1
fi

PKG_NAME="corporate-blue"
OUT_DIR="${OUT_DIR:-dist}"
STAGE="${OUT_DIR}/.stage/${PKG_NAME}"
ARCHIVE="${OUT_DIR}/${PKG_NAME}-v${VERSION}.tar.bz2"

# --- Whitelist: alles, was KeyHelp tatsächlich braucht -----------------------
#  Bewusst Whitelist statt Blacklist, damit _settings.json niemals
#  versehentlich aus dem Release fällt.
INCLUDE=(
    "_settings.json"
    "_preview.html"
    "_screenshot.png"
    "unicode_reference"
    "README.md"
    "assets"
    "templates"
)

# --- Pflicht-Files prüfen ----------------------------------------------------
for f in _settings.json templates assets; do
    if [[ ! -e "$f" ]]; then
        echo "FEHLER: Pflicht-Datei/Ordner fehlt: $f" >&2
        exit 1
    fi
done

# --- Tailwind-CSS bauen (falls Toolchain vorhanden) --------------------------
#  tw.css wird in assets/css/ erwartet. Wenn package.json vorhanden ist und
#  npx funktioniert, frisch builden — andernfalls Existenz prüfen.
if [[ -f "package.json" ]] && command -v npx >/dev/null 2>&1; then
    echo "Tailwind: baue assets/css/tw.css ..."
    if [[ ! -d "node_modules" ]]; then
        npm install --silent --no-audit --no-fund
    fi
    npx --no-install tailwindcss \
        -i ./tailwind/input.css \
        -o ./assets/css/tw.css \
        --minify >/dev/null
fi
if [[ ! -f "assets/css/tw.css" ]]; then
    echo "FEHLER: assets/css/tw.css fehlt — Tailwind-Build vor Release ausführen." >&2
    exit 1
fi

# --- Stage aufbauen ----------------------------------------------------------
rm -rf "${OUT_DIR}/.stage"
mkdir -p "$STAGE"
for item in "${INCLUDE[@]}"; do
    if [[ -e "$item" ]]; then
        cp -a "$item" "$STAGE/"
    else
        echo "Hinweis: optionales Item fehlt, wird übersprungen: $item" >&2
    fi
done

# --- Aufräumen im Stage ------------------------------------------------------
find "$STAGE" -type d -name '.git'        -prune -exec rm -rf {} +
find "$STAGE" -type d -name 'node_modules' -prune -exec rm -rf {} +
find "$STAGE" -type f \( \
        -name '.DS_Store' -o \
        -name 'Thumbs.db' -o \
        -name '*.swp'    -o \
        -name '*~' \
    \) -delete

# --- Tarball schnüren --------------------------------------------------------
mkdir -p "$OUT_DIR"
rm -f "$ARCHIVE"
tar --owner=0 --group=0 --numeric-owner \
    -cjf "$ARCHIVE" -C "${OUT_DIR}/.stage" "$PKG_NAME"

rm -rf "${OUT_DIR}/.stage"

# --- Verifikation ------------------------------------------------------------
echo
echo "Release gebaut: $ARCHIVE"
echo "Größe:          $(du -h "$ARCHIVE" | cut -f1)"
echo "Inhalt (Top):"
tar -tjf "$ARCHIVE" | awk -F/ 'NF<=2 {print "  " $0}' | sort -u

# Pflicht-Files im Archiv gegenprüfen (Listing einmal in Variable cachen,
# sonst kollidiert SIGPIPE von `grep -q` mit `set -o pipefail`).
ARCHIVE_LIST="$(tar -tjf "$ARCHIVE")"
for must in "${PKG_NAME}/_settings.json" "${PKG_NAME}/templates/" "${PKG_NAME}/assets/"; do
    if ! grep -q "^${must}" <<< "$ARCHIVE_LIST"; then
        echo "FEHLER: $must fehlt im fertigen Archiv!" >&2
        exit 1
    fi
done
echo
echo "OK — alle Pflicht-Bestandteile enthalten."
