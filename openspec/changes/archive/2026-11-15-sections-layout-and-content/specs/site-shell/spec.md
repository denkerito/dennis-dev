# Spec Delta

## MODIFIED Requirements

### Requirement: Header navigation
The header SHALL show a home mark, the capital letter `D`, on the left and links to About, Work and Contact on the right, and SHALL stay available while the visitor scrolls. The Contact link SHALL be shown as a highlighted button, filled with the accent colour, to invite the click. Activating a section link SHALL bring that section into view and update the URL fragment; activating the home mark SHALL return to the top of the page.

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

#### Scenario: Contact stands out
- **GIVEN** the home page is loaded at 1440 or at 360 pixels wide
- **WHEN** the visitor looks at the header
- **THEN** the Contact link is a filled button in the accent colour, while About and Work are plain text links
- **AND** its text meets the text contrast requirement for its size, and its outline contrasts at least 3:1 with the header background

#### Scenario: Contact button is still a link
- **GIVEN** a visitor using a screen reader
- **WHEN** focus lands on the Contact button
- **THEN** it is announced as a link named "Contact", and activating it brings the Contact section into view and sets the fragment to `#contact`
