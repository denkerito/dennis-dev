# Proposal

## Why

The cat exists only on a lab page. Its look is accepted and its behaviour is decided, so the next step in the intended order of work is to put it where visitors see it first: in the hero, following the pointer. Doing so forces the one question that was still open, how a near-black cat stays visible on the wordmark, and Dennis has now answered it: the cat keeps its decided colours and gets no rim, and the page's colours change instead.

## What Changes

- The cat appears in the hero of the home page. It waits seated, turns its head toward the pointer, gets up a moment later, turns on the spot, walks to about one body length from the pointer, and sits again. Small pointer movements move only its head.
- It stays inside the hero, always fully visible and never over the header navigation. When the pointer leaves the hero it stops and sits.
- It blinks and flicks its tail for a few seconds after it last moved, then is completely still.
- Where there is no pointer to follow (touch devices, or before the pointer has moved) it sits still. For visitors who ask for reduced motion it is a still, seated cat.
- It is decorative and arrives after the page: the page is complete without it, nothing shifts when it appears, and the wordmark under it can still be selected.
- **Colours:** the wordmark gets its own colour, an ink blue that is a lighter tint of the navy (`#3F6FD0`, provisional), so the cat stands out on it at 4.1:1 instead of 1.2:1. The cat's dark tone becomes a theme token of its own. Text, cards and the accent keep their colours.
- The walk becomes brisker. The gait accepted in the lab covers about 45 pixels a second, which would take over 20 seconds to cross the hero; it is retuned to about one body length a second, roughly five times the current pace, and has to be looked at again in the lab.
- The lab drops the contrast treatments Dennis rejected (light rim, cat in accent, wordmark in accent) and shows its wordmark sample in the new wordmark colour.
- A test runner is added for the behaviour and the gait, which are logic rather than look.
- `AGENTS.md` records the contrast decision, the new colour roles and the working choices listed in `design.md`.

## Capabilities

### New Capabilities

- `mascot-behaviour`: what the cat does: where it waits, how it looks at and follows a target, how it stays within its area, its idle gestures, and how it behaves without a pointer, under reduced motion, and while loading. This change covers the hero; later changes extend it to the sections and the footer.

### Modified Capabilities

- `visual-theme`: the colour roles go from three to five (a wordmark colour and a mascot colour are added), and the mascot must stand out against the background and the wordmark.
- `site-shell`: the reserved mascot mount point is no longer empty; it stays decorative and has no visible effect until the mascot has loaded.
- `prototype-lab`: the cat lab's backdrops requirement loses the contrast treatments and follows the wordmark colour.

## Out of scope

- The cat walking between sections, sitting beside content, or looking at cards and links.
- The cat in the footer.
- What a click does, which stays open.
- The ink effect, and any other interaction between the cat and the wordmark beyond walking in front of it.
- Changing the background, text or accent colours, or the display typeface.
- A control for visitors to pause or hide the cat. The idle-gesture rule is what keeps automatic movement short.
- Sound.

## Impact

- **Pages affected:** the home page (`/`): the hero gains the cat and the wordmark changes colour. The lab page (`/lab/cat`, development only) loses three options and follows the new colours.
- **Capabilities affected:** new `mascot-behaviour`; modified `visual-theme`, `site-shell`, `prototype-lab`.
- **Code:** a behaviour module and a hero controller under `src/mascot/`, a small client component that loads them after the page, the hero and its styles, the theme tokens in `globals.css`, the gait, and the lab. The home page ships hand-written client JavaScript for the first time, loaded lazily.
- **Dependencies:** no runtime dependency. One development dependency, a test runner (see `design.md`).
- **Performance:** the home page's first load is unchanged; the cat's code is a separate chunk requested when the browser is idle. Lighthouse is measured again with the cat present.
- **Documents:** `AGENTS.md`.
