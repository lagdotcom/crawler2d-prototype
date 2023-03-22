import { XYTag, xyToTag } from "./tools/xyTags";
import { move, rotate } from "./tools/geometry";

import Dir from "./types/Dir";
import Engine from "./Engine";
import XY from "./types/XY";

interface FovEntry {
  x: number;
  y: number;
  dx: number;
  dz: number;
}

const facingDisplacements: Record<Dir, [number, number, number, number]> = {
  [Dir.E]: [0, 1, -1, 0],
  [Dir.N]: [1, 0, 0, 1],
  [Dir.S]: [-1, 0, 0, -1],
  [Dir.W]: [0, -1, 1, 0],
};

function getDisplacement(from: XY, to: XY, facing: Dir) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const [a, b, c, d] = facingDisplacements[facing];
  const x = dx * a + dy * b;
  const y = dx * c + dy * d;
  return [x, y];
}

class FovCalculator {
  entries: Map<XYTag, FovEntry>;

  constructor(public g: Engine) {
    this.entries = new Map();
  }

  calculate(width: number, depth: number) {
    const position = this.g.position;
    this.propagate(position, width, depth);

    return [...this.entries.values()].sort((a, b) => {
      const zd = a.dz - b.dz;
      if (zd) return zd;

      const xd = Math.abs(a.dx) - Math.abs(b.dx);
      return -xd;
    });
  }

  private displacement(position: XY) {
    return getDisplacement(this.g.position, position, this.g.facing);
  }

  private propagate(position: XY, width: number, depth: number) {
    if (width <= 0 || depth <= 0) return;

    const { g } = this;
    const { facing } = g;

    const tag = xyToTag(position);
    if (this.entries.has(tag)) return;

    const { x, y } = position;

    const cell = g.getCell(x, y);
    if (!cell) return;

    const [dx, dz] = this.displacement(position);
    this.entries.set(tag, { x, y, dx, dz });

    const leftDir = rotate(facing, 3);
    const leftWall = cell.sides[leftDir];
    if (!leftWall?.wall)
      this.propagate(move(position, leftDir), width - 1, depth);

    const rightDir = rotate(facing, 1);
    const rightWall = cell.sides[rightDir];
    if (!rightWall?.wall)
      this.propagate(move(position, rightDir), width - 1, depth);

    const forwardWall = cell.sides[facing];
    if (!forwardWall?.wall)
      this.propagate(move(position, facing), width, depth - 1);
  }
}

export default function getFieldOfView(
  g: Engine,
  width: number,
  depth: number
) {
  const calc = new FovCalculator(g);
  return calc.calculate(width, depth);
}
