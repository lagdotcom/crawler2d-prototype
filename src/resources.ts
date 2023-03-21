import World from "./types/World";
import minma1Image from "../res/atlas/minma1.png";
import minma1Json from "../res/atlas/minma1.json";

export const AtlasResources: Record<string, World["atlas"]> = {
  minma1: { image: minma1Image, json: minma1Json },
};
