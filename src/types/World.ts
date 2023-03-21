import Dir from "./Dir";
import XY from "./XY";

export type WorldSide = {
  solid?: boolean;
  wall?: number;
  decal?: number;
};

export type WorldCell = {
  object?: number;
  ceiling?: number;
  floor?: number;
  sides: Partial<Record<Dir, WorldSide>>;
};

type World = {
  atlas: { image: string; json: string };
  cells: WorldCell[][];
  start: XY;
  facing: Dir;
};
export default World;
