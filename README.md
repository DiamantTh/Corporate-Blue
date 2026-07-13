# Corporate Blue — KeyHelp Theme

Ein corporate-blaues Light-Theme für das [KeyHelp](https://www.keyhelp.de)
Control-Panel. Ursprünglich abgeleitet vom offiziellen Default-Theme von
Alexander Mahr / Keyweb AG, inzwischen vollständig auf
**Tailwind CSS v4** als Foundation umgebaut.

## Features

- **Light-Mode-Theme** (`has_dark_mode: false`) — kein Toggle, klares
  blaues Corporate-Schema durchgängig
- **Tailwind v4 als alleinige Foundation** — Bulma-/Bootstrap-Abhängigkeiten
  vollständig durch einen scoped Foundation-Layer (`body.default-mode`)
  ersetzt, inklusive der responsiven Bulma-Column-Varianten
  (`is-X-tablet/desktop/widescreen/fullhd`)
- **Coexistence-Mode** — kein `@tailwind preflight`, damit KeyHelps
  bestehendes Markup unberührt bleibt; nur `theme` + `utilities` Layer
- **Lokale Vendor-Assets** — keine CDNs (ECharts, Chart.js, CodeMirror,
  FontAwesome, jQuery, Select2, Tippy, Trumbowyg, Handlebars,
  Perfect-Scrollbar, Bulma-Reste für Legacy-Markup, Tailwind-Build)
- **Relative Asset-Pfade** — `theme_root` wird in `base.twig` gesetzt,
  alles funktioniert unter `/theme/Corporate-Blue/` ohne Hardcoding
- **DKIM-Modal & Modal-Größen** — `is-large` / `is-xlarge` /
  `is-fullscreen` / `is-dkim` (monospace) als Tailwind-Layer-Klassen
- **CapsLock-Detection** — dynamisch nur sichtbar wenn Caps aktiv
  und Passwort-Feld fokussiert (Login + interne Pages)
- **Logo- und Icon-Caps** — `.svg-vendor-logo`, `.svg-keydisc`,
  `.svg-footer-icon` mit definierten Maximalgrößen
- **FIDO2/WebAuthn + TOTP** — Login-Flow voll unterstützt

## Farbpalette

| Token | Verwendung |
|---|---|
| Primary Blue `#3273DC` | Links, aktive States, Buttons |
| Sidebar (hell, blau-grau) | Navigation |
| Card (weiß / sehr helles Blau) | Karten-Hintergründe |
| Text (dunkles Marineblau) | Body-Text |
| Border (helles Blau-Grau) | Dividers, Tabellen, Formulare |

## Projekt-Struktur

```
Corporate-Blue/
├── _settings.json            # Theme-Metadaten (name, version, has_dark_mode)
├── _preview.html             # Standalone-Browser-Preview ohne Backend
├── _screenshot.png           # Theme-Screenshot für KeyHelp-Auswahl
├── unicode_reference         # KeyHelp-Pflichtdatei
├── build-release.sh          # Release-Tarball-Builder mit Whitelist
├── package.json              # Tailwind v4 Build (npm)
├── tailwind/
│   └── input.css             # Tailwind-Quelle inkl. Foundation-Layer
│                             # (Bulma-kompatible Selektoren scoped auf
│                             #  body.default-mode)
├── assets/
│   ├── css/
│   │   ├── fontawesome.css   # FontAwesome 7 Build-Output (minified, via sass)
│   │   └── tw.css            # Tailwind-Build-Output (minified)
│   ├── img/                  # Logos, Favicons, Vendor-SVGs
│   ├── js/                   # Page-spezifisches JS (login.js, main.js,
│   │                         #  dashboard_notes.js, page_*.js, …)
│   ├── fonts/fontawesome/    # FontAwesome-Webfonts (woff2)
│   └── vendor/               # ECharts, CodeMirror, FontAwesome-SCSS,
│                             # Handlebars, jQuery, Perfect-Scrollbar,
│                             # Select2, Tailwind, Tippy, Trumbowyg
└── templates/
    ├── layout/               # base, intern, extern, popup
    ├── components/           # Cards, Navigation, Modals, Forms, Icons
    ├── macros/               # Twig-Makros
    └── views/                # Seitenspezifische Views (intern/extern)
```

## Build

FontAwesome (SCSS → CSS) + Tailwind v4 in einem Schritt:

```bash
npm run build
```

Oder einzeln:

```bash
npm run build:fa    # assets/css/fontawesome.css
npm run build:css   # assets/css/tw.css
```

Die Quelle `tailwind/input.css` enthält den **Foundation-Layer** —
ein scoped Set Bulma-kompatibler Selektoren (`.columns`, `.column`,
`.box`, `.button`, `.tag`, `.modal`, `.menu`, …), allesamt unter
`body.default-mode { … }`, damit KeyHelps Twig-Templates ohne
Markup-Änderung weiterlaufen.

## Preview ohne Backend

```bash
python3 -m http.server 8099
```

Dann [http://localhost:8099/_preview.html](http://localhost:8099/_preview.html)
öffnen — zeigt Dashboard, Card-Layouts, Forms und Tabellen rein
client-seitig.

## Installation

```
/home/keyhelp/www/keyhelp/theme/Corporate-Blue/
```

KeyHelp erkennt das Theme automatisch über `_settings.json`.
**Schreibweise des Verzeichnisnamens beachten** — KeyHelp serviert
Theme-Assets case-sensitive (`/theme/Corporate-Blue/...`).

## Release-Build

```bash
OUT_DIR=out bash build-release.sh           # Version aus _settings.json
OUT_DIR=out bash build-release.sh 1.1.3     # Version explizit
```

Ergebnis: `out/corporate-blue-v<version>.tar.bz2`.

Der Builder verwendet eine **Whitelist** (`_settings.json`,
`_preview.html`, `_screenshot.png`, `unicode_reference`, `README.md`,
`assets/`, `templates/`) und prüft am Ende, dass die KeyHelp-Pflicht-
bestandteile (`_settings.json`, `templates/`, `assets/`) wirklich im
Archiv liegen — Schutz gegen versehentlich zerschossene Releases.

## Versionshistorie

- **1.1.3** — Responsive Bulma-Column-Varianten
  (`is-X-tablet/desktop/widescreen/fullhd`) im Foundation-Layer;
  Konfiguration & Systemstatus wrappen wieder korrekt
- **1.1.2** — Logo-/Icon-Größen-Caps, Password-Annotation-Defaults,
  dynamische CapsLock-Detection (Login + intern)
- **1.1.1** — `theme_root`-Variable in `base.twig`, DKIM-Modal-Größe
- **1.1.0** — Tailwind-v4-Foundation komplett, Bulma-Migration
  abgeschlossen
- **1.0.x** — initiale Veröffentlichung auf Bulma-Basis

## Lizenz

AGPL-3.0-or-later

## Basierend auf

- **Default-Theme** von Alexander Mahr / Keyweb AG —
  [keyhelp.de](https://www.keyhelp.de)
- **Tailwind CSS v4**
- **FontAwesome**

## Autor

DiamantTh — basierend auf dem Default-Theme von
Alexander Mahr / Keyweb AG

## Version

`1.1.3` — kompatibel mit KeyHelp 25.x
