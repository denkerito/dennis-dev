import type { ReactNode } from "react";

import styles from "@/components/Sections/Sections.module.css";

type SectionProps = {
  /** Fragment identifier used by the navigation. */
  id: string;
  /** Layout of the section's content, from Sections.module.css. */
  className?: string;
  children: ReactNode;
};

/** A page section: the anchor, the side padding and the maximum content width. */
export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={[styles.section, styles[id]].filter(Boolean).join(" ")}>
      <div className={[styles.inner, className].filter(Boolean).join(" ")}>{children}</div>
    </section>
  );
}
