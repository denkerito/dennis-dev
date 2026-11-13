# Design

## Context

See `proposal.md` for motivation and scope, and the four spec deltas for the behaviour this design must satisfy.

State of the code after `cat-look-test`:

- `src/mascot/` draws the cat with Canvas 2D from a posable skeleton. It is framework-free. `drawCat(ctx, params, view, paint)` takes a pose (`standing`, `walking`, `seated`), a heading, a head turn and a walk phase. Standing and seated rigs can already be blended (`blendRigs`), but nothing uses that yet.
- The only place the cat is drawn is the lab page `/lab/cat`, which exists in development only.
- The home page has no hand-written client JavaScript. `Hero.tsx` is a Server Component with an empty, `aria-hidden`, `pointer-events: none` mount point positioned over the hero, after the `<h1>`.
- There is no test runner.
- The walk accepted in the lab is slow. One cycle lasts 1.1 seconds and covers 0.48 body units, which at the hero's cat size is about 45 pixels a second.

Decisions by Dennis that this design treats as fixed:

- Everything under "Behaviour" in `AGENTS.md` that is labelled Decided.
- The look: near-black cat, light eyes with pupils, light inner ears, kitten proportions.
- Asked how the cat should be told apart from the navy wordmark, he answered: change the page's colours; the cat must not get a light rim or colours other than those already decided.

Everything else below is a design-level call made here and is open to correction.

## Goals / Non-Goals

**Goals:**

- The behaviour is logic that can be tested without a browser, separate from the code that touches the page.
- The home page's first load stays what it is: the cat's code is fetched afterwards and can fail without consequence.
- The same follower can later drive the cat in the footer, and its target can later be something other than the pointer (a spot beside a section), without rewriting it.

**Non-Goals:**

- Moving between sections, the footer, click reactions, the ink effect.
- A general animation system. The cat has six states and they are written out.

## Decisions

### 1. Colours: a wordmark colour and a mascot colour

Two tokens are added to `globals.css`; the three existing ones are unchanged.

| Token | Provisional value | Role |
|---|---|---|
| `--color-wordmark` | `#3F6FD0` | the giant wordmark only |
| `--color-mascot` | `#0B0B10` | the cat's silhouette and its pupils |

Measured contrast:

| Pair | Ratio | Needed |
|---|---|---|
| mascot on wordmark | 4.11:1 | 3:1 (to stay visible) |
| mascot on paper | 16.86:1 | 3:1 |
| wordmark on paper | 4.10:1 | 3:1 (large text) |
| mascot on ink, for comparison | 1.23:1 | the problem being solved |

- **Why this blue:** it has the same hue as the navy (about 220 degrees), so it reads as a lighter tint of the second colour rather than as a new colour, and it keeps the ink-on-paper mood as blue ink. It sits almost exactly midway in contrast between the cat and the paper, so neither pairing is marginal. The accent stays at its small share.
- **Alternative rejected:** the wordmark in the accent colour. It gives the cat more contrast (4.93:1) and needs no new token, but it makes the accent the largest coloured area on the page, against the 60/30/10 split, and a giant red wordmark under a black cat is very close to the reference.
- **Alternative rejected:** changing the second colour itself to a lighter blue. Text and filled cards would lose contrast (about 5:1 instead of 13.72:1), and the accent on a mid-blue card falls to about 1.5:1.
- **Alternative rejected, by Dennis:** a light rim around the cat, or a cat in another colour.
- The wordmark uses `--color-wordmark`. The header's `D` home mark stays in the second colour: it is a link, and the wordmark colour does not reach 4.5:1 on paper. The site icon is unchanged.
- The cat's eyes, whiskers and inner ears use `--color-paper`. The constant `MASCOT_TONE` in `params.ts` is removed: callers read `--color-mascot` from the theme, so no colour is written outside `globals.css`.
- The exact blue is a token and is expected to be tuned by eye.

### 2. A pure behaviour module and a thin controller

```
src/mascot/
  behaviour.ts     pure: (state, input, dt) -> state. No DOM, no timers, no randomness of its own.
  follower.ts      the controller: canvas, pointer, animation loop, visibility, reduced motion
src/components/Mascot/
  HeroMascot.tsx   client component: waits for idle, imports follower.ts, mounts it in the hero
```

- `behaviour.ts` holds the whole state machine. Its input is the target position (or none), the bounds, and the elapsed time; a random source is passed in, so tests are deterministic. This is where the spec's distances and delays live, as named constants.
- `follower.ts` turns browser events into that input and the resulting state into a drawing. It knows nothing about the hero specifically: it is given an element to stay inside and a function that says where the target is. The footer and the sections can reuse it.
- **Alternative rejected:** one module doing both. The behaviour would then be testable only by driving a browser.

### 3. States

