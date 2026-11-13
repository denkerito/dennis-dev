# site-shell Specification

## Purpose

Defines the structure of the single-page site: its landmarks, section anchors, header navigation, hero heading, keyboard and reduced-motion behaviour, responsive layout, and the reserved place where the mascot is attached. Everything else on the site is placed inside this structure.

## Requirements

### Requirement: Single-page landmark structure
The site SHALL consist of one page at `/` that exposes, in this order, a header landmark containing the site navigation, a main landmark containing the hero followed by the About, Work and Contact sections, and a footer landmark.

#### Scenario: Landmarks are exposed to assistive technology
- **GIVEN** a visitor using a screen reader
- **WHEN** they list the landmarks of the home page
- **THEN** they find exactly one banner, one navigation, one main and one content-information landmark

#### Scenario: Sections appear in a fixed order
- **GIVEN** the home page is loaded
- **WHEN** the visitor scrolls from top to bottom
- **THEN** they pass the hero, then About, then Work, then Contact, then the footer

### Requirement: Hero heading
The hero SHALL contain the page's only level-one heading, with the text content `DENNIS` rendered as real text. Together with the header, the hero SHALL fill the first screen when the page loads.

#### Scenario: Wordmark is real text
- **GIVEN** the home page is loaded
- **WHEN** the visitor selects the wordmark or reads it with a screen reader
- **THEN** it is exposed as a level-one heading reading "DENNIS"
- **AND** there is no other level-one heading on the page

#### Scenario: Hero fills the first screen on desktop
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the home page loads without scrolling
- **THEN** the header and the hero together fill the viewport and no part of the About section is visible

#### Scenario: Wordmark fits a narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the home page loads
- **THEN** the whole wordmark is visible without horizontal scrolling

### Requirement: Section anchors
The About, Work and Contact sections SHALL each have a level-two heading with the section's name and a stable fragment identifier: `about`, `work` and `contact`.

#### Scenario: Direct link to a section
- **GIVEN** a visitor opens the site URL ending in `#work`
- **WHEN** the page finishes loading
- **THEN** the Work section heading is visible and not covered by the header

#### Scenario: Heading outline
- **GIVEN** a visitor using a screen reader
- **WHEN** they list the headings of the page
- **THEN** they find one level-one heading followed by level-two headings "About", "Work" and "Contact", with no skipped levels

### Requirement: Header navigation
The header SHALL show a home mark, the capital letter `D`, on the left and links to About, Work and Contact on the right, and SHALL stay available while the visitor scrolls. Activating a section link SHALL bring that section into view and update the URL fragment; activating the home mark SHALL return to the top of the page.

#### Scenario: Navigate to a section with the pointer
- **GIVEN** the visitor is at the top of the page
- **WHEN** they activate the "Work" link
- **THEN** the Work section comes into view with its heading not covered by the header
- **AND** the URL fragment becomes `#work`

#### Scenario: Return to the top
- **GIVEN** the visitor has scrolled to the Contact section
- **WHEN** they activate the home mark
- **THEN** the page returns to the top and the hero is in view

#### Scenario: Home mark has an accessible name
- **GIVEN** a visitor using a screen reader
- **WHEN** focus lands on the home mark
- **THEN** it is announced as a link with a name that says it leads to the top of Dennis's site, not just the letter "D"

#### Scenario: Navigation on a narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the home page loads
- **THEN** the home mark and all three links are visible without a collapsed menu
- **AND** each has a target area of at least 24 by 24 CSS pixels

### Requirement: Skip link
The page SHALL provide a "Skip to content" link as its first focusable element, hidden until it receives keyboard focus, that moves focus to the main content.

#### Scenario: Skipping the navigation with the keyboard
- **GIVEN** the home page has just loaded
- **WHEN** the visitor presses Tab once
- **THEN** a "Skip to content" link becomes visible and focused
- **AND** activating it moves focus to the main content, so the next Tab goes past the header navigation

### Requirement: Keyboard operability
Every interactive element of the shell SHALL be reachable and operable with the keyboard alone, in an order that matches the visual order, with a visible focus indicator that is never hidden behind the header.

#### Scenario: Tabbing through the shell
- **GIVEN** the home page has just loaded
- **WHEN** the visitor presses Tab repeatedly
- **THEN** focus moves through the skip link, the home mark, About, Work and Contact, in that order
- **AND** each focused element shows a clearly visible focus indicator

#### Scenario: Activating a link with the keyboard
- **GIVEN** keyboard focus is on the "About" link
- **WHEN** the visitor presses Enter
- **THEN** the About section comes into view with its heading not covered by the header

### Requirement: Reduced motion
Scrolling triggered by the shell's navigation SHALL be animated only for visitors who have not asked their system to reduce motion.

#### Scenario: Visitor prefers reduced motion
- **GIVEN** the visitor's system is set to reduce motion
- **WHEN** they activate the "Contact" link
- **THEN** the page jumps to the Contact section without a scrolling animation

#### Scenario: Visitor has no motion preference
- **GIVEN** the visitor's system has no reduced-motion preference
- **WHEN** they activate the "Contact" link
- **THEN** the page scrolls smoothly to the Contact section

### Requirement: Responsive layout
The page SHALL be usable from 360 CSS pixels wide upward without horizontal scrolling, with the desktop layout as the reference design, and SHALL remain usable when text is enlarged to 200%.

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor scrolls the whole page
- **THEN** no horizontal scrollbar appears and no content is cut off

#### Scenario: Enlarged text
- **GIVEN** a 1280 pixel wide viewport with browser zoom at 200%
- **WHEN** the visitor scrolls the whole page
- **THEN** all headings and navigation links remain visible and operable without horizontal scrolling

### Requirement: Works without client-side scripting
The page's structure, headings and navigation SHALL be fully usable when client-side scripting is unavailable.

#### Scenario: Scripting disabled
- **GIVEN** a browser with JavaScript disabled
- **WHEN** the visitor loads the home page and activates the "Work" link
- **THEN** the wordmark, all sections and the navigation are present
- **AND** the Work section comes into view

### Requirement: Reserved mascot mount point
The hero SHALL contain a region for the mascot that is purely decorative: hidden from assistive technology, never focusable, and never intercepting pointer input. Until the mascot has loaded, and if it never loads, the region SHALL have no visible effect.

#### Scenario: Mount point is invisible to assistive technology
- **GIVEN** a visitor using a screen reader
- **WHEN** they read through the hero, with or without the mascot shown
- **THEN** only the wordmark heading is announced

#### Scenario: Mount point does not block interaction
- **GIVEN** the home page is loaded and the mascot is shown
- **WHEN** the visitor selects the wordmark text with the pointer or tabs through the page
- **THEN** the text can be selected and no extra focus stop appears

#### Scenario: Mascot not loaded
- **GIVEN** the mascot has not loaded
- **WHEN** the hero is displayed at 1440 and at 360 pixels wide
- **THEN** it looks exactly as it would with no mascot region at all

### Requirement: Static delivery
The site SHALL be delivered as pre-built static files that can be served by any static file host, with no server-side code running at request time.

#### Scenario: Served from a plain static host
- **GIVEN** the production build output
- **WHEN** it is served by a generic static file server with no application runtime
- **THEN** the home page loads and behaves the same as in development
