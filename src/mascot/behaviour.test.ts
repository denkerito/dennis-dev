import { describe, expect, it } from "vitest";

import {
  type BehaviourConfig,
  type BehaviourInput,
  type Bounds,
  type CatState,
  FACING_TOLERANCE,
  GET_UP_DELAY,
  HEAD_LIMIT,
  IDLE_SECONDS,
  type Point,
  STEER_RATE,
  TURN_RATE,
  initialState,
  step,
  toView,
} from "./behaviour";

// These tests state the limits of the spec (mascot-behaviour), not the exact
// values the implementation happens to produce. Every scenario runs through
// `simulate`, which also checks the general invariants at every step.

// ---------------------------------------------------------------------------
// Fixtures

const DT = 1 / 60;
const EPS = 1e-9;

const CONFIG: BehaviourConfig = {
  bodyLength: 100,
  walkSpeed: 120,
  cycleSeconds: 0.36,
  home: { x: 800, y: 500 },
};
const BOUNDS: Bounds = { minX: 100, maxX: 1000, minY: 100, maxY: 600 };
const B = CONFIG.bodyLength;
const HOME = CONFIG.home;
/** Far to the left of the waiting spot: six body lengths away. */
const FAR_LEFT: Point = { x: 200, y: 500 };
const MAX_TURN_RATE = Math.max(TURN_RATE, STEER_RATE);

// ---------------------------------------------------------------------------
// Geometry

const rad = (deg: number): number => (deg * Math.PI) / 180;
const wrap180 = (a: number): number => ((((a + 180) % 360) + 360) % 360) - 180;
const angleBetween = (a: number, b: number): number => Math.abs(wrap180(a - b));
const dist = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
/** Heading from `from` toward `to`, with the module's convention: 0 is +y, 90 is +x. */
const bearing = (from: Point, to: Point): number =>
  (((Math.atan2(to.x - from.x, to.y - from.y) * 180) / Math.PI) % 360 + 360) % 360;
/** A point `lengths` body lengths from the cat, `offset` degrees off its heading. */
const fromCat = (cat: CatState, offset: number, lengths: number): Point => ({
  x: cat.x + Math.sin(rad(cat.heading + offset)) * lengths * B,
  y: cat.y + Math.cos(rad(cat.heading + offset)) * lengths * B,
});

// ---------------------------------------------------------------------------
// Deterministic randomness: a 32-bit linear congruential generator.

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Simulation

type Frame = {
  /** Seconds since the start of the run, at the end of the step that produced this state. */
  t: number;
  state: CatState;
  /** The input that produced this state; null for the starting state. */
  input: BehaviourInput | null;
};

type TargetScript = Point | null | ((t: number, cat: CatState) => Point | null);
type BoundsScript = Bounds | ((t: number) => Bounds);

type Scenario = {
  seconds: number;
  target: TargetScript;
  bounds?: BoundsScript;
  config?: BehaviourConfig;
  start?: CatState;
  seed?: number;
};

const sameBounds = (a: Bounds, b: Bounds): boolean =>
  a.minX === b.minX && a.maxX === b.maxX && a.minY === b.minY && a.maxY === b.maxY;
const sameTarget = (a: Point | null, b: Point | null): boolean =>
  a === null || b === null ? a === b : a.x === b.x && a.y === b.y;
const sameInput = (a: BehaviourInput, b: BehaviourInput): boolean =>
  sameTarget(a.target, b.target) && sameBounds(a.bounds, b.bounds);

/** Everything on the cat that a visitor can see: its pose and where it is. */
const observable = (s: CatState): Record<string, unknown> => ({ ...toView(s), x: s.x, y: s.y });
const sameObservable = (a: CatState, b: CatState): boolean => {
  const oa = observable(a);
  const ob = observable(b);
  return Object.keys(oa).every((k) => Object.is(oa[k], ob[k]));
};

