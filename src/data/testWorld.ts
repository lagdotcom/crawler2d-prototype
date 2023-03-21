import Dir from "../types/Dir";
import World from "../types/World";
import convertWormTunnel from "../convertWormTunnel";
import image from "../../res/atlas/minma1.png";
import json from "../../res/atlas/minma1.json";
import { xy } from "../tools/geometry";

enum Id {
  White = 1,
  Door = 2,
}

const _ = { floor: Id.White, ceiling: Id.White };
const a = { wall: Id.White };
const b = { wall: Id.White, decal: Id.Door };

const testWorld: World = {
  atlas: { image, json },
  cells: convertWormTunnel([
    [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
    [a, _, _, _, _, _, _, a, b, _, _, a, _, _, _, a],
    [a, _, a, a, a, a, _, a, a, a, _, a, _, a, a, a],
    [a, a, _, _, _, _, _, _, _, _, _, _, _, _, _, a],
    [a, _, _, _, a, _, a, b, a, _, a, _, a, a, _, a],
    [a, _, a, _, a, _, a, a, a, _, a, _, a, _, _, a],
    [a, _, _, _, _, _, _, _, _, _, _, _, _, _, _, a],
    [a, _, a, _, a, _, _, _, a, a, a, _, _, _, _, a],
    [a, _, _, a, a, _, b, _, a, _, _, _, _, a, _, a],
    [a, _, _, _, _, _, a, _, _, a, _, _, a, a, _, a],
    [a, a, _, a, a, _, a, _, a, a, _, _, _, _, _, a],
    [a, _, _, _, a, _, _, _, _, _, _, a, a, _, a, a],
    [a, _, a, _, a, _, _, a, _, _, _, a, a, _, _, a],
    [a, a, a, _, _, _, a, a, a, _, a, a, _, _, _, a],
    [a, _, _, _, a, _, _, a, _, _, _, _, _, a, _, a],
    [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
  ]),
  start: xy(1, 2),
  facing: Dir.N,
};
export default testWorld;
