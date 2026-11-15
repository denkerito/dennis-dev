# Spec Delta

## Purpose

Defines how the Work section presents Dennis's projects: which projects appear and in what order, the shape every project card follows, and how its links behave for pointer, keyboard and screen-reader users.

## ADDED Requirements

### Requirement: Projects and their order
The Work section SHALL show one card per project, in this order: the hackathon win of May 2026, Agentic RAG, JIM007. Each card's title SHALL be a level-three heading.

#### Scenario: Heading outline
- **GIVEN** a visitor using a screen reader
- **WHEN** they list the headings of the page
- **THEN** under the level-two heading "Work" they find three level-three headings, in order: the hackathon win, "Agentic RAG", "JIM007"

### Requirement: Card shape
Every card SHALL say what the project is and why it exists. A card SHALL list the project's technologies only when it has them, and link to its source only when it is public.

#### Scenario: Agentic RAG card
- **GIVEN** the home page is loaded
- **WHEN** the visitor reads the Agentic RAG card
- **THEN** it says what the agent does, and that Dennis built it to show up with something that works instead of a plain cold message, which got a polite rejection, and that he kept building it
- **AND** it lists its technologies and links to its GitHub repository

#### Scenario: JIM007 card
- **GIVEN** the home page is loaded
- **WHEN** the visitor reads the JIM007 card
- **THEN** it says the tracker turns a workout written in a chat into structured data, and that gym apps make you fill in forms between sets
- **AND** it lists its technologies and links to its GitHub repository

#### Scenario: Hackathon card
- **GIVEN** the home page is loaded
- **WHEN** the visitor reads the hackathon card
- **THEN** it tells that Dennis's team won a hackathon on digital accessibility in banking with a chatbot on a RAG architecture for a bank's employees, and why they won
- **AND** it shows no list of technologies and no link

### Requirement: No names that must stay private
No card SHALL name the bank of the hackathon or the company that received Agentic RAG.

#### Scenario: Reading every card
- **GIVEN** the home page is loaded
- **WHEN** the text of the Work section is read in full
- **THEN** it contains no bank name and no name of the company that rejected the application

### Requirement: Project links
Each project link SHALL lead to the project's GitHub repository in the same tab. Its accessible name SHALL start with its visible text and include the project's name. It SHALL be recognisable as a link without relying on colour.

#### Scenario: Link names
- **GIVEN** a visitor using a screen reader
- **WHEN** they list the links of the page
- **THEN** the project links read as "View on GitHub: Agentic RAG" and "View on GitHub: JIM007", not two identical "View on GitHub" links

#### Scenario: Speech input
- **GIVEN** a visitor using speech input
- **WHEN** they say "click View on GitHub"
- **THEN** the project links are offered as matches

#### Scenario: Following a link
- **GIVEN** the visitor is on the home page
- **WHEN** they activate the Agentic RAG link
- **THEN** `github.com/denkerito/agentic-rag` opens in the same tab

### Requirement: Readable dark cards
Cards SHALL be filled with the second colour, and their text SHALL use the background colour, meeting the text contrast requirement.

#### Scenario: Card text contrast
- **GIVEN** any card
- **WHEN** the colour of its body text is compared with the card's fill
- **THEN** the contrast ratio is at least 4.5:1

### Requirement: Visible focus on dark cards
The keyboard focus indicator on a link inside a card SHALL contrast at least 3:1 with the card's fill and SHALL be at least 2 CSS pixels thick.

#### Scenario: Focusing a project link
- **GIVEN** a keyboard user
- **WHEN** focus lands on the JIM007 link
- **THEN** a focus indicator at least 2 pixels thick appears around it and contrasts at least 3:1 with the card

#### Scenario: Only links take focus
- **GIVEN** a keyboard user tabbing through Work
- **WHEN** focus moves through the section
- **THEN** it stops on the two project links only, in card order, and never on a card itself

### Requirement: Cards on a narrow phone
On a narrow viewport each card SHALL span the content width, with its text wrapping and no content cut off.

#### Scenario: Narrow phone
- **GIVEN** a 360 pixel wide viewport
- **WHEN** the visitor scrolls through Work
- **THEN** the three cards are stacked full width, every line of text is visible, and no horizontal scrollbar appears
