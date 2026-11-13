// Puts the cat on the page: a small canvas that moves inside an area and is
// driven by the behaviour in behaviour.ts.
//
// This is the only module in `src/mascot/` that touches the DOM. It knows
// nothing about the hero: it is given an element to stay inside and follows
// the pointer while the pointer is over that element.

import {
  type BehaviourConfig,
  type Bounds,
  type CatState,
  type Point,
  initialState,
  step,
  toView,
} from "./behaviour";
import { drawCat } from "./draw";
import { walkSpeed } from "./gait";
import { DEFAULT_PARAMS, WALK_CYCLE_SECONDS, type CatPaint, type CatParams } from "./params";
import { bodyLength, standingHeight } from "./skeleton";

export type FollowerOptions = {
  /** The element the cat stays inside. The canvas is added to it. */
  area: HTMLElement;
  /** The cat's size in CSS pixels (its standing height). Read again whenever the area resizes. */
  size: () => number;
  /** Where the cat waits, as fractions of the area's width and height. */
  home: Point;
  /**
   * A line in the viewport the cat must stay below, for example the bottom of
   * a sticky header. Read again on scroll and resize. Defaults to none.
   */
  ceiling?: () => number;
};

// How far the drawing extends from the cat's ground point, as multiples of its size.
const REACH = { side: 1.05, up: 1.2, down: 0.65 };
// How close the ground point may come to each edge of the area, so the whole cat stays inside.
const MARGIN = { side: 0.8, up: 1.15, down: 0.4 };
/** Longest step taken in one frame, so a stalled tab does not make the cat leap. */
const MAX_FRAME_SECONDS = 0.05;
const FADE_SECONDS = 0.3;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Starts the cat in the given area. Returns a function that removes it. */
export function mountFollower(options: FollowerOptions): () => void {
  const { area } = options;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  // Narrowed once, so the closures below do not have to repeat the check.
  const ctx: CanvasRenderingContext2D = context;

  const reducedMotion = window.matchMedia(REDUCED_MOTION);
  canvas.style.cssText =
    "position:absolute;left:0;top:0;pointer-events:none;opacity:0;will-change:transform;";
  if (!reducedMotion.matches) canvas.style.transition = `opacity ${FADE_SECONDS}s`;
  area.appendChild(canvas);

  const theme = getComputedStyle(document.documentElement);
  const token = (name: string) => theme.getPropertyValue(name).trim();
  const paper = token("--color-paper");
  const mascot = token("--color-mascot");
  const paint: CatPaint = { body: mascot, detail: paper, eye: paper, pupil: mascot, earInner: paper };

  let params: CatParams = DEFAULT_PARAMS;
  // The camera looks down at an angle, so a step away from the viewer covers
  // less screen than a step sideways: ground y is screen y divided by this.
  let depth = 1;
  let config: BehaviourConfig = { bodyLength: 1, walkSpeed: 1, cycleSeconds: 1, home: { x: 0, y: 0 } };
  let bounds: Bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  let state: CatState = initialState(config, bounds);
  let origin = { x: 0, y: 0 };
  let dpr = 1;

  let pointer: Point | null = null;
  let target: Point | null = null;
  let hasLeftHome = false;
  let inView = true;
  let frame = 0;
  let last = 0;
  let drawn = "";

  /** Sizes everything from the area as it is now. */
  function measure(): void {
    const size = options.size();
    params = { ...DEFAULT_PARAMS, size };
    depth = Math.sin((params.elevation * Math.PI) / 180);
    const scale = size / standingHeight(params);
    const width = area.clientWidth;
    const height = area.clientHeight;

    config = {
      bodyLength: bodyLength(params) * scale,
      walkSpeed: walkSpeed(params) * scale,
      cycleSeconds: WALK_CYCLE_SECONDS,
      home: { x: options.home.x * width, y: (options.home.y * height) / depth },
    };

    const top = area.getBoundingClientRect().top;
    const ceiling = Math.max(0, (options.ceiling?.() ?? -Infinity) - top);
    bounds = {
      minX: MARGIN.side * size,
      maxX: width - MARGIN.side * size,
      minY: (ceiling + MARGIN.up * size) / depth,
      maxY: (height - MARGIN.down * size) / depth,
    };

    dpr = window.devicePixelRatio || 1;
    const w = Math.ceil(REACH.side * 2 * size);
    const h = Math.ceil((REACH.up + REACH.down) * size);
    origin = { x: w / 2, y: REACH.up * size };
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      drawn = "";
    }
    // A cat that has not been anywhere yet waits at the spot for this size of area.
    if (!hasLeftHome) state = initialState(config, bounds);
  }

  /** Where the pointer is on the ground of the area, or null when it is not over it. */
  function locate(): void {
    target = null;
    if (!pointer) return;
    const rect = area.getBoundingClientRect();
    const x = pointer.x - rect.left;
    const y = pointer.y - rect.top;
    const ceiling = Math.max(0, (options.ceiling?.() ?? -Infinity) - rect.top);
    if (x < 0 || x > rect.width || y < ceiling || y > rect.height) return;
    target = { x, y: y / depth };
  }

  function render(): void {
    const x = state.x - origin.x;
    const y = state.y * depth - origin.y;
    canvas.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    const view = toView(state);
    // Walking changes the pose every frame, but a seated cat is redrawn only when something differs.
    const signature = Object.values(view)
      .map((value) => (typeof value === "number" ? value.toFixed(3) : String(value)))
      .join(",");
    if (signature === drawn) return;
    drawn = signature;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.translate(origin.x, origin.y);
    drawCat(ctx, params, view, paint);
    canvas.style.opacity = "1";
  }

  const canAnimate = () =>
    inView && document.visibilityState === "visible" && !reducedMotion.matches;

  function tick(now: number): void {
    frame = 0;
    if (!canAnimate()) return;
    // The first frame after a rest has no previous one to measure from.
    const dt = last === 0 ? 1 / 60 : Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
    last = now;
    state = step(state, { target, bounds }, dt, config, Math.random);
    if (state.mode !== "seated") hasLeftHome = true;
    render();
    // At rest nothing will change until the pointer does: stop asking for frames.
    if (state.atRest) last = 0;
    else frame = requestAnimationFrame(tick);
  }

  /** Something changed: make sure the loop is running, if it is allowed to. */
  function wake(): void {
    if (frame === 0 && canAnimate()) frame = requestAnimationFrame(tick);
  }

  function sleep(): void {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  /** The still, seated cat shown to visitors who ask for reduced motion. */
  function showStill(): void {
    sleep();
    hasLeftHome = false;
    state = initialState(config, bounds);
    render();
  }

  function onPointerMove(event: PointerEvent): void {
    // A finger is not a pointer to follow: only a mouse or a pen hovers.
    if (event.pointerType === "touch") return;
    pointer = { x: event.clientX, y: event.clientY };
    locate();
    wake();
  }

  function onPointerGone(): void {
    pointer = null;
    target = null;
    wake();
  }

  function onScroll(): void {
    // Scrolling moves the area under a pointer that has not moved.
    measure();
    locate();
    wake();
  }

  function onResize(): void {
    measure();
    locate();
    if (reducedMotion.matches) showStill();
    else {
      render();
      wake();
    }
  }

  /** The pointer is listened to only while the cat is allowed to move. */
  function followPointer(on: boolean): void {
    if (on) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerGone);
    } else {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerGone);
      pointer = null;
      target = null;
    }
  }

  function onMotionPreference(): void {
    canvas.style.transition = reducedMotion.matches ? "" : `opacity ${FADE_SECONDS}s`;
    followPointer(!reducedMotion.matches);
    if (reducedMotion.matches) showStill();
    else wake();
  }

  function onVisibility(): void {
    if (canAnimate()) wake();
    else sleep();
  }

  const resizeObserver = new ResizeObserver(onResize);
  const viewObserver = new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1]?.isIntersecting ?? true;
    onVisibility();
  });

  measure();
  render();
  resizeObserver.observe(area);
  viewObserver.observe(area);
  followPointer(!reducedMotion.matches);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotion.addEventListener("change", onMotionPreference);

  return () => {
    sleep();
    resizeObserver.disconnect();
    viewObserver.disconnect();
    followPointer(false);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    reducedMotion.removeEventListener("change", onMotionPreference);
    canvas.remove();
  };
}
