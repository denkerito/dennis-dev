# Spec Delta

## MODIFIED Requirements

### Requirement: Colour roles
The theme SHALL be built from exactly five colour roles: a background colour covering most of the page; a second colour used for text and filled surfaces; a wordmark colour, a lighter tint of the second colour, used only by the wordmark; an accent colour used sparingly for emphasis; and a mascot colour used only by the mascot.

#### Scenario: Roles on the home page
- **GIVEN** the home page is loaded
- **WHEN** the visitor looks at the hero and the sections
- **THEN** the page background uses the background colour
- **AND** headings and body text use the second colour
- **AND** the wordmark uses the wordmark colour
- **AND** the mascot's silhouette uses the mascot colour, and its eyes, whiskers and inner ears use the background colour
- **AND** no colour outside the five roles appears

## ADDED Requirements

### Requirement: Mascot stands out
The mascot colour SHALL have a contrast ratio of at least 3:1 against the background colour and against the wordmark colour, so that the mascot remains visible wherever it is allowed to be.

#### Scenario: Mascot in front of the wordmark
- **GIVEN** the mascot is in front of a letter of the wordmark
- **WHEN** the mascot colour is compared with the wordmark colour
- **THEN** the contrast ratio is at least 3:1

#### Scenario: Mascot on the page background
- **GIVEN** the mascot is in front of the page background
- **WHEN** the mascot colour is compared with the background colour
- **THEN** the contrast ratio is at least 3:1

#### Scenario: Mascot on a narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the mascot is shown in front of the wordmark
- **THEN** it uses the same colours, and so has the same contrast, as on desktop
