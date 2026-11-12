# visual-theme Specification

## Purpose

Defines the single visual theme of the site: the colour roles, how they may be combined, the contrast they guarantee, and the typography roles. It keeps the look consistent and readable while the actual colours and typefaces are still being chosen.

## Requirements

### Requirement: Single theme
The site SHALL present one theme to every visitor. It SHALL NOT switch colours based on the visitor's operating-system light or dark preference.

#### Scenario: Visitor's system is in dark mode
- **GIVEN** a visitor whose operating system is set to dark mode
- **WHEN** they load the home page
- **THEN** the page shows the same colours as for a visitor in light mode
- **AND** browser-drawn elements such as scrollbars match the light theme

### Requirement: Colour roles
The theme SHALL be built from exactly three colour roles: a background colour covering most of the page, a second colour used for text, the wordmark and filled surfaces, and an accent colour used sparingly for emphasis.

#### Scenario: Roles on the home page
- **GIVEN** the home page is loaded
- **WHEN** the visitor looks at the hero and the sections
- **THEN** the page background uses the background colour
- **AND** the wordmark, headings and body text use the second colour
- **AND** no colour outside the three roles appears

### Requirement: Text contrast
Text SHALL have a contrast ratio of at least 4.5:1 against its background, or at least 3:1 when it is large text (24 CSS pixels or more, or 18.66 CSS pixels or more when bold).

#### Scenario: Body-size text
- **GIVEN** any navigation link or section heading in the shell
- **WHEN** its colour is compared with the colour directly behind it
- **THEN** the contrast ratio is at least 4.5:1

#### Scenario: Text on a narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor reads the navigation links
- **THEN** the text is at least 16 CSS pixels in size and meets the same contrast ratio as on desktop

### Requirement: Accent colour usage
The accent colour SHALL be used for text only where it meets the text contrast requirement for that text's size, and SHALL never be the only means of conveying information or state.

#### Scenario: Accent on small text
- **GIVEN** the accent colour does not reach 4.5:1 against the background colour
- **WHEN** a normal-size link or label is styled
- **THEN** its text uses the second colour, and the accent appears only as decoration such as an underline or marker

#### Scenario: State not conveyed by colour alone
- **GIVEN** a link that uses the accent colour as decoration
- **WHEN** a visitor who cannot distinguish the accent from the second colour looks at it
- **THEN** it is still identifiable as a link by a non-colour cue such as an underline

### Requirement: Focus indicator contrast
The keyboard focus indicator SHALL have a contrast ratio of at least 3:1 against the colours adjacent to it and SHALL be at least 2 CSS pixels thick.

#### Scenario: Focus on a navigation link
- **GIVEN** the visitor navigates with the keyboard
- **WHEN** focus lands on the "About" link
- **THEN** a focus indicator at least 2 CSS pixels thick appears around it
- **AND** its contrast against the header background is at least 3:1

### Requirement: Typography roles
The theme SHALL define a display typeface used for the wordmark and a text typeface used for all other text. Typefaces SHALL be served from the site's own origin, and text SHALL remain readable while they load.

#### Scenario: No third-party font requests
- **GIVEN** a visitor loads the home page
- **WHEN** the network requests are inspected
- **THEN** every font file is requested from the site's own origin

#### Scenario: Font still loading
- **GIVEN** a slow connection on which the display typeface has not arrived yet
- **WHEN** the home page is first painted
- **THEN** the wordmark is visible in a fallback typeface rather than hidden
