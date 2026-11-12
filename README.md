# Dennis Portfolio

Personal portfolio website: a single static page built with Next.js (App Router), TypeScript and CSS Modules.

## Prerequisites

- Node.js 20.9 or later (developed on Node 22)
- npm

Install dependencies once:

```bash
npm install
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload at http://localhost:3000 |
| `npm run build` | Production build. Writes the static site to `out/` |
| `npm run lint` | ESLint with the Next.js rules |
| `npm run typecheck` | Generates Next.js route types, then runs the TypeScript compiler without emitting files |

The build downloads the display typeface (Anton) from Google Fonts at build time, so it needs network access. Visitors never contact Google: the font is served from the site itself.

## Serving the build locally

`out/` is plain static files, so any static file server works. With Python, which needs nothing extra installed:

```bash
python -m http.server 4173 --directory out
```

Then open http://localhost:4173.

## Site address (optional)

Set `SITE_URL` at build time to the public address of the site. The page then gets a canonical URL and an Open Graph URL built from it. Without it, the build still works and those two tags are left out. An invalid value stops the build with an error.

```bash
SITE_URL=https://example.com npm run build
```

In PowerShell:

```powershell
$env:SITE_URL = "https://example.com"; npm run build
```

## Theme

All colours are tokens in [`src/app/globals.css`](src/app/globals.css) (`--color-paper`, `--color-ink`, `--color-accent`). Change the theme by editing those values; components only reference the tokens. The site icon [`src/app/icon.svg`](src/app/icon.svg) cannot read CSS variables, so its two colours have to be updated by hand.

## Project structure

- `src/app/` — root layout (metadata, fonts), the page, global styles, site icon
- `src/components/` — one folder per component, each with its `.tsx` and `.module.css`
- `src/content/site.ts` — site name, metadata text and navigation items
- `openspec/` — specs and changes describing what the site does and why
