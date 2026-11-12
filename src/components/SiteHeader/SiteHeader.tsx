import { navigation, site } from "@/content/site";

import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      {/* `#top` is resolved by browsers to the top of the document. */}
      <a className={styles.homeMark} href="#top" aria-label={site.homeLinkLabel}>
        D
      </a>
      <nav className={styles.nav} aria-label="Main">
        <ul className={styles.list}>
          {navigation.map((item) => (
            <li key={item.id}>
              <a className={styles.link} href={`#${item.id}`}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
