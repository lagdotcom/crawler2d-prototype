import Dir from "./Dir";
import XY from "./XY";

export type WorldCell = {
  solid?: boolean;
  wall?: number;
  decal?: number;
  object?: number;
  ceiling?: number;
  floor?: number;
};

type World = {
  atlas: { image: string; json: string };
  cells: WorldCell[][];
  start: XY;
  facing: Dir;
};
export default World;
