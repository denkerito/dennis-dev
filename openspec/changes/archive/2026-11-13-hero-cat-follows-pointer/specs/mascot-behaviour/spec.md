# Spec Delta

## Purpose

Defines what the site's cat mascot does: where it waits, how it looks at and walks to a target, how it stays inside the area it belongs to, its idle gestures, and how it behaves when there is no pointer, when the visitor asks for reduced motion, and while it loads. It currently covers the hero.

## ADDED Requirements

### Requirement: Waiting seated
Until the visitor moves a pointer over the hero, the mascot SHALL wait seated at a fixed spot in the hero, facing the viewer.

#### Scenario: Page just loaded
- **GIVEN** the home page has loaded and the pointer has not moved
- **WHEN** the mascot appears
- **THEN** it is seated at its waiting spot in the hero, facing the viewer, and does not move from it

### Requirement: Looking at the pointer
While the pointer is inside the hero, the mascot SHALL turn its head toward it. The head SHALL start to turn before the body does anything, and pointer movements that stay near the mascot SHALL move only its head.

#### Scenario: Head turns first
- **GIVEN** the mascot is seated and the pointer enters the hero far from it
- **WHEN** the pointer moves
- **THEN** the mascot's head turns toward the pointer while its body is still seated

#### Scenario: Small movements
- **GIVEN** the mascot is seated and looking at the pointer, which is about one body length away
- **WHEN** the pointer moves a short distance and stays within two body lengths
- **THEN** only the mascot's head follows it and the mascot stays seated

### Requirement: Walking to the pointer
When the pointer is inside the hero and more than two body lengths from the mascot, the mascot SHALL get up a moment after the pointer moved, turn on the spot until it faces the pointer, walk to it, and stop about one body length away. It SHALL sit down again shortly after arriving. It SHALL always respond: no pointer movement in the hero is ignored.

#### Scenario: Pointer far away
- **GIVEN** the mascot is seated at the right of the hero
- **WHEN** the pointer moves to the left of the hero and rests there
- **THEN** within half a second the mascot gets up
- **AND** it turns to face the pointer, walks toward it and stops about one body length from it
- **AND** it sits down within a second of stopping

#### Scenario: Pointer moves while the mascot walks
- **GIVEN** the mascot is walking toward the pointer
- **WHEN** the pointer moves somewhere else in the hero
- **THEN** the mascot curves toward the new position without stopping or jumping

#### Scenario: Pointer behind the mascot
- **GIVEN** the mascot is seated and the pointer is close to it but behind it
- **WHEN** the pointer stays there
- **THEN** the mascot gets up, turns on the spot to face the pointer, and sits again

### Requirement: One steady walk
The mascot SHALL move only by walking, at one pace of about one of its own body lengths a second. It SHALL NOT run, slide or jump from one place to another, and a paw on the ground SHALL NOT slide.

#### Scenario: Crossing the hero
- **GIVEN** a 1440 by 900 viewport and the mascot at one side of the hero
- **WHEN** the pointer rests at the opposite side
- **THEN** the mascot arrives in between three and six seconds, walking the whole way at the same pace

### Requirement: Staying in the hero
The mascot SHALL stay inside the hero, completely visible, and SHALL never overlap the header. When the pointer leaves the hero the mascot SHALL stop where it is and sit down. When the hero changes size the mascot SHALL remain inside it.

#### Scenario: Pointer at the top edge
- **GIVEN** the pointer is inside the hero, right under the header
- **WHEN** the mascot walks to it
- **THEN** the mascot stops while it is still entirely below the header

#### Scenario: Pointer over the navigation
- **GIVEN** the mascot is walking toward the pointer
- **WHEN** the pointer moves up onto the header navigation
- **THEN** the mascot stops, sits down, and no part of it covers the header

#### Scenario: Window resized
- **GIVEN** the mascot is seated near the right edge of the hero
- **WHEN** the window is made narrower
- **THEN** the mascot is still entirely inside the hero

