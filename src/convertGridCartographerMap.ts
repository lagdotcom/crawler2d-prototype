import { Map, Tile } from "./GridCartographer/schema";
import World, { WorldCell } from "./types/World";
import { dirFromInitial, xy } from "./tools/geometry";

import { AtlasResources } from "./resources";
import Dir from "./types/Dir";
import { Edge } from "./GridCartographer/enums";
import Grid from "./Grid";
import XY from "./types/XY";

type EdgeSide = { decal?: string; wall?: boolean; solid?: boolean };
type EdgeEntry = { main: EdgeSide; opposite: EdgeSide };

const wall = { wall: true, solid: true };
const door = { decal: "Door", wall: true };
const invisible = { solid: true };
const fake = { wall: true };

const defaultEdge: EdgeEntry = { main: wall, opposite: wall };

const EdgeDetails: Partial<Record<Edge, EdgeEntry>> = {
  [Edge.Door]: { main: door, opposite: door },
  [Edge.Door_Box]: { main: door, opposite: door },
  [Edge.Door_OneWayRD]: { main: door, opposite: wall },
  [Edge.Door_OneWayLU]: { main: wall, opposite: door },
  [Edge.Wall_Secret]: { main: invisible, opposite: invisible },
  [Edge.Wall_OneWayRD]: { main: fake, opposite: wall },
  [Edge.Wall_OneWayLU]: { main: wall, opposite: fake },
};

function apply(
  decals: Record<string, number>,
  edge: Edge,
  texture: number,
  lt: WorldCell,
  ld: Dir,
  rt: WorldCell,
  rd: Dir
) {
  const { main, opposite } = EdgeDetails[edge] ?? defaultEdge;

  lt.sides[ld] = {
    wall: main.wall ? texture : undefined,
    decal: decals[`${main.decal},${texture}`],
    solid: main.solid,
  };
  rt.sides[rd] = {
    wall: opposite.wall ? texture : undefined,
    decal: decals[`${opposite.decal},${texture}`],
    solid: opposite.solid,
  };
}

export default function convertGridCartographerMap(
  j: Map,
  region = 0,
  floor = 0
): { atlas?: World["atlas"]; cells: WorldCell[][]; start: XY; facing: Dir } {
  const r = j.regions[region];
  if (!r) throw new Error(`No such region: ${region}`);

  const f = r.floors.find((f) => f.index === floor);
  if (!f) throw new Error(`No such floor: ${floor}`);

  const grid = new Grid<WorldCell>(() => ({ sides: {} }));
  const decals: Record<string, number> = {};

  let atlas: World["atlas"] | undefined = undefined;
  let start = xy(0, 0);
  let facing = Dir.N;
  for (const note of f.notes) {
    const { __data, x, y } = note;
    if (!__data || !__data.startsWith("#")) continue;

    const [cmd, arg] = __data.split(" ");
    if (cmd === "#ATLAS") {
      atlas = AtlasResources[arg];
    } else if (cmd === "#START") {
      start = { x, y };
      facing = dirFromInitial(arg);
    } else if (cmd === "#DECAL") {
      const [name, texture, decal] = arg.split(",");
      decals[`${name},${texture}`] = Number(decal);
    }
  }

  for (const row of f.tiles.rows ?? []) {
    let x = f.tiles.bounds.x0 + row.start;
    const y =
      r.setup.origin === "tl"
        ? row.y
        : f.tiles.bounds.height - (row.y - f.tiles.bounds.y0) - 1;

    for (const tile of row.tdata) {
      const mt = grid.getOrDefault({ x, y });
      if (tile.t) mt.floor = tile.tc || 1;

      // TODO different ceiling textures?
      if (tile.c) mt.ceiling = 1;

      if (tile.b)
        apply(
          decals,
          tile.b,
          tile.bc ?? 1,
          mt,
          Dir.S,
          grid.getOrDefault({ x, y: y + 1 }),
          Dir.N
        );

      if (tile.r)
        apply(
          decals,
          tile.r,
          tile.rc ?? 1,
          mt,
          Dir.E,
          grid.getOrDefault({ x: x + 1, y: y }),
          Dir.W
        );

      x++;
    }
  }

  const cells = grid.asArray();
  return { atlas, cells, start, facing };
}
