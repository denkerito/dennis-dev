# Design

## Context

The repository is greenfield: it holds OpenSpec configuration, a README and a `.gitignore`, and no application code. See `proposal.md` for motivation and scope, and the three spec deltas for the behaviour this design must satisfy.

Facts checked on the development machine on 2026-11-11:

- Node 22.17.1 and npm 11.11.0 are installed; pnpm is not.
- The current stable releases are `next` 16.4.6 (requires Node >= 20.9) and `react` 19.3.1.

Decisions already taken by Dennis during exploration, which this design treats as fixed:

- Styling uses CSS Modules.
- One theme only. Provisional colours: cream background, navy second colour, dark coral accent.
- The giant wordmark uses the second colour (navy), not the accent.
- Header: a capital `D` home mark on the left, About · Work · Contact on the right.
- The mascot roams freely only in the hero and the footer; elsewhere it is staged. Its interaction with the wordmark is deferred.

Everything else below is a design-level call made here and is open to correction.

## Goals / Non-Goals

**Goals:**

- A shell that later changes extend without restructuring: new content goes inside existing sections, the mascot attaches to an existing mount point, the theme changes by editing token values.
- Zero hand-written client-side JavaScript in this change, so the baseline for performance is as good as the framework allows.
- A build output that any static host can serve.

**Non-Goals:**

- Choosing final colours, typefaces or spacing. Values here are placeholders with correct structure.
- Any animation beyond native smooth scrolling.
- Abstractions for content that does not exist yet (project data models, CMS, MDX).

## Decisions

### 1. Set the project up by hand instead of `create-next-app`

Install `next`, `react`, `react-dom` and the development packages with npm, and write the handful of configuration and source files directly.

- **Why:** the repository already contains `.claude/` and `openspec/`, which the generator treats as conflicts in a non-empty directory. The generator also produces boilerplate (sample page, sample assets, optional Tailwind) that would be deleted immediately.
- **Alternative rejected:** `create-next-app` in a temporary folder and copying files over. More steps for the same result, and it hides which files are actually needed.
- **Package manager:** npm, because it is already installed. pnpm was rejected only because it would be one more tool to install for no benefit at this size.

### 2. Dependencies

| Package | Kind | Why it is needed | Alternative rejected |
|---|---|---|---|
| `next`, `react`, `react-dom` | runtime | The stack chosen for the project (App Router, static generation, also a React showcase for internship applications) | Astro or plain HTML with Vite: lighter, but Dennis chose Next.js |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | dev | Strict type checking | None; required by the stack |
| `eslint`, `eslint-config-next` | dev | Lint rules including accessibility and Next.js checks | Biome: faster, but lacks the Next.js-specific rules |

Deliberately not added: Tailwind (CSS Modules chosen), Prettier, a test framework, any animation or UI library. Each can be justified later by the change that needs it.

Tooling details move between major versions of Next.js. During implementation, confirm the lint setup and configuration file formats against the documentation of the installed version rather than from memory. In particular, check whether linting is run through the ESLint CLI directly.

### 3. Fully static export

Set `output: 'export'` in the Next.js configuration so the build writes plain files to `out/`.

- **Why:** hosting is undecided and the project must not depend on a provider. Static files run anywhere and need no maintenance.
- **Alternative rejected:** the default server output with statically rendered pages. It keeps server features available but requires a Node-capable host, which narrows hosting choices before any feature needs a server.
- **Consequence:** no request-time server code and no built-in image optimisation. The change that adds the visitor-distance feature, and the one that adds mascot images, must each account for this.

### 4. File layout

```
src/
  app/
    layout.tsx        document shell, metadata, fonts, skip link
    page.tsx          the single page: hero + three sections
    globals.css       tokens, reset, base element styles
    icon.svg          site icon
  components/
    SiteHeader/       home mark + navigation
    Hero/             h1 wordmark + mascot mount point
    Section/          generic section with id and h2
    SiteFooter/
    SkipLink/
  content/
    site.ts           site name, title, description, navigation items
```

Each component folder holds its `.tsx` and `.module.css`. A path alias `@/*` maps to `src/*`. All components are Server Components; nothing in this change needs `"use client"`.

`content/site.ts` is the single place for the site name, metadata text and the navigation list, so the header and the page cannot drift apart. No folder is created for the mascot yet: empty folders are not tracked by git and the mascot's structure is not designed.

### 5. Theme tokens

Tokens are CSS custom properties on `:root` in `globals.css`. Component styles reference tokens only and never contain literal colours.

| Token | Provisional value | Role |
|---|---|---|
| `--color-paper` | `#F4EDE0` | background |
| `--color-ink` | `#14213D` | second colour: text, wordmark, filled surfaces |
| `--color-accent` | `#E24A38` | accent |

Measured contrast for these values:

| Pair | Ratio | Allowed for |
|---|---|---|
| ink on paper | 13.72:1 | all text |
| accent on paper | 3.42:1 | large text and non-text only |
| accent on ink | 4.01:1 | large text and non-text only |