function stateProblems(s: CatState, bounds: Bounds): string[] {
  const problems: string[] = [];
  for (const [key, value] of Object.entries(s)) {
    if (typeof value === "number" && Number.isNaN(value)) problems.push(`${key} is NaN`);
  }
  for (const key of ["sit", "step", "stride", "eyeOpen"] as const) {
    if (!(s[key] >= 0 && s[key] <= 1)) problems.push(`${key} = ${s[key]} is outside [0, 1]`);
  }
  if (!(Math.abs(s.tailFlick) <= 1)) problems.push(`tailFlick = ${s.tailFlick} is outside [-1, 1]`);
  if (!(s.phase >= 0 && s.phase < 1)) problems.push(`phase = ${s.phase} is outside [0, 1)`);
  if (!(s.heading >= 0 && s.heading < 360)) problems.push(`heading = ${s.heading} is outside [0, 360)`);
  if (!(Math.abs(s.headTurn) <= HEAD_LIMIT)) problems.push(`headTurn = ${s.headTurn} is past HEAD_LIMIT`);
  const inside =
    s.x >= bounds.minX - EPS &&
    s.x <= bounds.maxX + EPS &&
    s.y >= bounds.minY - EPS &&
    s.y <= bounds.maxY + EPS;
  if (!inside) problems.push(`ground point (${s.x}, ${s.y}) is outside the bounds`);
  return problems;
}

function motionProblems(prev: Frame, next: CatState, input: BehaviourInput, config: BehaviourConfig): string[] {
  const problems: string[] = [];
  const a = prev.state;
  // A shrinking area may push the cat back inside; that is not a step of its own.
  const boundsChanged = prev.input !== null && !sameBounds(prev.input.bounds, input.bounds);
  const moved = dist(a, next);
  if (!boundsChanged && moved > config.walkSpeed * DT + EPS) {
    problems.push(`moved ${moved} in one step: faster than walking, or a jump`);
  }
  const turned = angleBetween(a.heading, next.heading);
  if (turned > MAX_TURN_RATE * DT + EPS) problems.push(`heading turned ${turned} degrees in one step`);
  if (a.atRest && prev.input !== null && sameInput(prev.input, input) && !sameObservable(a, next)) {
    problems.push("changed while at rest although the input did not change");
  }
  return problems;
}

/** Steps the machine at a fixed `DT`, checking the general invariants at every step. */
function simulate(scenario: Scenario): Frame[] {
  const config = scenario.config ?? CONFIG;
  const boundsScript = scenario.bounds ?? BOUNDS;
  const boundsAt = (t: number): Bounds => (typeof boundsScript === "function" ? boundsScript(t) : boundsScript);
  const targetScript = scenario.target;
  const targetAt = (t: number, cat: CatState): Point | null =>
    typeof targetScript === "function" ? targetScript(t, cat) : targetScript;
  const random = seededRandom(scenario.seed ?? 1);

  let state = scenario.start ?? initialState(config, boundsAt(0));
  const startProblems = stateProblems(state, boundsAt(0));
  if (startProblems.length > 0) throw new Error(`At the start: ${startProblems.join("; ")}`);
  const frames: Frame[] = [{ t: 0, state, input: null }];

  const steps = Math.round(scenario.seconds / DT);
  for (let i = 1; i <= steps; i++) {
    const t = (i - 1) * DT;
    const input: BehaviourInput = { target: targetAt(t, state), bounds: boundsAt(t) };
    const given = { ...state };
    const next = step(state, input, DT, config, random);
    const problems = [
      ...(Object.keys(given) as (keyof CatState)[])
        .filter((key) => !Object.is(given[key], state[key]))
        .map((key) => `step() changed the given state's ${key}`),
      ...stateProblems(next, input.bounds),
      ...motionProblems(frames[i - 1], next, input, config),
    ];
    if (problems.length > 0) throw new Error(`After ${(i * DT).toFixed(3)} s: ${problems.join("; ")}`);
    frames.push({ t: i * DT, state: next, input });
    state = next;
  }
  return frames;
}

/** A target script that switches from `first` to a second target once the cat has walked for a while. */
function retargetMidWalk(first: Point, second: (cat: CatState) => Point | null, walkedFor = 0.5) {
  let switched = false;
  let next: Point | null = null;
  return (_t: number, cat: CatState): Point | null => {
    if (!switched && cat.mode === "walking" && cat.modeTime >= walkedFor) {
      switched = true;
      next = second(cat);
    }
    return switched ? next : first;
  };
}

const last = (frames: Frame[]): Frame => frames[frames.length - 1];
const movedAt = (frames: Frame[], i: number): number => dist(frames[i - 1].state, frames[i].state);
/** Index of the first frame whose position differs from the one before, or -1. */
const firstMove = (frames: Frame[]): number => frames.findIndex((_, i) => i > 0 && movedAt(frames, i) > 0);
/** Index of the last frame whose position differs from the one before, or -1. */
function lastMove(frames: Frame[]): number {
  for (let i = frames.length - 1; i > 0; i--) if (movedAt(frames, i) > 0) return i;
  return -1;
}
/** Index of the first frame produced by a target other than `first`. */
const switchIndex = (frames: Frame[], first: Point): number =>
  frames.findIndex((f) => f.input !== null && f.input.target !== first);
