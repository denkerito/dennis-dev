# Spec Delta

## Purpose

Defines the document metadata the site exposes to browsers, search engines and link previews: language, title, description, Open Graph tags, viewport behaviour and site icon.

## ADDED Requirements

### Requirement: Document language
The page SHALL declare English as its language.

#### Scenario: Language is announced correctly
- **GIVEN** a visitor using a screen reader
- **WHEN** the home page loads
- **THEN** the document language is reported as English and content is read with English pronunciation

### Requirement: Title and description
The page SHALL have a non-empty document title that identifies the site as Dennis's portfolio and a meta description of at most 160 characters that summarises the site.

#### Scenario: Browser tab and search result
- **GIVEN** the home page is loaded
- **WHEN** the document head is inspected
- **THEN** it contains one title naming Dennis and one meta description between 50 and 160 characters long

### Requirement: Open Graph tags
The page SHALL expose Open Graph tags for title, description, type (`website`), site name and locale. The title and description SHALL match the document title and meta description.

#### Scenario: Link shared in a chat application
- **GIVEN** the home page URL is shared in an application that renders link previews
- **WHEN** the application reads the page's Open Graph tags
- **THEN** it finds a title, a description, the type `website`, a site name and a locale

### Requirement: Absolute URL when the site address is known
When a public site address is provided at build time, the page SHALL expose a canonical URL and an Open Graph URL built from it. When no address is provided, the build SHALL still succeed and those two tags SHALL be omitted.

#### Scenario: Site address configured
- **GIVEN** the site is built with a public site address configured
- **WHEN** the document head is inspected
- **THEN** the canonical URL and the Open Graph URL are absolute and start with that address

#### Scenario: Site address not configured
- **GIVEN** the site is built with no public site address configured
- **WHEN** the build runs
- **THEN** it completes successfully
- **AND** the page contains no canonical URL and no Open Graph URL

### Requirement: Viewport and zoom
The page SHALL adapt to the device width on mobile and SHALL NOT prevent the visitor from zooming.

#### Scenario: Pinch zoom on a phone
- **GIVEN** a visitor on a 360 pixel wide phone
- **WHEN** they load the home page and pinch to zoom in
- **THEN** the page first renders at device width without a zoomed-out desktop layout
- **AND** zooming in is allowed

### Requirement: Site icon
The site SHALL provide an icon so that browsers show it in the tab and do not report a missing-icon error.

#### Scenario: Browser requests the icon
- **GIVEN** a visitor loads the home page
- **WHEN** the browser requests the site icon
- **THEN** an icon is returned and no failed request is logged in the console
