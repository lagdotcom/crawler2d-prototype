import { move, rotate, xy } from "./tools/geometry";

import Dir from "./types/Dir";
import DungeonRenderer from "./DungeonRenderer";
import MinimapRenderer from "./MinimapRenderer";
import ResourceManager from "./ResourceManager";
import Soon from "./Soon";
import World from "./types/World";
import XY from "./types/XY";
import clone from "nanoclone";
import convertGridCartographerMap from "./convertGridCartographerMap";
import getCanvasContext from "./tools/getCanvasContext";

type RenderSetup = {
  dungeon: DungeonRenderer;
  minimap: MinimapRenderer;
};

export default class Engine {
  ctx: CanvasRenderingContext2D;
  drawSoon: Soon;
  facing: Dir;
  position: XY;
  renderSetup?: RenderSetup;
  res: ResourceManager;
  world?: World;
  worldSize: XY;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = getCanvasContext(canvas, "2d");

    this.facing = Dir.N;
    this.position = xy(0, 0);
    this.worldSize = xy(0, 0);
    this.res = new ResourceManager();
    this.drawSoon = new Soon(this.render);

    canvas.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") this.turn(-1);
      else if (e.key === "ArrowRight") this.turn(1);
      else if (e.key === "ArrowUp") this.move(this.facing);
      else if (e.key === "ArrowDown") this.move(rotate(this.facing, 2));
    });
  }

  async loadWorld(w: World) {
    this.renderSetup = undefined;

    this.world = clone(w);
    this.worldSize = xy(this.world.cells[0].length, this.world.cells.length);
    this.position = w.start;
    this.facing = w.facing;

    const [atlas, image] = await Promise.all([
      this.res.loadAtlas(w.atlas.json),
      this.res.loadImage(w.atlas.image),
    ]);
    const dungeon = new DungeonRenderer(this, atlas, image);
    const minimap = new MinimapRenderer(this);

    await dungeon.generateImages();

    this.renderSetup = { dungeon, minimap };
    return this.draw();
  }

  async loadGCMap(jsonUrl: string, region: number, floor: number) {
    this.renderSetup = undefined;

    const map = await this.res.loadGCMap(jsonUrl);
    const { atlas, cells, start, facing } = convertGridCartographerMap(
      map,
      region,
      floor
    );
    if (!atlas) throw new Error(`${jsonUrl} did not contain #ATLAS`);

    return this.loadWorld({ atlas, cells, start, facing });
  }

  getCell(x: number, y: number) {
    if (x < 0 || x >= this.worldSize.x || y < 0 || y >= this.worldSize.y)
      return;

    return this.world?.cells[y][x];
  }

  draw() {
    this.drawSoon.schedule();
  }

  render = () => {
    const { ctx, renderSetup } = this;
    const { width, height } = this.canvas;

    ctx.clearRect(0, 0, width, height);

    if (!renderSetup) {
      this.draw();
      return;
    }

    renderSetup.dungeon.render();
    renderSetup.minimap.render();
  };

  canMove(dir: Dir) {
    // has something gone badly wrong?
    const at = this.getCell(this.position.x, this.position.y);
    if (!at) return false;

    // is there a wall in the way?
    const wall = at?.sides[dir];
    if (wall?.solid) return false;

    // is there anywhere to move to??
    const destination = move(this.position, dir);
    const cell = this.getCell(destination.x, destination.y);
    if (!cell) return false;

    // TODO etc. etc.
    return true;
  }

  move(dir: Dir) {
    if (this.canMove(dir)) {
      this.position = move(this.position, dir);
      this.draw();
    }
  }

  turn(clockwise: number) {
    this.facing = rotate(this.facing, clockwise);
    this.draw();
  }
}
