# Design

## Context

See `proposal.md` for motivation and scope. The behaviour this design must satisfy is in the five spec deltas.

State of the code after `hero-cat-follows-pointer`:

- `page.tsx` maps the navigation items onto a generic `Section` component, which renders only an `h2`. Its `min-height: 70svh` is a placeholder kept so the anchors can be tested.
- All copy lives in `src/content/site.ts`. The header and the sections read their labels from `navigation`.
- The theme tokens live only in `globals.css`. There is one global focus style: a 2 px ink outline.
- The hero's wordmark is sized `clamp(3rem, 31vw, 62svh)`. The cat's size is computed in JavaScript as 0.45 times that, clamped between 80 and 220 px (`HeroMascot.tsx`). At 1440 by 900 that is about 200 px; at 360 px wide it is 80 px.
- The only hand-written client code is the hero's cat, loaded lazily. Vitest runs pure-logic tests.

Decisions Dennis made while this was explored, treated here as fixed:

- **Layout:**
  - slots alternate sides, and in Work they alternate card by card;
  - the cat may pass behind a card, but not behind plain text;
  - in About the cat comes close as in the reference, but not on mobile;
  - on mobile, slot A: in the heading row, one per section.
- **Age:** it keeps counting and stays correct. The visitor stops it by activating the number; there is no separate button. It shows eight decimals.
- **Contact:**
  - the header Contact link becomes a highlighted button, and there is no prompt under the hero;
  - the email is shown, with a mailto link and a copy button.
- **Copy:** the copy below was written in this exploration and corrected by Dennis.

## Goals / Non-Goals

**Goals:**

- The page reads completely and works with no cat and no scripting. The only differences without scripting are the live age and the copy button.
- The slots are plain layout boxes whose size and position come from CSS alone. The next change can find them in the page and walk the cat to them without changing this layout.
- The cat's size is written once and shared by the hero and the slots.

**Non-Goals:**

- The cat in the sections. Nothing here draws or moves it, and no stacking layer for it is created yet.
- A content management layer. The content is typed data in the repository.

## Decisions

### 1. Content as typed data under `src/content/`

The sections render from typed objects in a new `src/content/sections.ts`; `site.ts` keeps the site-wide strings and the navigation. The data includes the birth date as a calendar date and the email address. A project's `stack` and `link` are optional, so the hackathon card leaves them out rather than the component special-casing it.

- **Alternative rejected:** writing the copy straight into the components. It scatters the copy Dennis will keep editing across JSX, while `site.ts` already set the pattern of one place for words.
- **Alternative rejected:** Markdown files. They need a parser, which is a dependency, for six short blocks of text.

Agreed copy:

**About**
- Greeting: "Hi, I'm Dennis."
- List:
  - `<age>` years old
  - Third-year Computer Science student at the University of Milano-Bicocca
  - Based in Milan, or maybe somewhere else around Europe
  - Into AI, LLMs and machine learning, maths and software engineering
  - English, Italian and Albanian speaker
  - Off the keyboard: lifting and running
- Internship line: "Open to internships — in Milan, remote, or relocating anywhere in Europe."

**Work**, in this order:

1. **Hackathon win · May 2026.**
   - "Our team won a hackathon on digital accessibility in banking. The problem was inside the bank: employees were losing time to bureaucracy and to documents full of jargon. Our answer was a chatbot on a RAG architecture that they can simply ask."
   - "We won because we took the time to really understand the problem, and what accessibility means, before we started thinking about a solution."
   - No stack, no link.
2. **Agentic RAG.**
   - "An AI agent that investigates a company's finances: the numbers come from read-only SQL, the causes from its documents, and every claim cites its source."
   - "Instead of cold messaging a company on LinkedIn with “hi, I'm a student, hire me”, I wanted to show up with something that actually works. Result: a polite rejection. I liked the project too much to stop, so I kept building it."
   - Stack: Python, FastAPI, Pydantic AI, PostgreSQL + pgvector, React.
   - Link: `https://github.com/denkerito/agentic-rag`.
3. **JIM007.**
   - "A workout tracker you talk to. Write “bench press 55x8 55x6” in a chat and it becomes structured training data."
   - "Gym apps make you fill in forms between sets. I wanted to log a session the way I'd text a friend."
   - Stack: Python, FastAPI, PostgreSQL, Gemini, React.
   - Link: `https://github.com/denkerito/Jim-007`.

