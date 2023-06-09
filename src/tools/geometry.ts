import Dir from "../types/Dir";
import XY from "../types/XY";

export const xy = (x: number, y: number): XY => ({ x, y });

export function addXY(a: XY, b: XY): XY {
  return { x: a.x + b.x, y: a.y + b.y };
}

const displacements: XY[] = [xy(0, -1), xy(1, 0), xy(0, 1), xy(-1, 0)];
export function displacement(dir: Dir): XY {
  return displacements[dir];
}

export function move(pos: XY, dir: Dir): XY {
  return addXY(pos, displacements[dir]);
}

export function rotate(dir: Dir, clockwise: number): Dir {
  return (dir + clockwise + 4) % 4;
}

export function dirFromInitial(initial: string): Dir {
  switch (initial) {
    case "E":
      return Dir.E;
    case "S":
      return Dir.S;
    case "W":
      return Dir.W;
    case "N":
    default:
      return Dir.N;
  }
}
