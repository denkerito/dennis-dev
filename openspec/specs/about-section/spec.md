# about-section Specification

## Purpose

Defines what the About section tells a visitor about Dennis: who he is, his live age, his studies, where he is based, his interests, languages and pastimes, and that he is open to internships.

## Requirements

### Requirement: About content
The About section SHALL open with a greeting from Dennis followed by a list with these items, in order: his age, his degree, where he is based, his interests, his languages, and what he does away from the keyboard. The list SHALL be exposed as a list to assistive technology.

#### Scenario: Reading About
- **GIVEN** the home page is loaded
- **WHEN** the visitor reads the About section
- **THEN** they see "Hi, I'm Dennis." followed by a bulleted list
- **AND** the list says he is a third-year Computer Science student at the University of Milano-Bicocca, based in Milan or maybe somewhere else around Europe, into AI, LLMs, machine learning, maths and software engineering, an English, Italian and Albanian speaker, and lifting and running off the keyboard

#### Scenario: Screen reader
- **GIVEN** a visitor using a screen reader
- **WHEN** they reach the list in About
- **THEN** it is announced as a list with six items

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor reads About
- **THEN** every list item is fully visible, wrapping onto new lines where needed, with no horizontal scrolling

### Requirement: About in a card
The greeting, the list and the internship line SHALL sit together in one dark card, filled with the second colour, with text in the background colour. The section heading SHALL stay outside the card. On wide screens the heading and card together SHALL be centred vertically beside About's mascot slot.

#### Scenario: Card on desktop
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the visitor looks at About
- **THEN** the heading "About" is above a dark card holding the greeting, the list and the internship line
- **AND** the heading and card together are centred vertically on About's slot, within a few pixels

#### Scenario: Card contrast and focus
- **GIVEN** the About card
- **WHEN** its text and the age counter's focus indicator are compared with the card's fill
- **THEN** the text has a contrast ratio of at least 4.5:1 and the focus indicator at least 3:1
- **AND** the counter's pause or play cue stands out from the card

#### Scenario: Card on a narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor reads About
- **THEN** the heading stays in the row with the slot and the card spans the content width below it

### Requirement: Based in Milan without a distance
About SHALL state where Dennis is based as plain text and SHALL NOT show or compute the visitor's distance from Milan.

#### Scenario: No location lookup
- **GIVEN** a visitor loads the home page
- **WHEN** the network requests are inspected
- **THEN** no request is made to look up the visitor's location
- **AND** About reads "Based in Milan, or maybe somewhere else around Europe"

### Requirement: Open to internships
About SHALL end with a line saying Dennis is open to internships, in Milan, remote, or relocating anywhere in Europe. It SHALL stand out from the list by size or weight, not by colour alone, and meet the text contrast requirement.

#### Scenario: Seen on arrival at About
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the visitor activates the "About" link in the header
- **THEN** the internship line is visible without scrolling further
- **AND** it is larger or bolder than the list items

### Requirement: Live age
Where scripting is available, Dennis's age SHALL be shown as a number of years with eight decimals that counts up continuously. The whole part SHALL increase exactly at midnight, Milan time, on 31 October. The decimals SHALL be the share of the current year of his life that has passed.

#### Scenario: Counting
- **GIVEN** the About section is in view and the counter is not paused
- **WHEN** the visitor watches the number for two seconds
- **THEN** its last digits change several times
- **AND** the text around it does not move, because every digit takes the same width

#### Scenario: Birthday
- **GIVEN** the time is one second after midnight on 31 October, Milan time
- **WHEN** the age is shown
- **THEN** its whole part has just increased by one and its decimals start with 0.0000000

#### Scenario: Half way through a year of life
- **GIVEN** the time is exactly half way between two of Dennis's birthdays
- **WHEN** the age is shown
- **THEN** its decimals read 0.50000000, give or take the last digit

### Requirement: Pausing the age
The age number SHALL itself be a control that stops and restarts the counting. It SHALL work with a pointer, Enter and Space, and expose its state to assistive technology. On hover and focus it SHALL show a visible cue that it can be paused or resumed. When resumed, it SHALL show the current age.

#### Scenario: Pause with the pointer
- **GIVEN** the counter is counting
- **WHEN** the visitor clicks the number
- **THEN** the number stops changing
- **AND** clicking it again makes it count from the current age, not from where it stopped

#### Scenario: Pause with the keyboard
- **GIVEN** a keyboard user tabbing through About
- **WHEN** focus lands on the age and they press Enter or Space
- **THEN** the counting stops or restarts
- **AND** a visible focus indicator and a pause or play cue are shown on the number

#### Scenario: State announced
- **GIVEN** a visitor using a screen reader
- **WHEN** focus lands on the age control
- **THEN** it is announced as a toggle button whose name starts with his age in whole years, such as "21 years old, pause counter", together with its pressed state

### Requirement: Age for visitors who ask for reduced motion
For a visitor whose system asks for reduced motion, the age SHALL start paused, showing the current value, and count only after the visitor resumes it.

#### Scenario: Reduced motion requested
- **GIVEN** the visitor's system is set to reduce motion
- **WHEN** they load the page and look at About
- **THEN** the age shows the current value with eight decimals and does not change
- **AND** activating it starts the counting

### Requirement: Age read by assistive technology
Assistive technology SHALL read Dennis's age in whole years, such as "21 years old". It SHALL NOT be told about each change of the decimals.

#### Scenario: Screen reader reads the age
- **GIVEN** a visitor using a screen reader and the counter counting
- **WHEN** they read the first list item in About
- **THEN** they hear his age in whole years
- **AND** no announcement is made as the decimals change

### Requirement: Age without scripting
Where scripting is unavailable, the age SHALL be shown in whole years, as of when the site was built. No control SHALL be shown that cannot work.

#### Scenario: Scripting disabled
- **GIVEN** a browser with JavaScript disabled
- **WHEN** the visitor reads About
- **THEN** the age reads as a whole number of years
- **AND** it is plain text, not a button

### Requirement: Age at rest when unseen
The age SHALL stop updating while About is scrolled out of view or the page is in a background tab, and SHALL show the current value again as soon as it is seen.

#### Scenario: Scrolled away and back
- **GIVEN** the counter is counting
- **WHEN** the visitor scrolls to Contact, waits ten seconds and scrolls back
- **THEN** no updates were made while About was out of view
- **AND** the age shown on return is the current one
