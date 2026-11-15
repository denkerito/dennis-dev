# Tasks

## 1. Baseline and tokens

- [x] 1.1 Before changing anything, run `npm run build` and Lighthouse on the production output, and save the four scores and the home page's total script size outside the repository; verify the saved baseline holds all five numbers
- [x] 1.2 Add `--wordmark-size` and `--mascot-size` to `globals.css` as in design decision 2, point the hero wordmark at `--wordmark-size`, and add the cross-referencing comments in `globals.css` and `HeroMascot.tsx`; verify by screenshot at 1440 × 900 and 360 × 740 that the hero looks the same as before, and in the browser that the computed `--mascot-size` matches the size the cat is drawn at, at both widths
- [x] 1.3 Add the slot tokens of design decision 3 and the `--focus-color` fallback to the global focus rule; verify the header's focus ring is unchanged by screenshot

## 2. Content

- [x] 2.1 Create `src/content/sections.ts` with the typed About, Work and Contact content and the agreed copy from design decision 1, making `stack` and `link` optional; verify `npm run typecheck` passes and a search of `src/` finds no bank name and no company name for Agentic RAG
- [x] 2.2 Implement `ageAt(now, birthDate)` in `src/content/age.ts` as in design decision 6, with unit tests for one second after midnight on a birthday in a UTC+1 year and in a UTC+2 year (31 October 2027), one second before a birthday, the half-year value, and a leap year in between; verify `npm test` passes

## 3. Layout and slots

- [x] 3.1 Replace the placeholder `Section` behaviour (remove `min-height: 70svh`) and render About, Work and Contact explicitly from `page.tsx`, keeping the `id`s and `h2`s; verify the heading outline and the `#about`, `#work`, `#contact` anchors still work, with the header not covering the headings
- [x] 3.2 Add the slot element with its `data-mascot-slot` and `data-mascot-layout` attributes, `aria-hidden`, no pointer input and no background; verify in the accessibility tree that no slot appears, and with the keyboard that no slot takes focus
- [x] 3.3 Build the wide layout with CSS Grid from `60rem` up: About as two columns with the close-up slot on the right, card rows alternating slot and card by grid placement, and Contact with its slot on the right; verify at 1440 × 900 that the slot sides are right, left, right, left, right, that Contact's slot measures at least 460 × 400, each card slot is 460 wide and exactly its card's height, About's at least 600 × 680, and the gaps between cards are equal, and that the DOM order equals the visual order
- [x] 3.4 Guarantee the room to walk: card rows directly under one another, no text in the column above About's slot, and an empty band above Contact of at least `var(--mascot-size)`; verify each check of the "Room to walk between slots" scenarios by measuring element rectangles in the browser at 1440 × 900
- [x] 3.5 Build the narrow layout below `60rem`: one slot per section in the heading row against the right gutter, no card slots, no close-up; verify at 360 × 740 that each section slot measures at least 184 × 160 and touches the gutter, and that no horizontal scrollbar appears, and at 1280 px with 200% zoom that the stacked layout is used

## 4. About

- [x] 4.1 Render the greeting, the six-item list and the internship line from the content, with the internship line set larger or bolder; verify by screenshot at 1440 and 360, that a screen reader announces a list of six items, and that after activating "About" at 1440 × 900 the internship line is visible
- [x] 4.2 Build the age counter client component of design decision 6: button with `aria-pressed` and an `aria-label` starting with the whole years, tabular fixed-width digits, a pause or play cue on hover and focus, and resuming from the current time; verify in the browser that the last digits change several times in two seconds without moving the surrounding text, that click, Enter and Space toggle it, and that the accessibility tree shows the name and pressed state
- [x] 4.3 Stop the counter's loop while About is out of view, while the tab is hidden and while it is paused, and start it paused under reduced motion; verify by counting animation frames that none is requested while scrolled to Contact or paused, and with reduced motion emulated that the counter shows eight decimals and stays still until activated
- [x] 4.4 Add the build-time variants and the `<noscript>` style of design decision 7; verify with JavaScript disabled that the age reads as whole years in plain text with no button, and with JavaScript enabled that the page's layout shift stays at 0 while the counter hydrates

## 5. Work

- [x] 5.1 Build the project card as an `<article>` with an `h3`, two paragraphs, an optional inline stack list and an optional link, filled with ink and texted in paper, opaque, with `position: relative; z-index: 1` and `--focus-color` set to paper; verify the three cards render in the order hackathon, Agentic RAG, JIM007, that the hackathon card has no stack and no link, and that text on the card measures at least 4.5:1
- [x] 5.2 Give the links the visible text "View on GitHub", a hidden ": <project>" suffix and an underline; verify in the accessibility tree that their names read "View on GitHub: Agentic RAG" and "View on GitHub: JIM007", that each opens its repository in the same tab, and that the focus ring on a card is visible at 2 px with at least 3:1 against ink
- [x] 5.3 Verify at 360 × 740 that the cards stack full width with all text visible and no horizontal scrollbar, and that tabbing through Work stops only on the two links, in card order

## 6. Contact

- [x] 6.1 Render "Let's grab a coffee." larger than body text, then the `mailto:` link showing the full address, LinkedIn and GitHub; verify each link's target, that each is underlined, and that at 360 px everything fits with targets of at least 24 × 24
- [x] 6.2 Build the copy button client component of design decision 8 with its `role="status"` region and failure message, rendered as a `data-js` variant; verify that clicking, Enter and Space put the address on the clipboard and show "Copied", that a screen reader announces it without moving focus, that denying the clipboard permission shows the failure message, and that with JavaScript disabled no button appears

## 7. Header

- [x] 7.1 Add the `highlight` flag to `NavigationItem`, set it on Contact, and style that link as in design decision 9; verify by screenshot at 1440 and 360 that Contact is a coral button with bold ink text and the other links are unchanged, by calculation that ink on coral is at least 3:1 at 19 px bold and the coral against paper at least 3:1, and that at 360 the header fits without wrapping and every target is at least 24 × 24

## 8. Records

- [x] 8.1 Update `AGENTS.md` as listed in design decision 10; verify each listed item has the stated label, that "Open: where exactly the cat sits" and the hackathon's open content question are gone, and that the file still holds no email address or date of birth
- [x] 8.2 Ask Dennis to look at the page in the browser at 1440 and 360, with the empty slots, and say whether the layout and copy are accepted; verify his answer is quoted in the final summary, and adjust slot factors or copy if he asks
  - Dennis, 2026-11-15: "Accetto". Changes he asked for on the way, all applied: Work cards exactly as tall as their text with equal gaps (card slots now follow the card height), less space between sections (3rem padding, a single band before Contact), and About in a dark card centred beside its slot. Graphics and colours are to be revisited later.

## 9. Verification

- [x] 9.1 Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`; verify all four pass with no warnings introduced by this change
- [x] 9.2 Serve the static build output and check it at 1440 × 900, 1024 × 768, 360 × 740, and 1280 with 200% zoom; verify there is no horizontal scrollbar at any of them, that the keyboard order is the visual order, and that with JavaScript disabled the whole page reads and its links work
- [x] 9.3 Run Lighthouse on the production output and compare with the baseline from 1.1; verify every category is at least 90 and the script size grew by no more than the two small components
