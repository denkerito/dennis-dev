# Tasks

## 1. Lab route and tooling

- [x] 1.1 Before changing anything, run `npm run build` and save the list of files in `out/` and the scripts the home page requests, outside the repository; verify the saved baseline exists and names every script of the home page
- [x] 1.2 Check in the documentation of the installed Next.js version whether a compound page extension (`page.lab.tsx`) is supported in the App Router, and write the finding and the mechanism chosen (design decision 8 or its fallback) as a comment in `next.config.ts`; verify the comment names the documentation page consulted
- [x] 1.3 Configure `next.config.ts` so lab pages are routes only outside production builds, and add `src/app/lab/cat/page.lab.tsx` with a title naming the cat lab, `robots: noindex` and a placeholder; verify `/lab/cat` renders in `npm run dev` and that after `npm run build` there is no `lab` entry in `out/`
- [x] 1.4 Add a development-server entry to `.claude/launch.json`; verify it starts and `/lab/cat` opens through it
- [x] 1.5 Add `CatLab.tsx` as a client component with a canvas sized to the device pixel ratio, marked `aria-hidden` and not focusable, and `CatLab.module.css` with a single-column layout that fits 360 pixels; verify a test shape drawn on the canvas is sharp at device pixel ratio 2 and that no horizontal scrollbar appears at 360 pixels

## 2. Skeleton, projection and silhouette

- [x] 2.1 Create `src/mascot/params.ts` with the parameter type (proportions, fur, elevation, size, tone) and kitten-proportioned defaults; verify `npm run typecheck` passes and the file imports nothing from React, Next.js or `src/app/`
- [x] 2.2 Implement `skeleton.ts` (proportions to joints and radii at rest) and `project.ts` (heading and elevation to 2D shapes with facing information); verify with the lab's skeleton overlay that the joints of the standing cat are plausible at headings 0, 90, 180 and 270 degrees
- [x] 2.3 Implement the silhouette in `draw.ts` (tapered capsules and ear triangles filled in one colour) and show the standing cat in the lab; verify by screenshot at eight headings that the body reads as one continuous shape with no seams or gaps, and that it is recognisable as a cat at 80 and at 400 CSS pixels tall
- [x] 2.4 Add lab controls for heading, continuous turning, elevation and size as labelled native inputs; verify each redraws the cat immediately and that turning through a full circle shows no jump between neighbouring headings

## 3. Fur, eyes, whiskers and rim

- [x] 3.1 Implement `fur.ts` (seeded tufts per body part, denser on tail, chest and cheeks) and draw them; verify the outline is ragged, that two drawings of the same pose are pixel-identical, and that tufts keep their place on the body while the heading turns
- [x] 3.2 Draw eyes and whiskers in the page background colour read from the theme token, with the facing test; verify both eyes show when facing the viewer, the far eye disappears first when turning away, and none shows from behind
- [x] 3.3 Add the "Fur" control and the proportion controls (head, ears, legs, body, tail, eyes); verify each changes only its own feature and takes effect without a reload
- [x] 3.4 Add the backdrop choice (page background alone, wordmark sample in the display typeface) and the four contrast treatments (none, light rim, cat in accent, wordmark in accent), with colours read from the theme tokens; verify each treatment by screenshot and that editing a token value in `globals.css` changes the lab after a reload

## 4. Poses and walk

- [x] 4.1 Implement `poses.ts` with standing, seated and pose blending, and add the pose control; verify by screenshot that the seated cat sits upright with straight front legs and its tail on the ground, at headings facing, profile and away
- [x] 4.2 Add the head turn (a quarter turn to either side) and its control; verify that only head and neck move and that the eyes follow the facing rule while the head turns
- [x] 4.3 Implement `gait.ts` (four-beat lateral walk, stance and swing phases, two-bone inverse kinematics, body bob, tail sway) and play it on the spot in the lab; verify with the skeleton overlay that the paws land one after another a quarter cycle apart and that a paw in stance does not move relative to the ground
- [x] 4.4 Add the motion control: movement starts on its own only without a reduced-motion preference, a visible button starts and stops it, and the loop stops while the tab is hidden; verify with reduced motion emulated that the walking pose is shown still until the button is used

## 5. Copy, reset and accessibility of the lab

- [x] 5.1 Add "Copy values" (every parameter and its current value as text on the clipboard, confirmed through a status region) and "Reset"; verify the copied text lists every parameter and that reset restores every default
- [x] 5.2 Group the controls in labelled fieldsets and check every control's accessible name and value; verify by tabbing through the lab that every control is reachable, shows the site's focus indicator, and can be changed with the keyboard alone
- [x] 5.3 Check the lab at 360 pixels wide and at 200% zoom; verify the cat is fully visible, the controls follow in one column, and there is no horizontal scrolling

## 6. Record the decisions

- [x] 6.1 Update `AGENTS.md` as listed in design decision 9 (behaviour decisions with their status labels, the cute requirement, the code-drawn cat as the provisional approach with its fallbacks, the reworded step 2, lab pages in the technical direction); verify every item under "Behaviour decisions taken by Dennis" in `design.md` appears in `AGENTS.md` with the right label and that no Decided item was changed beyond what that list says

## 7. Verdict

- [x] 7.1 Ask Dennis to look at the lab beside the reference recording, tune it, and give one of the three verdicts in design decision 10; verify his answer is quoted in the change's final summary
- [x] 7.2 If accepted, set the values he copied as the defaults in `params.ts`; in every case record the verdict and the next step in `AGENTS.md`; verify the lab opens showing the recorded defaults and `AGENTS.md` states the outcome
- [x] 7.3 Requested by Dennis with his verdict: draw the inside of the ears where they face the viewer, let the eye colour be chosen, and add vertical pupils; verify by screenshot that the inner ears show when the standing cat faces the viewer and that nothing but silhouette shows from behind
- [x] 7.4 Add lab controls for eye colour (page background, accent, custom), pupils and ear detail, included in "Copy values" and "Reset"; verify each redraws the cat at once, appears in the copied text and returns to its default on reset

## 8. Final verification

- [x] 8.1 Run `npm run build`, `npm run lint` and `npm run typecheck`; verify all three finish without errors or warnings
- [x] 8.2 Compare the production output with the baseline from 1.1; verify `out/` has no `lab` entry, the home page requests exactly the same scripts as before, and it contains no link to the lab
- [x] 8.3 Search the CSS for literal colour values outside `globals.css` and the mascot modules for imports of React, Next.js or `src/app/`; verify both searches return nothing
- [x] 8.4 Go through every scenario of both spec deltas in the lab, on desktop and at 360 pixels, with the keyboard and with reduced motion emulated; verify each one holds and list any that does not
- [x] 8.5 Run `openspec validate cat-look-test --strict`; verify it reports no errors or warnings
