# AGENTS.md

Vision and intent for Dennis's personal website. Read this before proposing or building anything.

This file says **what the site is meant to become and why**. It is not the rulebook:

- Hard constraints (stack, accessibility target, performance target, language) live in `openspec/config.yaml`.
- Agreed behaviour lives in `openspec/specs/` and in the changes under `openspec/changes/`.
- If this file disagrees with either, they win, and this file should be corrected.

## How to read the status labels

Very little here is final. Every item carries one of three labels, and they must not be upgraded silently:

- **Decided** — Dennis chose it. Change it only if he says so.
- **Provisional** — a working choice so that work can proceed. Expected to change; keep it cheap to change.
- **Open** — not chosen yet. Do not pick an answer on your own; ask Dennis.

## What the site is for

- **Decided:** a personal portfolio for Dennis that also helps him find an internship. Readers are recruiters and engineers deciding whether to talk to him.
- **Decided:** written in English, in a light, friendly tone. No forced jokes.
- **Decided:** one page, with the first name only: `DENNIS`.
- The page has to convince on its own through contact details, background and projects. The cat is what makes it memorable, not what makes it credible. Anything decorative is layered on top of a page that already works without it.

## Page structure

- **Decided:** header with a capital `D` home mark on the left (returns to the top) and About · Work · Contact on the right.
- **Decided:** a hero that is essentially just the giant `DENNIS` wordmark, as real text.
- **Decided:** sections for About, Work and Contact, then a footer.
- **Open:** Dennis's first idea placed a contact call-to-action directly under the name, before About. The current shell orders the sections About, Work, Contact to match the menu. Whether a contact prompt also appears right under the hero is undecided.

## The cat

The signature element of the site. It comes from a screen recording Dennis saw of a tattoo-studio website; there is no link to that site, only the recording. **Take the mechanism and the mood from it, never its artwork, illustrations or copy.** The cat on this site must be Dennis's own.

### Behaviour

In the reference, the cat is small and seen from above in the hero and footer. In the sections it stays fixed on screen, much larger, and turns as the page scrolls, resting on the edge of things: lying over an edge with paws and tail hanging, sitting beside a card and looking at it, seen from behind with a curled tail, ears peeking over the top of a grid. This was seen, and Dennis deliberately chose a different model: one cat that always walks to a target, at a constant size and viewing angle.

- **Decided:** there is one cat. Two are never visible at once.
- **Decided:** the cat always walks toward a target, at a constant size and seen from a constant angle.
- **Decided:** in the hero and the footer the target is the pointer. The cat stops about one body length away from it and looks at it.
- **Decided:** in the sections between them the target is a spot beside the section (to its side or above it, depending on the layout). There the cat sits and looks at the section's content, and turns its head toward the card or link that is hovered or has keyboard focus. It does not follow the pointer there.
- **Open:** where exactly the cat sits in each section. This needs real content.
- **Decided:** character: calm and curious. The head turns first, and the cat gets up a moment later. Small pointer movements move only the head. It sits soon after arriving. It never ignores the visitor.
- **Decided:** actions: walking at a single gait, turning on the spot, sitting, blinking, a tail flick. No running.
- **Decided:** before the pointer has moved, or when there is none, the cat waits seated.
- **Decided:** on touch devices the cat sits in the hero and the footer, because there is no pointer to follow, but it still walks from section to section as the visitor scrolls.
- **Decided:** on a long jump (a navigation link, a direct link to a section, a reload part-way down) the cat leaves through the nearest edge and comes back in beside its new target. It never visibly teleports.
- **Decided:** scrolling back makes it walk back the way it came.
- **Decided:** it may pass in front of text only over the wordmark in the hero. It never goes over the header navigation.
- **Decided:** it never disappears. In the reference it dissolves into the ink at times; here it does not.
- **Decided:** exactly how the cat interacts with the wordmark is deferred. Do not design it as part of other work. The two items above already constrain it.
- **Provisional (proposed, not confirmed by Dennis):** idle gestures (blink, tail flick) stop a while after the last interaction, so that nothing moves on its own for more than five seconds (WCAG 2.2.2).
- **Provisional (proposed, not confirmed by Dennis):** the cat's interest does not fade: it follows every time.
- **Open:** what a click does.

### Look

- **Decided:** it should look like the cat in the reference: seen in perspective, with the view changing as it turns (from above, in profile, facing the viewer), a ragged fur outline, light eyes and whiskers. Not a flat geometric silhouette.
- **Decided:** it is a very dark, near-black cat.
- **Decided:** it must be cute, with kitten proportions: a large head and large ears, short legs and a thick tail.
- **Decided:** buying a model is ruled out. A model, if one is ever used, must be free. No suitable free one was found.
- **Decided:** the cat is drawn entirely in code: a posable skeleton seen from a fixed oblique angle, drawn as a flat silhouette with fur tufts, eyes and whiskers. No model, image asset or library is involved. Dennis accepted this look on the lab page on 2026-11-12 (change `cat-look-test`), with the proportions, amount of fur and 50 degree viewing angle that are its defaults.
- **Decided:** the eyes are light, each with a vertical pupil in the cat's own colour, and the inside of the ears is light too, shown only where an ear faces the viewer. "Light" is the page background colour. Dennis chose this in the lab on 2026-11-12, over accent or custom-coloured eyes and accent inner ears.
- The fallbacks that were considered, should this look ever have to be replaced: for the shape or the walk, a model generated by an AI service from a text description, never from frames of the reference, with its licence checked first; for the fur, a model built by script in Blender with real fur and pre-rendered into images.

