# Proposal

## Why

The About, Work and Contact sections are still empty placeholders, so the page cannot yet do its job: convince a recruiter or an engineer to talk to Dennis. The next step in the intended order of work is real content. This change also sets where the cat will sit in each section. That spot was **Open** because it needed real content, and the cat's walk between sections, which comes next, needs it fixed.

## What Changes

- **About** gets its real content. A greeting and a bulleted list: his age as a live number with eight decimals, his degree, where he is based, his interests, his languages and what he does away from the keyboard. Then a clearly visible line saying he is open to internships.
- **The age keeps counting**, and the visitor stops and restarts it by activating the number. That satisfies WCAG 2.2.2 without stopping the count on its own. It starts paused for visitors who ask for reduced motion. Without scripting, it shows his age in whole years.
- **Work** gets three project cards, in this order: the hackathon win, Agentic RAG, JIM007. Each says what the project is and why it exists. Agentic RAG and JIM007 add their tech stack and a link to their GitHub repository. The hackathon card has no stack and no link.
- **Contact** gets the coffee invitation and links to email, LinkedIn and GitHub. The email address is shown in full, and a button copies it.
- **The header's Contact link becomes a highlighted button** in the accent colour, inviting the click. This settles the open question about a contact prompt under the hero: there is none.
- **Desktop layout: blocks alternate sides.** The page is a sequence of blocks: About, each project card, Contact. Each block puts its content on one side and leaves room for the cat on the other, alternating right and left down the page.
- **Room for the cat (mascot slots).** Each block reserves an empty, decorative slot. About's slot is much larger, because there the cat will come close to the viewer as in the reference. The layout also guarantees that the cat will be able to get from one slot to the next without passing in front of any text: either behind the card in between, which is opaque, or through an empty band across the page.
- **Mobile layout (from 360 px):** blocks stack. Each section reserves one slot of the cat's normal size, in its heading row, against the right edge. Cards have no slot and there is no close-up.
- **The cat does not move into the sections yet.** The slots stay empty.
- `AGENTS.md` records:
  - the decisions Dennis made while this was explored: alternating sides, the cat may pass behind cards, the close-up in About, the cat's position following the scroll position at walking pace, and the header button in place of a prompt under the hero;
  - the content now written;
  - Work moving from **Provisional** to the order Dennis chose.

## Capabilities

### New Capabilities

- `section-layout`: how the sections are laid out on desktop and mobile. This covers the alternating blocks, the reserved mascot slots and their sizes, and the guarantees the layout gives the cat for moving between slots.
- `about-section`: what About shows, including the live age counter and the internship line.
- `work-section`: the project cards: their order, their shape, their links and how they behave with the keyboard.
- `contact-section`: the invitation, the contact links and copying the email address.

### Modified Capabilities

- `site-shell`: the header navigation requirement gains a highlighted Contact link.

## Out of scope

- The cat moving into, between or beside the sections, looking at cards, coming close in About, or passing behind cards. This change only reserves the room for it.
- The cat in the footer. The footer stays empty.
- The approximate distance between the visitor and Milan. About says "Based in Milan, or maybe somewhere else around Europe".
- The ink effect on the wordmark.
- New colours, or replacing the 60/30/10 split. A separate exploration covers that. This change uses the existing tokens and adds none.
- Rough, stamp-like edges on the wordmark, and oversized type behind the sections.
- A CV download, a phone number, or a contact form.
- What a click on the cat does.

## Impact

- **Pages affected:** the home page (`/`): the header's Contact link, and the About, Work and Contact sections. The hero, the footer and the lab are unchanged.
- **Capabilities affected:** new `section-layout`, `about-section`, `work-section`, `contact-section`; modified `site-shell`.
- **Code:**
  - the section components and their styles;
  - new typed content under `src/content/`, including Dennis's date of birth and email address, which become public in the repository and on the site;
  - two small client components: the age counter and the copy button;
  - the header's styles.
- **Dependencies:** none.
- **Performance:** two small client components in the first load, no new images or fonts. Lighthouse is measured again.
- **Documents:** `AGENTS.md`.
