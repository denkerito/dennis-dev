# mascot-appearance Specification

## Purpose

Defines how the site's cat mascot looks wherever it is drawn: the angle it is seen from, its silhouette and fur, its eyes and whiskers, its proportions, the poses it can hold, and how it is presented to visitors who ask for reduced motion. It says nothing about how the cat is produced or how it behaves.

## Requirements

### Requirement: Oblique view that follows the heading
The mascot SHALL be shown from a fixed viewpoint above and in front of the ground it stands on, so that its outline changes with the direction it faces: toward the viewer, in profile, away from the viewer, and every direction in between.

#### Scenario: Facing the viewer
- **GIVEN** the mascot is standing
- **WHEN** it faces the viewer
- **THEN** its face, both eyes and both ears are visible and its body is foreshortened behind its head

#### Scenario: In profile
- **GIVEN** the mascot is standing
- **WHEN** it faces to the left or to the right
- **THEN** its head, back, legs and tail are seen from the side and at most one eye is visible

#### Scenario: Facing away
- **GIVEN** the mascot is standing
- **WHEN** it faces away from the viewer
- **THEN** its back, the back of its head and its tail are visible and no eye or whisker is shown

#### Scenario: Turning through every heading
- **GIVEN** the mascot is standing
- **WHEN** its heading is turned slowly through a full circle
- **THEN** its outline changes continuously, with no visible jump between neighbouring headings

### Requirement: Silhouette with a fur outline
The mascot SHALL be drawn as one flat-coloured silhouette in which the body parts merge into a single shape. Its outline SHALL be ragged like fur, not smooth and not made of recognisable geometric shapes. The fur SHALL stay attached to the body as the mascot moves or turns.

#### Scenario: Body reads as one shape
- **GIVEN** the mascot in any pose and heading
- **WHEN** it is drawn
- **THEN** head, body, legs and tail form one continuous silhouette with no visible seams, gaps or overlapping outlines

#### Scenario: Outline is ragged
- **GIVEN** the mascot with the default amount of fur
- **WHEN** its outline is inspected
- **THEN** the edge is irregular with small tufts along the body, most visibly on the tail, chest and cheeks

#### Scenario: Fur does not shimmer
- **GIVEN** the mascot holding a still pose
- **WHEN** it is drawn repeatedly
- **THEN** every drawing is identical, and when the mascot walks each tuft keeps its place on the body

### Requirement: Eyes and whiskers
The mascot SHALL have eyes and whiskers in colours that stand out against its silhouette, visible only from directions in which its face can be seen. Each eye SHALL be able to show a vertical pupil.

#### Scenario: Face toward the viewer
- **GIVEN** the mascot's head is turned toward the viewer
- **WHEN** it is drawn
- **THEN** two eyes and whiskers on both sides of the muzzle are visible against the silhouette

#### Scenario: Pupils
- **GIVEN** pupils are switched on
- **WHEN** the mascot faces the viewer
- **THEN** each eye shows a narrow vertical pupil in the colour of the silhouette

#### Scenario: Head turning away
- **GIVEN** the mascot's head turns from facing the viewer to facing away
- **WHEN** the turn passes through profile
- **THEN** the far eye narrows and disappears first, then the near eye, and none remains once the head faces away

### Requirement: Ear detail
The mascot SHALL be able to show the inside of its ears in a colour distinct from its silhouette. The inside of an ear SHALL be visible only where the front of that ear faces the viewer.

#### Scenario: Ears in front of the body
- **GIVEN** the ear detail is switched on and the mascot is standing
- **WHEN** it faces the viewer, so that its ears overlap its body
- **THEN** the inside of both ears is visible and the ears can be told apart from the body

#### Scenario: Seen from behind
- **GIVEN** the ear detail is switched on
- **WHEN** the mascot faces away from the viewer
- **THEN** no inside of an ear is shown

### Requirement: Kitten proportions
With its default proportions the mascot SHALL look like a kitten rather than an adult cat: a large head and large ears relative to the body, short legs and a thick tail.

#### Scenario: Default proportions
- **GIVEN** the mascot with its default proportions
- **WHEN** it is shown standing in profile and seated facing the viewer
- **THEN** its head and ears are clearly large for its body, its legs are short and its tail is thick

### Requirement: Poses
The mascot SHALL be able to stand, walk, sit, and sit with its head turned up to a quarter turn to either side. Every pose SHALL be available at every heading.

#### Scenario: Seated
- **GIVEN** the mascot is seated
- **WHEN** it is shown facing the viewer
- **THEN** it sits upright on its haunches with its front legs straight and its tail resting on the ground beside it

#### Scenario: Head turned while seated
- **GIVEN** the mascot is seated
- **WHEN** its head is turned to one side
- **THEN** only the head and neck turn, and the body, legs and tail stay where they were

#### Scenario: Walking
- **GIVEN** the mascot is walking
- **WHEN** one full step cycle is observed
- **THEN** the four paws touch the ground one after another in a regular sequence
- **AND** a paw that is on the ground does not slide relative to the ground

### Requirement: Sharp at any size
The mascot SHALL be drawn at the resolution of the visitor's screen, at any size between 80 and 400 CSS pixels tall, without blurring or visible pixels.

#### Scenario: High-density screen
- **GIVEN** a screen with two device pixels per CSS pixel
- **WHEN** the mascot is shown 160 CSS pixels tall
- **THEN** its outline and whiskers are as sharp as text of the same size

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the mascot is shown at its smallest size
- **THEN** it is still recognisable as a cat, with its ears and tail distinguishable

### Requirement: Still for visitors who ask for reduced motion
For a visitor whose system asks for reduced motion, the mascot SHALL NOT move on its own: it is shown in a still pose until the visitor explicitly starts a movement.

#### Scenario: Reduced motion requested
- **GIVEN** the visitor's system is set to reduce motion
- **WHEN** the mascot is first shown
- **THEN** it holds a still pose and no part of it animates

### Requirement: Decorative presentation
The mascot SHALL be purely decorative: hidden from assistive technology and never a keyboard focus stop.

#### Scenario: Screen reader
- **GIVEN** a visitor using a screen reader
- **WHEN** they read through a page that shows the mascot
- **THEN** the mascot is not announced

#### Scenario: Keyboard navigation
- **GIVEN** a visitor navigating with the keyboard
- **WHEN** they press Tab through a page that shows the mascot
- **THEN** focus never lands on the mascot
