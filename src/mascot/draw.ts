import { tuftShapes } from "./fur";
import { cycleDistance, movingPose } from "./gait";
import type { CatPaint, CatParams, CatView } from "./params";
import { seatedPose } from "./poses";
import { type Camera, type P2, makeCamera } from "./project";
import { type Rig, assembleRig, blendRigs, standingHeight } from "./skeleton";
import { type V3, clamp, cross, dot, lerp, mix, mul, normalize, offset, radians, sub } from "./vec";

const TAU = Math.PI * 2;

/** The cat's shapes for a view, before projection. */
export function rigFor(params: CatParams, view: CatView): Rig {
  const headTurn = clamp(view.headTurn, -90, 90);
  const sit = clamp(view.sit, 0, 1);
  const flick = clamp(view.tailFlick ?? 0, -1, 1);
  const seated = () => assembleRig(params, seatedPose(params, flick), headTurn);
  if (sit >= 1) return seated();
  const step = clamp(view.step, 0, 1);
  const stride = clamp(view.stride, 0, 1);
  const moving = assembleRig(params, movingPose(params, view.phase, step, stride, flick), headTurn);
  if (sit <= 0) return moving;
  // Eased, so the cat settles into the pose instead of arriving at constant speed.
  return blendRigs(moving, seated(), sit * sit * (3 - 2 * sit));
}

// Every sub-path is wound the same way, so that filling them together with the
// non-zero rule gives their union and overlapping parts never cut holes.

function addCircle(path: Path2D, c: P2, r: number): void {
  path.moveTo(c.x + r, c.y);
  path.arc(c.x, c.y, r, 0, TAU);
  path.closePath();
}

function addPolygon(path: Path2D, points: P2[]): void {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    area += p.x * q.y - q.x * p.y;
  }
  const ordered = area >= 0 ? points : [...points].reverse();
  path.moveTo(ordered[0].x, ordered[0].y);
  for (let i = 1; i < ordered.length; i++) path.lineTo(ordered[i].x, ordered[i].y);
  path.closePath();
}

/** Two circles and the band between them along their outer tangents. */
function addCapsule(path: Path2D, c1: P2, r1: number, c2: P2, r2: number): void {
  addCircle(path, c1, r1);
  addCircle(path, c2, r2);
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const d = Math.hypot(dx, dy);
  // One circle inside the other: the circles alone are the whole shape.
  if (d < 1e-6 || d <= Math.abs(r1 - r2)) return;
  const phi = Math.atan2(dy, dx);
  const beta = Math.acos((r1 - r2) / d);
  const at = (c: P2, r: number, angle: number): P2 => ({
    x: c.x + r * Math.cos(angle),
    y: c.y + r * Math.sin(angle),
  });
  addPolygon(path, [
    at(c1, r1, phi + beta),
    at(c2, r2, phi + beta),
    at(c2, r2, phi - beta),
    at(c1, r1, phi - beta),
  ]);
}

function silhouette(rig: Rig, params: CatParams, camera: Camera): Path2D {
  const path = new Path2D();
  const s = camera.scale;
  for (const part of rig.capsules) {
    addCapsule(path, camera.point(part.a), part.ra * s, camera.point(part.b), part.rb * s);
    for (const tuft of tuftShapes(part, params.fur)) {
      const tip = camera.point(tuft.tip);
      addPolygon(path, [camera.point(tuft.a1), camera.point(tuft.a2), tip]);
      addPolygon(path, [camera.point(tuft.b1), camera.point(tuft.b2), tip]);
    }
  }
  return path;
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  params: CatParams,
  view: CatView,
  camera: Camera,
  paint: CatPaint,
): void {
  const { c, r, forward, left, up } = rig.head;
  const azimuth = radians(40);
  const lift = radians(2);
  const k = params.eyeSize;
  const open = clamp(view.eyeOpen ?? 1, 0, 1);
  // Closed eyes are simply not there: the face is one colour.
  if (open < 0.08) return;
  for (const side of [1, -1]) {
    // Direction from the centre of the head to the eye.
    const n = normalize(
      offset(
        [0, 0, 0],
        forward,
        Math.cos(lift) * Math.cos(azimuth),
        left,
        side * Math.cos(lift) * Math.sin(azimuth),
        up,
        Math.sin(lift),
      ),
    );
    // An eye on the far side of the head is not drawn. Nearer the edge it
    // narrows by itself, because it lies flat on the head's surface.
    if (dot(n, camera.toCamera) < 0.06) continue;
    const across = normalize(cross(up, n), left);
    const along = cross(n, across);
    // Outer corners slightly raised.
    const tilt = radians(12) * side;
    const wide = offset([0, 0, 0], across, Math.cos(tilt), along, Math.sin(tilt));
    const tall = offset([0, 0, 0], across, -Math.sin(tilt), along, Math.cos(tilt));
    const centre = camera.point(offset(c, n, r * 1.01));
    const p1 = camera.vector(mul(wide, r * 0.2 * k));
    const p2 = camera.vector(mul(tall, r * 0.25 * k));
    // A unit circle drawn through this transform is the eye as it lies on the head.
    const disc = (width: number, height: number) => {
      ctx.save();
      ctx.transform(p1.x * width, p1.y * width, p2.x * height, p2.y * height, centre.x, centre.y);
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, TAU);
      ctx.restore();
      ctx.fill();
    };
    ctx.fillStyle = paint.eye ?? paint.detail;
    disc(1, open);
    if (paint.pupil) {
      ctx.fillStyle = paint.pupil;
      disc(0.3, 0.82 * open);
    }
  }
}