```
            pointer moves, far                  facing it
 SEATED ---------------------> RISING --> TURNING ---------> WALKING
   ^   (head follows; after a             (on the spot)        |
   |    short delay it gets up)                                | within one
   |                                                           | body length
   +---------------- SITTING <----------- STANDING <-----------+
        (blend to seated)     (short pause)
```

- **Seated:** the head turns toward the target at a limited rate, up to a quarter turn either way. If the target is more than two body lengths away for longer than the get-up delay (0.25 s), go to Rising. If it is nearer but outside the head's range, go to Rising as well, turn, and sit again.
- **Rising / Sitting:** a blend between the seated and standing rigs, 0.25 s to rise and 0.4 s to sit, so the cat is on its feet half a second after the pointer moved.
- **Turning:** the heading turns toward the target at about 200 degrees a second while the legs step in place. Entered when the heading is more than about 25 degrees off.
- **Walking:** forward at the walking speed; the heading steers at a limited rate toward the nearest point to the target that the cat can reach, which gives curved paths when the target moves, including a U-turn when it moves behind the cat. Ends within the stop distance, about one body length from the target. The body always moves exactly as far as the legs step: while it slows to a halt it keeps travelling as the stride shortens, and at the edge of its area it stops instead of walking on the spot.
- **Standing:** a pause of about 0.5 s before sitting, so a pointer that moves on immediately does not make the cat sit and get up again.
- When the target disappears (pointer left the area) the cat goes to Standing from wherever it is, then sits.
- Under reduced motion, and where there is no hovering pointer, the machine is never stepped: the cat is drawn once, seated.

### 4. Movement happens on the ground, not on the screen

The camera looks down at an angle, so a step away from the viewer covers less screen than a step sideways. The behaviour works in ground coordinates: the pointer's vertical offset is divided by the sine of the viewing angle before it becomes a target, and the cat's ground position is projected back for drawing. The cat's ground speed equals the distance its gait covers per cycle divided by the cycle time, so its paws do not slide in any direction.

### 5. A brisker gait

The walk is retuned to about one body length a second: a stance sweep of roughly 0.57 body units and a cycle of roughly 0.42 seconds, about 225 pixels a second at the desktop size, which crosses a 1440-pixel hero in about five seconds. Leg segment lengths and the height of the body while walking are adjusted so the paws reach both ends of the longer stride.

- The rig gains a continuous `stride` amount (0 while stepping in place for a turn, 1 at full walk) and a continuous `sit` amount, replacing the three fixed poses inside `src/mascot/`. The lab keeps its three pose buttons and maps them onto these.
- Because this changes a walk Dennis accepted, he looks at it again in the lab before the change is finished.
- **Alternative rejected:** keeping the accepted gait and moving the cat faster than its legs. The paws would slide, which the appearance spec forbids.
- **Alternative rejected:** a second, faster gait for long distances. Dennis decided on a single gait.

### 6. Blink and tail flick

`CatView` gains an eye-openness value and a tail-flick value. A blink closes the eyes for about 0.15 s; a flick sweeps the tip of the tail once. The behaviour schedules them at random intervals during the five seconds after the cat last moved, then stops. Nothing is scheduled after that until the target moves again.

This implements the idle-gesture rule that is still Provisional in `AGENTS.md`. It is what makes a pause control unnecessary: movement is either a response to the visitor's pointer or lasts less than five seconds (WCAG 2.2.2).

### 7. A small canvas that moves

The cat is drawn on a canvas a little larger than the cat itself, positioned over the hero with a CSS transform.

- **Why:** a canvas covering the whole hero at a device pixel ratio of 2 on a large screen is tens of megabytes to allocate and clear every frame. A cat-sized canvas is about a megabyte, and moving it is compositor work.
- The canvas is redrawn only when the pose changes. While the cat is at rest the animation loop is stopped, not idling; a pointer event restarts it.
- The loop also stops while the hero is out of view (`IntersectionObserver`) or the tab is hidden.
- The cat's size is the wordmark's computed font size times 0.45, between 80 and 220 CSS pixels, recomputed on resize. (First set to 0.36 and 200; raised after seeing the seated cat next to the letters, where it looked lost.)

### 8. Bounds and the waiting spot

- The cat's ground point is kept inside the hero by margins equal to how far its drawing extends in each direction, so the whole cat is always inside. The top limit is the bottom edge of the sticky header, so the cat never appears over the navigation and is not left half hidden under it.
- The waiting spot is at 78% of the hero's width and 72% of its height, in front of the end of the wordmark. This is a working choice, a pair of constants.
- On resize the position is clamped into the new bounds.

### 9. Pointer input

- One passive `pointermove` listener on the window. Only events whose `pointerType` is `mouse` or `pen` count, which handles touch screens, hybrids and pens without guessing the device from media queries.
- The pointer's position relative to the hero is recomputed on scroll as well, because scrolling moves the hero under a pointer that has not moved.
- A pointer outside the hero's visible bounds is "no target".
- No click, key or touch handler is added.