### Requirement: Idle gestures
After it stops moving, the mascot SHALL blink and flick its tail now and then, for no longer than five seconds. After that it SHALL be completely still until the pointer moves again.

#### Scenario: Just arrived
- **GIVEN** the mascot has just sat down
- **WHEN** the pointer stays still for three seconds
- **THEN** the mascot blinks or flicks its tail at least once

#### Scenario: Left alone
- **GIVEN** the mascot sat down more than five seconds ago and the pointer has not moved since
- **WHEN** it is observed for ten more seconds
- **THEN** nothing on it moves

### Requirement: No pointer to follow
Where the visitor has no hovering pointer, such as on a touch screen, the mascot SHALL sit still at its waiting spot. Touching the hero SHALL NOT make it move.

#### Scenario: Phone
- **GIVEN** a 360 pixel wide touch device
- **WHEN** the visitor loads the home page and taps or scrolls on the hero
- **THEN** the mascot stays seated at its waiting spot
- **AND** the whole mascot is visible without horizontal scrolling

### Requirement: Still for visitors who ask for reduced motion
For a visitor whose system asks for reduced motion, the mascot SHALL be a still, seated cat at its waiting spot: it does not walk, turn its head, blink or flick its tail, and it appears without a transition.

#### Scenario: Reduced motion requested
- **GIVEN** the visitor's system is set to reduce motion
- **WHEN** they move the pointer across the hero
- **THEN** the mascot stays seated and nothing on it moves

### Requirement: Never in the way
The mascot SHALL NOT take pointer input, keyboard focus or a place in the reading order. Text under it SHALL remain selectable and controls under it SHALL remain operable.

#### Scenario: Selecting the wordmark
- **GIVEN** the mascot is in front of part of the wordmark
- **WHEN** the visitor drags across the wordmark to select it
- **THEN** the wordmark text is selected as if the mascot were not there

#### Scenario: Keyboard and screen reader
- **GIVEN** a visitor navigating with the keyboard or a screen reader
- **WHEN** they tab or read through the page
- **THEN** focus moves through the same elements in the same order as without the mascot
- **AND** the mascot is not announced

### Requirement: Arrives after the page
The mascot SHALL load after the page's content and SHALL NOT delay it. The page SHALL be complete and usable before the mascot appears and if it never appears, and nothing SHALL shift when it does.

#### Scenario: Slow connection
- **GIVEN** a slow connection
- **WHEN** the home page is first painted
- **THEN** the wordmark, navigation and sections are present and usable although the mascot has not appeared

#### Scenario: Mascot appears
- **GIVEN** the page is displayed without the mascot
- **WHEN** the mascot appears
- **THEN** no other element moves or changes size

#### Scenario: Scripting unavailable or the mascot fails to load
- **GIVEN** a browser with JavaScript disabled, or one in which the mascot's code fails to load
- **WHEN** the visitor uses the home page
- **THEN** the page looks and works as it did before the mascot existed, and no error is shown

### Requirement: Resting when unseen
The mascot SHALL stop animating while the hero is scrolled out of view or the page is in a background tab.

#### Scenario: Scrolled away and back
- **GIVEN** the mascot is walking toward the pointer
- **WHEN** the visitor scrolls the hero out of view, waits, and scrolls back
- **THEN** the mascot is inside the hero, seated or resuming its walk from where it was, and has not jumped

### Requirement: Sized to the wordmark
The mascot's size SHALL follow the size of the wordmark, so that it keeps the same proportion to the letters on every screen, and SHALL never be less than 80 CSS pixels tall.

#### Scenario: Desktop
- **GIVEN** a 1440 by 900 viewport
- **WHEN** the mascot stands next to the wordmark
- **THEN** it is between a quarter and two thirds as tall as the letters

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the mascot is shown
- **THEN** it is at least 80 CSS pixels tall and fits entirely inside the hero
