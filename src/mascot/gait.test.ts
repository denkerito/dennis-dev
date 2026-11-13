import { describe, expect, it } from "vitest";

import { rigFor } from "./draw";
import { DUTY, LEG_PHASE, cycleDistance, movingPose, walkSpeed } from "./gait";
import { DEFAULT_PARAMS, WALK_CYCLE_SECONDS } from "./params";
import { LEGS, PAW_HEIGHT, bodyLength, dimensions } from "./skeleton";

const fract = (v: number): number => v - Math.floor(v);
const PHASES = Array.from({ length: 200 }, (_, i) => i / 200);

describe("walk", () => {
  it("keeps a paw in stance fixed on the ground", () => {
    const distance = cycleDistance(DEFAULT_PARAMS);
    for (const leg of LEGS) {
      const groundX: number[] = [];
      for (const phase of PHASES) {
        const paw = movingPose(DEFAULT_PARAMS, phase, 1, 1).legs[leg];
        if (!paw.grounded) continue;
        // How far the body has travelled since this paw touched down.
        const travelled = fract(phase - LEG_PHASE[leg]) * distance;
        groundX.push(paw.paw[0] + travelled);
        expect(paw.paw[2]).toBeCloseTo(PAW_HEIGHT);
      }
      expect(groundX.length).toBeGreaterThan(PHASES.length * DUTY * 0.9);
      expect(Math.max(...groundX) - Math.min(...groundX)).toBeLessThan(1e-9);
    }
  });

  it("puts the four paws down a quarter of a cycle apart", () => {
    const touchdowns = LEGS.map((leg) => LEG_PHASE[leg]).sort((a, b) => a - b);
    expect(touchdowns).toEqual([0, 0.25, 0.5, 0.75]);
  });

  it("lifts every paw once per cycle", () => {
    for (const leg of LEGS) {
      const lifted = PHASES.filter((phase) => !movingPose(DEFAULT_PARAMS, phase, 1, 1).legs[leg].grounded);
      expect(lifted.length / PHASES.length).toBeCloseTo(1 - DUTY, 1);
    }
  });
});

describe("pace", () => {
  it("covers about one body length a second", () => {
    const speed = walkSpeed(DEFAULT_PARAMS);
    expect(speed).toBeCloseTo(cycleDistance(DEFAULT_PARAMS) / WALK_CYCLE_SECONDS);
    const bodyLengthsPerSecond = speed / bodyLength(DEFAULT_PARAMS);
    expect(bodyLengthsPerSecond).toBeGreaterThanOrEqual(0.9);
    expect(bodyLengthsPerSecond).toBeLessThanOrEqual(1.3);
  });

  it("lets every leg reach both ends of its stride", () => {
    const d = dimensions(DEFAULT_PARAMS);
    for (const phase of PHASES) {
      const pose = movingPose(DEFAULT_PARAMS, phase, 1, 1);
      for (const leg of LEGS) {
        const bone = leg === "fl" || leg === "fr" ? d.frontBone : d.hindBone;
        const { top, ankle } = pose.legs[leg];
        const span = Math.hypot(ankle[0] - top[0], ankle[1] - top[1], ankle[2] - top[2]);
        expect(span).toBeLessThanOrEqual(bone * 2);
      }
    }
  });
});

describe("stepping in place", () => {
  it("lifts the paws in the same order without moving them along the ground", () => {
    const rest = movingPose(DEFAULT_PARAMS, 0, 0, 0);
    for (const leg of LEGS) {
      let lifted = 0;
      for (const phase of PHASES) {
        const paw = movingPose(DEFAULT_PARAMS, phase, 1, 0).legs[leg];
        expect(paw.paw[0]).toBeCloseTo(rest.legs[leg].paw[0]);
        expect(paw.paw[1]).toBeCloseTo(rest.legs[leg].paw[1]);
        if (!paw.grounded) lifted += 1;
      }
      expect(lifted / PHASES.length).toBeCloseTo(1 - DUTY, 1);
    }
  });
});

describe("gestures", () => {
  const view = { heading: 20, headTurn: 0, sit: 1, step: 0, stride: 0, phase: 0 };

  it("leave the cat unchanged by default", () => {
    expect(rigFor(DEFAULT_PARAMS, { ...view, eyeOpen: 1, tailFlick: 0 })).toEqual(rigFor(DEFAULT_PARAMS, view));
  });

  it("move only the tail in a flick", () => {
    const still = rigFor(DEFAULT_PARAMS, view);
    const flicked = rigFor(DEFAULT_PARAMS, { ...view, tailFlick: 1 });
    const changed = still.capsules.filter((part, i) => JSON.stringify(part) !== JSON.stringify(flicked.capsules[i]));
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every((part) => part.id.startsWith("tail-"))).toBe(true);
  });
});
