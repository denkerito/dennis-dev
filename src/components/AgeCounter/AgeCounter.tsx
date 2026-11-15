"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ageAt, formatAge } from "@/content/age";
import type { CalendarDate } from "@/content/sections";

import styles from "./AgeCounter.module.css";

type AgeCounterProps = {
  birthDate: CalendarDate;
  /** The age when the page was built: shown until the first update, and without scripting. */
  initialAge: number;
  /** Text after the number, such as "years old". */
  suffix: string;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const label = (whole: number, suffix: string) => `${whole} ${suffix}, pause counter`;

/**
 * Dennis's age with eight decimals, counting while it is in view. The number is
 * a toggle button: activating it pauses or resumes the count (WCAG 2.2.2).
 * Screen readers get the age in whole years only, never each change.
 *
 * The digits and the button's name are written straight to the page, so the
 * count never re-renders the component.
 */
export function AgeCounter({ birthDate, initialAge, suffix }: AgeCounterProps) {
  const root = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  // null until the visitor toggles it: then it starts paused only under reduced motion.
  const [toggled, setToggled] = useState<boolean | null>(null);
  const paused = toggled ?? reducedMotion;
  const [inView, setInView] = useState(true);

  // Count only while the number is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Show the current value whenever the state changes, then keep counting if
  // allowed. requestAnimationFrame does not run in background tabs; the text is
  // written only when the shown value changes, about three times a second.
  useEffect(() => {
    let shown = "";
    const show = () => {
      const age = ageAt(Date.now(), birthDate);
      const text = formatAge(age);
      if (text === shown) return;
      shown = text;
      if (digits.current) digits.current.textContent = text;
      button.current?.setAttribute("aria-label", label(Math.floor(age), suffix));
    };
    show();
    if (paused || !inView) return;
    let frame = 0;
    const tick = () => {
      show();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, inView, birthDate, suffix]);

  return (
    <span ref={root}>
      <span data-js="" className={styles.line}>
        <button
          ref={button}
          type="button"
          className={styles.counter}
          aria-pressed={paused}
          aria-label={label(Math.floor(initialAge), suffix)}
          onClick={() => setToggled(!paused)}
        >
          <span ref={digits} className={styles.digits} aria-hidden="true">
            {formatAge(initialAge)}
          </span>
          <span className={styles.cue} aria-hidden="true">
            {paused ? "Play" : "Pause"}
          </span>
        </button>
        <span aria-hidden="true"> {suffix}</span>
      </span>
      <span data-nojs="">
        {Math.floor(initialAge)} {suffix}
      </span>
    </span>
  );
}
