"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { drawCat } from "@/mascot/draw";
import {
  DEFAULT_PARAMS,
  DEFAULT_VIEW,
  PARAM_CONTROLS,
  POSE_VIEW,
  POSES,
  WALK_CYCLE_SECONDS,
  type CatPaint,
  type CatParams,
  type CatPose,
  type CatView,
  type ParamControl,
} from "@/mascot/params";

import styles from "./CatLab.module.css";

const BACKDROPS = [
  { value: "page", label: "Page background" },
  { value: "wordmark", label: "Wordmark" },
] as const;

const EYE_COLOURS = [
  { value: "paper", label: "Light eyes" },
  { value: "accent", label: "Accent eyes" },
  { value: "custom", label: "Custom eyes" },
] as const;

const EAR_DETAILS = [
  { value: "none", label: "No ear detail" },
  { value: "accent", label: "Accent inner ears" },
  { value: "paper", label: "Light inner ears" },
] as const;

type Backdrop = (typeof BACKDROPS)[number]["value"];
type EyeColour = (typeof EYE_COLOURS)[number]["value"];
type EarDetail = (typeof EAR_DETAILS)[number]["value"];

/** Small details of the face. The defaults are the ones Dennis chose: light eyes with pupils, light inner ears. */
type Details = { eyes: EyeColour; customEye: string; pupils: boolean; ears: EarDetail };

// The custom eye colour is experimental and the one colour outside the theme.
const DEFAULT_DETAILS: Details = {
  eyes: "paper",
  customEye: "#e8c547",
  pupils: true,
  ears: "paper",
};

/**
 * Everything about the view except the pose amounts, which come from the chosen
 * pose through POSE_VIEW, and the walk phase, which advances every frame and lives in a ref.
 */
type ViewSettings = Omit<CatView, "phase" | "sit" | "step" | "stride">;

const DEFAULT_PHASE = DEFAULT_VIEW.phase;
const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  heading: DEFAULT_VIEW.heading,
  headTurn: DEFAULT_VIEW.headTurn,
  showSkeleton: DEFAULT_VIEW.showSkeleton,
};
const DEFAULT_POSE: CatPose = "standing";
const DEFAULT_BACKDROP: Backdrop = "page";

const TURN_DEGREES_PER_SECOND = 40;
/** Longest step the animation takes in one frame, so a stalled tab does not make the cat jump. */
const MAX_FRAME_SECONDS = 0.1;
/** Where the cat's ground point sits, as a share of the canvas height. */
const GROUND_LINE = 0.66;
const MIN_CANVAS_HEIGHT = 320;

const CONTROL_GROUPS = [...new Set(PARAM_CONTROLS.map((control) => control.group))];
const SIZE_MIN = PARAM_CONTROLS.find((control) => control.key === "size")?.min ?? 0;

const UNIT_NAMES: Record<string, string> = { "°": "degrees", px: "pixels" };

type Theme = { paper: string; ink: string; accent: string; wordmark: string; mascot: string };

type Scene = { params: CatParams; view: ViewSettings; pose: CatPose; details: Details };

function readTheme(): Theme {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    paper: token("--color-paper"),
    ink: token("--color-ink"),
    accent: token("--color-accent"),
    wordmark: token("--color-wordmark"),
    mascot: token("--color-mascot"),
  };
}

function paintFor(theme: Theme, details: Details): CatPaint {
  const colourOf = { paper: theme.paper, accent: theme.accent, custom: details.customEye };
  return {
    body: theme.mascot,
    detail: theme.paper,
    overlay: theme.accent,
    eye: colourOf[details.eyes],
    pupil: details.pupils ? theme.mascot : undefined,
    earInner: details.ears === "none" ? undefined : colourOf[details.ears],
  };
}

function decimalsOf(step: number): number {
  const text = String(step);
  const point = text.indexOf(".");
  return point === -1 ? 0 : text.length - point - 1;
}

function wholeDegrees(angle: number): number {
  return Math.round(angle) % 360;
}

