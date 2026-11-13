# Proposal

## Why

The cat is the signature element of the site and the only part whose feasibility is unknown: nobody has yet checked that a cat can be made that looks like the reference and that Dennis finds cute. Exploration ruled out buying a model, found no suitable free one, and settled on a cat drawn entirely in code; this change tests that look in isolation, before any behaviour is built on top of it.

## What Changes

- Add a cat drawn in code: a posable skeleton seen from a fixed oblique angle and rendered as a flat dark silhouette with a ragged fur outline, light eyes and whiskers. No 3D model, image asset or library is involved.
- Add the poses needed to judge the look: standing, walking, seated, and seated with the head turned, each viewable from every heading.
- Add a lab page, separate from the home page and absent from the published site, that shows the cat with adjustable parameters (proportions, amount of fur, viewing angle, size) so Dennis can choose by looking.
- In the lab, show the cat on the paper background and over a sample of the wordmark, with the contrast treatments that are still undecided (no treatment, light rim, cat in the accent colour, wordmark in the accent colour) selectable side by side.
- Let the current parameter values be copied out of the lab, so the values Dennis settles on can be recorded.
- Record in `AGENTS.md` the behaviour decisions Dennis took during exploration (listed in `design.md`), and replace the provisional "pre-rendered 3D model" approach with the code-drawn cat.
- End with an explicit verdict from Dennis: the look is accepted, or it is not and the fallback named in `design.md` is tried next.

## Capabilities

### New Capabilities

- `mascot-appearance`: how the cat looks wherever it is drawn: the oblique view that changes with its heading, the silhouette and fur outline, eyes and whiskers, the set of poses, sharpness at any size, and stillness for visitors who ask for reduced motion.
- `prototype-lab`: pages used to tune prototypes by eye: kept out of the published site, usable on desktop and phone, with adjustable parameters whose values can be copied out. The cat lab is the first one.

### Modified Capabilities

None. The home page, its shell, its metadata and the visual theme keep their current requirements.

## Out of scope

- The cat following the pointer, walking between sections, sitting beside content, or any other behaviour. Those decisions are recorded by this change but not built.
- Blinking and tail flicks.
- Placing the cat on the home page, in the hero mount point or in the footer.
- The ink effect on the wordmark.
- Choosing the contrast treatment or the cat's final colour. The lab only makes the options visible; any change to the `visual-theme` colour roles belongs to the change that puts the cat on the home page.
- Behaviour on click, which stays open.
- Embedding frames of the reference recording in the lab. The comparison is done by eye, with the recording open beside the browser.
- Any purchased, downloaded or AI-generated model.

## Impact

- **Pages affected:** a new lab page at `/lab/cat`, available in development only. The home page (`/`) is not changed and ships no new code.
- **Capabilities affected:** two new ones, `mascot-appearance` and `prototype-lab`. None modified.
- **Code:** new framework-free modules for the cat under `src/mascot/`, a new lab route under `src/app/lab/`, and a build configuration change so lab pages are left out of the production output. The lab contains the repository's first client-side component.
- **Dependencies:** none added.
- **Tooling:** a development-server entry in `.claude/launch.json`, because the existing entry serves only the production output, which will not contain the lab.
- **Documents:** `AGENTS.md` is updated with the behaviour decisions, the new provisional approach for the cat's look, and the outcome of the test.