/** The inside of each ear, where its front faces the viewer. */
function drawInnerEars(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  camera: Camera,
  colour: string,
): void {
  ctx.fillStyle = colour;
  for (const part of rig.capsules) {
    if (!part.id.startsWith("ear-")) continue;
    const axis = normalize(sub(part.b, part.a));
    const side = normalize(cross(axis, rig.head.forward), rig.head.left);
    // Perpendicular to the ear and as close to the head's forward as possible.
    const front = cross(side, axis);
    if (dot(front, camera.toCamera) < 0.12) continue;
    const at = (t: number, across: number): V3 => {
      const radius = mix(part.ra, part.rb, t);
      return offset(lerp(part.a, part.b, t), front, radius * 0.7, side, radius * across);
    };
    const points = [at(0.1, 0.62), at(0.1, -0.62), at(0.8, 0)].map(camera.point);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWhiskers(ctx: CanvasRenderingContext2D, rig: Rig, camera: Camera): void {
  const { r: headRadius, forward, left, up } = rig.head;
  const { c, r } = rig.muzzle;
  ctx.lineWidth = Math.max(0.8, camera.scale * 0.011);
  ctx.lineCap = "round";
  for (const side of [1, -1]) {
    const facing = normalize(offset([0, 0, 0], left, side, forward, 0.9));
    if (dot(facing, camera.toCamera) < 0) continue;
    const root = camera.point(offset(c, left, side * r * 0.75, forward, r * 0.3, up, -r * 0.05));
    for (const spread of [-1, 0, 1]) {
      const dir = normalize(offset([0, 0, 0], left, side, forward, 0.15, up, spread * 0.2 - 0.02));
      const reach = camera.vector([
        dir[0] * headRadius * 1.1,
        dir[1] * headRadius * 1.1,
        dir[2] * headRadius * 1.1,
      ]);
      ctx.beginPath();
      ctx.moveTo(root.x, root.y);
      ctx.lineTo(root.x + reach.x, root.y + reach.y);
      ctx.stroke();
    }
  }
}

/** Joints, bones, paw contacts and moving ground marks: a tuning aid. */
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  params: CatParams,
  view: CatView,
  camera: Camera,
): void {
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const part of rig.capsules) {
    const a = camera.point(part.a);
    const b = camera.point(part.b);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.moveTo(a.x + 2, a.y);
    ctx.arc(a.x, a.y, 2, 0, TAU);
  }
  // Marks fixed to the ground. While walking they travel backward at the speed
  // of the ground, so a paw in stance should stay on the same mark.
  const spacing = 0.25;
  const travelled = view.phase * cycleDistance(params) * clamp(view.stride, 0, 1);
  const shift = travelled % spacing;
  for (let k = -6; k <= 6; k++) {
    const x = k * spacing - shift;
    const a = camera.point([x, -0.4, 0]);
    const b = camera.point([x, 0.4, 0]);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  for (const paw of rig.paws) {
    const onGround: V3 = [paw.p[0], paw.p[1], 0];
    const p = camera.point(onGround);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, TAU);
    if (paw.grounded) ctx.fill();
    else ctx.stroke();
  }
}

/**
 * Draws the cat on a Canvas 2D context.
 *
 * The cat's ground point (the spot on the ground under the middle of its body)
 * is drawn at the context's origin, in CSS pixels: the caller applies the
 * device-pixel-ratio scale and translates to where the cat should stand.
 * Nothing is cleared; the caller clears the canvas.
 *
 * The drawing stays within about `params.size` to either side of the origin,
 * `1.15 * params.size` above it and `0.6 * params.size` below it.
 */
export function drawCat(
  ctx: CanvasRenderingContext2D,
  params: CatParams,
  view: CatView,
  paint: CatPaint,
): void {
  const scale = params.size / standingHeight(params);
  const camera = makeCamera(view.heading, params.elevation, scale);
  const rig = rigFor(params, view);
  const path = silhouette(rig, params, camera);

  ctx.save();
  ctx.fillStyle = paint.body;
  ctx.fill(path, "nonzero");

  if (paint.earInner) drawInnerEars(ctx, rig, camera, paint.earInner);
  drawEyes(ctx, rig, params, view, camera, paint);
  ctx.strokeStyle = paint.detail;
  drawWhiskers(ctx, rig, camera);

  if (view.showSkeleton) {
    const overlay = paint.overlay ?? paint.detail;
    ctx.fillStyle = overlay;
    ctx.strokeStyle = overlay;
    drawSkeleton(ctx, rig, params, view, camera);
  }
  ctx.restore();
}
