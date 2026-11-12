# Design

## Context

See `proposal.md` for motivation and scope, and the two spec deltas for the behaviour this design must satisfy.

State of the repository: the site shell is built and archived (`bootstrap-site-shell`). Every component is a Server Component, there is no hand-written client JavaScript, no test framework, and the hero contains an empty, decorative mascot mount point. The site is exported as static files (`output: "export"`).

### What exploration established

- The reference recording was inspected frame by frame. Its cat is small and seen from above in the hero and footer; in the sections it stays fixed on screen, about four times larger, and turns as the page scrolls. Dennis chose **not** to copy that second part (see the behaviour decisions below).
- Buying a model is ruled out: a model, if one is ever used, must be free.
- No suitable free model was found. The free animated cats that turned up are a cube-built one and a cartoon monster (both Quaternius, CC0), and a cartoon character rig (Blender Studio, CC-BY). A realistic, four-legged, animated, free cat did not turn up in four searches.
- Dennis chose to try a cat drawn entirely in code first, and requires that the cat be cute.

### Behaviour decisions taken by Dennis

These are **not built by this change**. They are listed here because this change records them in `AGENTS.md` (decision 9), and because they shape what the look test must be able to show.

Decided:

- There is one cat. Two are never visible at once.
- The cat always walks toward a target, at a constant size and seen from a constant angle.
- In the hero and the footer the target is the pointer. The cat stops about one body length away from it and looks at it.
- In the sections between them the target is a spot beside the section (to its side or above it, depending on the layout). Once there the cat sits and looks at the section's content, and turns its head toward the card or link that is hovered or has keyboard focus. It does not follow the pointer there.
- Character: calm and curious. The head turns first, and the cat gets up a moment later. Small pointer movements move only the head. It sits soon after arriving. It never ignores the visitor.
- Actions: walking at a single gait, turning on the spot, sitting, blinking, a tail flick. No running.
- Before the pointer has moved, or when there is none, the cat waits seated.
- On touch devices the cat sits in the hero and the footer, because there is no pointer to follow, but it still walks from section to section as the visitor scrolls.
- On a long jump (a navigation link, a direct link to a section, a reload part-way down) the cat leaves through the nearest edge and comes back in beside its new target. It never visibly teleports.
- Scrolling back makes it walk back the way it came.
- It may pass in front of text only over the wordmark in the hero. It never goes over the header navigation.
- It never disappears. In the reference it dissolves into the ink at times; here it does not.

Proposed during exploration and not confirmed by Dennis (record as Provisional):

- Idle gestures (blink, tail flick) stop a while after the last interaction, so that nothing moves on its own for more than five seconds (WCAG 2.2.2).
- The cat's interest does not fade: it follows every time.

Still open: what a click does, where exactly the cat sits in each section (needs real content), the contrast between cat and wordmark, and everything about the ink effect.

## Goals / Non-Goals

**Goals:**

- Let Dennis answer one question by looking: can a cat drawn in code look like the reference and be cute?
- Keep the cat's drawing code free of React and of the lab, so that if the look is accepted the same modules are used on the home page unchanged.
- Leave the home page exactly as it is: same markup, same scripts, same Lighthouse result.

**Non-Goals:**

- A state machine, pointer tracking, scroll handling or any other behaviour.
- Final parameter values. The lab exists to find them.
- A general lab framework. One lab page is built; a second one can copy its structure when it is needed.

## Decisions

### 1. A posable 3D skeleton, drawn as a 2D silhouette

The cat is a skeleton of joints in three dimensions (spine, neck, head, four legs, tail), each joint with a radius. Neighbouring joints define a tapered capsule; the ears are triangles. To draw the cat, every part is projected onto the screen and filled in one colour.

- **Why:** the cat is a flat silhouette, and the silhouette of several solid parts is exactly the union of their individual silhouettes. So filled 2D shapes give the same picture a 3D renderer would, without a renderer, a model file or depth sorting. A live skeleton also makes every decided behaviour cheap later: turning the head is one joint rotation.
- **Alternative rejected:** a real 3D mesh rendered with WebGL. It needs a model (none is available for free), skinning code and a format, all to produce a picture that ends up flat black.
- **Alternative rejected:** a 2D cat drawn directly, without a 3D skeleton. It cannot change convincingly with the heading, which the look requires.

### 2. Orthographic oblique camera

The viewpoint is defined by one angle of elevation above the ground and looks at the cat from in front. The projection is orthographic: no perspective foreshortening with distance.

- **Why:** under an orthographic projection a sphere projects to a circle of the same radius, so every capsule projects to a simple 2D shape and the silhouette stays exact. At the size the cat is shown, true perspective would be barely noticeable.
- **Alternative rejected:** a perspective projection. More mathematics (spheres project to ellipses) for no visible gain.
- The elevation is a lab parameter. Its default is chosen in the lab, starting from about 50 degrees.

### 3. Canvas 2D for drawing

The projected shapes are drawn with the Canvas 2D API, on a canvas sized to the device pixel ratio.

