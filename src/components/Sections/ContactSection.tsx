import { CopyEmailButton } from "@/components/CopyEmailButton/CopyEmailButton";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { Section } from "@/components/Section/Section";
import { contact } from "@/content/sections";

import styles from "./Sections.module.css";

export function ContactSection({ title }: { title: string }) {
  return (
    <Section id="contact" className={styles.split}>
      <h2 className={styles.title}>{title}</h2>
      <MascotSlot name="contact" layout="both" className={styles.slot} />
      <div className={styles.body}>
        <p className={styles.invitation}>{contact.invitation}</p>
        <ul className={styles.ways}>
          <li className={styles.emailRow}>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <CopyEmailButton email={contact.email} text={contact.copy} />
          </li>
          {contact.profiles.map((profile) => (
            <li key={profile.label}>
              <a href={profile.href}>{profile.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
