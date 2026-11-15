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
- **Decided (2026-11-13):** there is no contact prompt under the hero. Instead the header's Contact link is a highlighted button, filled with the accent colour, to invite the click.
- **Decided:** on wide screens the sections are a sequence of blocks (About, each Work card, Contact), each with its content on one side and room for the cat on the other, alternating sides down the page, starting with the cat on the right of About. On narrow screens the blocks stack and each section keeps room for the cat in its heading row, on the right.

## The cat

The signature element of the site. It comes from a screen recording Dennis saw of a tattoo-studio website; there is no link to that site, only the recording. The recording is in the `reference/` folder at the root of the repository; that folder is git-ignored, so it exists only on Dennis's machine. **Take the mechanism and the mood from it, never its artwork, illustrations or copy.** The cat on this site must be Dennis's own.

### Behaviour

In the reference, the cat is small and seen from above in the hero and footer. In the sections it stays fixed on screen, much larger, and turns as the page scrolls, resting on the edge of things: lying over an edge with paws and tail hanging, sitting beside a card and looking at it, seen from behind with a curled tail, ears peeking over the top of a grid. This was seen, and Dennis deliberately chose a different model: one cat that always walks to a target, at a constant size and viewing angle.

- **Decided:** there is one cat. Two are never visible at once.
- **Decided:** the cat always walks toward a target, at a constant size and seen from a constant angle, with one exception: in About it comes close to the viewer and is much larger, as in the reference. Elsewhere it keeps its size, walks, sits and stays seated.
- **Provisional:** in About it is about 2.5 times its normal size. There is no close-up on mobile.
- **Decided:** in the hero and the footer the target is the pointer. The cat stops about one body length away from it and looks at it.
- **Decided:** in the sections between them the target is a spot beside the section (to its side or above it, depending on the layout). There the cat sits and looks at the section's content, and turns its head toward the card or link that is hovered or has keyboard focus. It does not follow the pointer there.
- **Decided:** where the cat sits in the sections: beside each block on wide screens (About, each Work card, Contact), alternating right and left; on mobile, in the heading row of each section. The page reserves this room as empty, decorative slots (`[data-mascot-slot]`, change `sections-layout-and-content`).
- **Provisional:** on mobile there is one slot per section, none per card.
- **Decided:** between sections, the cat's position follows the scroll position. The scroll sets where it should be, and it walks there at its own pace, catching up rather than running. It does not move in exact step with a fast scroll.
- **Decided:** it may pass behind a card, which hides it completely, but never behind plain text. The layout guarantees that between two slots there is always a way behind a card or across empty background.
- **Decided:** character: calm and curious. The head turns first, and the cat gets up a moment later. Small pointer movements move only the head. It sits soon after arriving. It never ignores the visitor.
- **Decided:** actions: walking at a single gait, turning on the spot, sitting, blinking, a tail flick. No running.
- **Decided:** before the pointer has moved, or when there is none, the cat waits seated.
- **Decided:** on touch devices the cat sits in the hero and the footer, because there is no pointer to follow, but it still walks from section to section as the visitor scrolls.
- **Decided:** on a long jump (a navigation link, a direct link to a section, a reload part-way down) the cat leaves through the nearest edge and comes back in beside its new target. It never visibly teleports.
- **Decided:** scrolling back makes it walk back the way it came.
- **Decided:** it may pass in front of text only over the wordmark in the hero. It never goes over the header navigation.
- **Decided:** it never dissolves. In the reference it dissolves into the ink at times; here it does not. It may be briefly hidden behind a card it is crossing.
- **Decided:** exactly how the cat interacts with the wordmark is deferred. Do not design it as part of other work. The two items above already constrain it.
- **Provisional (proposed, not confirmed by Dennis):** idle gestures (blink, tail flick) stop a while after the last interaction, so that nothing moves on its own for more than five seconds (WCAG 2.2.2).
- **Provisional (proposed, not confirmed by Dennis):** the cat's interest does not fade: it follows every time.
- **Provisional:** in the hero the cat waits in front of the end of the wordmark, at about 78% of the hero's width and 72% of its height.
- **Provisional:** when the pointer leaves the hero the cat stops where it is and sits down. It does not go back to its waiting spot.
- **Provisional:** it walks at about one of its own body lengths a second, which crosses the hero in about five seconds. It is on its feet half a second after the pointer moves away, and sits again within a second of arriving. Dennis looked at this walk in the lab and accepted it on 2026-11-13.
- **Provisional:** its size follows the wordmark: 0.45 of the wordmark's font size, between 80 and 220 CSS pixels.
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