- **Why:** it is the simplest thing that draws filled shapes sharply at any size, it behaves the same on every browser, and it is easy to inspect while tuning. It adds no dependency.
- **Alternative rejected for now:** a WebGL fragment shader that blends the parts smoothly and roughens the edge with noise. It gives softer joins and would share a canvas with the future ink effect, but it is harder to tune, and noise-based fur tends to swim over the body unless it is anchored per part. Revisit when the ink effect is designed; the drawing step is isolated (decision 7) so that swapping it is local.
- **Alternative rejected:** SVG with a turbulence filter for the fur. Animated filters are slow in some browsers.

### 4. Fur as tufts attached to the body

Each body part carries a fixed set of small tufts. A tuft has a position on the surface of its part, a length and a lean, all generated once from a seeded random sequence. Tufts are projected and drawn as small triangles in the cat's colour.

- **Why:** tufts that fall inside the silhouette are invisible (same colour), and those on its edge stick out, which produces a ragged outline. Because they live in the body's own coordinates they stay attached when the cat moves, come into and go out of the outline as it turns, and never shimmer. The seed makes every drawing reproducible.
- Density differs per part (more on tail, chest and cheeks) and is scaled by one lab parameter, "Fur".
- **Alternative rejected:** displacing the finished outline with noise. It gives a rough edge rather than fur, and the roughness slides along the outline as the cat moves.

### 5. Eyes, whiskers and the rim

- Eyes are two ellipses on the surface of the head. Each is drawn only when the surface it sits on faces the camera, and is narrowed by how far it is turned away, which gives the "far eye disappears first" behaviour in the spec.
- Whiskers are thin lines from the muzzle, drawn under the same facing test.
- Whiskers use the page background colour, read from the theme token. Eyes default to the same colour, which keeps them inside the existing palette.
- Added at Dennis's request when he accepted the look: the eye colour is a choice (page background, accent, or a custom colour picked in the lab), each eye can carry a vertical slit pupil in the silhouette's colour, and the inside of each ear can be drawn as a triangle on the ear's front, shown only where that front faces the camera. The inner ear also solves a weakness of the plain silhouette: from above, a standing cat facing the viewer has its ears in front of its body, where they were invisible.
- Dennis then chose, in the lab: light eyes with pupils and light inner ears, "light" being the page background colour. These are the lab's defaults, and they stay inside the theme's three colours.
- A custom eye colour is outside the three theme colours, like the cat's dark tone. It exists in the lab only so Dennis can try colours; which one ships is decided with the change that puts the cat on the home page.
- The light rim treatment draws the whole silhouette, tufts included, once in the background colour with a thick round stroke, then the normal silhouette on top.

### 6. Poses and the walk

- A pose is a set of joint positions and rotations derived from the proportions. Standing and seated are authored as numbers; any two poses can be blended, which the lab uses for nothing yet but the behaviour change will.
- The head turn is a rotation of the head and neck relative to the body, from a quarter turn left to a quarter turn right.
- The walk is procedural: a four-beat lateral sequence (left hind, left fore, right hind, right fore, a quarter cycle apart). Each paw alternates a stance phase, in which it stays fixed on the ground while the body moves over it, and a swing phase, in which it lifts and moves forward. Leg joints are placed by two-bone inverse kinematics from shoulder or hip to paw; the hind leg adds a hock segment at a fixed ratio. The spine bobs slightly and the tail sways.
- In the lab the cat walks on the spot, as on a treadmill, so every heading can be judged.
- **Alternative rejected:** authored keyframes for the walk. Harder to keep paws from sliding, and they would have to be re-authored whenever the proportions change. The procedural walk adapts to the proportions automatically.

### 7. Code layout

```
src/
  mascot/              framework-free TypeScript, no React, no DOM except draw.ts
    params.ts          the parameter type and its defaults
    skeleton.ts        proportions -> joints and radii at rest
    poses.ts           standing, seated, head turn, blending
    gait.ts            the walk: phases, paw targets, inverse kinematics
    project.ts         heading + elevation -> 2D shapes with facing information
    fur.ts             seeded tufts per body part
    draw.ts            Canvas 2D: silhouette, tufts, eyes, whiskers, rim
  app/
    lab/
      cat/
        page.lab.tsx   server component: metadata (title, noindex), renders CatLab
        CatLab.tsx     client component: canvas, controls, animation loop
        CatLab.module.css
```

- `src/mascot/` is the part meant to survive: the future hero uses it as it is. It must not import React, Next.js or anything from `src/app/`.
- `CatLab.tsx` is the first `"use client"` component in the repository. It exists only in the lab.
- The lab page is rendered inside the existing root layout, so it gets the theme tokens, the display typeface and the focus styles for free. The header's section links have no target on that page; this is accepted for a development-only page.
- A "Show skeleton" toggle in the lab draws the joints and the paw contact points over the cat. It is a tuning aid, not a requirement.

### 8. Keeping lab pages out of the published site

