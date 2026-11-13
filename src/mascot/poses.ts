// The still poses: standing and seated. The walk lives in gait.ts and starts
// from the standing pose. A rig for any moment is a blend of the two.

import type { CatParams } from "./params";
import {
  type BodyPose,
  type LegId,
  type LegPose,
  LEGS,
  PAW_HEIGHT,
  TAIL_POINTS,
  dimensions,
  isFront,
  legSide,
} from "./skeleton";
import { type V3, add, radians } from "./vec";

/** Where the head sits relative to the shoulders when standing. */
export function standingHead(p: CatParams, shoulder: V3): V3 {
  return add(shoulder, [0.34, 0, 0.18 + p.headSize * 0.5]);
}

/**
 * A tail that leaves the body backward and curls upward.
 * `sway` bends it sideways, more toward the tip.
 */
export function raisedTail(p: CatParams, hip: V3, sway = 0): V3[] {
  const step = (p.tailLength * 0.9) / (TAIL_POINTS - 1);
  const points: V3[] = [add(hip, [-0.2, 0, 0.12])];
  for (let i = 1; i < TAIL_POINTS; i++) {
    const t = i / (TAIL_POINTS - 1);
    const lift = radians(30 + 75 * t);
    const prev = points[i - 1];
    points.push([
      prev[0] - Math.cos(lift) * step,
      prev[1] + sway * t * t * step * 2.2,
      prev[2] + Math.sin(lift) * step,
    ]);
  }
  return points;
}

export function standingPose(p: CatParams): BodyPose {
  const d = dimensions(p);
  const shoulder: V3 = [d.L / 2, 0, d.h + 0.04];
  const hip: V3 = [-d.L / 2, 0, d.h + 0.05];
  const legs = {} as Record<LegId, LegPose>;
  for (const leg of LEGS) {
    const side = legSide(leg);
    if (isFront(leg)) {
      const paw = d.frontPaw(side);
      legs[leg] = { top: d.frontTop(side), ankle: paw, paw, grounded: true };
    } else {
      const paw = d.hindPaw(side);
      legs[leg] = { top: d.hindTop(side), ankle: add(paw, d.hockOffset), paw, grounded: true };
    }
  }
  return {
    shoulder,
    mid: [0, 0, d.h + 0.03],
    hip,
    head: standingHead(p, shoulder),
    headPitch: 22,
    tail: raisedTail(p, hip),
    legs,
  };
}

/**
 * Upright on the haunches, front legs straight, tail on the ground curled to the right.
 * `tailFlick` (-1 to 1) lifts the end of the tail off the ground and sweeps it.
 */
export function seatedPose(p: CatParams, tailFlick = 0): BodyPose {
  const d = dimensions(p);
  const g = d.g;
  const shoulder: V3 = [0.16, 0, d.h + 0.06];
  const hip: V3 = [-0.2, 0, 0.29 * g];
  const legs = {} as Record<LegId, LegPose>;
  for (const leg of LEGS) {
    const side = legSide(leg);
    if (isFront(leg)) {
      const paw: V3 = [0.24, side * 0.12 * g, PAW_HEIGHT];
      legs[leg] = {
        top: [shoulder[0] + 0.03, side * 0.13 * g, d.h - 0.02],
        ankle: paw,
        paw,
        grounded: true,
      };
    } else {
      // Folded: thigh against the body, foot flat on the ground pointing forward.
      legs[leg] = {
        top: [-0.12, side * 0.2 * g, 0.24],
        ankle: [-0.02, side * 0.25 * g, 0.075],
        paw: [0.13, side * 0.25 * g, PAW_HEIGHT],
        grounded: true,
      };
    }
  }

  // The tail lies on the ground in an arc around the cat's right side.
  const step = (p.tailLength * 0.9) / (TAIL_POINTS - 1);
  const radius = 0.44 * g;
  const tail: V3[] = [];
  for (let i = 0; i < TAIL_POINTS; i++) {
    const t = i / (TAIL_POINTS - 1);
    // A flick swings the outer half of the tail along its arc and lifts it.
    const angle = Math.PI + (i * step) / radius + tailFlick * 0.5 * t * t;
    tail.push([
      -0.04 + Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      p.tailGirth + Math.abs(tailFlick) * 0.16 * t * t,
    ]);
  }

  return {
    shoulder,
    mid: [-0.04, 0, hip[2] + (shoulder[2] - hip[2]) * 0.42],
    hip,
    head: add(shoulder, [0.2, 0, 0.2 + p.headSize * 0.5]),
    headPitch: 26,
    tail,
    legs,
  };
}
