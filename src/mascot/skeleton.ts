// From a body pose to the full set of shapes that make up the cat.
//
// A pose only places the points that differ between poses (spine, head, paws,
// tail). Everything else (elbows and knees, ears, cheeks, muzzle, radii, fur
// density) is derived here from the proportions, so every pose has the same
// parts in the same order and any two can be blended.

import { solveTwoBone } from "./gait";
import type { CatParams } from "./params";
import {
  type V3,
  X,
  Y,
  Z,
  add,
  cross,
  distance,
  lerp,
  mix,
  mul,
  normalize,
  offset,
  radians,
  rotateZ,
  sub,
} from "./vec";

export type FurSpec = {
  /** Tufts at fur amount 1. */
  count: number;
  /** Tuft length in body units. */
  length: number;
  /** How far tufts lean along the part, from its first point toward its second. */
  lean: number;
  /** Share of the tufts placed on the rounded ends rather than along the sides. */
  capShare: number;
};

/** A tapered capsule: two spheres and everything between them. */
export type Capsule = {
  id: string;
  a: V3;
  ra: number;
  b: V3;
  rb: number;
  /** A direction not parallel to the capsule, used to place fur consistently around it. */
  ref: V3;
  fur: FurSpec | null;
};

export type HeadFrame = { c: V3; r: number; forward: V3; left: V3; up: V3 };

export type LegId = "fl" | "fr" | "hl" | "hr";
export const LEGS: readonly LegId[] = ["fl", "fr", "hl", "hr"];
export const legSide = (leg: LegId): number => (leg === "fl" || leg === "hl" ? 1 : -1);
export const isFront = (leg: LegId): boolean => leg === "fl" || leg === "fr";

export type LegPose = {
  /** Shoulder or hip joint. */
  top: V3;
  /** Wrist of a front leg, hock of a hind leg. */
  ankle: V3;
  /** Where the paw meets the ground (or hangs in the air). */
  paw: V3;
  grounded: boolean;
};

export type BodyPose = {
  shoulder: V3;
  mid: V3;
  hip: V3;
  /** Centre of the head before the head turn is applied. */
  head: V3;
  /** Degrees the nose is raised. */
  headPitch: number;
  /** Tail points from base to tip. Always TAIL_POINTS long. */
  tail: V3[];
  legs: Record<LegId, LegPose>;
};

export const TAIL_POINTS = 6;

export type Rig = {
  capsules: Capsule[];
  head: HeadFrame;
  muzzle: { c: V3; r: number };
  paws: { id: LegId; p: V3; grounded: boolean }[];
};

export const PAW_HEIGHT = 0.09;

/** Lengths that follow from the proportions and are shared by every pose. */
export function dimensions(p: CatParams) {
  const g = p.bodyGirth;
  const L = p.bodyLength;
  const h = p.legLength;
  const frontTop = (side: number): V3 => [L / 2 - 0.04, side * 0.16 * g, h - 0.02];
  const hindTop = (side: number): V3 => [-L / 2 + 0.06, side * 0.17 * g, h];
  const frontPaw = (side: number): V3 => [L / 2, side * 0.16 * g, PAW_HEIGHT];
  const hindPaw = (side: number): V3 => [-L / 2 - 0.02, side * 0.17 * g, PAW_HEIGHT];
  /** From a hind paw to its hock. */
  const hockOffset: V3 = [-0.09, 0, 0.4 * h];
  const frontReach = distance(frontTop(1), frontPaw(1));
  const hindReach = distance(hindTop(1), add(hindPaw(1), hockOffset));
  return {
    g,
    L,
    h,
    R: p.headSize,
    frontTop,
    hindTop,
    frontPaw,
    hindPaw,
    hockOffset,
    // Slightly longer than the straight distance, so a standing leg is a little
    // bent and a walking leg can reach the ends of its stride.
    frontBone: frontReach * 0.54,
    hindBone: hindReach * 0.68,
  };
}

/** Height of the standing cat from the ground to the ear tips. */
export function standingHeight(p: CatParams): number {
  return p.legLength + 0.04 + 0.18 + p.headSize * 0.5 + p.headSize * 0.8 + p.earSize + 0.03;
}

const fur = (count: number, length: number, lean: number, capShare = 0): FurSpec => ({
  count,
  length,
  lean,
  capShare,
});

