# Spec Delta

## MODIFIED Requirements

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
