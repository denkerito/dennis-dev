import type { ReactNode } from "react";

import styles from "./Section.module.css";

type SectionProps = {
  /** Fragment identifier used by the navigation. */
  id: string;
  title: string;
  children?: ReactNode;
};

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  );
}