### Ink effect

- In the reference, the wordmark behaves like wet ink: where the cat walks, the colour drags, dilutes toward grey and forms liquid-like veining, and the damage stays.
- **Open:** how strong the effect is here, and whether it persists or heals. Dennis first described it as "slightly distorts the wordmark", then showed the reference where it is destroyed. Build any prototype with these as adjustable parameters so he can choose by looking.
- **Provisional:** a liquid look like the reference most likely needs WebGL, which can be written without a library.

### Known problem to resolve

- **Open:** the wordmark is currently navy and the cat near-black. Those two colours have almost no contrast, so the cat nearly disappears exactly where it matters most. Options discussed: a light outline around the cat (which could read as a fur rim), a cat in the accent colour, or a wordmark in the accent colour. Dennis has not chosen. The cat lab page shows the options side by side so he can choose by looking.

### Rules that hold whatever the cat becomes

- The page is complete and usable before the cat loads and if it never loads.
- The cat is decorative: hidden from assistive technology, never focusable, never blocking clicks or text selection.
- Visitors who ask for reduced motion get a still cat.
- It loads after the page content, so it does not cost the performance target.

## Visual direction

- **Decided:** a single theme. There is no dark mode.
- **Provisional:** colours follow a 60 / 30 / 10 split.

  | Role | Share | Value | Used for |
  |---|---|---|---|
  | Background | 60% | cream `#F4EDE0` | page background |
  | Second colour | 30% | navy `#14213D` | text, the giant wordmark, filled cards |
  | Accent | 10% | dark coral `#E24A38` | small details only |

- **Provisional:** the giant wordmark uses the second colour, so that the accent really stays near 10%.
- The accent does not reach the contrast needed for normal-size text on either other colour (3.4:1 on cream, 4.0:1 on navy). Use it for decoration and large elements, not for body-size text.
- **Provisional:** the wordmark is set in a very heavy, condensed sans-serif in capitals; Anton is the stand-in. The reference adds rough, stamp-like edges on top of the letters; whether to do that here is **Open**.
- Mood taken from the reference, all **Provisional**: ink on paper, oversized type that runs off the edges of the screen behind the content, solid dark cards sitting on the light background.
- Dennis is still exploring colours. Treat every value above as a token to swap, never as a constant.

## Content

An outline of what each section is meant to hold. Wording is not written yet, and none of this is built.

**Contact — Decided**
- LinkedIn (`linkedin.com/in/dennis-ismajli`), GitHub (`github.com/denkerito`) and email. No phone number.
- The tone of the invitation is casual, along the lines of offering a coffee.

**About — Provisional**
- His age shown as a live number with decimals that keeps counting.
- Based in Milan, "or maybe somewhere else around Europe".
- An approximate distance between the visitor and Milan, derived from the visitor's IP. Nothing is stored, and it falls back to a plain "Based in Milan" when it cannot be worked out.
- BSc in Computer Science at the University of Milano-Bicocca, third year.
- Languages: English, Italian, Albanian.
- Outside work: lifting and running.
- A clearly visible line that he is open to internships.

**Work — Provisional**
- **Agentic RAG** (`github.com/denkerito/agentic-rag`): built as a cold application instead of sending a CV. It got a polite rejection, and he kept developing it anyway. The rejection is part of the story, not something to hide. Do not name the company.
- **JIM007** (`github.com/denkerito/Jim-007`): a workout tracker. Gym apps force rigid forms mid-workout; here he logs a session by writing it in plain language.
- **Hackathon win, May 2026:** his team won a hackathon on accessibility in banking with a solution built on a RAG architecture. Told as a short story. **Never name the bank.**
- Each project follows the same shape: what it is, why he built it, link.

**Open content questions**
- When he is available for an internship, and where (Milan, remote, abroad).
- For the hackathon: who had the problem, and what they can do now.

Dennis's email address and date of birth are needed for the Contact and About sections but are deliberately not written in this file. Ask him when a change needs them.

## Technical direction

`openspec/config.yaml` is the source for constraints. In addition:

- **Decided:** Next.js, and CSS Modules for styling.
- **Provisional:** the site is exported as fully static files. This rules out server-side code at request time, which the visitor-distance feature will have to work around or revisit.
- **Open:** hosting and domain. Do not rely on any provider's features.
- **Provisional:** lab pages exist for tuning prototypes by eye. They are available only in development and are never published.

## Intended order of work

**Provisional.** The cat comes early on purpose: it is the only uncertain part, and it sets the style for everything else.

1. Site shell: the empty, correct page.
2. Cat look test: a cat drawn in code, judged against the reference on a lab page.
3. Cat following the pointer in the hero.
4. Ink effect on the wordmark.
5. Real content for About, Work and Contact.
6. Cat walking between sections and sitting beside them.
7. Cat in the footer, then polish.

For what is actually planned or done, look at `openspec/changes/` and `openspec/specs/`, not at this list.

## Working with Dennis

- He writes in Italian. Reply in Italian; write code, site copy and OpenSpec documents in English.
- Work goes through OpenSpec changes. Explore first when something is unclear, propose before building.
- When an item here changes status, update this file in the same piece of work.