Lab pages use the file name `page.lab.tsx`. The Next.js configuration sets `pageExtensions` so that `lab.tsx` is a page extension only when the site is not being built for production. In a production build `page.lab.tsx` is then not a page, the route does not exist, and nothing of it reaches `out/`.

- **Why:** absence is stronger than hiding. No lab code can ship, the home page bundle cannot be affected, and no robots rule is needed to keep the lab private.
- **To confirm during implementation:** the Next.js documentation describes `pageExtensions` but does not show a compound extension in the App Router. Check against the installed version that `page.lab.tsx` is recognised in development and ignored in production.
- **Fallback if it is not supported:** keep a normal `page.tsx` that renders the framework's not-found page when built for production, and verify that the home page still loads no lab code. The spec scenarios are the acceptance test either way.
- **Alternative rejected:** a standalone HTML file outside the application. It would not share the theme tokens, the typeface or the TypeScript modules.
- The page also declares `robots: noindex` and a title, as belt and braces.

### 9. `AGENTS.md` update

`AGENTS.md` requires that a status change is recorded in the same piece of work. This change edits it as follows:

- **The cat › Behaviour:** replace the current bullets with the decided list from the Context section above, labelled Decided; add the two unconfirmed items labelled Provisional; keep "what a click does" as Open; change touch behaviour from Open to Decided. Note that the reference's fixed, scroll-driven cat was seen and deliberately not adopted.
- **The cat › Look:** add "it must be cute: kitten proportions" as Decided. Replace the Provisional paragraph about a pre-rendered 3D model with the code-drawn cat as the Provisional approach, and name the fallbacks from the Risks section.
- **Intended order of work:** reword step 2 as the look test of a code-drawn cat on a lab page.
- **Technical direction:** add that lab pages exist for tuning prototypes and are never published.
- After Dennis gives his verdict (decision 10), record it in the same file.

### 10. How the test ends

The change is finished when Dennis has looked at the lab next to the reference recording and said one of:

- **Accepted.** The values he copies from the lab become the defaults in `params.ts`, and `AGENTS.md` records the code-drawn cat as the chosen approach.
- **Not accepted, because of the shape or the walk.** `AGENTS.md` records that, and the next thing to try is a model generated by an AI service from a text description, on Dennis's own account. Its free-plan licence must be checked first (Meshy's is CC BY 4.0, which requires crediting the service), and frames of the reference must never be used as input.
- **Not accepted, because of the fur.** The next thing to try is a model built by script in Blender with real fur and pre-rendered into images, accepting that this needs a few hundred images and more memory on phones.

In the last two cases the lab page and `src/mascot/` stay in the repository as they are; a later change decides what to keep.

### Dependencies

None added, at runtime or for development. No test framework is introduced: the outcome of this change is judged by eye, and each task is verified by what the lab shows. The change that builds the behaviour on top of these modules is the right place to add a test runner.

### Impact on performance

- The home page is untouched: no markup, style or script changes, so its Lighthouse scores cannot move. This is checked by comparing the production output before and after.
- In the lab the canvas is redrawn only when a parameter changes or while a movement is playing, and the animation loop stops when the tab is hidden. One frame is a few dozen filled shapes and a few hundred small triangles.

### Impact on accessibility

- The canvas is decorative: `aria-hidden`, not focusable.
- Controls are native form elements (range inputs, selects, buttons) inside labelled groups, so names, values and keyboard operation come from the platform. The "values copied" confirmation is announced through a status region.
- Movement starts on its own only without a reduced-motion preference, and a visible control stops it at any time.
- All lab text is in the site's second colour on its background colour, 13.72:1.

## Risks / Trade-offs

- [The cat looks geometric or clumsy rather than cute] → This is the question the test exists to answer. Proportions, fur and angle are adjustable, and decision 10 names what is tried next if it fails.
- [The walk looks mechanical] → Stride, lift, body bob and tail sway are parameters; the skeleton overlay shows where it goes wrong. If it cannot be made convincing, that is a "not accepted" outcome, not something to hide.
- [Sharp concave corners where legs meet the body] → Tufts are denser around joints. If that is not enough, the smooth-blending shader in decision 3 is the known remedy.
- [`page.lab.tsx` is not recognised by the installed Next.js] → Fallback in decision 8.
- [Scope creeps into behaviour because the skeleton makes it easy] → The lab has no pointer tracking and no state machine; the out-of-scope list in the proposal is binding.
- [The cat's dark tone is a fourth colour, which the `visual-theme` spec does not allow on the home page] → The tone is a default in `params.ts`, used only in the lab, and is not added to the theme tokens. The change that puts the cat on the home page must either add a colour role to that spec or draw the cat in an existing one.
- [No automated tests for the geometry] → Accepted for a prototype judged by eye; see Dependencies.

## Migration Plan

Nothing to migrate. Rollback is reverting the commits of this change; the home page does not depend on anything it adds.

## Open Questions

- The default elevation, proportions and amount of fur. They are found in the lab and recorded at the end.
- Whether Canvas 2D stays the renderer once the ink effect is designed.
