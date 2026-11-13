// The walk and the inverse kinematics that place elbows and knees.
//
// The walk is a four-beat lateral sequence: left hind, left fore, right hind,
// right fore, a quarter of a cycle apart. Each paw alternates a stance phase,
// in which it stays put on the ground while the body travels over it, and a
// swing phase, in which it lifts and moves forward.

import { WALK_CYCLE_SECONDS, type CatParams } from "./params";
import { raisedTail, standingHead, standingPose } from "./poses";
import { type BodyPose, type LegId, LEGS, dimensions, isFront } from "./skeleton";
import { type V3, Y, add, clamp, cross, distance, mix, mul, normalize, sub } from "./vec";

/** Fraction of the cycle a paw spends on the ground. */
export const DUTY = 0.62;

/** When each paw touches down, as a fraction of the cycle. */
export const LEG_PHASE: Record<LegId, number> = { hl: 0, fl: 0.25, hr: 0.5, fr: 0.75 };

/** How far a paw travels on the ground during one stance at full stride, in body units. */
export const strideLength = (p: CatParams): number => p.legLength * 0.9;

/** Distance the cat covers in one full cycle at full stride, in body units. */
export const cycleDistance = (p: CatParams): number => strideLength(p) / DUTY;

/** Ground speed at full stride, in body units per second. */
export const walkSpeed = (p: CatParams): number => cycleDistance(p) / WALK_CYCLE_SECONDS;

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

/**
 * Position of one paw along its stride and above the ground at a point in the cycle.
 * `stride` scales how far it travels (0 steps in place), `step` how high it lifts.
 */
export function pawOffset(
  p: CatParams,
  leg: LegId,
  phase: number,
  stride = 1,
  step = 1,
): { x: number; z: number; grounded: boolean } {
  const reach = strideLength(p) * stride;
  const local = fract(phase - LEG_PHASE[leg]);
  if (local < DUTY) {
    // Stance: constant speed backward, which is what keeps the paw from sliding.
    return { x: reach * (0.5 - local / DUTY), z: 0, grounded: true };
  }
  const u = (local - DUTY) / (1 - DUTY);
  const eased = u * u * (3 - 2 * u);
  return {
    x: reach * (-0.5 + eased),
    z: p.legLength * 0.2 * step * Math.sin(Math.PI * u),
    grounded: step <= 0,
  };
}

/**
 * The body pose of a cat on its feet.
 *
 * @param phase position in the walk cycle, 0 to 1
 * @param step how much the legs are stepping: 0 stands still, 1 lifts the paws fully
 * @param stride how far each step travels: 0 steps in place, 1 is the full walk
 * @param tailFlick -1 to 1, a sideways sweep of the tail on top of its own sway
 */
export function movingPose(p: CatParams, phase = 0, step = 0, stride = 0, tailFlick = 0): BodyPose {
  const d = dimensions(p);
  const pose = standingPose(p);
  if (step <= 0 && tailFlick === 0) return pose;
  const turn = phase * Math.PI * 2;

  // Shoulders and hips dip twice per cycle and shift toward the supporting side.
  // A long stride needs the body a little lower, so the legs reach both ends of it.
  const crouch = 0.06 * stride * step;
  const bob = (shift: number) => (-0.012 + 0.012 * Math.cos(2 * turn + shift)) * step - crouch;
  const sway = 0.018 * Math.sin(turn) * step;
  const front: V3 = [0, -sway, bob(Math.PI / 2)];
  const rear: V3 = [0, sway, bob(0)];
  const hip = add(pose.hip, rear);

  const legs = { ...pose.legs };
  for (const leg of LEGS) {
    const o = pawOffset(p, leg, phase, stride, step);
    const rest = pose.legs[leg];
    const paw = add(rest.paw, [o.x, 0, o.z]);
    legs[leg] = {
      top: add(rest.top, isFront(leg) ? front : rear),
      paw,
      ankle: isFront(leg) ? paw : add(paw, d.hockOffset),
      grounded: o.grounded,
    };
  }

  return {
    shoulder: add(pose.shoulder, front),
    mid: add(pose.mid, [0, 0, (bob(0) + bob(Math.PI / 2)) / 2]),
    hip,
    // The head stays level: it takes only half of the shoulders' movement.
    head: add(standingHead(p, pose.shoulder), mul(front, 0.5)),
    headPitch: mix(pose.headPitch, 14, step * stride),
    tail: raisedTail(p, hip, Math.sin(turn + Math.PI / 2) * 0.35 * step + tailFlick * 0.9),
    legs,
  };
}