/** Builds every shape of the cat from a body pose and a head turn in degrees. */
export function assembleRig(p: CatParams, pose: BodyPose, headTurn: number): Rig {
  const d = dimensions(p);
  const { g, R } = d;
  const capsules: Capsule[] = [];
  const cap = (
    id: string,
    a: V3,
    ra: number,
    b: V3,
    rb: number,
    furSpec: FurSpec | null,
    ref: V3 = Y,
  ) => {
    capsules.push({ id, a, ra, b, rb, ref, fur: furSpec });
  };

  // Torso.
  cap("chest", pose.shoulder, 0.28 * g, pose.mid, 0.25 * g, fur(60, 0.055, 1));
  cap("belly", pose.mid, 0.25 * g, pose.hip, 0.29 * g, fur(66, 0.055, 1));
  const spine = normalize(sub(pose.shoulder, pose.mid));
  const bib = offset(pose.shoulder, spine, 0.12, Z, -0.07);
  cap("bib", bib, 0.22 * g, add(bib, mul(spine, 0.02)), 0.22 * g, fur(36, 0.075, -0.2, 0.6), Y);

  // Head: turned about the vertical axis around the base of the neck.
  const neckBase = offset(pose.shoulder, spine, 0.04, Z, 0.1);
  const turn = radians(headTurn);
  const c = add(neckBase, rotateZ(sub(pose.head, neckBase), turn * 0.4));
  const pitch = radians(pose.headPitch);
  const flat = rotateZ(X, turn);
  const left = rotateZ(Y, turn);
  const forward = normalize(offset([0, 0, 0], flat, Math.cos(pitch), Z, Math.sin(pitch)));
  const up = normalize(cross(forward, left));
  const head: HeadFrame = { c, r: R, forward, left, up };

  cap("neck", neckBase, 0.22 * g, c, R * 0.7, fur(26, 0.055, -0.3));
  cap(
    "head",
    offset(c, forward, -0.02),
    R,
    offset(c, forward, 0.02),
    R,
    fur(80, 0.05, -0.6, 1),
    up,
  );
  const muzzle = { c: offset(c, forward, R * 0.74, up, -R * 0.22), r: R * 0.4 };
  cap("muzzle", muzzle.c, muzzle.r, offset(muzzle.c, forward, 0.01), muzzle.r, null, up);

  for (const side of [1, -1]) {
    const name = side === 1 ? "l" : "r";
    const cheek = offset(c, left, side * R * 0.6, up, -R * 0.3, forward, R * 0.12);
    cap(
      `cheek-${name}`,
      cheek,
      R * 0.46,
      offset(cheek, left, side * 0.02),
      R * 0.46,
      fur(18, 0.09, 0.5, 1),
      up,
    );
    const earBase = offset(c, up, R * 0.6, left, side * R * 0.55, forward, -R * 0.05);
    const earTip = offset(c, up, R * 0.8 + p.earSize, left, side * R * 0.85);
    cap(`ear-${name}`, earBase, R * 0.36, earTip, 0.03, fur(6, 0.035, 0.6), forward);
  }

  // Tail: fluffy, slightly thicker in the middle than at the base.
  const last = TAIL_POINTS - 2;
  for (let i = 0; i <= last; i++) {
    const r0 = p.tailGirth * tailProfile(i / (last + 1));
    const r1 = p.tailGirth * tailProfile((i + 1) / (last + 1));
    cap(
      `tail-${i}`,
      pose.tail[i],
      r0,
      pose.tail[i + 1],
      r1,
      fur(34, 0.085, 1.1, i === last ? 0.4 : 0),
    );
  }

  // Legs. Elbows bend backward, knees forward.
  const paws: Rig["paws"] = [];
  for (const leg of LEGS) {
    const lp = pose.legs[leg];
    if (isFront(leg)) {
      const elbow = solveTwoBone(lp.top, lp.ankle, d.frontBone, d.frontBone, -1);
      cap(`${leg}-upper`, lp.top, 0.14 * g, elbow, 0.11, fur(12, 0.045, 0.9));
      cap(`${leg}-lower`, elbow, 0.11, lp.ankle, 0.095, fur(8, 0.035, 0.9));
      cap(`${leg}-paw`, lp.ankle, 0.095, offset(lp.paw, X, 0.07, Z, 0.005), 0.1, null);
    } else {
      const knee = solveTwoBone(lp.top, lp.ankle, d.hindBone, d.hindBone, 1);
      cap(`${leg}-thigh`, lp.top, 0.2 * g, knee, 0.12, fur(20, 0.05, 0.9));
      cap(`${leg}-shin`, knee, 0.12, lp.ankle, 0.085, fur(8, 0.035, 0.9));
      cap(`${leg}-foot`, lp.ankle, 0.085, lp.paw, 0.095, fur(4, 0.03, 0.9));
      cap(`${leg}-paw`, lp.paw, 0.095, offset(lp.paw, X, 0.08, Z, 0.005), 0.1, null);
    }
    paws.push({ id: leg, p: lp.paw, grounded: lp.grounded });
  }

  return { capsules, head, muzzle, paws };
}

function tailProfile(t: number): number {
  // 0.9 at the base, 1.08 around the middle, 0.85 at the tip.
  return 0.9 + 0.72 * t * (1 - t) - 0.05 * t;
}

/** Blends two rigs built from the same proportions. 0 gives `a`, 1 gives `b`. */
export function blendRigs(a: Rig, b: Rig, t: number): Rig {
  return {
    capsules: a.capsules.map((ca, i) => {
      const cb = b.capsules[i];
      return {
        ...ca,
        a: lerp(ca.a, cb.a, t),
        ra: mix(ca.ra, cb.ra, t),
        b: lerp(ca.b, cb.b, t),
        rb: mix(ca.rb, cb.rb, t),
        ref: normalize(lerp(ca.ref, cb.ref, t), ca.ref),
      };
    }),
    head: {
      c: lerp(a.head.c, b.head.c, t),
      r: mix(a.head.r, b.head.r, t),
      forward: normalize(lerp(a.head.forward, b.head.forward, t), a.head.forward),
      left: normalize(lerp(a.head.left, b.head.left, t), a.head.left),
      up: normalize(lerp(a.head.up, b.head.up, t), a.head.up),
    },
    muzzle: { c: lerp(a.muzzle.c, b.muzzle.c, t), r: mix(a.muzzle.r, b.muzzle.r, t) },
    paws: a.paws.map((pa, i) => ({
      id: pa.id,
      p: lerp(pa.p, b.paws[i].p, t),
      grounded: t < 0.5 ? pa.grounded : b.paws[i].grounded,
    })),
  };
}