So in this shell every piece of text is ink on paper, and the accent appears only as decoration (for example the underline of the focused or hovered navigation link). `color-scheme: only light` is declared so browsers do not apply their own dark styling, and the browser theme colour is set to the paper colour.

- **Alternative rejected:** a TypeScript theme object or CSS-in-JS. It adds runtime cost and a dependency for something CSS variables already do.

### 6. Typography

- **Display typeface:** Anton, loaded with the framework's built-in font support for Google Fonts. The font file is downloaded at build time and served from the site's own origin, so visitors make no request to Google. It is exposed as a CSS variable and used only by the wordmark and the home mark. Loading uses `swap` so the wordmark is never invisible.
- **Text typeface:** the system UI font stack. It costs zero bytes and is a neutral placeholder until the theme is designed.
- **Alternative rejected for now:** committing the font file and loading it locally. It removes the build-time network dependency and is the better long-term choice, but it is not worth doing for a typeface that is expected to change.
- **Wordmark size:** fluid, driven by viewport width and capped by viewport height (`clamp` over `vw` and `svh` units), so the six letters span most of the width at 1440 pixels and still fit entirely at 360 pixels. Exact numbers are tuned during implementation.

### 7. Header, anchors and scrolling without JavaScript

- The header is `position: sticky` at the top with the paper background and a fixed height stored in a `--header-height` token. Making it sticky is a call made here: the home mark is only useful as "back to top" if it stays reachable.
- The hero's minimum height is the small viewport height minus the header height, so header and hero fill the first screen.
- Navigation uses plain fragment links (`#about`, `#work`, `#contact`); the home mark links to `#top`, which browsers resolve to the top of the document.
- `scroll-padding-top` on the root equals the header height, so targets and focused elements are never hidden under the header.
- Smooth scrolling is `scroll-behavior: smooth` inside a `prefers-reduced-motion: no-preference` media query. Visitors who prefer reduced motion get the browser's instant jump.
- Three links plus the home mark fit at 360 pixels, so there is no collapsed menu and no script.

- **Alternative rejected:** a scroll-spy that highlights the current section. It needs client JavaScript and belongs with real content, if at all.

### 8. Skip link and focus

The skip link is the first element in the body, visually hidden until focused, and targets the `main` element, which has `tabindex="-1"` so it can receive focus. One global `:focus-visible` rule draws a 2 pixel ink outline with an offset; ink on paper is 13.72:1.

### 9. Mascot mount point

Inside the hero, a `div` with `aria-hidden="true"`, absolutely positioned over the hero, with `pointer-events: none` and no content. The `h1` stays an ordinary element underneath in the same stacking context. The footer gets a generous minimum height and nothing else. This is the whole of the mascot's footprint in this change: a later change decides what renders there and how it loads.

### 10. Metadata

Use the framework's metadata API in the root layout, reading text from `content/site.ts`. A public site address is read from an environment variable at build time; when present it sets the metadata base, the canonical URL and the Open Graph URL, and when absent those are left out. The site icon is a hand-written SVG built from basic shapes (a navy square with a cream capital `D` made from a stem and a half-round bowl), since an SVG icon cannot rely on the display typeface being available.

### Impact on performance

- No hand-written client JavaScript; the page is static HTML plus the framework runtime.
- One font file (Anton, a single weight), preloaded and self-hosted; body text uses system fonts.
- No images. The largest contentful element is the wordmark text.
- Expected to meet the Lighthouse target with margin; this is measured, not assumed, in the final task.

### Impact on accessibility

- Semantic landmarks, one `h1`, ordered `h2`s, skip link, visible focus and no keyboard traps come from the structure itself.
- The sticky header is the one accessibility hazard introduced: it can cover focused elements and anchor targets. `scroll-padding-top` addresses both.
- All text is ink on paper at 13.72:1. The accent is never used for text in this change.
- Motion is limited to native smooth scrolling and is disabled under reduced-motion.

## Risks / Trade-offs

- [Static export rules out server-side features] → Recorded in the proposal as a constraint; a later change may switch the output mode by changing one configuration line and stating why.
- [The build needs network access to fetch Anton] → Acceptable while the typeface is provisional; switch to a committed local font file when the final typeface is chosen.
- [Provisional colours could get hard-coded in later components] → Component styles use tokens only; the verification task includes a search for literal colour values outside `globals.css`.
- [A sticky header takes vertical space on small phones] → Keep it compact (around 56 pixels) and re-evaluate when real content exists.
- [A near-black mascot is nearly invisible on a navy wordmark] → Out of scope here and recorded in the proposal; the mascot change must resolve it. The token structure does not prevent either a light outline on the mascot or a different wordmark colour.
- [Lighthouse is measured locally, not in CI] → Sufficient for a single-developer project at this stage; automate when deployment exists.

## Migration Plan

Greenfield: nothing to migrate. Rollback is reverting the commits of this change.

## Open Questions

- Which text typeface will replace the system font stack. Decided with the final theme.
- The public site address. Unknown until a domain is chosen; the build works without it.
- Whether the not-found page needs custom styling. The framework's default is used for now.
