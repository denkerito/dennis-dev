// The camera: from body coordinates to the screen.
//
// The viewer stands in front of the scene and looks down at it from a fixed
// angle of elevation. The projection is orthographic, so a sphere always
// projects to a circle of its own radius and the silhouette of the cat is
// exactly the union of the silhouettes of its parts.

import { type V3, dot, radians } from "./vec";

export type P2 = { x: number; y: number };

export type Camera = {
  /** Pixels per body unit. */
  scale: number;
  /** Screen position of a point, in pixels from the cat's ground point; y grows downward. */
  point: (p: V3) => P2;
  /** Screen offset of a direction or displacement. */
  vector: (v: V3) => P2;
  /** Unit vector from the scene toward the viewer, in body coordinates. */
  toCamera: V3;
};

/**
 * @param heading degrees: 0 faces the viewer, 90 the viewer's right, 180 away, 270 the viewer's left
 * @param elevation degrees above the ground: 0 is level, 90 is from straight above
 * @param scale pixels per body unit
 */
export function makeCamera(heading: number, elevation: number, scale: number): Camera {
  const th = radians(heading);
  const el = radians(elevation);
  const right: V3 = [Math.sin(th), Math.cos(th), 0];
  const up: V3 = [-Math.cos(th) * Math.sin(el), Math.sin(th) * Math.sin(el), Math.cos(el)];
  const toCamera: V3 = [Math.cos(th) * Math.cos(el), -Math.sin(th) * Math.cos(el), Math.sin(el)];
  const vector = (v: V3): P2 => ({ x: dot(v, right) * scale, y: -dot(v, up) * scale });
  return { scale, point: vector, vector, toCamera };
}
