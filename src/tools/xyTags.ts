import XY from "../types/XY";

export type XYTag = `${number},${number}`;

export function xyToTag(pos: XY): XYTag {
  return `${pos.x},${pos.y}`;
}

export function tagToXy(tag: XYTag): XY {
  const [x, y] = tag.split(",");
  return { x: Number(x), y: Number(y) };
}
