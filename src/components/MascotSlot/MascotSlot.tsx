import styles from "./MascotSlot.module.css";

export type MascotSlotLayout = "wide" | "narrow" | "both";

type MascotSlotProps = {
  /** Looked up by the cat's code: `[data-mascot-slot="<name>"]`. */
  name: string;
  /** Which layout uses this slot; it is not displayed in the other one. */
  layout: MascotSlotLayout;
  /** Placement and size, set by the section that owns the slot. */
  className?: string;
};

/**
 * Empty room where the cat will sit beside a block. Purely decorative: hidden
 * from assistive technology, never focusable, transparent to the pointer, and
 * with no visible effect of its own.
 */
export function MascotSlot({ name, layout, className }: MascotSlotProps) {
  return (
    <div
      aria-hidden="true"
      data-mascot-slot={name}
      data-mascot-layout={layout}
      className={[styles.slot, styles[layout], className].filter(Boolean).join(" ")}
    />
  );
}
