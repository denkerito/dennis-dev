# Proposal

## Why

The repository contains only OpenSpec configuration and a README: there is no application yet. Every planned feature (the cat mascot, the ink effect on the wordmark, the About / Work / Contact content) needs a real page to attach to, so the first step is an empty but correct stage: a single static page with its structure, navigation, provisional theme and accessibility foundations in place.

## What Changes

- Add a Next.js (App Router) + TypeScript strict application to the repository, configured to build as a fully static site.
- Add the single home page (`/`) with its permanent structure: header navigation, a full-viewport hero holding the real `DENNIS` heading, three empty sections (About, Work, Contact) with headings only, and a footer.
- Add header navigation: a capital `D` home mark on the left that returns to the top, and About · Work · Contact anchor links on the right.
- Add accessibility foundations: skip link, semantic landmarks, visible keyboard focus, reduced-motion handling for scrolling.
- Add a single provisional visual theme expressed as design tokens: cream background, navy as second colour (also used for the giant wordmark), dark coral accent, and a provisional heavy condensed display typeface for the wordmark.
- Add page metadata: language, title, meta description, Open Graph tags and a simple site icon.
- Add project tooling: lint, type check and build scripts.
- Reserve an empty, decorative mount point in the hero (and room in the footer) where the mascot will be attached by a later change.

## Out of scope

- The cat mascot in any form: the free-roaming cat in the hero and footer, the staged poses in the sections, and the 3D-model / sprite pipeline.
- The ink smear effect on the wordmark, and how exactly the cat interacts with the wordmark. This is deliberately deferred.
- Real content for About, Work and Contact (copy, project cards, contact links, live age, distance from the visitor).
- The final theme. Colours and typeface in this change are provisional and expected to change by editing token values only.
- The link-preview image (Open Graph image). It depends on the final theme and on a public site address, so it waits for both.
- Hosting, domain, deployment pipeline, analytics.
- An automated test framework (unit or end-to-end).

Direction recorded for later changes, not implemented here: the mascot is intended to be a very dark, near-black cat. A near-black cat has almost no contrast against a navy wordmark, so the change that introduces the mascot must decide how the two are told apart.

## Capabilities

### New Capabilities

- `site-shell`: the structure of the single-page site — landmarks, section anchors, header navigation, hero heading, skip link, keyboard and reduced-motion behaviour, responsive layout, and the reserved mascot mount point.
- `visual-theme`: the single site-wide theme — colour tokens and their permitted pairings, contrast guarantees, and typography roles.
- `site-metadata`: document metadata for browsers, search engines and link previews — language, title, description, Open Graph tags, viewport behaviour and site icon.

### Modified Capabilities

None. There are no existing specs.

## Impact

- **Pages affected:** the home page `/` (new). It is the only page of the site.
- **Code:** new application source under `src/` (app, components, content), new root configuration files (`package.json`, `tsconfig.json`, Next.js and ESLint configuration), updated `.gitignore` and `README.md`.
- **Dependencies:** `next`, `react`, `react-dom` at runtime; `typescript`, `eslint` and the Next.js ESLint configuration plus type packages for development. No styling, animation or UI library.
- **Build output:** a static `out/` directory deployable to any static host.
- **Constraint introduced for later changes:** with static export there is no server-side code at request time. Features that need the visitor's IP or a server endpoint must use a client-side call or revisit this decision in their own change.