const isGesture = (s: CatState): boolean => s.eyeOpen < 1 || s.tailFlick !== 0;
const isSeated = (s: CatState): boolean => s.mode === "seated" && s.sit === 1;

// ---------------------------------------------------------------------------

describe("Waiting seated", () => {
  it("starts seated at its waiting spot inside the hero, facing the viewer, at rest", () => {
    const cat = initialState(CONFIG, BOUNDS);
    expect({ x: cat.x, y: cat.y }).toEqual(HOME);
    expect(isSeated(cat)).toBe(true);
    expect(cat.heading).toBe(0);
    expect(cat.headTurn).toBe(0);
    expect(cat.atRest).toBe(true);
  });

  it("does not move from its waiting spot while there is nothing to follow", () => {
    const frames = simulate({ seconds: 30, target: null });
    const start = frames[0].state;
    for (const f of frames) {
      expect(toView(f.state)).toEqual(toView(start));
      expect({ x: f.state.x, y: f.state.y }).toEqual(HOME);
      expect(f.state.mode).toBe("seated");
      expect(f.state.atRest).toBe(true);
    }
  });
});

describe("Looking at the pointer", () => {
  it("follows a pointer within two body lengths with its head only", () => {
    // Each stays within two body lengths and less than 100 degrees off the heading.
    const near: Point[] = [
      { x: 900, y: 550 },
      { x: 850, y: 600 },
      { x: 700, y: 560 },
      { x: 800, y: 650 },
      { x: 880, y: 520 },
    ];
    for (const target of near) {
      expect(dist(HOME, target)).toBeLessThan(2 * B);
      expect(angleBetween(bearing(HOME, target), 0)).toBeLessThan(100);
    }
    const frames = simulate({ seconds: near.length, target: (t) => near[Math.min(near.length - 1, Math.floor(t))] });

    for (const f of frames) {
      expect({ x: f.state.x, y: f.state.y }).toEqual(HOME);
      expect(f.state.heading).toBe(0);
      expect(f.state.mode).toBe("seated");
      expect(f.state.sit).toBe(1);
    }
    // The head turns toward each target's bearing, never away from it, and gets there.
    for (let i = 1; i < frames.length; i++) {
      const target = frames[i].input?.target;
      if (!target) throw new Error("expected a target");
      const want = clamp(wrap180(bearing(HOME, target)), -HEAD_LIMIT, HEAD_LIMIT);
      const gapBefore = Math.abs(want - frames[i - 1].state.headTurn);
      const gapAfter = Math.abs(want - frames[i].state.headTurn);
      expect(gapAfter).toBeLessThanOrEqual(gapBefore + EPS);
      const endOfSegment = i === frames.length - 1 || frames[i + 1].input?.target !== target;
      if (endOfSegment) expect(frames[i].state.headTurn).toBeCloseTo(want, 6);
    }
  });

  it.each<[string, Point]>([
    ["right", { x: 950, y: 490 }],
    ["left", { x: 650, y: 490 }],
  ])("turns its head no further than HEAD_LIMIT toward a near pointer just past its %s shoulder", (_, target) => {
    // About 94 degrees off the heading: beyond the neck's reach but not behind the cat.
    expect(angleBetween(bearing(HOME, target), 0)).toBeGreaterThan(HEAD_LIMIT);
    expect(angleBetween(bearing(HOME, target), 0)).toBeLessThan(100);
    const frames = simulate({ seconds: 3, target });
    const turns = frames.map((f) => f.state.headTurn);
    expect(Math.max(...turns.map(Math.abs))).toBeLessThanOrEqual(HEAD_LIMIT);
    expect(Math.abs(last(frames).state.headTurn)).toBeCloseTo(HEAD_LIMIT, 6);
    expect(Math.sign(last(frames).state.headTurn)).toBe(Math.sign(wrap180(bearing(HOME, target))));
    for (const f of frames) expect({ x: f.state.x, y: f.state.y, sit: f.state.sit }).toEqual({ ...HOME, sit: 1 });
  });

  it("turns its head toward a far pointer in the very first step, while the body is still seated", () => {
    const [start, first] = simulate({ seconds: DT, target: FAR_LEFT });
    expect(start.state.headTurn).toBe(0);
    expect(first.state.headTurn).toBeLessThan(0); // the pointer is at bearing 270, i.e. -90
    expect(isSeated(first.state)).toBe(true);
  });
});

