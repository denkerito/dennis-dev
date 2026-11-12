# Tasks

## 1. Project setup

- [ ] 1.1 Create `package.json` (private, `engines.node >= 20.9`) and install `next`, `react`, `react-dom` plus dev packages `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`; verify `npm ls --depth=0` lists exactly these and reports no errors
- [ ] 1.2 Add `tsconfig.json` with `strict: true` and the `@/*` → `src/*` path alias, and a `typecheck` script; verify `npm run typecheck` exits 0
- [ ] 1.3 Add the Next.js configuration with `output: 'export'`, checking the configuration file format against the documentation of the installed Next.js version; verify the file is picked up by `npm run build` in task 2.2
- [ ] 1.4 Add the ESLint configuration using the Next.js rules and a `lint` script, checking against the installed version's documentation how linting is invoked; verify `npm run lint` exits 0
- [ ] 1.5 Extend `.gitignore` with `.next/`, `out/`, `next-env.d.ts` and `*.tsbuildinfo`; verify `git status` shows none of them after a build

## 2. Document shell and theme

- [ ] 2.1 Create `src/content/site.ts` with the site name, title, description (50–160 characters) and the navigation items About, Work, Contact with their fragment ids; verify it type-checks and is the only place these strings are defined
- [ ] 2.2 Create `src/app/globals.css` with the colour tokens (`--color-paper`, `--color-ink`, `--color-accent`), `--header-height`, `color-scheme: only light`, a minimal reset, base text styles using the system font stack, and `scroll-padding-top`; create a minimal `src/app/layout.tsx` and `src/app/page.tsx`; verify `npm run build` succeeds and writes `out/index.html`
- [ ] 2.3 Load Anton through the framework's font support with `display: swap`, exposed as a CSS variable; verify the built page requests the font from its own origin and no request goes to a Google domain
- [ ] 2.4 Add the global `:focus-visible` outline (2px, ink, with offset) and the reduced-motion-aware `scroll-behavior` rule; verify by tabbing in the browser that focus is visible, and that toggling "reduce motion" in the browser's rendering tools switches anchor scrolling between smooth and instant

## 3. Page structure

- [ ] 3.1 Build the `SkipLink` component and make `main` focusable as its target; verify the first Tab reveals "Skip to content" and activating it moves focus into `main`
- [ ] 3.2 Build the `SiteHeader` component: sticky, paper background, capital `D` home mark linking to `#top` with an accessible name, and the three fragment links from `site.ts`; verify at 360px width that all four are visible with no collapsed menu and each target is at least 24 by 24 CSS pixels
- [ ] 3.3 Build the `Hero` component with the `h1` `DENNIS` in the display typeface and ink colour, fluid size, and minimum height of small viewport height minus header height; verify at 1440×900 that header plus hero fill the screen, and at 360px that the whole wordmark is visible without horizontal scroll
- [ ] 3.4 Add the mascot mount point inside the hero (`aria-hidden`, absolutely positioned, `pointer-events: none`, empty); verify the wordmark text can still be selected with the pointer and the accessibility tree of the hero contains only the heading
- [ ] 3.5 Build the `Section` component (id + `h2`) and render About, Work and Contact in `page.tsx`, each with a minimum height so anchors are testable; verify opening `/#work` shows the Work heading fully below the header
- [ ] 3.6 Build the `SiteFooter` component as a footer landmark with a generous minimum height; verify the landmark list shows one banner, one navigation, one main and one content information
- [ ] 3.7 Verify the page with JavaScript disabled in the browser: wordmark, sections and navigation are present and the fragment links work

## 4. Metadata

- [ ] 4.1 Add metadata in the root layout from `site.ts`: `lang="en"`, title, description, Open Graph title, description, type `website`, site name and locale, and the viewport export with the paper theme colour and zoom allowed; verify the tags in the built `out/index.html`
- [ ] 4.2 Read the public site address from an environment variable at build time and set the metadata base, canonical URL and Open Graph URL only when it is present; verify by building once with and once without the variable and inspecting `out/index.html` in both cases
- [ ] 4.3 Add `src/app/icon.svg` (navy square, cream capital `D` from basic shapes); verify the browser tab shows it and the console logs no failed icon request

## 5. Documentation

- [ ] 5.1 Update `README.md` with prerequisites (Node version), the `dev`, `build`, `lint` and `typecheck` commands, how to serve `out/` locally, the optional site-address variable, and a pointer to `globals.css` as the place to change theme tokens; verify each documented command runs as written

## 6. Verification

- [ ] 6.1 Run `npm run build`, `npm run lint` and `npm run typecheck`; verify all three exit 0 with no warnings left unexplained
- [ ] 6.2 Serve `out/` with a plain static file server and check the layout at 360, 768 and 1440 pixels wide and at 200% zoom on 1280; verify no horizontal scrollbar and no clipped content at any size
- [ ] 6.3 Keyboard pass on the served build: Tab order is skip link, home mark, About, Work, Contact; Enter on each link reaches its section; no focused element is hidden under the header
- [ ] 6.4 Accessibility pass on the served build: check landmarks and heading outline with the browser's accessibility tree, and confirm with a contrast checker the ratios recorded in `design.md`; search the source for literal colour values outside `globals.css` and verify there are none
- [ ] 6.5 Run Lighthouse (mobile and desktop) against the served build; verify Performance, Accessibility, Best Practices and SEO are each at least 90 and record the scores in the change summary
- [ ] 6.6 Emulate OS dark mode in the browser; verify the page colours do not change

## Workflow follow-up

- Archive the change once the verification group is complete.
