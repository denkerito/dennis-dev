"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./CopyEmailButton.module.css";

type CopyText = {
  readonly label: string;
  readonly done: string;
  readonly announced: string;
  readonly failed: string;
};

type CopyEmailButtonProps = {
  email: string;
  text: CopyText;
};

type State = "idle" | "copied" | "failed";

/** Copies the email address; shown only where scripting runs. */
export function CopyEmailButton({ email, text }: CopyEmailButtonProps) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(email);
      setState("copied");
      timer.current = window.setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("failed");
    }
  };

  return (
    <span data-js="" className={styles.wrap}>
      <button type="button" className={styles.button} onClick={copy}>
        {state === "copied" ? text.done : text.label}
        {/* The accessible name is the visible text plus what is copied. */}
        <span className="visually-hidden"> email address</span>
      </button>
      {/* Present from the first render so that changes are announced. */}
      <span role="status" className="visually-hidden">
        {state === "copied" ? text.announced : state === "failed" ? text.failed : ""}
      </span>
      {state === "failed" && (
        <span className={styles.failed} aria-hidden="true">
          {text.failed}
        </span>
      )}
    </span>
  );
}
