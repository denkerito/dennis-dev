// The walk and the inverse kinematics that place elbows and knees.
//
// The walk is a four-beat lateral sequence: left hind, left fore, right hind,
// right fore, a quarter of a cycle apart. Each paw alternates a stance phase,
// in which it stays put on the ground while the body travels over it, and a
// swing phase, in which it lifts and moves forward.

import type { CatParams } from "./params";
import { raisedTail, standingHead, standingPose } from "./poses";
import { type BodyPose, type LegId, LEGS, type Rig, assembleRig, dimensions, isFront } from "./skeleton";
import { type V3, Y, add, clamp, cross, distance, mul, normalize, sub } from "./vec";

/** Fraction of the cycle a paw spends on the ground. */
export const DUTY = 0.62;

/** When each paw touches down, as a fraction of the cycle. */
export const LEG_PHASE: Record<LegId, number> = { hl: 0, fl: 0.25, hr: 0.5, fr: 0.75 };

/** How far a paw travels on the ground during one stance, in body units. */
export const strideLength = (p: CatParams): number => p.legLength * 0.5;

/** Distance the cat covers in one full cycle, in body units. */
export const cycleDistance = (p: CatParams): number => strideLength(p) / DUTY;

/**
 * Middle joint of a two-bone chain from `top` to `target`.
 * `bend` chooses the side the joint goes to: 1 forward, -1 backward.
 * A target out of reach is treated as if it were at full reach.
 */
export function solveTwoBone(top: V3, target: V3, l1: number, l2: number, bend: number): V3 {
  const span = distance(top, target);
  const d = clamp(span, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const dir = normalize(sub(target, top), [0, 0, -1]);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const out = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  // Perpendicular to the leg in its own vertical plane: forward for a leg pointing down.
  const forward = normalize(cross(dir, Y), [1, 0, 0]);
  return add(add(top, mul(dir, along)), mul(forward, out * bend));
}

const fract = (v: number): number => v - Math.floor(v);

/** Position of one paw along its stride and above the ground at a point in the cycle. */
export function pawOffset(p: CatParams, leg: LegId, phase: number): { x: number; z: number; grounded: boolean } {
  const stride = strideLength(p);
  const local = fract(phase - LEG_PHASE[leg]);
  if (local < DUTY) {
    // Stance: constant speed backward, which is what keeps the paw from sliding.
    return { x: stride * (0.5 - local / DUTY), z: 0, grounded: true };
  }
  const u = (local - DUTY) / (1 - DUTY);
  const eased = u * u * (3 - 2 * u);
  return {
    x: stride * (-0.5 + eased),
    z: p.legLength * 0.2 * Math.sin(Math.PI * u),
    grounded: false,
  };
}

/** The body pose at a point of the walk cycle, 0 to 1. */
export function walkingPose(p: CatParams, phase: number): BodyPose {
  const d = dimensions(p);
  const pose = standingPose(p);
  const turn = phase * Math.PI * 2;

  // Shoulders and hips dip twice per cycle and shift toward the supporting side.
  const bob = (shift: number) => -0.012 + 0.012 * Math.cos(2 * turn + shift);
  const sway = 0.018 * Math.sin(turn);
  const shoulder = add(pose.shoulder, [0, -sway, bob(Math.PI / 2)]);
  const hip = add(pose.hip, [0, sway, bob(0)]);
  const mid = add(pose.mid, [0, 0, (bob(0) + bob(Math.PI / 2)) / 2]);

  const legs = { ...pose.legs };
  for (const leg of LEGS) {
    const o = pawOffset(p, leg, phase);
    const rest = pose.legs[leg];
    const paw = add(rest.paw, [o.x, 0, o.z]);
    const top = add(rest.top, isFront(leg) ? [0, -sway, bob(Math.PI / 2)] : [0, sway, bob(0)]);
    legs[leg] = {
      top,
      paw,
      ankle: isFront(leg) ? paw : add(paw, d.hockOffset),
      grounded: o.grounded,
    };
  }

  return {
    shoulder,
    mid,
    hip,
    // The head stays level: it takes only half of the shoulders' movement.
    head: add(standingHead(p, pose.shoulder), [0, -sway * 0.5, bob(Math.PI / 2) * 0.5]),
    headPitch: 14,
    tail: raisedTail(p, hip, Math.sin(turn + Math.PI / 2) * 0.35),
    legs,
  };
}

export function walkingRig(p: CatParams, phase: number, headTurn = 0): Rig {
  return assembleRig(p, walkingPose(p, phase), headTurn);
}
