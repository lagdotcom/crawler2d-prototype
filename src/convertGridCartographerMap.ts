import { AtlasReference, WorldCell } from "./types/World";
import { Edge, GCMap } from "./types/GCMap";
import { dirFromInitial, xy } from "./tools/geometry";

import { AtlasResources } from "./resources";
import Dir from "./types/Dir";
import Grid from "./Grid";
import XY from "./types/XY";

interface EdgeSide {
  decal?: string;
  wall?: boolean;
  solid?: boolean;
}
interface EdgeEntry {
  main: EdgeSide;
  opposite: EdgeSide;
}

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

class GCMapConverter {
  atlas?: AtlasReference;
  decals: Map<string, number>;
  definitions: Map<string, number>;
  textures: Map<number, number>;
  start: XY;
  facing: Dir;

  constructor() {
    this.decals = new Map();
    this.definitions = new Map();
    this.textures = new Map();
    this.start = xy(0, 0);
    this.facing = Dir.N;
  }

  convert(
    j: GCMap,
    region = 0,
    floor = 0
  ): { atlas?: AtlasReference; cells: WorldCell[][]; start: XY; facing: Dir } {
    if (!(region in j.regions)) throw new Error(`No such region: ${region}`);
    const r = j.regions[region];

    const f = r.floors.find((f) => f.index === floor);
    if (!f) throw new Error(`No such floor: ${floor}`);

    const grid = new Grid<WorldCell>(() => ({ sides: {} }));

    for (const note of f.notes) {
      const { __data, x, y } = note;

      for (const line of __data?.split("\n") ?? []) {
        if (!line.startsWith("#")) continue;

        const [cmd, arg] = line.split(" ");
        this.applyCommand(cmd, arg, x, y);
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
        if (tile.t) mt.floor = this.getTexture(tile.tc);

        // TODO different ceiling textures?
        if (tile.c) mt.ceiling = this.getTexture(0);

        if (tile.b)
          this.setEdge(
            tile.b,
            tile.bc,
            mt,
            Dir.S,
            grid.getOrDefault({ x, y: y + 1 }),
            Dir.N
          );

        if (tile.r)
          this.setEdge(
            tile.r,
            tile.rc,
            mt,
            Dir.E,
            grid.getOrDefault({ x: x + 1, y: y }),
            Dir.W
          );

        x++;
      }
    }

    const { atlas, start, facing } = this;
    const cells = grid.asArray();
    return { atlas, cells, start, facing };
  }

  getTexture(index: number = 0) {
    const texture = this.textures.get(index);
    if (typeof texture === "undefined")
      throw new Error(`Unknown texture for palette index ${index}`);

    return texture;
  }

  eval(s: string) {
    const def = this.definitions.get(s);
    if (typeof def !== "undefined") return def;

    const num = Number(s);
    if (!isNaN(num)) return num;

    throw new Error(`Could not evaluate: ${s}`);
  }

  applyCommand(cmd: string, arg: string, x: number, y: number) {
    switch (cmd) {
      case "#ATLAS":
        this.atlas = AtlasResources[arg];
        return;

      case "#DEFINE": {
        const [key, value] = arg.split(",");
        if (this.definitions.has(key))
          throw new Error(`Already defined: ${key}`);
        this.definitions.set(key, this.eval(value));
        return;
      }

      case "#STYLE": {
        const [index, value] = arg.split(",");
        this.textures.set(this.eval(index), this.eval(value));
        return;
      }

      case "#DECAL": {
        const [name, texture, decal] = arg.split(",");
        this.decals.set(`${name},${this.eval(texture)}`, this.eval(decal));
        return;
      }

      case "#START":
        this.start = { x, y };
        this.facing = dirFromInitial(arg);
        return;

      default:
        throw new Error(`Unknown command: ${cmd} ${arg} at (${x},${y})`);
    }
  }

  setEdge(
    edge: Edge,
    index: number | undefined,
    lt: WorldCell,
    ld: Dir,
    rt: WorldCell,
    rd: Dir
  ) {
    const { main, opposite } = EdgeDetails[edge] ?? defaultEdge;
    const texture = this.getTexture(index);

    lt.sides[ld] = {
      wall: main.wall ? texture : undefined,
      decal: this.decals.get(`${main.decal},${texture}`),
      solid: main.solid,
    };
    rt.sides[rd] = {
      wall: opposite.wall ? texture : undefined,
      decal: this.decals.get(`${opposite.decal},${texture}`),
      solid: opposite.solid,
    };
  }
}

export default function convertGridCartographerMap(
  j: GCMap,
  region = 0,
  floor = 0
) {
  const converter = new GCMapConverter();
  return converter.convert(j, region, floor);
}
