import XY from "./XY";

export interface AtlasTile {
  type: "front" | "side" | "floor" | "ceiling" | "object";
  flipped: boolean;
  tile: { x: number; z: number };
  screen: XY;
  coords: { x: number; y: number; w: number; h: number; fullWidth: number };

  image: CanvasImageSource; // this is added by DungeonRenderer
}

export interface AtlasLayer {
  on: boolean;
  index: number;
  name: string;
  type: "Walls" | "Decal" | "Floor" | "Ceiling" | "Object";
  id: number;
  scale: XY;
  offset: XY;
  tiles: AtlasTile[];
}

interface Atlas {
  version: string;
  generated: string;
  resolution: { width: number; height: number };
  depth: number;
  width: number;
  layers: AtlasLayer[];
}
export default Atlas;
