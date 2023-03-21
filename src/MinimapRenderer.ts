import Dir from "./types/Dir";
import Engine from "./Engine";
import { WorldSide } from "./types/World";
import { xy } from "./tools/geometry";

const facingChars = ["^", ">", "v", "<"];

const sideColours = {
  "": "black",
  d: "silver",
  s: "white",
  w: "grey",
  ds: "silver",
  dw: "red",
  sw: "white",
  dsw: "silver",
};

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ox: number,
  oy: number,
  w: number,
  h: number,
  side: WorldSide
) {
  const tag = `${side.decal ? "d" : ""}${side.solid ? "s" : ""}${
    side.wall ? "w" : ""
  }` as const;

  ctx.fillStyle = sideColours[tag];
  ctx.fillRect(x + ox, y + oy, w, h);
}

export default class MinimapRenderer {
  constructor(
    public g: Engine,
    public tileSize = 10,
    public wallSize = 1,
    public size = xy(2, 2),
    public offset = xy(100, 100)
  ) {}

  render() {
    const { tileSize, size, offset, wallSize } = this;
    const { ctx, facing, position } = this.g;
    const { width, height } = this.g.canvas;

    const startX = width - offset.x;
    const startY = height - offset.y;
    let dx = 0;
    let dy = startY;

    ctx.fillStyle = "black";
    ctx.fillRect(
      startX,
      startY,
      tileSize * (size.x * 2 + 1),
      tileSize * (size.y * 2 + 1)
    );

    for (let y = -size.y; y <= size.y; y++) {
      dx = startX - tileSize;
      for (let x = -size.x; x <= size.x; x++) {
        dx += tileSize;
        const cell = this.g.getCell(x + position.x, y + position.y);

        const north = cell?.sides[Dir.N];
        const east = cell?.sides[Dir.E];
        const south = cell?.sides[Dir.S];
        const west = cell?.sides[Dir.W];

        const edge = tileSize - wallSize;

        if (north) rect(ctx, dx, dy, 0, 0, tileSize, wallSize, north);
        if (east) rect(ctx, dx, dy, edge, 0, wallSize, tileSize, east);
        if (south) rect(ctx, dx, dy, 0, edge, tileSize, wallSize, south);
        if (west) rect(ctx, dx, dy, 0, 0, wallSize, tileSize, west);
      }

      dy += tileSize;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(
      facingChars[facing],
      startX + tileSize * (size.x + 0.5),
      startY + tileSize * (size.y + 0.5)
    );
  }
}
