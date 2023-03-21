import Engine from "./Engine";
import { xy } from "./tools/geometry";

export default class MinimapRenderer {
  constructor(
    public g: Engine,
    public tileSize = 10,
    public size = xy(2, 2),
    public offset = xy(100, 100)
  ) {}

  render() {
    const { tileSize, size, offset } = this;
    const { ctx, position } = this.g;
    const { width, height } = this.g.canvas;

    const startX = width - offset.x;
    const startY = height - offset.y;
    let dx = 0;
    let dy = startY;

    for (let y = -size.y; y <= size.y; y++) {
      dx = startX - tileSize;
      for (let x = -size.x; x <= size.x; x++) {
        dx += tileSize;
        const cell = this.g.getCell({ x: x + position.x, y: y + position.y });
        if (!cell) continue;

        ctx.fillStyle = cell.solid ? "black" : "white";
        ctx.fillRect(dx, dy, tileSize, tileSize);
      }

      dy += tileSize;
    }
  }
}
