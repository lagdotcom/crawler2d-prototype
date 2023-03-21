import { WorldCell, WorldSide } from "./types/World";

import Dir from "./types/Dir";
import Grid from "./Grid";

type WormTunnelCell = Pick<WorldCell, "object" | "ceiling" | "floor"> &
  Pick<WorldSide, "wall" | "decal">;

export default function convertWormTunnel(
  src: WormTunnelCell[][]
): WorldCell[][] {
  const grid = new Grid<WorldCell>(() => ({ sides: {} }));

  for (let y = 0; y < src.length; y++) {
    for (let x = 0; x < src[y].length; x++) {
      const wtc = src[y][x];
      const cc = grid.getOrDefault({ x, y });
      cc.floor = wtc.floor;
      cc.ceiling = wtc.ceiling;
      cc.object = wtc.object;

      if (wtc.wall || wtc.decal) {
        const side = { wall: wtc.wall, decal: wtc.decal, solid: true };
        cc.sides = [side, side, side, side];

        const nc = grid.getOrDefault({ x, y: y - 1 });
        const ec = grid.getOrDefault({ x: x + 1, y });
        const sc = grid.getOrDefault({ x, y: y + 1 });
        const wc = grid.getOrDefault({ x: x - 1, y });

        nc.sides[Dir.S] = side;
        ec.sides[Dir.W] = side;
        sc.sides[Dir.N] = side;
        wc.sides[Dir.E] = side;
      }
    }
  }

  return grid.asArray();
}
