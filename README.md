# Corporate Blue — KeyHelp Theme

A dark, corporate-styled theme for [KeyHelp](https://www.keyhelp.de) control panel, based on the official Default Theme by Alexander Mahr / Keyweb AG.

## Features

- **Unified dark style** — permanently dark, no toggle; tuned for extended screen sessions
- **Corporate Blue palette** — deep navy sidebar, midnight header, layered card system
- **ECharts integration** — dashboard charts (CPU/RAM/Traffic) shipped locally, no CDN
- **Tailwind CSS** (prefix `tw-`) — available alongside Bulma for new UI elements, no CDN
- **Button system** — 8 variants with distinct dark-adjusted backgrounds (link/dark/danger/warning/success/info/primary/outlined)
- **Tag system** — all Bulma tag variants re-colored for the dark palette
- **No dark-mode toggle** — `has_dark_mode: false`; the theme is always dark

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Sidebar | `#0a1928` | Navigation background |
| Header | `#0e1e30` | Top bar, footer |
| Page bg | `#15253a` | Main content area |
| Card | `#1c2e46` | Card backgrounds |
| Card header | `#172840` | Card header strip |
| Border | `#2c4060` | Dividers, table borders, form borders |
| Text primary | `#c8d8f0` | Body text |
| Text muted | `#8ab0d0` | Labels, secondary info |
| Accent blue | `#3273DC` | Links, active states, progress |

## File Structure

```
corporate-blue/
├── _preview.html          # Standalone browser preview (no backend required)
├── _settings.json         # Theme metadata (name, version, has_dark_mode)
├── assets/
│   ├── css/
│   │   ├── style.css          # Main stylesheet (Bulma + Corporate Blue overrides)
│   │   ├── style-dark.css     # Dark CSS (kept for compatibility, same overrides)
│   │   ├── style-rtl.css      # RTL variant
│   │   └── style-dark-rtl.css # Dark RTL variant
│   ├── img/
│   │   ├── keyhelp.svg        # Standard logo (light background)
│   │   └── dark/
│   │       └── keyhelp.svg    # Dark logo (used always in this theme)
│   ├── js/                    # Page-specific JS files
│   └── vendor/
│       ├── echarts/           # ECharts 5.x (local, no CDN)
│       └── tailwind/          # Tailwind CSS 3.x (local, no CDN)
└── templates/
    └── layout/
        ├── base.twig          # Base layout (CSS/JS includes, inline overrides)
        ├── intern.twig        # Authenticated admin/client layout
        ├── extern.twig        # Login / external pages
        └── popup.twig         # Popup windows
```

## Preview

Start a local preview server from the theme root:

```bash
python3 -m http.server 8099
```

Then open: [http://localhost:8099/_preview.html](http://localhost:8099/_preview.html)

The preview includes:
- Dashboard with KPI strip, server info table, Disk/Traffic charts, monitoring line chart
- Client accounts table with pagination
- Domain edit form with tabs (General / SSL / PHP / Redirects)
- Service status + quick actions
- Sub-pages: Domains list, E-Mail manager, DNS editor

## Installation

Place the `corporate-blue/` folder in your KeyHelp themes directory:

```
/home/keyhelp/www/keyhelp/theme/corporate-blue/
```

KeyHelp will detect it automatically via `_settings.json`.

## Based On

- **Default Theme** by Alexander Mahr / Keyweb AG — [keyhelp.de](https://www.keyhelp.de)
- **Bulma** CSS framework
- **Font Awesome** icons

## Author

DiamantTh — based on the Default Theme by Alexander Mahr / Keyweb AG

## Version

`25.3` — Compatible with KeyHelp 25.x
