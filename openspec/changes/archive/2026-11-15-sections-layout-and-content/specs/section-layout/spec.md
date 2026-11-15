# Spec Delta

## Purpose

Defines how the About, Work and Contact sections are laid out on wide and narrow screens, and the empty room each one reserves for the cat, so that the cat can later sit beside every block and walk from one to the next without covering any text.

## ADDED Requirements

### Requirement: Alternating blocks on wide screens
On a wide viewport the sections SHALL form a sequence of blocks (About, then one block per project card in Work, then Contact), each with its content on one side and a mascot slot on the other. Slot sides SHALL alternate, starting on the right with About.

#### Scenario: Desktop reference layout
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the visitor scrolls from About to Contact
- **THEN** the mascot slots are, in order: right of About, left of the first project card, right of the second, left of the third, right of Contact
- **AND** each block's content is on the side opposite its slot

#### Scenario: Reading order is unaffected by the sides
- **GIVEN** a 1440 by 900 viewport and a keyboard user at the top of the About section
- **WHEN** they press Tab repeatedly through to the Contact section
- **THEN** focus moves through About, then the three project cards in their order, then Contact, never jumping back up the page

### Requirement: Stacked sections on narrow screens
On a narrow viewport the blocks SHALL stack in a single column. Each section SHALL reserve one mascot slot in the row of its heading, against the right edge of the page. Project cards SHALL have no slot of their own.

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor scrolls the About, Work and Contact sections
- **THEN** each section heading has an empty slot beside it on the right, touching the page gutter
- **AND** the project cards span the content width with no slot beside them
- **AND** no horizontal scrollbar appears and no content is cut off

#### Scenario: Enlarged text
- **GIVEN** a 1280 pixel wide viewport with browser zoom at 200%
- **WHEN** the visitor scrolls the sections
- **THEN** the stacked layout is used and all content remains readable and operable without horizontal scrolling

### Requirement: Mascot slots are decorative
Every mascot slot SHALL be empty background: hidden from assistive technology, never focusable, never intercepting pointer input, and with no visible effect of its own.

#### Scenario: Screen reader
- **GIVEN** a visitor using a screen reader
- **WHEN** they read through About, Work and Contact
- **THEN** no slot is announced and the reading order contains only the sections' content

#### Scenario: Pointer over a slot
- **GIVEN** the home page at 1440 by 900
- **WHEN** the visitor drags across a slot and the text beside it
- **THEN** the text is selected as if the slot were not there

#### Scenario: Keyboard
- **GIVEN** a keyboard user
- **WHEN** they tab through the sections
- **THEN** focus never lands on a slot

### Requirement: Slot sizes follow the cat
Each slot SHALL be sized from the cat's normal size, the size the cat has in the hero, so slots shrink and grow with it. A slot SHALL be at least 2.3 times that size wide and 2 times tall, except beside a project card on wide screens, where it SHALL be as tall as the card and at least 1.2 times that size. About's wide slot SHALL be at least 3 times wide and 3.4 times tall.

#### Scenario: Desktop sizes
- **GIVEN** a 1440 by 900 viewport, where the cat's normal size is about 200 pixels
- **WHEN** the slots are measured
- **THEN** Contact's slot is at least 460 by 400 pixels
- **AND** each slot beside a project card is at least 460 pixels wide, exactly as tall as its card, and at least 240 pixels tall
- **AND** About's slot is at least 600 by 680 pixels

#### Scenario: Cards fit their text
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the project cards are measured
- **THEN** each card is only as tall as its own content and padding
- **AND** the vertical gaps between consecutive cards are equal

#### Scenario: Narrow phone sizes
- **GIVEN** a 360 pixel wide viewport, where the cat's normal size is 80 pixels
- **WHEN** the slots are measured
- **THEN** each section's slot is at least 184 by 160 pixels
- **AND** About's slot is the same size as the others

#### Scenario: Without scripting
- **GIVEN** a browser with JavaScript disabled
- **WHEN** the home page is loaded at 1440 and at 360 pixels wide
- **THEN** the slots have the same sizes and positions as with scripting

### Requirement: Room to walk between slots
On wide screens, the cat SHALL be able to reach each slot from the previous one without passing in front of any text. Below every slot down to the next block on the same side there SHALL be either empty background or an opaque card. Above Contact there SHALL be an empty band across the full content width, at least as tall as the cat's normal size.

#### Scenario: From one slot to the next behind a card
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the area between About's slot and the first project card's slot is examined
- **THEN** the space straight below About's slot is empty background down to the first project card, which lies on the same side
- **AND** the same holds from each project card's slot to the next card

#### Scenario: Crossing before Contact
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the area between the last project card's row and the Contact heading is examined
- **THEN** it contains a band of empty background spanning the content width that is at least 200 pixels tall

#### Scenario: From the hero to About's slot
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the area between the bottom of the hero and About's slot is examined
- **THEN** it contains no text on the slot's side

### Requirement: Cards hide what is behind them
Every project card SHALL be fully opaque, so that anything drawn behind it is completely hidden.

#### Scenario: Card surface
- **GIVEN** the home page at any width
- **WHEN** a project card's background is inspected
- **THEN** it is a solid colour with no transparency across the whole card
