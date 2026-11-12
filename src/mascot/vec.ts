// Minimal 3D vector helpers for the cat's skeleton.
//
// Body coordinates: x points forward (toward the nose), y to the cat's own
// left, z up. The origin is on the ground under the middle of the body.

export type V3 = readonly [number, number, number];

export const X: V3 = [1, 0, 0];
export const Y: V3 = [0, 1, 0];
export const Z: V3 = [0, 0, 1];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const distance = (a: V3, b: V3): number => length(sub(a, b));

export function normalize(a: V3, fallback: V3 = X): V3 {
  const l = length(a);
  return l < 1e-9 ? fallback : [a[0] / l, a[1] / l, a[2] / l];
}

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export const lerp = (a: V3, b: V3, t: number): V3 => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

/** a + b*kb + c*kc + d*kd: a point offset along up to three directions. */
export function offset(a: V3, b: V3, kb: number, c: V3 = X, kc = 0, d: V3 = X, kd = 0): V3 {
  return [
    a[0] + b[0] * kb + c[0] * kc + d[0] * kd,
    a[1] + b[1] * kb + c[1] * kc + d[1] * kd,
    a[2] + b[2] * kb + c[2] * kc + d[2] * kd,
  ];
}

/** Rotates a vector about the vertical axis; positive angles turn x toward y. */
export function rotateZ(a: V3, radians: number): V3 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c, a[2]];
}

export const radians = (degrees: number): number => (degrees * Math.PI) / 180;
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