### 10. Loading

`HeroMascot` is a small client component rendered inside the existing mount point. After the window's `load` event, and then when the browser is idle (`requestIdleCallback`, with a timeout fallback), it imports `follower.ts` with a dynamic `import()`, which the bundler emits as a separate chunk. Any failure is caught and ignored.

- The mount point keeps `aria-hidden` and `pointer-events: none`. The canvas is absolutely positioned inside it, so nothing shifts when it appears. It fades in over about 0.3 s, or appears at once under reduced motion.
- **Why not `next/dynamic`:** the component is already a client component and needs no server rendering; a plain dynamic import after idle gives explicit control of when the request is made.
- **Alternative rejected:** importing the cat in the page bundle. It would add the cat's code to the first load for a decorative element.

### 11. The lab

The lab loses the "Contrast treatment" group and the `rim` option in `CatPaint`; its wordmark sample uses `--color-wordmark` and its cat `--color-mascot`. Copied values no longer contain a treatment. Its walk shows the retuned gait, and it gains nothing else.

### 12. Tests and the new development dependency

Vitest is added as a development dependency, with a `test` script.

- **Why now:** the behaviour is logic with exact thresholds, and the gait has an invariant (a planted paw does not move). Both are cheap to assert and easy to break by tuning. `cat-look-test` deferred a test runner to the change that builds behaviour.
- **What is tested:** the state machine (waits seated; head only for near targets; gets up after the delay; stops at the stop distance; sits after the pause; stays in bounds; never steps under reduced motion; no gesture later than five seconds after the last movement) and the gait (a paw in stance is fixed on the ground at every phase; ground speed matches the cycle).
- **Alternative rejected:** Node's built-in test runner. Running TypeScript with it needs either a newer Node than the project requires or an experimental flag, and it requires file extensions in imports, which the project's bundler-style imports do not have.
- **Alternative rejected:** browser-driven end-to-end tests. A much larger dependency for behaviour that a pure function already exposes.
- To confirm during implementation: the current Vitest release supports the installed Node and TypeScript versions, and the `@/` path alias resolves in tests.

### 13. `AGENTS.md`

Updated in the same change:

- **Known problem to resolve:** from Open to Decided. The cat keeps its colours and gets no rim; the wordmark changes colour.
- **Visual direction:** the colour table gains the wordmark colour and the mascot colour, both Provisional values; the line saying the wordmark uses the second colour is replaced.
- **Behaviour:** add as Provisional the working choices made here: the waiting spot, that the cat sits when the pointer leaves the hero, and the walking pace.
- **Intended order of work:** nothing to change; step 3 is this change.

### Impact on performance

- The first load of the home page is unchanged apart from a small loader component. The cat's chunk is requested after `load`, when the browser is idle. Its size is measured during implementation; the target is under 15 KB compressed.
- No layout shift: the canvas is absolutely positioned in a region that already exists.
- The largest contentful element is still the wordmark, which does not depend on the cat.
- While the cat is at rest, out of view or in a background tab, no animation frame is requested.
- Lighthouse is run on the production build with the cat present; all four scores must stay at or above 90.

### Impact on accessibility

- The cat is decorative: `aria-hidden`, not focusable, no pointer events. The heading outline, landmarks and tab order are unchanged.
- The wordmark keeps 4.10:1 on the background, above the 3:1 it needs as large text. All other text is unchanged at 13.72:1.
- Movement is a response to the visitor's own pointer, or lasts under five seconds. Under reduced motion there is none.
- The cat cannot be reached or operated, so it introduces nothing to operate by keyboard.

## Risks / Trade-offs

- [The blue wordmark changes the look of the first screen more than Dennis expects] → It is one token. The lab shows the cat on it, and the alternatives are recorded above.
- [The brisker walk looks worse than the one accepted] → Dennis re-checks it in the lab before the change is finished; pace and stride are constants.
- [The cat feels slow or nervous] → Delays, distances and turn rates are named constants in one module, covered by tests that state the spec's limits rather than exact values.
- [Hydrating a client component on a page that had none] → The component renders nothing and does its work in an effect. The framework's runtime is already on the page.
- [`requestIdleCallback` is missing in some browsers] → Timeout fallback.
- [A pointer that never moves after load] → The cat waits seated, which is the decided behaviour.
- [The cat's canvas hides part of the wordmark from selection] → It takes no pointer events; a scenario checks selection through it.
- [Scope creeps toward the sections] → The follower takes its area and its target as inputs, but only the hero is wired up.

## Migration Plan

Nothing to migrate. Rollback is reverting the commits of this change: the home page goes back to having no cat and a navy wordmark.

## Open Questions

- The exact wordmark blue, the waiting spot, and the walking pace. All three are constants or tokens, tuned by eye once the cat is in place.
