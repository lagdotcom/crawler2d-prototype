import mapDScript from "../res/map.dscript";
import minma1Image from "../res/atlas/minma1.png";
import minma1Json from "../res/atlas/minma1.json";

const Resources: Record<string, string> = {
  "minma1.png": minma1Image,
  "minma1.json": minma1Json,
  "map.dscript": mapDScript,
};

export function getResourceURL(id: string) {
  const value = Resources[id];
  if (!value) throw new Error(`Invalid resource ID: ${id}`);
  return value;
}