describe("Walking to the pointer", () => {
  it("gets up no earlier than the get-up delay and within half a second", () => {
    const frames = simulate({ seconds: 1, target: FAR_LEFT });
    const up = frames.findIndex((f) => !isSeated(f.state));
    expect(up).toBeGreaterThan(0);
    expect(frames[up].t).toBeGreaterThanOrEqual(GET_UP_DELAY - EPS);
    expect(frames[up].t).toBeLessThanOrEqual(0.5);
  });

  it("turns on the spot to face the pointer before its position changes at all", () => {
    const frames = simulate({ seconds: 3, target: FAR_LEFT });
    const m = firstMove(frames);
    expect(m).toBeGreaterThan(0);
    const before = frames[m - 1].state;
    expect(angleBetween(before.heading, bearing(before, FAR_LEFT))).toBeLessThanOrEqual(FACING_TOLERANCE);
    expect(angleBetween(frames[m].state.heading, bearing(before, FAR_LEFT))).toBeLessThanOrEqual(FACING_TOLERANCE);
  });

  it("walks at walkSpeed once in full stride, and never faster", () => {
    const frames = simulate({ seconds: 9, target: FAR_LEFT });
    const start = firstMove(frames);
    const stop = lastMove(frames);
    expect(start).toBeGreaterThan(0);
    // The stride lengthens as the cat sets off and shortens as it halts; in between it is full.
    const rampEnd = frames[start].t + 0.3;
    const haltStart = frames[stop].t - 0.3;
    const speeds = frames.slice(start, stop + 1).map((f, k) => ({ t: f.t, speed: movedAt(frames, start + k) / DT }));
    expect(Math.max(...speeds.map((s) => s.speed))).toBeLessThanOrEqual(CONFIG.walkSpeed + 1e-6);
    const offPace = speeds.filter(
      (s) => s.t > rampEnd && s.t < haltStart && Math.abs(s.speed - CONFIG.walkSpeed) > 1e-6,
    );
    expect(offPace).toEqual([]);
  });

  it("stops about one body length from the pointer and sits within a second of stopping", () => {
    const frames = simulate({ seconds: 9, target: FAR_LEFT });
    const stop = lastMove(frames);
    expect(stop).toBeGreaterThan(0);
    expect(stop).toBeLessThan(frames.length - 1);
    const lengths = dist(frames[stop].state, FAR_LEFT) / B;
    expect(lengths).toBeGreaterThanOrEqual(0.8);
    expect(lengths).toBeLessThanOrEqual(1.2);
    const seated = frames.findIndex((f, i) => i > stop && isSeated(f.state));
    expect(seated).toBeGreaterThan(stop);
    expect(frames[seated].t - frames[stop].t).toBeLessThanOrEqual(1);
  });

  // Offsets are relative to the walking cat's heading.
  const NEW_POSITIONS: [string, number, number][] = [
    ["off to one side", -75, 3.5],
    ["behind it", 170, 2.5],
  ];

  it.each(NEW_POSITIONS)(
    "neither jumps nor spins when the pointer moves %s mid-walk",
    (_, offset, lengths) => {
      const frames = simulate({ seconds: 12, target: retargetMidWalk(FAR_LEFT, (cat) => fromCat(cat, offset, lengths)) });
      expect(switchIndex(frames, FAR_LEFT)).toBeGreaterThan(0);
      for (let i = 1; i < frames.length; i++) {
        expect(movedAt(frames, i)).toBeLessThanOrEqual(CONFIG.walkSpeed * DT + EPS);
        expect(angleBetween(frames[i - 1].state.heading, frames[i].state.heading)).toBeLessThanOrEqual(
          MAX_TURN_RATE * DT + EPS,
        );
      }
      const target = frames[switchIndex(frames, FAR_LEFT)].input?.target;
      if (!target) throw new Error("expected a target");
      const lengthsAway = dist(frames[lastMove(frames)].state, target) / B;
      expect(lengthsAway).toBeGreaterThanOrEqual(0.8);
      expect(lengthsAway).toBeLessThanOrEqual(1.2);
    },
  );

  it.each(NEW_POSITIONS)(
    "curves toward a pointer that moves %s mid-walk without stopping",
    (_, offset, lengths) => {
      const frames = simulate({ seconds: 12, target: retargetMidWalk(FAR_LEFT, (cat) => fromCat(cat, offset, lengths)) });
      const sw = switchIndex(frames, FAR_LEFT);
      const target = frames[sw].input?.target;
      if (!target) throw new Error("expected a target");
      const near = frames.findIndex((f, i) => i >= sw && dist(f.state, target) <= 1.2 * B);
      expect(near).toBeGreaterThan(sw);
      const halted = frames
        .slice(sw, near + 1)
        .filter((_f, k) => movedAt(frames, sw + k) === 0)
        .map((f) => f.t.toFixed(3));
      expect(halted).toEqual([]);
    },
  );

  it.each<[string, Point]>([
    ["directly behind it", { x: 800, y: 400 }],
    ["behind it, off to one side", { x: 720, y: 380 }],
  ])("gets up, turns to face a pointer close %s, and sits again without moving", (_, target) => {
    expect(dist(HOME, target)).toBeLessThan(2 * B);
    expect(angleBetween(bearing(HOME, target), 0)).toBeGreaterThan(100);
    const frames = simulate({ seconds: 10, target });
    expect(frames.some((f) => f.state.sit < 1)).toBe(true);
    for (const f of frames) expect({ x: f.state.x, y: f.state.y }).toEqual(HOME);
    const end = last(frames).state;
    expect(isSeated(end)).toBe(true);
    expect(angleBetween(end.heading, bearing(HOME, target))).toBeLessThanOrEqual(FACING_TOLERANCE);
    expect(end.atRest).toBe(true);
  });
});

