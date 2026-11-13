import { HeroMascot } from "@/components/Mascot/HeroMascot";
import { site } from "@/content/site";

import styles from "./Hero.module.css";

export function Hero() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.wordmark}>{site.wordmark}</h1>
      {/* The cat: purely decorative, loaded after the page. */}
      <HeroMascot className={styles.mascotMount} />
    </div>
  );
}
