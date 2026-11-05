/** M-7.9 ring geometry — shared by the ring and the reveal origin. */
export const AREA_COUNT = 8;
/** Ring centre (px from the map top) in the overview. */
export const CENTER_Y = 250;
/** Neighbour discs' centre line (px from the map top) while an area is in focus. */
export const FOCUS_ROW_Y = 140;

export function ringRadius(width: number): number {
  return Math.min(128, width / 2 - 51);
}

/** Offset from the ring centre for area `i` at the current rotation (degrees). */
export function ringPoint(i: number, rotation: number, width: number): { x: number; y: number } {
  const a = ((-135 + i * (360 / AREA_COUNT) + rotation) * Math.PI) / 180;
  const r = ringRadius(width);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

/** Signed step from the selected area, wrapped to -4…4. */
export function stepFrom(selected: number, i: number): number {
  let d = (i - selected + AREA_COUNT) % AREA_COUNT;
  if (d > AREA_COUNT / 2) d -= AREA_COUNT;
  return d;
}