describe("One steady walk", () => {
  // Desktop numbers from the design: a 1440-wide hero, a cat of about 185 units walking about 230 a second.
  const DESKTOP_BOUNDS: Bounds = { minX: 90, maxX: 1350, minY: 180, maxY: 760 };

  it.each<[string, Point, Point]>([
    ["from the waiting spot to the left edge", { x: 1123, y: 560 }, { x: 40, y: 560 }],
    ["from the left side to the right edge", { x: 150, y: 560 }, { x: 1400, y: 560 }],
  ])("crosses a 1440-wide hero %s in three to six seconds at one pace", (_, home, target) => {
    const config: BehaviourConfig = { bodyLength: 185, walkSpeed: 230, cycleSeconds: 0.42, home };
    const frames = simulate({ seconds: 10, target, config, bounds: DESKTOP_BOUNDS });
    const start = firstMove(frames);
    const stop = lastMove(frames);
    expect(stop).toBeLessThan(frames.length - 1);
    expect(frames[stop].t).toBeGreaterThanOrEqual(3);
    expect(frames[stop].t).toBeLessThanOrEqual(6);
    const lengths = dist(frames[stop].state, target) / config.bodyLength;
    expect(lengths).toBeGreaterThanOrEqual(0.8);
    expect(lengths).toBeLessThanOrEqual(1.2);
    const offPace = frames
      .slice(start, stop + 1)
      .filter(
        (f, k) =>
          f.t > frames[start].t + 0.3 &&
          f.t < frames[stop].t - 0.3 &&
          Math.abs(movedAt(frames, start + k) / DT - config.walkSpeed) > 1e-6,
      );
    expect(offPace.map((f) => f.t.toFixed(3))).toEqual([]);
  });

  // "A paw on the ground SHALL NOT slide": the gait's paws cover walkSpeed x stride
  // per second backward, so the body must cover exactly that forward, along its heading.
  it.each<[string, TargetScript]>([
    ["a walk that ends at the pointer", FAR_LEFT],
    ["a walk whose pointer moves to one side", retargetMidWalk(FAR_LEFT, (cat) => fromCat(cat, -75, 3.5))],
    ["a walk whose pointer leaves the hero", retargetMidWalk(FAR_LEFT, () => null)],
    ["a walk toward a pointer beyond the edge", { x: 1150, y: 150 }],
  ])("keeps the paws from sliding during %s", (_, target) => {
    const frames = simulate({ seconds: 12, target });
    const slips: string[] = [];
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1].state;
      const b = frames[i].state;
      const h = rad(b.heading);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const forward = dx * Math.sin(h) + dy * Math.cos(h);
      const sideways = Math.abs(dx * Math.cos(h) - dy * Math.sin(h));
      const lo = CONFIG.walkSpeed * Math.min(a.stride, b.stride) * DT;
      const hi = CONFIG.walkSpeed * Math.max(a.stride, b.stride) * DT;
      const allowedSideways = Math.hypot(dx, dy) * Math.sin(rad(MAX_TURN_RATE * DT)) + 1e-6;
      if (forward < lo - 1e-6 || forward > hi + 1e-6 || sideways > allowedSideways) {
        slips.push(
          `${frames[i].t.toFixed(3)} s (${b.mode}): stride ${a.stride.toFixed(2)}->${b.stride.toFixed(2)}, ` +
            `moved ${forward.toFixed(3)} forward and ${sideways.toFixed(3)} sideways`,
        );
      }
    }
    expect(slips.length, slips.slice(0, 3).join("\n")).toBe(0);
  });
});

