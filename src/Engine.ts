import { move, rotate, xy } from "./tools/geometry";

import Dir from "./types/Dir";
import DungeonRenderer from "./DungeonRenderer";
import MinimapRenderer from "./MinimapRenderer";
import ResourceManager from "./ResourceManager";
import Soon from "./Soon";
import World from "./types/World";
import XY from "./types/XY";
import clone from "nanoclone";
import getCanvasContext from "./tools/getCanvasContext";

export default class Engine {
  ctx: CanvasRenderingContext2D;
  drawSoon: Soon;
  facing: Dir;
  position: XY;
  ready: boolean;
  dungeon?: DungeonRenderer;
  minimap?: MinimapRenderer;
  res: ResourceManager;
  world?: World;
  worldSize: XY;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = getCanvasContext(canvas, "2d");

    this.facing = Dir.N;
    this.position = xy(0, 0);
    this.worldSize = xy(0, 0);
    this.ready = false;
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
    this.ready = false;

    this.world = clone(w);
    this.worldSize = xy(this.world.cells[0].length, this.world.cells.length);
    this.position = w.start;
    this.facing = w.facing;

    const [atlas, image] = await Promise.all([
      this.res.loadAtlas(w.atlas.json),
      this.res.loadImage(w.atlas.image),
    ]);
    this.dungeon = new DungeonRenderer(
      this.canvas,
      this.ctx,
      atlas,
      image,
      this.world.cells
    );
    this.minimap = new MinimapRenderer(this);

    await this.dungeon.generateImages();

    this.ready = true;
    return this.draw();
  }

  getCell(pos: XY) {
    if (
      pos.x < 0 ||
      pos.x >= this.worldSize.x ||
      pos.y < 0 ||
      pos.y >= this.worldSize.y
    )
      return;

    return this.world?.cells[pos.y][pos.x];
  }

  draw() {
    this.drawSoon.schedule();
  }

  render = () => {
    if (!this.ready) {
      this.draw();
      return;
    }

    this.renderWorld();
  };

  renderWorld() {
    const { ctx, facing, position } = this;
    const { width, height } = this.canvas;

    ctx.clearRect(0, 0, width, height);
    this.dungeon!.player = { x: position.x, y: position.y, dir: facing };
    this.dungeon!.render();
    this.minimap!.render();
  }

  canMove(dir: Dir) {
    // is there a wall in the way?
    const destination = move(this.position, dir);
    if (this.getCell(destination)?.solid) return false;

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
