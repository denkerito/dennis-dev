// What the cat does: a state machine stepped with elapsed time.
//
// Pure: no DOM, no timers, and its only randomness comes from the function it
// is given. Positions are on the ground, in whatever unit the caller uses,
// with x to the viewer's right and y toward the viewer; the caller converts
// to and from the screen. Angles are degrees, with headings as in `CatView`:
// 0 faces the viewer, 90 the viewer's right, 180 away, 270 the viewer's left.

import type { CatView } from "./params";

export type Point = { x: number; y: number };
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

export type BehaviourConfig = {
  /** The cat's length on the ground: every distance below is measured in it. */
  bodyLength: number;
  /** Ground speed at full stride, per second. Must match the gait, or the paws slide. */
  walkSpeed: number;
  /** Seconds one walk cycle lasts. */
  cycleSeconds: number;
  /** Where the cat waits. */
  home: Point;
};

export type BehaviourInput = {
  /** Where the cat should go and look, or null when there is nothing to follow. */
  target: Point | null;
  /** The area the cat's ground point must stay inside. */
  bounds: Bounds;
};

export type Mode = "seated" | "rising" | "turning" | "walking" | "standing" | "sitting";

export type CatState = {
  mode: Mode;
  x: number;
  y: number;
  heading: number;
  headTurn: number;
  sit: number;
  step: number;
  stride: number;
  phase: number;
  eyeOpen: number;
  tailFlick: number;
  /** Seconds spent in the current mode. */
  modeTime: number;
  /** After getting up: walk to the target, or only turn to face it. */
  intent: "walk" | "face";
  /** Seconds the target has been asking the seated cat to get up. */
  urge: number;
  /** Seconds since the cat last moved, idle gestures aside. */
  stillFor: number;
  /** When, on the `stillFor` clock, the next blink and tail flick start. -1 is "not scheduled yet". */
  blinkAt: number;
  flickAt: number;
  /** Progress of the gesture under way, 0 to 1, or -1 when there is none. */
  blink: number;
  flick: number;
  /** Which way the current tail flick sweeps. */
  flickSide: number;
  /** True when further steps change nothing until the input changes. */
  atRest: boolean;
};

// Distances, in body lengths.
/** The seated cat gets up for a target farther than this. */
export const GET_UP_DISTANCE = 2;
/** The walking cat stops this far from the target. */
export const STOP_DISTANCE = 1;
/** A target the cat cannot get this much closer to is not worth getting up for. */
const WORTH_WALKING = 0.3;
/** Nearer than this the target is on top of the cat and gives no direction. */
const TOO_CLOSE = 0.3;

// Times, in seconds.
/** How long a far target must persist before the seated cat gets up. */
export const GET_UP_DELAY = 0.25;
/** How long a target behind the seated cat must persist before it turns round. */
export const BEHIND_DELAY = 0.6;
export const RISE_SECONDS = 0.25;
export const SIT_SECONDS = 0.4;
/** Pause on its feet before sitting, so a target that moves on is followed without sitting first. */
export const STAND_PAUSE = 0.45;
const STRIDE_RAMP = 0.18;
const STEP_RAMP = 0.12;
/** Idle gestures happen only this long after the cat last moved. */
export const IDLE_SECONDS = 5;
export const BLINK_SECONDS = 0.16;
export const FLICK_SECONDS = 0.55;
/** Steps come in whole frames, so a gesture is given this much room to end inside the window. */
const FRAME_SLACK = 0.1;

// Angles in degrees, rates in degrees per second.
export const HEAD_LIMIT = 90;
const WALKING_HEAD_LIMIT = 50;
const HEAD_RATE = 320;
export const TURN_RATE = 220;
export const STEER_RATE = 170;
/** The cat turns on the spot before walking when it is further off than this. */
export const FACING_TOLERANCE = 25;
const FACING_DONE = 3;
/** Beyond the head's reach: the cat has to turn its body. */
const BEHIND_ANGLE = 100;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const wrap180 = (a: number): number => ((((a + 180) % 360) + 360) % 360) - 180;
const wrap360 = (a: number): number => ((a % 360) + 360) % 360;
const approach = (v: number, to: number, by: number): number =>
  v < to ? Math.min(to, v + by) : Math.max(to, v - by);

function clampToBounds(p: Point, b: Bounds): Point {
  // A degenerate area (narrower than its margins) collapses to its middle.
  const x = b.minX <= b.maxX ? clamp(p.x, b.minX, b.maxX) : (b.minX + b.maxX) / 2;
  const y = b.minY <= b.maxY ? clamp(p.y, b.minY, b.maxY) : (b.minY + b.maxY) / 2;
  return { x, y };
}

