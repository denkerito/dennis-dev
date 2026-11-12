import { site } from "@/content/site";

import styles from "./Hero.module.css";

export function Hero() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.wordmark}>{site.wordmark}</h1>
      {/* Reserved for the mascot, added by a later change. Purely decorative. */}
      <div className={styles.mascotMount} aria-hidden="true" />
    </div>
  );
}
