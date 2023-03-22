"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/types/Dir.ts
  var Dir = /* @__PURE__ */ ((Dir2) => {
    Dir2[Dir2["N"] = 0] = "N";
    Dir2[Dir2["E"] = 1] = "E";
    Dir2[Dir2["S"] = 2] = "S";
    Dir2[Dir2["W"] = 3] = "W";
    return Dir2;
  })(Dir || {});
  var Dir_default = Dir;

  // src/tools/geometry.ts
  var xy = (x, y) => ({ x, y });
  function addXY(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  var displacements = [xy(0, -1), xy(1, 0), xy(0, 1), xy(-1, 0)];
  function move(pos, dir) {
    return addXY(pos, displacements[dir]);
  }
  function rotate(dir, clockwise) {
    return (dir + clockwise + 4) % 4;
  }
  function dirFromInitial(initial) {
    switch (initial) {
      case "E":
        return Dir_default.E;
      case "S":
        return Dir_default.S;
      case "W":
        return Dir_default.W;
      case "N":
      default:
        return Dir_default.N;
    }
  }

  // src/tools/getCanvasContext.ts
  function getCanvasContext(canvas, type, options) {
    const ctx = canvas.getContext(type, options);
    if (!ctx)
      throw new Error(`canvas.getContext(${type})`);
    return ctx;
  }

  // src/tools/xyTags.ts
  function xyToTag(pos) {
    return `${pos.x},${pos.y}`;
  }

  // src/fov.ts
  var facingDisplacements = {
    [Dir_default.E]: [0, 1, -1, 0],
    [Dir_default.N]: [1, 0, 0, 1],
    [Dir_default.S]: [-1, 0, 0, -1],
    [Dir_default.W]: [0, -1, 1, 0]
  };
  function getDisplacement(from, to, facing) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const [a, b, c, d] = facingDisplacements[facing];
    const x = dx * a + dy * b;
    const y = dx * c + dy * d;
    return [x, y];
  }
  var FovCalculator = class {
    constructor(g) {
      this.g = g;
      this.entries = /* @__PURE__ */ new Map();
    }
    calculate(width, depth) {
      const position = this.g.position;
      this.propagate(position, width, depth);
      return [...this.entries.values()].sort((a, b) => {
        const zd = a.dz - b.dz;
        if (zd)
          return zd;
        const xd = Math.abs(a.dx) - Math.abs(b.dx);
        return -xd;
      });
    }
    displacement(position) {
      return getDisplacement(this.g.position, position, this.g.facing);
    }
    propagate(position, width, depth) {
      if (width <= 0 || depth <= 0)
        return;
      const { g } = this;
      const { facing } = g;
      const tag = xyToTag(position);
      if (this.entries.has(tag))
        return;
      const { x, y } = position;
      const cell = g.getCell(x, y);
      if (!cell)
        return;
      const [dx, dz] = this.displacement(position);
      this.entries.set(tag, { x, y, dx, dz });
      const leftDir = rotate(facing, 3);
      const leftWall = cell.sides[leftDir];
      if (!(leftWall == null ? void 0 : leftWall.wall))
        this.propagate(move(position, leftDir), width - 1, depth);
      const rightDir = rotate(facing, 1);
      const rightWall = cell.sides[rightDir];
      if (!(rightWall == null ? void 0 : rightWall.wall))
        this.propagate(move(position, rightDir), width - 1, depth);
      const forwardWall = cell.sides[facing];
      if (!(forwardWall == null ? void 0 : forwardWall.wall))
        this.propagate(move(position, facing), width, depth - 1);
    }
  };
  function getFieldOfView(g, width, depth) {
    const calc = new FovCalculator(g);
    return calc.calculate(width, depth);
  }

  // src/DungeonRenderer.ts
  var tileTag = (id, type, tile) => `${type}${id}:${tile.x},${tile.z}`;
  var DungeonRenderer = class {
    constructor(g, dungeon, atlasImage) {
      this.g = g;
      this.dungeon = dungeon;
      this.atlasImage = atlasImage;
      this.imageData = /* @__PURE__ */ new Map();
    }
    generateImages() {
      const atlasCanvas = document.createElement("canvas");
      atlasCanvas.width = this.atlasImage.width;
      atlasCanvas.height = this.atlasImage.height;
      const atlasCtx = getCanvasContext(atlasCanvas, "2d", {
        willReadFrequently: true
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
    getImage(id, type, x, z) {
      const tag = tileTag(id, type, { x, z });
      return this.imageData.get(tag);
    }
    flipImage(w, h, data) {
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
    getLayersOfType(type) {
      return this.dungeon.layers.filter((layer) => layer.type === type);
    }
    project(x, z) {
      const { facing, position } = this.g;
      switch (facing) {
        case Dir_default.N:
          return [position.x + x, position.y + z];
        case Dir_default.E:
          return [position.x - z, position.y + x];
        case Dir_default.S:
          return [position.x - x, position.y - z];
        case Dir_default.W:
          return [position.x + z, position.y - x];
        default:
          throw new Error(`Invalid direction: ${facing}`);
      }
    }
    draw(result) {
      const dx = result.screen.x - (result.flipped ? result.coords.w : 0);
      const dy = result.screen.y;
      this.g.ctx.drawImage(result.image, dx, dy);
    }
    drawFront(result, x) {
      const dx = result.screen.x + x * result.coords.fullWidth;
      const dy = result.screen.y;
      this.g.ctx.drawImage(result.image, dx, dy);
    }
    drawImage(id, type, x, z) {
      const result = this.getImage(id, type, x, z);
      if (result)
        this.draw(result);
    }
    drawFrontImage(id, type, x, z) {
      const result = this.getImage(id, type, 0, z);
      if (result)
        this.drawFront(result, x);
    }
    cls() {
      this.g.ctx.fillStyle = "black";
      this.g.ctx.fillRect(0, 0, this.g.canvas.width, this.g.canvas.height);
    }
    render() {
      this.cls();
      const rightSide = rotate(this.g.facing, 1);
      const leftSide = rotate(this.g.facing, 3);
      const tiles = getFieldOfView(
        this.g,
        this.dungeon.width,
        this.dungeon.depth
      );
      for (const pos of tiles) {
        const cell = this.g.getCell(pos.x, pos.y);
        if (!cell)
          continue;
        const left = cell.sides[leftSide];
        if (left == null ? void 0 : left.wall)
          this.drawImage(left.wall, "side", pos.dx - 1, pos.dz);
        if (left == null ? void 0 : left.decal)
          this.drawImage(left.decal, "side", pos.dx - 1, pos.dz);
        const right = cell.sides[rightSide];
        if (right == null ? void 0 : right.wall)
          this.drawImage(right.wall, "side", pos.dx + 1, pos.dz);
        if (right == null ? void 0 : right.decal)
          this.drawImage(right.decal, "side", pos.dx + 1, pos.dz);
        const front = cell.sides[this.g.facing];
        if (front == null ? void 0 : front.wall)
          this.drawFrontImage(front.wall, "front", pos.dx, pos.dz - 1);
        if (front == null ? void 0 : front.decal)
          this.drawFrontImage(front.decal, "front", pos.dx, pos.dz - 1);
        if (cell.ceiling)
          this.drawImage(cell.ceiling, "ceiling", pos.dx, pos.dz);
        if (cell.floor)
          this.drawImage(cell.floor, "floor", pos.dx, pos.dz);
      }
    }
  };

  // src/MinimapRenderer.ts
  var facingChars = ["^", ">", "v", "<"];
  var sideColours = {
    "": "black",
    d: "silver",
    s: "white",
    w: "grey",
    ds: "silver",
    dw: "red",
    sw: "white",
    dsw: "silver"
  };
  function rect(ctx, x, y, ox, oy, w, h, side) {
    const tag = `${side.decal ? "d" : ""}${side.solid ? "s" : ""}${side.wall ? "w" : ""}`;
    ctx.fillStyle = sideColours[tag];
    ctx.fillRect(x + ox, y + oy, w, h);
  }
  var MinimapRenderer = class {
    constructor(g, tileSize = 10, wallSize = 1, size = xy(2, 2), offset = xy(100, 100)) {
      this.g = g;
      this.tileSize = tileSize;
      this.wallSize = wallSize;
      this.size = size;
      this.offset = offset;
    }
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
          const north = cell == null ? void 0 : cell.sides[Dir_default.N];
          const east = cell == null ? void 0 : cell.sides[Dir_default.E];
          const south = cell == null ? void 0 : cell.sides[Dir_default.S];
          const west = cell == null ? void 0 : cell.sides[Dir_default.W];
          const edge = tileSize - wallSize;
          if (north)
            rect(ctx, dx, dy, 0, 0, tileSize, wallSize, north);
          if (east)
            rect(ctx, dx, dy, edge, 0, wallSize, tileSize, east);
          if (south)
            rect(ctx, dx, dy, 0, edge, tileSize, wallSize, south);
          if (west)
            rect(ctx, dx, dy, 0, 0, wallSize, tileSize, west);
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
  };

  // src/ResourceManager.ts
  var ResourceManager = class {
    constructor() {
      this.promises = /* @__PURE__ */ new Map();
      this.loaders = [];
      this.atlases = {};
      this.images = {};
      this.maps = {};
    }
    start(src, promise) {
      this.promises.set(src, promise);
      this.loaders.push(promise);
      return promise;
    }
    loadImage(src) {
      const res = this.promises.get(src);
      if (res)
        return res;
      return this.start(
        src,
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.addEventListener("load", () => {
            this.images[src] = img;
            resolve(img);
          });
        })
      );
    }
    loadAtlas(src) {
      const res = this.promises.get(src);
      if (res)
        return res;
      return this.start(
        src,
        fetch(src).then((r) => r.json()).then((atlas) => {
          this.atlases[src] = atlas;
          return atlas;
        })
      );
    }
    loadGCMap(src) {
      const res = this.promises.get(src);
      if (res)
        return res;
      return this.start(
        src,
        fetch(src).then((r) => r.json()).then((map) => {
          this.maps[src] = map;
          return map;
        })
      );
    }
  };

  // src/Soon.ts
  var Soon = class {
    constructor(callback) {
      this.callback = callback;
      this.call = () => {
        this.timeout = void 0;
        this.callback();
      };
    }
    schedule() {
      if (!this.timeout)
        this.timeout = requestAnimationFrame(this.call);
    }
  };

  // node_modules/nanoclone/src/index.js
  function clone(src, seen = /* @__PURE__ */ new Map()) {
    if (!src || typeof src !== "object")
      return src;
    if (seen.has(src))
      return seen.get(src);
    let copy;
    if (src.nodeType && "cloneNode" in src) {
      copy = src.cloneNode(true);
      seen.set(src, copy);
    } else if (src instanceof Date) {
      copy = new Date(src.getTime());
      seen.set(src, copy);
    } else if (src instanceof RegExp) {
      copy = new RegExp(src);
      seen.set(src, copy);
    } else if (Array.isArray(src)) {
      copy = new Array(src.length);
      seen.set(src, copy);
      for (let i = 0; i < src.length; i++)
        copy[i] = clone(src[i], seen);
    } else if (src instanceof Map) {
      copy = /* @__PURE__ */ new Map();
      seen.set(src, copy);
      for (const [k, v] of src.entries())
        copy.set(k, clone(v, seen));
    } else if (src instanceof Set) {
      copy = /* @__PURE__ */ new Set();
      seen.set(src, copy);
      for (const v of src)
        copy.add(clone(v, seen));
    } else if (src instanceof Object) {
      copy = {};
      seen.set(src, copy);
      for (const [k, v] of Object.entries(src))
        copy[k] = clone(v, seen);
    } else {
      throw Error(`Unable to clone ${src}`);
    }
    return copy;
  }
  function src_default(src) {
    return clone(src, /* @__PURE__ */ new Map());
  }

  // res/atlas/minma1.png
  var minma1_default = "./minma1-VI5UXWCY.png";

  // res/atlas/minma1.json
  var minma1_default2 = "./minma1-6Z2CTON5.json";

  // src/resources.ts
  var AtlasResources = {
    minma1: { image: minma1_default, json: minma1_default2 }
  };

  // src/Grid.ts
  var Grid = class {
    constructor(defaultValue, toTag = xyToTag) {
      this.defaultValue = defaultValue;
      this.toTag = toTag;
      this.entries = /* @__PURE__ */ new Map();
      this.width = 0;
      this.height = 0;
    }
    set(xy2, item) {
      const tag = this.toTag(xy2);
      this.entries.set(tag, item);
      this.width = Math.max(this.width, xy2.x + 1);
      this.height = Math.max(this.height, xy2.y + 1);
    }
    get(xy2) {
      return this.entries.get(this.toTag(xy2));
    }
    getOrDefault(xy2) {
      const existing = this.get(xy2);
      if (existing)
        return existing;
      const value = this.defaultValue(xy2);
      this.set(xy2, value);
      return value;
    }
    asArray() {
      const rows = [];
      for (let y = 0; y < this.height; y++) {
        const row = [];
        for (let x = 0; x < this.width; x++)
          row.push(this.getOrDefault({ x, y }));
        rows.push(row);
      }
      return rows;
    }
  };

  // src/convertGridCartographerMap.ts
  var wall = { wall: true, solid: true };
  var door = { decal: "Door", wall: true };
  var invisible = { solid: true };
  var fake = { wall: true };
  var defaultEdge = { main: wall, opposite: wall };
  var EdgeDetails = {
    [2 /* Door */]: { main: door, opposite: door },
    [33 /* Door_Box */]: { main: door, opposite: door },
    [8 /* Door_OneWayRD */]: { main: door, opposite: wall },
    [5 /* Door_OneWayLU */]: { main: wall, opposite: door },
    [13 /* Wall_Secret */]: { main: invisible, opposite: invisible },
    [10 /* Wall_OneWayRD */]: { main: fake, opposite: wall },
    [7 /* Wall_OneWayLU */]: { main: wall, opposite: fake }
  };
  function apply(decals, edge, texture, lt, ld, rt, rd) {
    var _a;
    const { main, opposite } = (_a = EdgeDetails[edge]) != null ? _a : defaultEdge;
    lt.sides[ld] = {
      wall: main.wall ? texture : void 0,
      decal: decals[`${main.decal},${texture}`],
      solid: main.solid
    };
    rt.sides[rd] = {
      wall: opposite.wall ? texture : void 0,
      decal: decals[`${opposite.decal},${texture}`],
      solid: opposite.solid
    };
  }
  function convertGridCartographerMap(j, region = 0, floor = 0) {
    var _a, _b, _c;
    const r = j.regions[region];
    if (!r)
      throw new Error(`No such region: ${region}`);
    const f = r.floors.find((f2) => f2.index === floor);
    if (!f)
      throw new Error(`No such floor: ${floor}`);
    const grid = new Grid(() => ({ sides: {} }));
    const decals = {};
    let atlas = void 0;
    let start = xy(0, 0);
    let facing = Dir_default.N;
    for (const note of f.notes) {
      const { __data, x, y } = note;
      if (!__data || !__data.startsWith("#"))
        continue;
      const [cmd, arg] = __data.split(" ");
      if (cmd === "#ATLAS") {
        atlas = AtlasResources[arg];
      } else if (cmd === "#START") {
        start = { x, y };
        facing = dirFromInitial(arg);
      } else if (cmd === "#DECAL") {
        const [name, texture, decal] = arg.split(",");
        decals[`${name},${texture}`] = Number(decal);
      }
    }
    for (const row of (_a = f.tiles.rows) != null ? _a : []) {
      let x = f.tiles.bounds.x0 + row.start;
      const y = r.setup.origin === "tl" ? row.y : f.tiles.bounds.height - (row.y - f.tiles.bounds.y0) - 1;
      for (const tile of row.tdata) {
        const mt = grid.getOrDefault({ x, y });
        if (tile.t)
          mt.floor = tile.tc || 1;
        if (tile.c)
          mt.ceiling = 1;
        if (tile.b)
          apply(
            decals,
            tile.b,
            (_b = tile.bc) != null ? _b : 1,
            mt,
            Dir_default.S,
            grid.getOrDefault({ x, y: y + 1 }),
            Dir_default.N
          );
        if (tile.r)
          apply(
            decals,
            tile.r,
            (_c = tile.rc) != null ? _c : 1,
            mt,
            Dir_default.E,
            grid.getOrDefault({ x: x + 1, y }),
            Dir_default.W
          );
        x++;
      }
    }
    const cells = grid.asArray();
    return { atlas, cells, start, facing };
  }

  // src/Engine.ts
  var Engine = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.render = () => {
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
      this.ctx = getCanvasContext(canvas, "2d");
      this.facing = Dir_default.N;
      this.position = xy(0, 0);
      this.worldSize = xy(0, 0);
      this.res = new ResourceManager();
      this.drawSoon = new Soon(this.render);
      canvas.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft")
          this.turn(-1);
        else if (e.key === "ArrowRight")
          this.turn(1);
        else if (e.key === "ArrowUp")
          this.move(this.facing);
        else if (e.key === "ArrowDown")
          this.move(rotate(this.facing, 2));
      });
    }
    loadWorld(w) {
      return __async(this, null, function* () {
        this.renderSetup = void 0;
        this.world = src_default(w);
        this.worldSize = xy(this.world.cells[0].length, this.world.cells.length);
        this.position = w.start;
        this.facing = w.facing;
        const [atlas, image] = yield Promise.all([
          this.res.loadAtlas(w.atlas.json),
          this.res.loadImage(w.atlas.image)
        ]);
        const dungeon = new DungeonRenderer(this, atlas, image);
        const minimap = new MinimapRenderer(this);
        yield dungeon.generateImages();
        this.renderSetup = { dungeon, minimap };
        return this.draw();
      });
    }
    loadGCMap(jsonUrl, region, floor) {
      return __async(this, null, function* () {
        this.renderSetup = void 0;
        const map = yield this.res.loadGCMap(jsonUrl);
        const { atlas, cells, start, facing } = convertGridCartographerMap(
          map,
          region,
          floor
        );
        if (!atlas)
          throw new Error(`${jsonUrl} did not contain #ATLAS`);
        return this.loadWorld({ atlas, cells, start, facing });
      });
    }
    getCell(x, y) {
      var _a;
      if (x < 0 || x >= this.worldSize.x || y < 0 || y >= this.worldSize.y)
        return;
      return (_a = this.world) == null ? void 0 : _a.cells[y][x];
    }
    draw() {
      this.drawSoon.schedule();
    }
    canMove(dir) {
      const at = this.getCell(this.position.x, this.position.y);
      if (!at)
        return false;
      const wall2 = at == null ? void 0 : at.sides[dir];
      if (wall2 == null ? void 0 : wall2.solid)
        return false;
      const destination = move(this.position, dir);
      const cell = this.getCell(destination.x, destination.y);
      if (!cell)
        return false;
      return true;
    }
    move(dir) {
      if (this.canMove(dir)) {
        this.position = move(this.position, dir);
        this.draw();
      }
    }
    turn(clockwise) {
      this.facing = rotate(this.facing, clockwise);
      this.draw();
    }
  };

  // res/map.json
  var map_default = "./map-OVD476PJ.json";

  // src/index.ts
  function loadEngine(parent) {
    const container = document.createElement("div");
    parent.appendChild(container);
    const canvas = document.createElement("canvas");
    canvas.tabIndex = 1;
    container.appendChild(canvas);
    const g = new Engine(canvas);
    requestAnimationFrame(() => canvas.focus());
    window.g = g;
    const onResize = () => {
      const wantWidth = 320;
      const wantHeight = 240;
      const ratioWidth = Math.floor(window.innerWidth / wantWidth);
      const ratioHeight = Math.floor(window.innerHeight / wantHeight);
      const ratio = Math.max(1, Math.min(ratioWidth, ratioHeight));
      const width = wantWidth * ratio;
      const height = wantHeight * ratio;
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      canvas.width = wantWidth;
      canvas.height = wantHeight;
      g.draw();
    };
    window.addEventListener("resize", onResize);
    onResize();
    g.loadGCMap(map_default, 0, 1);
  }
  window.addEventListener("load", () => loadEngine(document.body));
})();
//# sourceMappingURL=bundle.js.map
