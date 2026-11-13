"use client";

import { useEffect, useRef } from "react";

// The cat's size relative to the wordmark's font size, and its limits in CSS pixels.
const SIZE_RATIO = 0.45;
const MIN_SIZE = 80;
const MAX_SIZE = 220;
// Where the cat waits, as fractions of the hero: in front of the end of the wordmark.
const HOME = { x: 0.78, y: 0.72 };

type HeroMascotProps = {
  /** Styles of the mount point: positioned over the hero, taking no pointer input. */
  className: string;
};

/**
 * The hero's mount point for the cat. It renders an empty, decorative element
 * and, once the page has loaded and the browser is idle, fetches the cat's code
 * and starts it there. If that never happens the page is simply without a cat.
 */
export function HeroMascot({ className }: HeroMascotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    let idle = 0;
    let timer = 0;

    const start = () => {
      import("@/mascot/follower")
        .then(({ mountFollower }) => {
          if (cancelled) return;
          const wordmark = mount.parentElement?.querySelector("h1");
          const header = document.querySelector("header");
          dispose = mountFollower({
            area: mount,
            home: HOME,
            size: () => {
              const fontSize = wordmark ? parseFloat(getComputedStyle(wordmark).fontSize) : 0;
              return Math.min(MAX_SIZE, Math.max(MIN_SIZE, fontSize * SIZE_RATIO));
            },
            // The header is sticky: the cat stays below it, never under or over it.
            ceiling: () => header?.getBoundingClientRect().bottom ?? 0,
          });
        })
        // The cat is decorative: a failed download is not an error worth showing.
        .catch(() => {});
    };

    const whenIdle = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 2000 });
      else timer = setTimeout(start, 200) as unknown as number;
    };

    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", whenIdle);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
      dispose?.();
    };
  }, []);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
