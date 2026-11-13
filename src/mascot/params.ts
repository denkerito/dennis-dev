// Parameters of the cat's look. Framework-free: this module and the rest of
// `src/mascot/` must not import React, Next.js or anything from `src/app/`.
//
// Lengths are in body units: 1 unit is the distance from shoulder to hip of a
// cat whose `bodyLength` is 1.

export type CatParams = {
  /** Radius of the head. */
  headSize: number;
  /** Height of the ears above the head. */
  earSize: number;
  /** Height of the shoulder and hip joints above the ground. */
  legLength: number;
  /** Distance from shoulder to hip. */
  bodyLength: number;
  /** Thickness of chest, belly and rump (1 = default). */
  bodyGirth: number;
  /** Length of the tail. */
  tailLength: number;
  /** Radius of the tail. */
  tailGirth: number;
  /** Size of the eyes relative to the head (1 = default). */
  eyeSize: number;
  /** Amount of fur: 0 is a smooth outline, 1 the default, 2 very shaggy. */
  fur: number;
  /** Viewing angle in degrees above the ground: 0 is level, 90 is from straight above. */
  elevation: number;
  /** Height of the standing cat in CSS pixels, ground to ear tips, seen level. */
  size: number;
};

export type CatParamKey = keyof CatParams;

/** Kitten proportions: large head and ears, short legs, thick tail. */
export const DEFAULT_PARAMS: CatParams = {
  headSize: 0.38,
  earSize: 0.34,
  legLength: 0.6,
  bodyLength: 0.82,
  bodyGirth: 1,
  tailLength: 1,
  tailGirth: 0.13,
  eyeSize: 1,
  fur: 1,
  elevation: 50,
  size: 180,
};

export type ParamControl = {
  key: CatParamKey;
  label: string;
  group: "Proportions" | "Fur" | "View";
  min: number;
  max: number;
  step: number;
  /** Shown after the value, for example "°" or "px". */
  unit?: string;
};

/** Every adjustable parameter, in the order the lab shows them. */
export const PARAM_CONTROLS: readonly ParamControl[] = [
  { key: "headSize", label: "Head size", group: "Proportions", min: 0.24, max: 0.5, step: 0.01 },
  { key: "earSize", label: "Ear size", group: "Proportions", min: 0.1, max: 0.5, step: 0.01 },
  { key: "legLength", label: "Leg length", group: "Proportions", min: 0.35, max: 0.9, step: 0.01 },
  { key: "bodyLength", label: "Body length", group: "Proportions", min: 0.7, max: 1.4, step: 0.01 },
  { key: "bodyGirth", label: "Body girth", group: "Proportions", min: 0.7, max: 1.4, step: 0.01 },
  { key: "tailLength", label: "Tail length", group: "Proportions", min: 0.5, max: 1.6, step: 0.01 },
  { key: "tailGirth", label: "Tail thickness", group: "Proportions", min: 0.05, max: 0.2, step: 0.005 },
  { key: "eyeSize", label: "Eye size", group: "Proportions", min: 0.5, max: 1.6, step: 0.05 },
  { key: "fur", label: "Fur", group: "Fur", min: 0, max: 2, step: 0.05 },
  { key: "elevation", label: "Viewing angle", group: "View", min: 10, max: 85, step: 1, unit: "°" },
  { key: "size", label: "Size", group: "View", min: 80, max: 400, step: 1, unit: "px" },
];

export type CatPose = "standing" | "walking" | "seated";

export const POSES: readonly { value: CatPose; label: string }[] = [
  { value: "standing", label: "Standing" },
  { value: "walking", label: "Walking" },
  { value: "seated", label: "Seated" },
];

/** What the cat is doing and where it faces, as opposed to how it is built. */
export type CatView = {
  /** Degrees. 0 faces the viewer, 90 faces the viewer's right, 180 faces away, 270 faces left. */
  heading: number;
  /** Degrees, -90 to 90. Positive turns the head toward the cat's own left. */
  headTurn: number;
  /** 0 is on its feet, 1 is seated; values between are the cat sitting down or getting up. */
  sit: number;
  /** How much the legs are stepping: 0 stands still, 1 lifts the paws fully. */
  step: number;
  /** How far each step travels: 0 steps in place (turning on the spot), 1 is the full walk. */
  stride: number;
  /** Position in the walk cycle, 0 to 1. Has no effect while `step` is 0. */
  phase: number;
  /** 1 is open, 0 is closed. Defaults to 1. */
  eyeOpen?: number;
  /** -1 to 1: a sideways sweep of the tail. Defaults to 0. */
  tailFlick?: number;
  /** Draw joints, bones and paw contacts over the cat. A tuning aid. */
  showSkeleton?: boolean;
};

/** The three poses the lab offers, as amounts of sitting, stepping and stride. */
export const POSE_VIEW: Record<CatPose, Pick<CatView, "sit" | "step" | "stride">> = {
  standing: { sit: 0, step: 0, stride: 0 },
  walking: { sit: 0, step: 1, stride: 1 },
  seated: { sit: 1, step: 0, stride: 0 },
};

export const DEFAULT_VIEW: CatView = {
  heading: 35,
  headTurn: 0,
  ...POSE_VIEW.standing,
  phase: 0,
  showSkeleton: false,
};

/** Colours the cat is painted with. The caller supplies them, usually from theme tokens. */
export type CatPaint = {
  /** The silhouette. */
  body: string;
  /** Eyes and whiskers. */
  detail: string;
  /** Colour of the skeleton overlay. Defaults to `detail`. */
  overlay?: string;
  /** Colour of the eyes. Defaults to `detail`. */
  eye?: string;
  /** If set, each eye gets a vertical slit pupil of this colour. */
  pupil?: string;
  /** If set, the inside of the ears is drawn in this colour where it faces the viewer. */
  earInner?: string;
};

/** Duration of one full walk cycle, in seconds: a kitten's quick steps. */
export const WALK_CYCLE_SECONDS = 0.36;
