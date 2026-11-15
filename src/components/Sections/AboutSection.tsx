import { AgeCounter } from "@/components/AgeCounter/AgeCounter";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { Section } from "@/components/Section/Section";
import { ageAt } from "@/content/age";
import { about } from "@/content/sections";

import styles from "./Sections.module.css";

// Evaluated once, when the static page is built: the age shown until scripts
// run, and the whole years shown without them.
const buildAge = ageAt(Date.now(), about.birthDate);

export function AboutSection({ title }: { title: string }) {
  return (
    <Section id="about" className={`${styles.split} ${styles.close}`}>
      {/* On wide screens the heading and the card move as one, centred beside the slot. */}
      <div className={styles.group}>
        <h2 className={styles.title}>{title}</h2>
        <div className={`${styles.body} ${styles.card} ${styles.aboutCard}`}>
          <p className={styles.greeting}>{about.greeting}</p>
          <ul className={styles.facts}>
            <li>
              <AgeCounter birthDate={about.birthDate} initialAge={buildAge} suffix={about.ageSuffix} />
            </li>
            {about.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <p className={styles.internship}>{about.internship}</p>
        </div>
      </div>
      <MascotSlot name="about" layout="both" className={styles.slot} />
    </Section>
  );
}
