# Spec Delta

## Purpose

Provides lab pages where a prototype can be tuned by eye before it reaches the site: each lab shows the prototype with adjustable parameters, is available only during development, and is never part of the published site. The cat lab is the first one.

## ADDED Requirements

### Requirement: Lab pages are not published
Lab pages SHALL NOT be part of the published site. The production build output SHALL contain no lab page, and the home page SHALL NOT link to a lab page or load any code that exists only for a lab.

#### Scenario: Lab address on the published site
- **GIVEN** the production build output served by a static file host
- **WHEN** a visitor requests `/lab/cat`
- **THEN** they receive the site's not-found response

#### Scenario: Home page is unaffected
- **GIVEN** the production build output
- **WHEN** the home page is loaded
- **THEN** it contains no link to a lab page
- **AND** it requests no script that it did not request before the lab existed

### Requirement: Cat lab available during development
While the site runs in development, the cat lab SHALL be available at `/lab/cat`, with a page title that names it as a lab and a marker asking search engines not to index it.

#### Scenario: Opening the cat lab
- **GIVEN** the site is running in development
- **WHEN** `/lab/cat` is opened
- **THEN** the cat is shown together with its controls
- **AND** the page title identifies the page as the cat lab

### Requirement: Cat look controls
The cat lab SHALL let the viewer choose the pose and the heading, turn the head, and adjust the proportions, the amount of fur, the viewing angle and the size. Every change SHALL take effect immediately, without reloading the page.

#### Scenario: Changing a proportion
- **GIVEN** the cat lab is open
- **WHEN** the head size is increased
- **THEN** the cat is redrawn at once with a larger head and every other value unchanged

#### Scenario: Choosing a pose and a heading
- **GIVEN** the cat lab is open
- **WHEN** the seated pose is chosen and the heading is set to face the viewer
- **THEN** the cat is shown seated, facing the viewer

#### Scenario: Turning continuously
- **GIVEN** the cat lab is open
- **WHEN** continuous turning is switched on
- **THEN** the cat's heading turns steadily through a full circle until it is switched off

### Requirement: Backdrops and contrast treatments
The cat lab SHALL show the cat on the page background alone or over a sample of the wordmark set in the display typeface, and SHALL offer these treatments for telling the cat apart from the wordmark: none, a light rim around the cat, the cat in the accent colour, and the wordmark in the accent colour. Background, wordmark and accent colours SHALL be the site's theme colours.

#### Scenario: The contrast problem is visible
- **GIVEN** the cat lab shows the cat over the wordmark sample
- **WHEN** the treatment is "none"
- **THEN** the cat is drawn in its dark colour directly over the wordmark in the site's second colour

#### Scenario: Switching treatment
- **GIVEN** the cat lab shows the cat over the wordmark sample
- **WHEN** the light rim treatment is chosen
- **THEN** a rim in the page background colour follows the cat's outline, including its fur

#### Scenario: Theme colours are followed
- **GIVEN** a theme colour value is changed in the site's theme
- **WHEN** the cat lab is reloaded
- **THEN** the backdrop, the wordmark sample and the accent treatment use the new value

### Requirement: Eye and ear detail controls
The cat lab SHALL let the viewer choose the colour of the eyes (the page background colour, the accent colour or any custom colour), switch the pupils on and off, and choose the ear detail (none, the accent colour or the page background colour). These choices SHALL be part of the copied values and of the reset.

#### Scenario: Choosing the eye colour
- **GIVEN** the cat lab shows the cat facing the viewer
- **WHEN** the accent eye colour is chosen
- **THEN** both eyes are redrawn at once in the site's accent colour

#### Scenario: Custom eye colour
- **GIVEN** the cat lab is open
- **WHEN** a colour is picked with the custom eye colour control
- **THEN** the eyes take that colour and the custom option becomes the chosen one

#### Scenario: Ear detail off
- **GIVEN** the ear detail is shown
- **WHEN** "No ear detail" is chosen
- **THEN** the ears are drawn as plain silhouette

### Requirement: Copy and reset parameter values
The cat lab SHALL let the viewer copy the current value of every parameter as text and reset every parameter to its default.

#### Scenario: Copying the chosen values
- **GIVEN** several parameters have been changed
- **WHEN** the viewer activates "Copy values"
- **THEN** a text listing every parameter with its current value is placed on the clipboard
- **AND** the lab confirms that the values were copied

#### Scenario: Resetting
- **GIVEN** several parameters have been changed
- **WHEN** the viewer activates "Reset"
- **THEN** every parameter returns to its default and the cat is redrawn accordingly

### Requirement: Motion control
The cat lab SHALL provide a visible control that starts and stops every movement of the cat. Movement SHALL start on its own only when the viewer's system does not ask for reduced motion.

#### Scenario: No motion preference
- **GIVEN** the viewer's system has no reduced-motion preference
- **WHEN** the walking pose is chosen
- **THEN** the walk plays, and activating the motion control stops it

#### Scenario: Reduced motion requested
- **GIVEN** the viewer's system is set to reduce motion
- **WHEN** the walking pose is chosen
- **THEN** the cat is shown still in a walking stance
- **AND** the walk plays only after the viewer activates the motion control

### Requirement: Keyboard operable
Every control of a lab page SHALL be reachable and operable with the keyboard alone, SHALL have a visible label that is also its accessible name, and SHALL show the site's focus indicator when focused.

#### Scenario: Adjusting a value with the keyboard
- **GIVEN** the cat lab is open
- **WHEN** the viewer tabs to the "Fur" control and presses the arrow keys
- **THEN** the amount of fur changes and the cat is redrawn
- **AND** the focused control shows a clearly visible focus indicator

#### Scenario: Controls are announced
- **GIVEN** a viewer using a screen reader
- **WHEN** focus lands on a control
- **THEN** its name and current value are announced

### Requirement: Usable on a phone
A lab page SHALL be usable from 360 CSS pixels wide upward without horizontal scrolling, with the prototype and its controls both reachable.

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the cat lab is opened
- **THEN** the cat is fully visible, the controls follow it in a single column, and no horizontal scrollbar appears
