# Tasks

## 1. Baseline and test runner

- [x] 1.1 Before changing anything, run `npm run build`, save the list of scripts the home page requests and their compressed sizes outside the repository, and run Lighthouse on the production output; verify the saved baseline contains the four Lighthouse scores and the total script size
- [x] 1.2 Check the current Vitest release against the installed Node and TypeScript versions in its documentation, add it as a development dependency with a `test` script and a configuration that resolves the `@/` alias; verify `npm test` runs one trivial test and passes, and that `npm run build` output is unchanged
- [x] 1.3 Add a test of the existing gait that asserts a paw in stance keeps the same ground position at every phase of the cycle; verify it passes against the current code, so later gait changes are checked

## 2. Colours

- [x] 2.1 Add `--color-wordmark` and `--color-mascot` to `globals.css` with the values in design decision 1 and point the hero wordmark at `--color-wordmark`; verify with a contrast calculation that wordmark on paper is at least 3:1, mascot on wordmark at least 3:1 and mascot on paper at least 3:1, and by screenshot at 1440 and 360 pixels that only the wordmark changed colour
- [x] 2.2 Remove `MASCOT_TONE` from `params.ts` and the `rim` option from `CatPaint` and `draw.ts`; make the lab read `--color-mascot` and `--color-wordmark`, drop its "Contrast treatment" group and the treatment from the copied values; verify the lab shows the cat in the mascot colour over the wordmark sample in the wordmark colour, that no treatment control remains, and that a search finds no literal colour for the cat outside `globals.css`
- [x] 2.3 Update `AGENTS.md` as listed in design decision 13 for the colours (known problem decided, colour table, wordmark line); verify the table lists five roles with their values and the known problem is labelled Decided with Dennis's answer

## 3. Rig: continuous sit and stride, gestures, brisker gait

- [x] 3.1 Replace the three fixed poses inside `src/mascot/` with a rig driven by continuous `sit` and `stride` amounts, keeping the lab's three pose buttons mapped onto them; verify by screenshot that standing, seated and walking in the lab look the same as before and that the gait test still passes
- [x] 3.2 Retune the gait to about one body length a second (stance sweep, cycle time, leg segment lengths, body height while walking) as in design decision 5; verify with a test that ground speed equals cycle distance over cycle time and is between 0.9 and 1.3 body lengths a second, that the stance test still passes, and by screenshots at four phases that the legs reach both ends of the stride
- [x] 3.3 Add stepping in place (stride 0) for turning on the spot; verify with a test that paws lift in the same four-beat order while their ground positions stay put, and by screenshot that the pose reads as stepping
- [x] 3.4 Add eye openness and a tail flick to `CatView` and the drawing; verify by screenshot that closed eyes show no eye disc, that a flicked tail differs only in the tail, and with a test that both default to the unchanged look
- [x] 3.5 Ask Dennis to look at the retuned walk in the lab and say whether it is acceptable; verify his answer is quoted in the final summary, and adjust pace or stride if he asks
  - Dennis, 2026-11-13: "confermo" (the retuned walk is acceptable; no change to pace or stride).

## 4. Behaviour

- [x] 4.1 Implement `behaviour.ts` as a pure step function with the states and constants of design decision 3, working in ground coordinates (decision 4) and taking its random source as an argument; verify it imports nothing but other `src/mascot/` modules and that `npm run typecheck` passes
- [x] 4.2 Test waiting and looking: with no target the state stays seated at the waiting spot; with a target within two body lengths only the head turn changes; verify the tests pass
- [x] 4.3 Test walking: a far target makes the cat rise after the get-up delay and within half a second, turn to within the facing tolerance before moving, walk at the gait's ground speed, stop about one body length away and sit within a second; a target that moves mid-walk changes the heading at a limited rate with no jump in position; verify the tests pass
- [x] 4.4 Test bounds and leaving: the ground point never leaves the given bounds for targets at every edge and corner; a target that disappears makes the cat stop and sit; shrinking the bounds clamps the position; verify the tests pass
- [x] 4.5 Test idle gestures: after the cat sits, at least one blink or flick is scheduled within three seconds, none later than five seconds, and the state is then unchanged by further steps until the target moves; verify the tests pass with a seeded random source

## 5. The cat in the hero

- [x] 5.1 Implement `follower.ts`: a cat-sized canvas moved by transform inside a given element, sized from the wordmark's font size, drawing from the behaviour state with colours read from the theme; verify in a development page or the lab that a cat driven by a scripted target walks, stops and sits without its paws sliding
- [x] 5.2 Add pointer input (window `pointermove`, mouse and pen only, recomputed on scroll), bounds from the hero and the header's bottom edge, and resize handling; verify in the browser that the cat follows the pointer inside the hero, stops and sits when the pointer moves onto the header, and stays inside the hero when the window is resized
- [x] 5.3 Stop the animation loop while the cat is at rest, while the hero is out of view and while the tab is hidden; verify by counting animation frames that none is requested five seconds after the cat sits, nor after scrolling the hero out of view
- [x] 5.4 Handle reduced motion and the absence of a hovering pointer: draw the cat once, seated, and add no pointer listener under reduced motion; verify with reduced motion emulated that nothing moves when the pointer crosses the hero, and with touch emulation at 360 pixels that taps and scrolling do not move the cat
- [x] 5.5 Add `HeroMascot.tsx`, rendered inside the hero's mount point, which imports the follower after `load` and idle, fades the canvas in (not under reduced motion) and ignores any failure; verify in the network panel that the cat's chunk is requested after the page's own scripts, that blocking that request leaves the page working with no console error, and that nothing moves when the cat appears

## 6. Record the working choices

- [x] 6.1 Update `AGENTS.md` with the behaviour items of design decision 13 (waiting spot, sitting when the pointer leaves, walking pace) labelled Provisional; verify each appears once with its label and that no Decided item was altered

## 7. Final verification

- [x] 7.1 Run `npm run build`, `npm run lint`, `npm run typecheck` and `npm test`; verify all four finish without errors or warnings
- [x] 7.2 Compare the production output with the baseline from 1.1: verify the scripts requested before `load` are the baseline's plus at most the loader, that the cat's chunk is under 15 KB compressed or the excess is reported, that `out/` still has no lab entry, and that no CSS outside `globals.css` contains a literal colour
- [x] 7.3 Run Lighthouse on the production output with the cat present; verify Performance, Accessibility, Best Practices and SEO are each at least 90 and layout shift is zero
- [x] 7.4 Go through every scenario of the four spec deltas on the production output at 1440 by 900 and at 360 pixels wide, with the keyboard, with a screen reader's accessibility tree, with reduced motion emulated and with JavaScript disabled; verify each holds and list any that does not
- [x] 7.5 Run `openspec validate hero-cat-follows-pointer --strict`; verify it reports no errors or warnings
