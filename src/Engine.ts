import { move, rotate, xy } from "./geometry";

import Dir from "./Dir";
import DungeonRenderer from "./DungeonRenderer";
import ResourceManager from "./ResourceManager";
import Soon from "./Soon";
import World from "./World";
import XY from "./XY";
import clone from "nanoclone";
import getCanvasContext from "./getCanvasContext";

export default class Engine {
  ctx: CanvasRenderingContext2D;
  drawSoon: Soon;
  facing: Dir;
  position: XY;
  ready: boolean;
  renderer?: DungeonRenderer;
  res: ResourceManager;
  world?: World;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = getCanvasContext(canvas, "2d");

    this.facing = Dir.N;
    this.position = xy(0, 0);
    this.ready = false;
    this.res = new ResourceManager();
    this.drawSoon = new Soon(this.render.bind(this));

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
    this.position = w.start;
    this.facing = w.facing;

    const [atlas, image] = await Promise.all([
      this.res.loadAtlas(w.atlas.json),
      this.res.loadImage(w.atlas.image),
    ]);
    this.renderer = new DungeonRenderer(
      this.canvas,
      this.ctx,
      atlas,
      image,
      this.world.cells
    );

    await this.renderer.generateImages();

    this.ready = true;
    return this.renderer.render();
  }

  getCell(pos: XY) {
    return this.world?.cells[pos.y][pos.x];
  }

  draw() {
    this.drawSoon.schedule();
  }

  private render() {
    if (!this.ready) {
      this.draw();
      return;
    }

    this.renderWorld();
  }

  renderWorld() {
    const { ctx, facing, position } = this;
    const { width, height } = this.canvas;

    ctx.clearRect(0, 0, width, height);
    this.renderer!.player = { x: position.x, y: position.y, dir: facing };
    this.renderer!.render();
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