### How the cat stays visible on the wordmark

- **Decided:** a near-black cat almost disappeared on the navy wordmark (1.2:1). Asked how to tell them apart, Dennis answered: change the page's colours; the cat must not get a light rim or colours other than those already decided. So the cat keeps its colours and the wordmark gets a colour of its own, an ink blue that is a lighter tint of the navy, on which the cat stands out at 4.1:1. A light rim, a cat in the accent colour and a wordmark in the accent colour were considered and rejected.

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
  | Second colour | 30% | navy `#14213D` | text, filled cards |
  | Wordmark colour | part of the 30% | ink blue `#3F6FD0` | the giant wordmark only |
  | Accent | 10% | dark coral `#E24A38` | small details only |
  | Mascot colour | the cat | near-black `#0B0B10` | the cat's silhouette and pupils only |

- **Provisional:** the giant wordmark uses the wordmark colour, a lighter tint of the second colour with the same hue, so that the accent really stays near 10%. The header's `D` home mark stays in the second colour: it is a link, and the wordmark colour does not reach the contrast normal-size text needs (4.1:1 on cream).
- The cat's eyes, whiskers and inner ears use the background colour.
- The accent does not reach the contrast needed for normal-size text on either other colour (3.4:1 on cream, 4.0:1 on navy). Use it for decoration and large elements, not for body-size text.
- **Provisional:** the wordmark is set in a very heavy, condensed sans-serif in capitals; Anton is the stand-in. The reference adds rough, stamp-like edges on top of the letters; whether to do that here is **Open**.
- Mood taken from the reference, all **Provisional**: ink on paper, oversized type that runs off the edges of the screen behind the content, solid dark cards sitting on the light background.
- Dennis is still exploring colours. Treat every value above as a token to swap, never as a constant.

## Content

What each section holds. The wording is written and lives in `src/content/sections.ts` (change `sections-layout-and-content`); edit it there.

**Contact — Decided**
- LinkedIn (`linkedin.com/in/dennis-ismajli`), GitHub (`github.com/denkerito`) and email. No phone number.
- The tone of the invitation is casual, along the lines of offering a coffee: "Let's grab a coffee.", then the links.
- The email address is shown in full as a `mailto:` link, with a button that copies it.

**About — Provisional**
- A greeting, "Hi, I'm Dennis.", then a bulleted list: age, degree, where he is based, interests, languages, what he does off the keyboard.
- **Decided:** his age is a live number with eight decimals that keeps counting and is always correct; it ticks over at midnight, Milan time, on his birthday. Clicking the number pauses and resumes it (WCAG 2.2.2). It starts paused for visitors who ask for reduced motion.
- Based in Milan, "or maybe somewhere else around Europe".
- An approximate distance between the visitor and Milan, derived from the visitor's IP. Nothing is stored, and it falls back to a plain "Based in Milan" when it cannot be worked out. Not built yet.
- BSc in Computer Science at the University of Milano-Bicocca, third year.
- Interests: AI, LLMs and machine learning, maths and software engineering.
- Languages: English, Italian, Albanian.
- Off the keyboard: lifting and running.
- A clearly visible line that he is open to internships: "in Milan, remote, or relocating anywhere in Europe".

**Work — Decided order:** the hackathon, then Agentic RAG, then JIM007.
- **Hackathon win, May 2026:** his team won a hackathon on digital accessibility in banking. The problem was the bank's employees losing time to bureaucracy and jargon-heavy documents; the answer was a chatbot on a RAG architecture they can ask. They won because they understood the problem, and what accessibility means, before thinking about a solution. It was a prototype; the copy does not say "built". No stack and no link. **Never name the bank.**
- **Agentic RAG** (`github.com/denkerito/agentic-rag`): an AI agent that investigates a company's finances. He built it to show up with something that works instead of a plain "hire me" cold message on LinkedIn. It got a polite rejection, and he kept building it anyway. The rejection is part of the story, not something to hide; keep the tone plain, not self-promotional. Do not name the company.
- **JIM007** (`github.com/denkerito/Jim-007`): a workout tracker. Gym apps force rigid forms mid-workout; here he logs a session by writing it in a chat.
- Each card follows the same shape: what it is, why it exists, and, when there is one, its stack and a link.

**Open content questions**
- When he is available for an internship. The "internships" line is Provisional.

Dennis's email address and date of birth are deliberately not written in this file. They are in `src/content/sections.ts`, which is public.

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