describe("Staying in the hero", () => {
  const { minX, maxX, minY, maxY } = BOUNDS;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const EDGE_TARGETS: [string, Point][] = [
    ["the top-left corner", { x: minX, y: minY }],
    ["the top-right corner", { x: maxX, y: minY }],
    ["the bottom-left corner", { x: minX, y: maxY }],
    ["the bottom-right corner", { x: maxX, y: maxY }],
    ["the top edge", { x: midX, y: minY }],
    ["the bottom edge", { x: midX, y: maxY }],
    ["the left edge", { x: minX, y: midY }],
    ["the right edge", { x: maxX, y: midY }],
    ["just beyond the left edge", { x: minX - 0.6 * B, y: midY }],
    ["beyond the right edge", { x: maxX + 1.5 * B, y: midY }],
    ["beyond the top edge", { x: midX, y: minY - B }],
    ["beyond the bottom edge", { x: midX, y: maxY + 1.5 * B }],
    ["beyond the top-left corner", { x: minX - B, y: minY - B }],
    ["beyond the top-right corner", { x: maxX + 1.5 * B, y: minY - B }],
    ["beyond the bottom-left corner", { x: minX - B, y: maxY + 1.5 * B }],
    ["beyond the bottom-right corner", { x: maxX + 1.5 * B, y: maxY + 1.5 * B }],
  ];

  it.each(EDGE_TARGETS)("stays inside the bounds and ends seated for a pointer at %s", (_, target) => {
    const frames = simulate({ seconds: 30, target }); // `simulate` checks the bounds at every step
    const end = last(frames).state;
    expect(isSeated(end)).toBe(true);
    expect(end.atRest).toBe(true);
    const settled = frames.slice(-3 * 60);
    for (const f of settled) expect({ x: f.state.x, y: f.state.y }).toEqual({ x: end.x, y: end.y });
  });

  it("stops where it is and sits down when the pointer leaves, without going home", () => {
    // Leaves after the cat has walked for 1.5 s, well away from its waiting spot.
    const frames = simulate({ seconds: 12, target: retargetMidWalk(FAR_LEFT, () => null, 1.5) });
    const sw = switchIndex(frames, FAR_LEFT);
    expect(sw).toBeGreaterThan(0);
    const stop = lastMove(frames);
    expect(frames[stop].t - frames[sw].t).toBeLessThanOrEqual(0.3);
    const where = frames[stop].state;
    expect(dist(where, HOME)).toBeGreaterThan(B);
    const seated = frames.findIndex((f, i) => i > sw && isSeated(f.state));
    expect(seated).toBeGreaterThan(sw);
    expect(frames[seated].t - frames[sw].t).toBeLessThanOrEqual(1.5);
    const end = last(frames).state;
    expect({ x: end.x, y: end.y }).toEqual({ x: where.x, y: where.y });
    expect(isSeated(end)).toBe(true);
    expect(end.atRest).toBe(true);
  });

  const SMALLER: Bounds = { minX: 100, maxX: 600, minY: 100, maxY: 400 };
  it.each<[string, Point | null, number, string]>([
    ["seated", null, 1, "seated"],
    ["walking", FAR_LEFT, 1.5, "walking"],
  ])("is back inside on the next step when the bounds shrink under a %s cat", (_, target, at, mode) => {
    const frames = simulate({ seconds: 10, target, bounds: (t) => (t < at ? BOUNDS : SMALLER) });
    const shrunk = frames.findIndex((f) => f.input?.bounds === SMALLER);
    expect(frames[shrunk - 1].state.mode).toBe(mode);
    const before = frames[shrunk - 1].state;
    expect(before.x > SMALLER.maxX || before.y > SMALLER.maxY).toBe(true);
    const after = frames[shrunk].state;
    expect(after.x).toBeLessThanOrEqual(SMALLER.maxX);
    expect(after.y).toBeLessThanOrEqual(SMALLER.maxY);
  });
});

