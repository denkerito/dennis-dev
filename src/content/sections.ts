// Copy of the About, Work and Contact sections. Wording agreed with Dennis
// (change `sections-layout-and-content`); edit it here, not in the components.

/** A calendar date, read as midnight in Milan. */
export type CalendarDate = {
  readonly year: number;
  /** 1 to 12. */
  readonly month: number;
  readonly day: number;
};

export const about = {
  greeting: "Hi, I'm Dennis.",
  birthDate: { year: 2005, month: 10, day: 31 } satisfies CalendarDate,
  /** Follows the age, which the component renders as the first list item. */
  ageSuffix: "years old",
  facts: [
    "Third-year Computer Science student at the University of Milano-Bicocca",
    "Based in Milan, or maybe somewhere else around Europe",
    "Into AI, LLMs and machine learning, maths and software engineering",
    "English, Italian and Albanian speaker",
    "Off the keyboard: lifting and running",
  ],
  internship: "Open to internships — in Milan, remote, or relocating anywhere in Europe.",
} as const;

export type Project = {
  /** Used for the mascot slot beside the card. */
  readonly id: string;
  readonly title: string;
  readonly what: string;
  readonly why: string;
  readonly stack?: readonly string[];
  readonly link?: { readonly href: string; readonly label: string };
};

// Never name the hackathon's bank, nor the company that received Agentic RAG.
export const projects: readonly Project[] = [
  {
    id: "hackathon",
    title: "Hackathon win · May 2026",
    what: "Our team won a hackathon on digital accessibility in banking. The problem was inside the bank: employees were losing time to bureaucracy and to documents full of jargon. Our answer was a chatbot on a RAG architecture that they can simply ask.",
    why: "We won because we took the time to really understand the problem, and what accessibility means, before we started thinking about a solution.",
  },
  {
    id: "agentic-rag",
    title: "Agentic RAG",
    what: "An AI agent that investigates a company's finances: the numbers come from read-only SQL, the causes from its documents, and every claim cites its source.",
    why: "Instead of cold messaging a company on LinkedIn with “hi, I'm a student, hire me”, I wanted to show up with something that actually works. Result: a polite rejection. I liked the project too much to stop, so I kept building it.",
    stack: ["Python", "FastAPI", "Pydantic AI", "PostgreSQL + pgvector", "React"],
    link: { href: "https://github.com/denkerito/agentic-rag", label: "View on GitHub" },
  },
  {
    id: "jim007",
    title: "JIM007",
    what: "A workout tracker you talk to. Write “bench press 55x8 55x6” in a chat and it becomes structured training data.",
    why: "Gym apps make you fill in forms between sets. I wanted to log a session the way I'd text a friend.",
    stack: ["Python", "FastAPI", "PostgreSQL", "Gemini", "React"],
    link: { href: "https://github.com/denkerito/Jim-007", label: "View on GitHub" },
  },
];

export const contact = {
  invitation: "Let's grab a coffee.",
  email: "ismajli.dennis@gmail.com",
  copy: {
    label: "Copy",
    accessibleLabel: "Copy email address",
    done: "Copied",
    announced: "Email address copied",
    failed: "Couldn't copy, select the address instead",
  },
  profiles: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dennis-ismajli" },
    { label: "GitHub", href: "https://github.com/denkerito" },
  ],
} as const;
