import Dir from "./Dir";
import XY from "./XY";

export interface WorldSide {
  solid?: boolean;
  wall?: number;
  decal?: number;
}

export interface WorldCell {
  object?: number;
  ceiling?: number;
  floor?: number;
  sides: Partial<Record<Dir, WorldSide>>;
  tags: string[];
}

export interface AtlasReference {
  image: string;
  json: string;
}

interface World {
  atlas: AtlasReference;
  cells: WorldCell[][];
  start: XY;
  facing: Dir;
}
export default World;