describe("Idle gestures", () => {
  it.each([1, 2, 3, 42, 2024, 65535])(
    "blinks or flicks within three seconds of sitting, never later than five, then is still (seed %i)",
    (seed) => {
      const frames = simulate({ seconds: 25, target: FAR_LEFT, seed });
      const stop = lastMove(frames);
      const sat = frames.findIndex((f, i) => i > stop && isSeated(f.state));
      expect(sat).toBeGreaterThan(0);
      const tSat = frames[sat].t;
      const since = frames.slice(sat);

      const gestures = since.filter((f) => isGesture(f.state));
      expect(gestures.some((f) => f.t - tSat <= 3)).toBe(true);
      expect(gestures.filter((f) => f.t - tSat > IDLE_SECONDS + EPS).map((f) => f.t.toFixed(3))).toEqual([]);

      const leftAlone = since.filter((f) => f.t - tSat > IDLE_SECONDS + EPS);
      expect(leftAlone.length * DT).toBeGreaterThanOrEqual(10);
      for (const f of leftAlone) {
        expect(f.state.atRest).toBe(true);
        expect(observable(f.state)).toEqual(observable(leftAlone[0].state));
        expect(f.state.eyeOpen).toBe(1);
        expect(f.state.tailFlick).toBe(0);
      }
    },
  );

  it("starts the gestures again when the pointer moves near it", () => {
    const settled = last(simulate({ seconds: 20, target: FAR_LEFT, seed: 7 })).state;
    expect(settled.atRest).toBe(true);
    // Near and well within the head's reach: only the head should follow.
    const target = fromCat(settled, 45, 1.2);
    const frames = simulate({ seconds: 12, target, start: settled, seed: 8 });
    expect(frames[1].state.atRest).toBe(false);
    for (const f of frames) {
      expect({ x: f.state.x, y: f.state.y, heading: f.state.heading }).toEqual({
        x: settled.x,
        y: settled.y,
        heading: settled.heading,
      });
      expect(isSeated(f.state)).toBe(true);
    }
    let headStill = 0;
    for (let i = 1; i < frames.length; i++) {
      if (frames[i].state.headTurn !== frames[i - 1].state.headTurn) headStill = i;
    }
    expect(headStill).toBeGreaterThan(0);
    const tStill = frames[headStill].t;
    const gestures = frames.filter((f) => isGesture(f.state));
    expect(gestures.some((f) => f.t > tStill && f.t - tStill <= 3)).toBe(true);
    expect(gestures.filter((f) => f.t - tStill > IDLE_SECONDS + EPS).map((f) => f.t.toFixed(3))).toEqual([]);
    expect(last(frames).state.atRest).toBe(true);
  });
});

describe("General invariants", () => {
  it("does not change the state it is given", () => {
    const cat = initialState(CONFIG, BOUNDS);
    const copy = { ...cat };
    step(cat, { target: FAR_LEFT, bounds: BOUNDS }, DT, CONFIG, seededRandom(1));
    expect(cat).toEqual(copy);
  });

  it("keeps every value in range through a minute of erratic pointer movement", () => {
    // `simulate` asserts ranges, bounds, speed, turn rate and immutability at every step.
    const pick = seededRandom(99);
    let nextChange = 0;
    let target: Point | null = null;
    const script = (t: number): Point | null => {
      if (t >= nextChange) {
        nextChange = t + 0.2 + pick() * 2;
        const r = pick();
        target =
          r < 0.15
            ? null
            : { x: BOUNDS.minX - 150 + pick() * 1200, y: BOUNDS.minY - 150 + pick() * 800 };
      }
      return target;
    };
    const frames = simulate({ seconds: 60, target: script, bounds: (t) => (t < 40 ? BOUNDS : { ...BOUNDS, maxX: 700 }), seed: 5 });
    expect(frames.some((f) => f.state.mode === "walking")).toBe(true);
  });
});
