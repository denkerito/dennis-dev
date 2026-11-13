// Fur: small tufts attached to the body.
//
// Each part carries a fixed set of tufts, generated once from a seed derived
// from the part's name. A tuft is stored in the part's own coordinates (how far
// along it, at what angle around it), so it stays attached when the cat moves,
// comes into and goes out of the outline as the cat turns, and never shimmers.

import type { Capsule, FurSpec } from "./skeleton";
import { type V3, Z, add, clamp, cross, lerp, mix, mul, normalize, offset, sub } from "./vec";

/** Largest fur amount: tufts are generated for this and a prefix of them is drawn. */
export const MAX_FUR = 2;

type Tuft = {
  /** 0 along the sides, 1 on the rounded end at the first point, 2 at the second. */
  region: 0 | 1 | 2;
  /** Position along the part, 0 to 1. */
  t: number;
  /** Angle around the part. */
  phi: number;
  /** On a rounded end: how far toward its pole, 0 to a quarter turn. */
  alpha: number;
  /** Length relative to the part's tuft length. */
  len: number;
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, Tuft[]>();

function tuftsFor(id: string, spec: FurSpec): Tuft[] {
  const key = `${id}:${spec.count}:${spec.capShare}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const random = mulberry32(hash(id));
  const tufts: Tuft[] = [];
  const total = Math.ceil(spec.count * MAX_FUR);
  for (let i = 0; i < total; i++) {
    const onCap = random() < spec.capShare;
    tufts.push({
      region: onCap ? (random() < 0.5 ? 1 : 2) : 0,
      t: random(),
      phi: random() * Math.PI * 2,
      // Uniform over the surface of a hemisphere.
      alpha: Math.asin(random()),
      len: 0.55 + 0.9 * random(),
    });
  }
  cache.set(key, tufts);
  return tufts;
}

/** A tuft as two crossed triangles sharing a tip, so it has width from every direction. */
export type TuftShape = { tip: V3; a1: V3; a2: V3; b1: V3; b2: V3 };

/** The tufts of one part for a fur amount between 0 and MAX_FUR. */
export function tuftShapes(part: Capsule, amount: number): TuftShape[] {
  const spec = part.fur;
  const fur = clamp(amount, 0, MAX_FUR);
  if (!spec || fur <= 0) return [];
  const tufts = tuftsFor(part.id, spec);
  const count = Math.min(tufts.length, Math.round(spec.count * fur));
  const lengthScale = 0.6 + 0.4 * fur;

  const axis = normalize(sub(part.b, part.a), Z);
  const n1 = normalize(cross(axis, part.ref), normalize(cross(axis, Z)));
  const n2 = cross(axis, n1);

  const shapes: TuftShape[] = [];
  for (let i = 0; i < count; i++) {
    const tuft = tufts[i];
    const radial = offset([0, 0, 0], n1, Math.cos(tuft.phi), n2, Math.sin(tuft.phi));
    let centre: V3;
    let radius: number;
    let normal: V3;
    let lean = spec.lean;
    if (tuft.region === 0) {
      centre = lerp(part.a, part.b, tuft.t);
      radius = mix(part.ra, part.rb, tuft.t);
      normal = radial;
    } else {
      const atStart = tuft.region === 1;
      centre = atStart ? part.a : part.b;
      radius = atStart ? part.ra : part.rb;
      normal = normalize(
        offset([0, 0, 0], radial, Math.cos(tuft.alpha), axis, (atStart ? -1 : 1) * Math.sin(tuft.alpha)),
      );
      lean *= 0.5;
    }
    // Rooted a little inside the surface so the base never shows as a gap.
    const root = add(centre, mul(normal, radius * 0.88));
    const length = spec.length * tuft.len * lengthScale;
    const tip = add(root, mul(normalize(offset(normal, axis, lean)), length + radius * 0.12));
    const side1 = normalize(cross(normal, axis), n1);
    const side2 = cross(normal, side1);
    const half = Math.max(length * 0.5, 0.015);
    shapes.push({
      tip,
      a1: add(root, mul(side1, half)),
      a2: sub(root, mul(side1, half)),
      b1: add(root, mul(side2, half)),
      b2: sub(root, mul(side2, half)),
    });
  }
  return shapes;
}
