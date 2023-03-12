// adapted from https://dungeoncrawlers.org/tools/dungeonrenderer/

import Atlas, { AtlasLayer, AtlasTile } from "./Atlas";

import Dir from "./Dir";
import { WorldCell } from "./World";
import getCanvasContext from "./getCanvasContext";

export const tileTag = (
  id: number,
  type: AtlasTile["type"],
  tile: AtlasTile["tile"]
) => `${type}${id}:${tile.x},${tile.z}`;

export default class DungeonRenderer {
  imageData: Map<string, AtlasTile>;
  mapSize: number;
  player: { x: number; y: number; dir: Dir };

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
    public dungeon: Atlas,
    public atlasImage: HTMLImageElement,
    public map: WorldCell[][]
  ) {
    this.imageData = new Map();

    // TODO actually load this from map
    this.mapSize = 16;
    this.player = { x: 1, y: 2, dir: 0 };
  }

  generateImages() {
    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = this.atlasImage.width;
    atlasCanvas.height = this.atlasImage.height;
    const atlasCtx = getCanvasContext(atlasCanvas, "2d", {
      willReadFrequently: true,
    });
    atlasCtx.drawImage(this.atlasImage, 0, 0);

    const promises = [];

    for (const layer of this.dungeon.layers) {
      for (const entry of layer.tiles) {
        const imageData = atlasCtx.getImageData(
          entry.coords.x,
          entry.coords.y,
          entry.coords.w,
          entry.coords.h
        );
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = entry.coords.w;
        tmpCanvas.height = entry.coords.h;
        const tmpCtx = getCanvasContext(tmpCanvas, "2d");
        if (entry.flipped) {
          const data = this.flipImage(
            entry.coords.w,
            entry.coords.h,
            imageData.data
          );
          imageData.data.set(data);
        }
        tmpCtx.putImageData(imageData, 0, 0);

        this.imageData.set(tileTag(layer.id, entry.type, entry.tile), entry);
        promises.push(
          createImageBitmap(imageData).then((bmp) => {
            entry.image = bmp;
            return entry;
          })
        );
      }
    }

    return Promise.all(promises);
  }

  getImage(id: number, type: AtlasTile["type"], x: number, z: number) {
    const tag = tileTag(id, type, { x, z });
    return this.imageData.get(tag);
  }

  flipImage(w: number, h: number, data: Uint8ClampedArray) {
    const flippedData = new Uint8Array(w * h * 4);
    for (let col = 0; col < w; col++) {
      for (let row = 0; row < h; row++) {
        const index = (w - 1 - col) * 4 + row * w * 4;
        const index2 = col * 4 + row * w * 4;
        flippedData[index2] = data[index];
        flippedData[index2 + 1] = data[index + 1];
        flippedData[index2 + 2] = data[index + 2];
        flippedData[index2 + 3] = data[index + 3];
      }
    }
    return flippedData;
  }

  getLayersOfType(type: AtlasLayer["type"]) {
    return this.dungeon.layers.filter((layer) => layer.type === type);
  }

  project(x: number, z: number): [x: number, y: number] {
    switch (this.player.dir) {
      case 0:
        return [this.player.x + x, this.player.y + z];
      case 1:
        return [this.player.x - z, this.player.y + x];
      case 2:
        return [this.player.x - x, this.player.y - z];
      case 3:
        return [this.player.x + z, this.player.y - x];

      default:
        throw new Error(`Invalid direction: ${this.player.dir}`);
    }
  }

  draw(result: AtlasTile) {
    const dx = result.screen.x - (result.flipped ? result.coords.w : 0);
    const dy = result.screen.y;
    this.ctx.drawImage(result.image, dx, dy);
  }

  drawFront(result: AtlasTile, x: number) {
    const dx = result.screen.x + x * result.coords.fullWidth;
    const dy = result.screen.y;
    this.ctx.drawImage(result.image, dx, dy);
  }

  drawSides(z: number) {
    for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
      const [px, py] = this.project(x, z);

      if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
        const cell = this.map[py][px];

        if (cell.wall) {
          const result = this.getImage(cell.wall, "side", x, z);
          if (result) this.draw(result);
        }

        if (cell.decal) {
          const result = this.getImage(cell.decal, "side", x, z);
          if (result) this.draw(result);
        }
      }
    }
  }

  drawFronts(z: number) {
    for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
      const [px, py] = this.project(x, z);

      if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
        const cell = this.map[py][px];

        if (cell.wall) {
          const result = this.getImage(cell.wall, "front", 0, z);
          if (result) this.drawFront(result, x);
        }

        if (cell.decal) {
          const result = this.getImage(cell.decal, "front", 0, z);
          if (result) this.drawFront(result, x);
        }

        if (cell.object) {
          const result = this.getImage(cell.object, "object", 0, z);
          if (result) this.drawFront(result, x);
        }
      }
    }
  }

  drawFloor(z: number) {
    for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
      const [px, py] = this.project(x, z);

      if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
        const cell = this.map[py][px];

        if (cell.floor) {
          const result = this.getImage(cell.floor, "floor", x, z);
          if (result) this.draw(result);
        }
      }
    }
  }

  drawCeiling(z: number) {
    for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
      const [px, py] = this.project(x, z);

      if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
        const cell = this.map[py][px];

        if (cell.ceiling) {
          const result = this.getImage(cell.ceiling, "ceiling", x, z);
          if (result) this.draw(result);
        }
      }
    }
  }

  cls() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    this.cls();

    // draw ceiling
    for (let z = -this.dungeon.depth; z <= 0; z++) {
      this.drawCeiling(z);
    }

    // draw floor
    for (let z = -this.dungeon.depth; z <= 0; z++) {
      this.drawFloor(z);
    }

    // draw wall, decal and object layers
    for (let z = -this.dungeon.depth; z <= 0; z++) {
      this.drawSides(z);
      this.drawFronts(z);
    }
  }
}