**Contact**
- "Let's grab a coffee."
- Then: `ismajli.dennis@gmail.com` with Copy, LinkedIn, GitHub.

Birth date: 31 October 2005.

### 2. One size token for the cat

`globals.css` gains two layout tokens:

```
--wordmark-size: clamp(3rem, 31vw, 62svh);
--mascot-size:   clamp(80px, calc(var(--wordmark-size) * 0.45), 220px);
```

The hero's wordmark switches to `font-size: var(--wordmark-size)`, which gives the same value as today. The slots are sized from `--mascot-size`. `HeroMascot.tsx` keeps computing the same formula in JavaScript from the wordmark's computed font size; a comment in each place points to the other.

- **Alternative rejected:** making the cat read `--mascot-size` from CSS. A custom property is returned unresolved (`clamp(...)`), so it would need a measuring element. Two short formulas with cross-references are simpler, and the next change can unify them if it needs to.

### 3. Slot sizes

| Slot | Width | Height | At 1440 × 900 | At 360 |
|---|---|---|---|---|
| Normal (About and Contact on mobile, Contact on wide screens, Work's heading on mobile) | 2.3 × size | 2 × size | 462 × 402 | 184 × 160 |
| Beside a Work card, wide screens | 2.3 × size | the card's height, at least 1.2 × size | 462 × card height (268–347) | none |
| About, wide screens | 3 × size | 3.4 × size | 603 × 683 | normal |

The About slot leaves room for a cat at 2.5 times its size (about 500 px) with space to turn. These factors are tokens (`--slot-w`, `--slot-h`, `--slot-card-min-h`, `--slot-close-w`, `--slot-close-h`) so the next change can adjust them by eye.

Beside a card, the slot stretches to the card's height instead of being 2 × size tall. Dennis asked, on looking at the page, that each card be exactly as tall as its text and that the gaps between cards be equal. A fixed slot taller than a card would make that row taller than the card, and the gap below it larger. Making cards as tall as the slot leaves empty space inside the card, which he rejected. Letting the slot overflow the row is not possible either: it would overlap the next card, which sits on the same side. A seated cat, about 1 × size tall, fits in 1.2 × size.

### 4. Layout: one breakpoint at 60rem, CSS Grid, slots as empty elements

- **Breakpoint:** below `60rem` (960 px at default text size) the layout stacks; from there up it alternates. The breakpoint is in `rem`, so a 1280 px window at 200% zoom (640 CSS px) gets the stacked layout, as the spec asks. At 960 px the content column beside a normal slot is still about 530 px wide, and About's text column is about 430 px.
- **Slots:** each slot is an empty `<div aria-hidden="true" data-mascot-slot="…">` with `pointer-events: none` and no background. The names are `about`, `work`, `work-hackathon`, `work-agentic-rag`, `work-jim007` and `contact`. Wide and narrow layouts use different sets, so each slot also carries `data-mascot-layout="wide|narrow|both"` and is `display: none` in the layout that does not use it. The next change looks slots up by these attributes.
- **About:**
  - the content sits in a dark card like the Work cards, with the heading outside it; Dennis asked for this on looking at the page;
  - wide: a two-column grid, with the close-up slot on the right. The heading and the card are wrapped in one element, which is centred vertically against the slot;
  - narrow: the wrapper is `display: contents`, so the heading and the slot share the first row, the slot at the right edge, and the card spans the full width below.
  - On the card, the counter's cue inverts its colours through `--surface` and `--on-surface`, which the card sets.
- **Work:**
  - the heading row holds the `h2` and, on narrow screens only, the `work` slot;
  - each project is a row of slot and card. Rows alternate with `:nth-child` and switch the column order, so the source order and the tab order stay card 1, 2, 3;
  - card rows sit directly under one another, so below each slot is the next card on that side, as the spec requires.
- **Contact:**
  - wide: content left, slot right;
  - narrow: like About.
  - The band above it is the bottom padding of Work plus the top padding of Contact. Together they are at least `var(--mascot-size)` and hold nothing.
- **Reading order:** the alternation uses `grid-column` placement, never `order` or a reversed source, so the DOM order, the reading order and the tab order are always the visual order from top to bottom.
- **Alternative rejected:** absolute positioning, or slots made of pseudo-elements. Pseudo-elements cannot be found by the next change, and absolute positioning takes the slots out of the flow, so the guarantees about the room to walk would no longer follow from the layout.
- **Alternative rejected:** Flexbox with `row-reverse`. It reverses the visual order inside a row, which is the kind of mismatch with the reading order that WCAG 1.3.2 and 2.4.3 warn about. Grid placement avoids it.

### 5. Cards

- Each card is an `<article>` with an `h3`, two paragraphs, an optional stack list and an optional link.
- **Fill:** solid `--color-ink`; text in `--color-paper` (13.7:1).
- **Stack:** a `<ul>` rendered inline with "·" separators drawn in CSS, so a screen reader announces a list with its item count.
- **Link:**
  - the visible text is "View on GitHub", followed by a visually hidden ": Agentic RAG", so the accessible name starts with the visible label (WCAG 2.5.3);
  - underlined, with the accent as underline colour on hover.
- **Opacity and stacking:** cards get `position: relative; z-index: 1`, so a later section layer for the cat at a lower `z-index` passes behind them. This change creates no such layer.
- **Focus on dark surfaces:** the global focus rule becomes `outline: 2px solid var(--focus-color, var(--color-ink))`, and cards set `--focus-color: var(--color-paper)` (13.7:1 against ink). Everywhere else is unchanged.

### 6. Age counter

**Calculation.** A pure function, `ageAt(now, birthDate)`, lives in `src/content/age.ts` and is unit-tested:

- the age is the number of birthdays passed plus `(now − lastBirthday) / (nextBirthday − lastBirthday)`. The whole part therefore changes exactly on the birthday, and leap years need no special case;
- a birthday is midnight in Milan, computed by the EU rule. Central European Time is UTC+1, and summer time ends at 01:00 UTC on the last Sunday of October. So midnight on 31 October is UTC+2 only in years when 31 October is that Sunday (for example 2027), and UTC+1 otherwise. Tests cover both cases, a year boundary and the half-year value.

**Alternative rejected:** a 365.25-day year. It is simpler, but the whole part would change hours away from the real birthday, and Dennis asked for the correct age.

**Display.** A client component renders the number inside a `<button type="button">`:

- the number has eight decimals, `font-variant-numeric: tabular-nums`, and a fixed width in `ch`, so nothing moves while it counts;
- `aria-pressed` is true while paused;
- `aria-label` is "`<whole>` years old, pause counter". It starts with the whole years, so the visible text and the name begin the same way, and the age is read once, in whole years;
- the visible digits and the trailing " years old" are `aria-hidden`;
- on `:hover` and `:focus-visible` a small pause or play glyph appears beside the number, in ink, along with the cursor change;
- resuming always recomputes from `Date.now()`.

**Loop.**
- `requestAnimationFrame` writes the text through a ref only when the formatted string changes, about three times a second, so React does not re-render.
- The loop stops while About is out of view (`IntersectionObserver`), while the tab is hidden (`visibilitychange`, and browsers already pause `requestAnimationFrame` there), and while the counter is paused.

**Reduced motion.** If `prefers-reduced-motion: reduce` matches when the counter mounts, it starts paused, showing the current value.

### 7. Server output, scripting and layout shift

The static HTML must work without scripting and must not shift when scripts arrive. Both client components therefore render two variants at build time:

- **Age:**
  - a button with the age at build time and eight decimals, which hydrates and starts counting;
  - a plain `<span>` with the whole years.
- **Email:** the Copy button.

A global rule hides every element marked `data-nojs`. A `<noscript><style>` block in the layout reverses this for browsers without scripting: it hides `[data-js]` and shows `[data-nojs]`.

- With scripting, the first paint already holds the button, with the same number of digits, so nothing moves on hydration. The digits briefly show the age at build time, a fraction of a year behind, until the first frame.
- Without scripting, there is no dead button and the age is in whole years.
- **Alternative rejected:** rendering the button only after mount. It inserts content after the first paint, which is a layout shift, and the age's width would jump.

### 8. Copy button

- A client component calls `navigator.clipboard.writeText(email)`.
- **Visible label:** "Copy", with the accessible name "Copy email address". It shows "Copied" for three seconds.
- **Status:** a visually hidden `role="status"` element, present from the first render, receives "Email address copied". If copying fails, it receives "Couldn't copy, select the address instead", and a visible line says the same. The `mailto:` link and the address text are never touched.
- The Clipboard API needs a secure context, which a real host (HTTPS) and `localhost` both provide. Any other origin takes the failure path.

### 9. Header Contact button

- `NavigationItem` gains an optional `highlight` flag, set on Contact.
- **Style:**
  - fill `--color-accent`, text `--color-ink`, bold at 1.1875rem (19 px);
  - from 18.66 px bold, text counts as large and needs 3:1. Ink on coral is 4.0:1;
  - small radius, and the same 2.75rem minimum height as the other links;
  - the button's outline against the paper header is 3.4:1, which meets the 3:1 non-text contrast;
  - on hover and focus it gets an ink underline, the same non-colour cue as the other links;
  - the focus ring is the usual ink outline on paper.
- **Fit at 360 px:** home mark 44 + gap 16 + About ~62 + Work ~56 + Contact button ~100 + list gaps 8 ≈ 286 px. The gutters leave 328 px.
- The link stays an `<a href="#contact">`, so nothing about navigation changes.

### 10. Records

`AGENTS.md` is updated in the same work:

- **Page structure:** the open question about a contact prompt under the hero becomes Decided: no prompt; the header's Contact is a highlighted button.
- **The cat › Behaviour.** These become Decided, with Dennis's own reasons:
  - where the cat sits in each section: beside each block, alternating sides, and on mobile in the heading row;
  - the cat may pass behind cards, but never behind plain text;
  - "it never disappears" is refined: it never dissolves, but it may be briefly hidden behind a card it is crossing;
  - in About it comes close to the viewer, larger, as in the reference; elsewhere it keeps its constant size;
  - between sections its position follows the scroll position, and it walks at its own pace to catch up rather than running.

  Provisional:
  - about 2.5 times its size in About;
  - no close-up on mobile;
  - one slot per section on mobile.

  The "constant size" item is reworded to name the About exception.
- **Content:**
  - About, Work and Contact describe what is now written;
  - Work's order is hackathon, Agentic RAG, JIM007, and the hackathon has no stack and no link;
  - the "open content questions" lose the hackathon item, and the internship line records "Milan, remote, or relocating anywhere in Europe" as Provisional;
  - the age is recorded as counting, with a pause on the number;
  - the note that the email address and date of birth are deliberately kept out of the file stays true: they now live in `src/content/`.

## Risks / Trade-offs

- **The date of birth becomes public:** in the repository, and derivable from an age with eight decimals. → Dennis accepted the eight decimals knowing this; the proposal's Impact states it.
- **The email is in plain HTML and will be scraped.** → Gmail's spam filtering. Obfuscating it would break the no-script and screen-reader cases.
- **The age needs a frame loop while visible.** → It writes to the page only about three times a second, and stops off screen, in background tabs and when paused.
- **The age button's visible text is a changing value.** → Its accessible name starts with the same whole number, so a speech user can say "click 21", and "click button" always works.
- **The empty slots read as unexplained whitespace until the cat arrives.** → On desktop it reads as a deliberate asymmetric layout. Dennis judges it in the browser before this is archived, and the slot factors are tokens if he wants them tighter.
- **A tall heading row on mobile (160 px).** → Decided by Dennis (option A). If it looks too sparse in the browser, the height factor can shrink without changing the approach.
- **The JavaScript and CSS formulas for the cat's size could drift.** → The cross-referencing comments, and a task verifies that the slot sizes match the cat's computed size at 1440 and 360.

**Performance.** Two small client components (well under 2 KB together, compressed) join the first load. There are no images and no new fonts. Lighthouse is measured again.

**Accessibility.**
- The DOM order is the visual order.
- Every slot is `aria-hidden` and inert.
- Cards get their own focus colour.
- The live age has a pause (2.2.2), a stable accessible name and no live region.
- The copy result is announced through `role="status"`.
- The accent appears only as a fill behind large bold text, and as decoration.

## Migration Plan

Static build, no data. Rollback is reverting the change's commit.
