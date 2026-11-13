# Spec Delta

## ADDED Requirements

### Requirement: Backdrops
The cat lab SHALL show the cat on the page background alone or over a sample of the wordmark set in the display typeface and in the site's wordmark colour. The cat SHALL be drawn in the site's mascot colour, with no rim and no alternative colouring. Every colour SHALL come from the site's theme.

#### Scenario: Cat over the wordmark
- **GIVEN** the cat lab is open
- **WHEN** the wordmark backdrop is chosen
- **THEN** the cat is drawn in the mascot colour in front of the wordmark sample in the wordmark colour
- **AND** the lab offers no rim and no other colouring of the cat or the wordmark

#### Scenario: Theme colours are followed
- **GIVEN** a theme colour value is changed in the site's theme
- **WHEN** the cat lab is reloaded
- **THEN** the backdrop, the wordmark sample and the cat use the new value

#### Scenario: Backdrop on a narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the wordmark backdrop is chosen with the keyboard
- **THEN** the wordmark sample fits inside the stage behind the cat without horizontal scrolling

## REMOVED Requirements

### Requirement: Backdrops and contrast treatments
**Reason**: The question the treatments existed to answer is decided. Dennis chose to keep the cat in its own colours with no rim and to change the wordmark's colour instead, so the light rim, the cat in the accent colour and the wordmark in the accent colour are no longer options.
**Migration**: The backdrops remain, under the new "Backdrops" requirement. The lab's wordmark sample uses the wordmark colour, and values copied from the lab no longer include a treatment.
