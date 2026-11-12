// Single source for the site's name, metadata text and navigation.
// The header, the page sections and the document metadata all read from here.

export const site = {
  name: "Dennis",
  wordmark: "DENNIS",
  title: "Dennis — Portfolio",
  description:
    "Dennis is a Computer Science student based in Milan. His projects, his background and how to reach him about an internship.",
  locale: "en_US",
  homeLinkLabel: "Dennis, back to top",
  skipLinkLabel: "Skip to content",
} as const;

export type NavigationItem = {
  /** Fragment identifier of the section, without the leading `#`. */
  readonly id: string;
  readonly label: string;
};

export const navigation: readonly NavigationItem[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];
