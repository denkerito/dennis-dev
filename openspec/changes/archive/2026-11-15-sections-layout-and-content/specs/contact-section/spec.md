# Spec Delta

## Purpose

Defines how the Contact section invites a visitor to get in touch with Dennis: the invitation itself, the ways to reach him, and copying his email address.

## ADDED Requirements

### Requirement: Invitation
The Contact section SHALL invite the visitor with the line "Let's grab a coffee.", shown larger than body text.

#### Scenario: Reading Contact
- **GIVEN** the home page is loaded
- **WHEN** the visitor reaches the Contact section
- **THEN** they see "Let's grab a coffee." in text larger than the body text, followed by the ways to reach Dennis

### Requirement: Ways to reach Dennis
Contact SHALL offer exactly three ways to reach Dennis: an email link showing his full address, a link to his LinkedIn profile and a link to his GitHub profile. It SHALL NOT show a phone number. Each link SHALL be recognisable as a link without relying on colour.

#### Scenario: Email link
- **GIVEN** the visitor reads Contact
- **WHEN** they activate the email address
- **THEN** their email program opens a new message addressed to `ismajli.dennis@gmail.com`
- **AND** the address itself is visible as text on the page

#### Scenario: Profile links
- **GIVEN** a visitor using a screen reader
- **WHEN** they list the links in Contact
- **THEN** they find the email link, a "LinkedIn" link to `linkedin.com/in/dennis-ismajli` and a "GitHub" link to `github.com/denkerito`

#### Scenario: Keyboard
- **GIVEN** a keyboard user
- **WHEN** they tab through Contact
- **THEN** focus moves through the email link, the copy button when present, LinkedIn and GitHub, in visual order, each with a visible focus indicator

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor reads Contact
- **THEN** the whole email address and every link are visible without horizontal scrolling, each with a target area of at least 24 by 24 CSS pixels

### Requirement: Copy the email address
Where scripting is available, a button beside the email address SHALL copy the address to the clipboard. It SHALL confirm the copy, both visibly and to assistive technology. If copying fails, it SHALL say so and the address SHALL stay on the page to select by hand.

#### Scenario: Copying
- **GIVEN** the visitor is in Contact with scripting available
- **WHEN** they activate the "Copy" button with a pointer, Enter or Space
- **THEN** the clipboard holds `ismajli.dennis@gmail.com`
- **AND** the button shows "Copied" for a few seconds and a screen reader announces it without moving focus

#### Scenario: Clipboard unavailable
- **GIVEN** the browser refuses access to the clipboard
- **WHEN** the visitor activates the "Copy" button
- **THEN** a short message says the address could not be copied
- **AND** the address is still shown and can be selected by hand

#### Scenario: Scripting disabled
- **GIVEN** a browser with JavaScript disabled
- **WHEN** the visitor reads Contact
- **THEN** no copy button is shown, and the email link and address are present and work