/** The cat as it waits: seated at home, facing the viewer, at rest. */
export function initialState(config: BehaviourConfig, bounds: Bounds): CatState {
  const home = clampToBounds(config.home, bounds);
  return {
    mode: "seated",
    x: home.x,
    y: home.y,
    heading: 0,
    headTurn: 0,
    sit: 1,
    step: 0,
    stride: 0,
    phase: 0,
    eyeOpen: 1,
    tailFlick: 0,
    modeTime: 0,
    intent: "walk",
    urge: 0,
    stillFor: IDLE_SECONDS,
    blinkAt: Infinity,
    flickAt: Infinity,
    blink: -1,
    flick: -1,
    flickSide: 1,
    atRest: true,
  };
}

/** Advances the cat by `dt` seconds. Returns a new state; the given one is not changed. */
export function step(
  prev: CatState,
  input: BehaviourInput,
  dt: number,
  config: BehaviourConfig,
  random: () => number,
): CatState {
  const s: CatState = { ...prev };
  const B = config.bodyLength;
  const { target, bounds } = input;
  let moved = false;

  const enter = (mode: Mode) => {
    s.mode = mode;
    s.modeTime = 0;
  };

  // Keep inside the area even if it shrank under the cat.
  const inside = clampToBounds(s, bounds);
  if (inside.x !== s.x || inside.y !== s.y) {
    s.x = inside.x;
    s.y = inside.y;
    moved = true;
  }

  s.modeTime += dt;

  // Where the target is, seen from the cat.
  const dx = target ? target.x - s.x : 0;
  const dy = target ? target.y - s.y : 0;
  const distance = Math.hypot(dx, dy);
  const hasDirection = target !== null && distance > TOO_CLOSE * B;
  const off = hasDirection ? wrap180((Math.atan2(dx, dy) * 180) / Math.PI - s.heading) : 0;
  // The nearest the cat can actually get to the target.
  const goal = target ? clampToBounds(target, bounds) : null;
  const toGoal = goal ? Math.hypot(goal.x - s.x, goal.y - s.y) : 0;
  const far = target !== null && distance > GET_UP_DISTANCE * B && toGoal > WORTH_WALKING * B;
  // The cat slows down over a short distance, so it starts stopping that much early.
  const slowing = (config.walkSpeed * STRIDE_RAMP) / 2;
  const arrived =
    target === null || distance <= STOP_DISTANCE * B + slowing || toGoal <= 0.08 * B + slowing;
  // When it walks, it walks toward the nearest point it can reach, so it never
  // pushes against the edge of its area. Its head still looks at the target itself.
  const walkOff =
    goal && toGoal > TOO_CLOSE * B
      ? wrap180((Math.atan2(goal.x - s.x, goal.y - s.y) * 180) / Math.PI - s.heading)
      : off;

  // The head looks at the target, as far as the neck allows.
  const headLimit = s.mode === "walking" || s.mode === "turning" ? WALKING_HEAD_LIMIT : HEAD_LIMIT;
  const wantHead = target === null ? 0 : hasDirection ? clamp(off, -headLimit, headLimit) : s.headTurn;
  const head = approach(s.headTurn, wantHead, HEAD_RATE * dt);
  if (Math.abs(head - s.headTurn) > 1e-6) moved = true;
  s.headTurn = head;

  const stepLegs = (stride: number) => {
    s.step = approach(s.step, 1, dt / STEP_RAMP);
    s.stride = approach(s.stride, stride, dt / STRIDE_RAMP);
    s.phase = (s.phase + dt / config.cycleSeconds) % 1;
  };
  // Which way the body should face: where it is going, or the target it only looks at.
  const bodyOff = () => (s.intent === "walk" ? walkOff : off);
  const turnBody = (rate: number) => {
    const want = bodyOff();
    const turn = clamp(want, -rate * dt, rate * dt);
    s.heading = wrap360(s.heading + turn);
    return Math.abs(want - turn);
  };
  // Moves the body forward by what the legs cover, so the paws on the ground do
  // not slide. Returns false, without moving, if that would leave the area.
  const advance = (): boolean => {
    const heading = (s.heading * Math.PI) / 180;
    const travel = config.walkSpeed * s.stride * dt;
    const next = { x: s.x + Math.sin(heading) * travel, y: s.y + Math.cos(heading) * travel };
    const kept = clampToBounds(next, bounds);
    if (Math.abs(kept.x - next.x) > 1e-9 || Math.abs(kept.y - next.y) > 1e-9) return false;
    s.x = next.x;
    s.y = next.y;
    return true;
  };
  const setOff = () => {
    if (!hasDirection) return enter("standing");
    if (Math.abs(bodyOff()) > FACING_TOLERANCE) return enter("turning");
    if (s.intent === "walk" && !arrived) return enter("walking");
    return enter("standing");
  };

  // Arriving starts the halt in this same step, so the legs never step without the body.
  if (s.mode === "walking" && arrived) enter("standing");

  switch (s.mode) {
    case "seated": {
      s.sit = 1;
      s.step = 0;
      s.stride = 0;
      const behind = hasDirection && Math.abs(off) > BEHIND_ANGLE;
      if (far || behind) {
        // A target behind the cat takes longer to get it up than one far away.
        s.urge += far ? dt : (dt * GET_UP_DELAY) / BEHIND_DELAY;
        if (s.urge >= GET_UP_DELAY) {
          s.intent = far ? "walk" : "face";
          s.urge = 0;
          enter("rising");
        }
      } else {
        s.urge = 0;
      }
      break;
    }
    case "rising": {
      moved = true;
      s.sit = Math.max(0, 1 - s.modeTime / RISE_SECONDS);
      if (s.sit === 0) setOff();
      break;
    }
    case "turning": {
      moved = true;
      stepLegs(0);
      if (!hasDirection) {
        enter("standing");
        break;
      }
      const left = turnBody(TURN_RATE);
      if (left <= FACING_DONE) enter(s.intent === "walk" && !arrived ? "walking" : "standing");
      break;
    }
    case "walking": {
      moved = true;
      stepLegs(1);
      turnBody(STEER_RATE);
      // At the edge of the area the legs stop with the body rather than walk on the spot.
      if (!advance()) {
        s.stride = 0;
        enter("standing");
      }
      break;
    }
    case "standing": {
      // Come to a halt: shorten the stride, then put the paws down.
      if (s.stride > 0 || s.step > 0) {
        moved = true;
        s.stride = approach(s.stride, 0, dt / STRIDE_RAMP);
        // While the steps shorten the body still covers what they cover.
        if (s.stride > 0 && !advance()) s.stride = 0;
        if (s.stride === 0) s.step = approach(s.step, 0, dt / STEP_RAMP);
        if (s.step > 0) s.phase = (s.phase + dt / config.cycleSeconds) % 1;
      }
      if (s.modeTime >= STAND_PAUSE && s.step === 0) {
        if (far) {
          s.intent = "walk";
          setOff();
        } else {
          enter("sitting");
        }
      }
      break;
    }
    case "sitting": {
      moved = true;
      s.sit = Math.min(1, s.modeTime / SIT_SECONDS);
      if (s.sit === 1) {
        s.urge = 0;
        enter("seated");
      }
      break;
    }
  }

  // Idle gestures: only while seated and still, and only for a few seconds.
  if (moved) {
    s.stillFor = 0;
    s.blinkAt = -1;
    s.flickAt = -1;
  } else {
    s.stillFor += dt;
    if (s.mode === "seated") {
      if (s.blinkAt === -1) {
        s.blinkAt = 0.5 + random() * 1.5;
        s.flickAt = 1 + random() * 2;
      }
      if (s.blink < 0 && s.stillFor >= s.blinkAt) {
        s.blink = 0;
        s.blinkAt = Infinity;
      }
      if (s.flick < 0 && s.stillFor >= s.flickAt) {
        s.flick = 0;
        s.flickSide = random() < 0.5 ? -1 : 1;
        s.flickAt = Infinity;
      }
    }
  }
  if (s.blink >= 0) {
    s.blink += dt / BLINK_SECONDS;
    if (s.blink >= 1) {
      s.blink = -1;
      s.eyeOpen = 1;
      // Blink again later, if it would still finish inside the idle window.
      const again = s.stillFor + 1.2 + random() * 2;
      if (again + BLINK_SECONDS + FRAME_SLACK <= IDLE_SECONDS) s.blinkAt = again;
    } else {
      s.eyeOpen = 1 - Math.sin(Math.PI * s.blink);
    }
  }
  if (s.flick >= 0) {
    s.flick += dt / FLICK_SECONDS;
    if (s.flick >= 1) {
      s.flick = -1;
      s.tailFlick = 0;
    } else {
      s.tailFlick = Math.sin(Math.PI * s.flick) * s.flickSide;
    }
  }
  // A gesture that could not finish inside the window does not start.
  if (s.blinkAt !== -1 && s.blinkAt + BLINK_SECONDS + FRAME_SLACK > IDLE_SECONDS) s.blinkAt = Infinity;
  if (s.flickAt !== -1 && s.flickAt + FLICK_SECONDS + FRAME_SLACK > IDLE_SECONDS) s.flickAt = Infinity;

  const gesturesOver =
    s.blink < 0 && s.flick < 0 && s.blinkAt === Infinity && s.flickAt === Infinity;
  // Not at rest while the target still asks for something, even in a step of no duration.
  const wanted =
    far || (hasDirection && Math.abs(off) > BEHIND_ANGLE) || Math.abs(wantHead - s.headTurn) > 1e-6;
  s.atRest = s.mode === "seated" && !moved && !wanted && s.urge === 0 && gesturesOver;
  return s;
}

/** The part of a state that the drawing needs. */
export function toView(s: CatState): CatView {
  return {
    heading: s.heading,
    headTurn: s.headTurn,
    sit: s.sit,
    step: s.step,
    stride: s.stride,
    phase: s.phase,
    eyeOpen: s.eyeOpen,
    tailFlick: s.tailFlick,
  };
}