// External stores read with useSyncExternalStore: the server snapshots keep the
// cat still during hydration, and the client values take over right after.
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function CatLab() {
  const idPrefix = useId();
  const id = (name: string) => `${idPrefix}-${name}`;

  const [params, setParams] = useState<CatParams>(DEFAULT_PARAMS);
  const [view, setView] = useState<ViewSettings>(DEFAULT_VIEW_SETTINGS);
  const [pose, setPose] = useState<CatPose>(DEFAULT_POSE);
  const [turning, setTurning] = useState(false);
  const [backdrop, setBackdrop] = useState<Backdrop>(DEFAULT_BACKDROP);
  const [details, setDetails] = useState<Details>(DEFAULT_DETAILS);
  // null until the viewer uses the motion control; until then the system preference decides.
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const [stageWidth, setStageWidth] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  );
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const themeRef = useRef<Theme | null>(null);
  const phaseRef = useRef(DEFAULT_PHASE);

  const playing = playChoice ?? !prefersReducedMotion;
  const walking = pose === "walking";
  const animating = playing && pageVisible && (walking || turning);

  // The cat reaches about `size` to either side of its ground point, so at most
  // half the stage width keeps it fully visible on a narrow screen.
  const sizeMax =
    stageWidth === null ? Infinity : Math.max(SIZE_MIN, Math.floor(stageWidth / 2));
  const shownParams = useMemo<CatParams>(
    () => ({ ...params, size: Math.min(params.size, sizeMax) }),
    [params, sizeMax],
  );
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, Math.round(shownParams.size * 1.75 + 40));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !scene || !ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    const backingWidth = Math.round(width * dpr);
    const backingHeight = Math.round(height * dpr);
    if (canvas.width !== backingWidth) canvas.width = backingWidth;
    if (canvas.height !== backingHeight) canvas.height = backingHeight;

    themeRef.current ??= readTheme();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height * GROUND_LINE);
    drawCat(
      ctx,
      scene.params,
      { ...scene.view, ...POSE_VIEW[scene.pose], phase: phaseRef.current },
      paintFor(themeRef.current, scene.details),
    );
  }, []);

  // Layout effect: the canvas height may just have changed, and the new
  // drawing should be on screen in the same frame.
  useLayoutEffect(() => {
    sceneRef.current = { params: shownParams, view, pose, details };
    draw();
  }, [shownParams, view, pose, details, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setStageWidth(Math.round(width));
      draw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    if (!animating) return;
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;
      if (walking) phaseRef.current = (phaseRef.current + dt / WALK_CYCLE_SECONDS) % 1;
      if (turning) {
        // The state change redraws through the layout effect above.
        setView((current) => ({
          ...current,
          heading: (current.heading + TURN_DEGREES_PER_SECOND * dt) % 360,
        }));
      } else {
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animating, walking, turning, draw]);

  const setParam = (key: keyof CatParams, value: number) =>
    setParams((current) => ({ ...current, [key]: value }));

  const changeTurning = (on: boolean) => {
    setTurning(on);
    // Switching it on is an explicit request to move.
    if (on) setPlayChoice(true);
  };

  const valuesText = () =>
    JSON.stringify(
      {
        params: shownParams,
        view: { pose, heading: wholeDegrees(view.heading), headTurn: view.headTurn },
        backdrop,
        details,
      },
      null,
      2,
    );

  const copyValues = async () => {
    const text = valuesText();
    // Empty first, so that the same message is announced again on a second copy.
    setStatus("");
    try {
      await navigator.clipboard.writeText(text);
      setFallbackText(null);
      setStatus("Values copied");
    } catch {
      setFallbackText(text);
      setStatus("The clipboard is not available. The values are shown below to copy by hand.");
    }
  };

  const reset = () => {
    setParams(DEFAULT_PARAMS);
    setView(DEFAULT_VIEW_SETTINGS);
    setPose(DEFAULT_POSE);
    setTurning(false);
    setBackdrop(DEFAULT_BACKDROP);
    setDetails(DEFAULT_DETAILS);
    phaseRef.current = DEFAULT_PHASE;
    setFallbackText(null);
    setStatus("Every value is back to its default");
  };

  return (
    <div className={styles.lab}>
      <h1 className={styles.title}>Cat lab</h1>
      <p className={styles.intro}>
        Development only. Tune the cat by eye, then copy the values.
      </p>

      <div className={styles.layout}>
        <div className={styles.stage}>
          {backdrop === "wordmark" && (
            <div className={styles.backdrop} aria-hidden="true">
              <span className={styles.wordmark}>DENNIS</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{ height: `${canvasHeight}px` }}
            aria-hidden="true"
          />
        </div>

        <div className={styles.controls}>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Pose and direction</legend>
            <RadioGroup
              legend="Pose"
              name={id("pose")}
              options={POSES}
              value={pose}
              onChange={setPose}
              nested
            />
            <RangeField
              id={id("heading")}
              label="Heading"
              value={wholeDegrees(view.heading)}
              min={0}
              max={359}
              step={1}
              unit="°"
              onChange={(heading) => setView((current) => ({ ...current, heading }))}
            />
            <Checkbox
              id={id("turning")}
              label="Turn continuously"
              checked={turning}
              onChange={changeTurning}
            />
            <RangeField
              id={id("head-turn")}
              label="Head turn"
              value={view.headTurn}
              min={-90}
              max={90}
              step={1}
              unit="°"
              onChange={(headTurn) => setView((current) => ({ ...current, headTurn }))}
            />
          </fieldset>

          {CONTROL_GROUPS.map((group) => (
            <fieldset key={group} className={styles.group}>
              <legend className={styles.legend}>{group}</legend>
              {PARAM_CONTROLS.filter((control) => control.group === group).map((control) => (
                <ParamField
                  key={control.key}
                  id={id(control.key)}
                  control={control}
                  value={shownParams[control.key]}
                  maxCap={control.key === "size" ? sizeMax : Infinity}
                  onChange={(value) => setParam(control.key, value)}
                />
              ))}
            </fieldset>
          ))}

          <RadioGroup
            legend="Backdrop"
            name={id("backdrop")}
            options={BACKDROPS}
            value={backdrop}
            onChange={setBackdrop}
          />

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Eyes and ears</legend>
            <RadioGroup
              legend="Eye colour"
              name={id("eyes")}
              options={EYE_COLOURS}
              value={details.eyes}
              onChange={(eyes) => setDetails((current) => ({ ...current, eyes }))}
              nested
            />
            <div className={styles.option}>
              <input
                id={id("custom-eye")}
                type="color"
                value={details.customEye}
                onChange={(event) =>
                  // Picking a colour is a request to see it.
                  setDetails((current) => ({
                    ...current,
                    customEye: event.target.value,
                    eyes: "custom",
                  }))
                }
              />
              <label htmlFor={id("custom-eye")}>Custom eye colour</label>
            </div>
            <Checkbox
              id={id("pupils")}
              label="Pupils"
              checked={details.pupils}
              onChange={(pupils) => setDetails((current) => ({ ...current, pupils }))}
            />
            <RadioGroup
              legend="Ear detail"
              name={id("ears")}
              options={EAR_DETAILS}
              value={details.ears}
              onChange={(ears) => setDetails((current) => ({ ...current, ears }))}
              nested
            />
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Motion</legend>
            <div>
              <button
                type="button"
                className={styles.button}
                onClick={() => setPlayChoice(!playing)}
                aria-describedby={id("motion-hint")}
              >
                {playing ? "Pause" : "Play"}
              </button>
              <p id={id("motion-hint")} className={styles.hint}>
                Plays the walk and the continuous turn.
              </p>
            </div>
            <Checkbox
              id={id("skeleton")}
              label="Show skeleton"
              checked={view.showSkeleton ?? false}
              onChange={(showSkeleton) => setView((current) => ({ ...current, showSkeleton }))}
            />
          </fieldset>

          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={() => void copyValues()}>
              Copy values
            </button>
            <button type="button" className={styles.button} onClick={reset}>
              Reset
            </button>
          </div>
          <p role="status" className={styles.status}>
            {status}
          </p>
          {fallbackText !== null && (
            <div className={styles.fallback}>
              <label htmlFor={id("fallback")} className={styles.label}>
                Current values
              </label>
              <textarea
                id={id("fallback")}
                className={styles.textarea}
                value={fallbackText}
                readOnly
                rows={Math.min(24, fallbackText.split("\n").length)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type RangeFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
};

function RangeField({ id, label, value, min, max, step, unit, onChange }: RangeFieldProps) {
  const shown = value.toFixed(decimalsOf(step));
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <span className={styles.value}>
        {shown}
        {unit}
      </span>
      <input
        id={id}
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={unit ? `${shown} ${UNIT_NAMES[unit] ?? unit}` : undefined}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type ParamFieldProps = {
  id: string;
  control: ParamControl;
  value: number;
  maxCap: number;
  onChange: (value: number) => void;
};

function ParamField({ id, control, value, maxCap, onChange }: ParamFieldProps) {
  const max = Math.max(control.min, Math.min(control.max, maxCap));
  return (
    <RangeField
      id={id}
      label={control.label}
      value={Math.min(value, max)}
      min={control.min}
      max={max}
      step={control.step}
      unit={control.unit}
      onChange={onChange}
    />
  );
}

type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <div className={styles.option}>
      <input
        id={id}
        type="checkbox"
        className={styles.check}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

type RadioGroupProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** A group inside another fieldset: lighter frame. */
  nested?: boolean;
};

function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  nested = false,
}: RadioGroupProps<T>) {
  return (
    <fieldset className={nested ? styles.nestedGroup : styles.group}>
      <legend className={nested ? styles.label : styles.legend}>{legend}</legend>
      {options.map((option) => {
        const optionId = `${name}-${option.value}`;
        return (
          <div key={option.value} className={styles.option}>
            <input
              id={optionId}
              type="radio"
              className={styles.check}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={optionId}>{option.label}</label>
          </div>
        );
      })}
    </fieldset>
  );
}
