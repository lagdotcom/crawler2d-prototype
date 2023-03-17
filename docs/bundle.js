"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 ||= {})
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __spreadProps = (a2, b2) => __defProps(a2, __getOwnPropDescs(b2));
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

  // src/tools/geometry.ts
  var xy = (x, y) => ({ x, y });
  function addXY(a2, b2) {
    return { x: a2.x + b2.x, y: a2.y + b2.y };
  }
  var displacements = [xy(0, -1), xy(1, 0), xy(0, 1), xy(-1, 0)];
  function move(pos, dir) {
    return addXY(pos, displacements[dir]);
  }
  function rotate(dir, clockwise) {
    return (dir + clockwise + 4) % 4;
  }

  // src/types/Dir.ts
  var Dir = /* @__PURE__ */ ((Dir2) => {
    Dir2[Dir2["N"] = 0] = "N";
    Dir2[Dir2["E"] = 1] = "E";
    Dir2[Dir2["S"] = 2] = "S";
    Dir2[Dir2["W"] = 3] = "W";
    return Dir2;
  })(Dir || {});
  var Dir_default = Dir;

  // src/tools/getCanvasContext.ts
  function getCanvasContext(canvas, type, options) {
    const ctx = canvas.getContext(type, options);
    if (!ctx)
      throw new Error(`canvas.getContext(${type})`);
    return ctx;
  }

  // src/DungeonRenderer.ts
  var tileTag = (id, type, tile) => `${type}${id}:${tile.x},${tile.z}`;
  var DungeonRenderer = class {
    constructor(canvas, ctx, dungeon, atlasImage, map) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.dungeon = dungeon;
      this.atlasImage = atlasImage;
      this.map = map;
      this.imageData = /* @__PURE__ */ new Map();
      this.mapSize = 16;
      this.player = { x: 1, y: 2, dir: 0 };
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
    draw(result) {
      const dx = result.screen.x - (result.flipped ? result.coords.w : 0);
      const dy = result.screen.y;
      this.ctx.drawImage(result.image, dx, dy);
    }
    drawFront(result, x) {
      const dx = result.screen.x + x * result.coords.fullWidth;
      const dy = result.screen.y;
      this.ctx.drawImage(result.image, dx, dy);
    }
    drawSides(z) {
      for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
        const [px, py] = this.project(x, z);
        if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
          const cell = this.map[py][px];
          if (cell.wall) {
            const result = this.getImage(cell.wall, "side", x, z);
            if (result)
              this.draw(result);
          }
          if (cell.decal) {
            const result = this.getImage(cell.decal, "side", x, z);
            if (result)
              this.draw(result);
          }
        }
      }
    }
    drawFronts(z) {
      for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
        const [px, py] = this.project(x, z);
        if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
          const cell = this.map[py][px];
          if (cell.wall) {
            const result = this.getImage(cell.wall, "front", 0, z);
            if (result)
              this.drawFront(result, x);
          }
          if (cell.decal) {
            const result = this.getImage(cell.decal, "front", 0, z);
            if (result)
              this.drawFront(result, x);
          }
          if (cell.object) {
            const result = this.getImage(cell.object, "object", 0, z);
            if (result)
              this.drawFront(result, x);
          }
        }
      }
    }
    drawFloor(z) {
      for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
        const [px, py] = this.project(x, z);
        if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
          const cell = this.map[py][px];
          if (cell.floor) {
            const result = this.getImage(cell.floor, "floor", x, z);
            if (result)
              this.draw(result);
          }
        }
      }
    }
    drawCeiling(z) {
      for (let x = -(this.dungeon.width - 1); x <= this.dungeon.width - 1; x++) {
        const [px, py] = this.project(x, z);
        if (px >= 0 && py >= 0 && px < this.mapSize && py < this.mapSize) {
          const cell = this.map[py][px];
          if (cell.ceiling) {
            const result = this.getImage(cell.ceiling, "ceiling", x, z);
            if (result)
              this.draw(result);
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
      for (let z = -this.dungeon.depth; z <= 0; z++) {
        this.drawCeiling(z);
      }
      for (let z = -this.dungeon.depth; z <= 0; z++) {
        this.drawFloor(z);
      }
      for (let z = -this.dungeon.depth; z <= 0; z++) {
        this.drawSides(z);
        this.drawFronts(z);
      }
    }
  };

  // src/ResourceManager.ts
  var ResourceManager = class {
    constructor() {
      this.promises = /* @__PURE__ */ new Map();
      this.loaders = [];
      this.atlases = {};
      this.images = {};
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

  // src/Engine.ts
  var Engine = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.render = () => {
        if (!this.ready) {
          this.draw();
          return;
        }
        this.renderWorld();
      };
      this.ctx = getCanvasContext(canvas, "2d");
      this.facing = Dir_default.N;
      this.position = xy(0, 0);
      this.ready = false;
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
        this.ready = false;
        this.world = src_default(w);
        this.position = w.start;
        this.facing = w.facing;
        const [atlas, image] = yield Promise.all([
          this.res.loadAtlas(w.atlas.json),
          this.res.loadImage(w.atlas.image)
        ]);
        this.renderer = new DungeonRenderer(
          this.canvas,
          this.ctx,
          atlas,
          image,
          this.world.cells
        );
        yield this.renderer.generateImages();
        this.ready = true;
        return this.renderer.render();
      });
    }
    getCell(pos) {
      var _a;
      return (_a = this.world) == null ? void 0 : _a.cells[pos.y][pos.x];
    }
    draw() {
      this.drawSoon.schedule();
    }
    renderWorld() {
      const { ctx, facing, position } = this;
      const { width, height } = this.canvas;
      ctx.clearRect(0, 0, width, height);
      this.renderer.player = { x: position.x, y: position.y, dir: facing };
      this.renderer.render();
    }
    canMove(dir) {
      var _a;
      const destination = move(this.position, dir);
      if ((_a = this.getCell(destination)) == null ? void 0 : _a.solid)
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

  // res/atlas/minma1.png
  var minma1_default = "./minma1-VI5UXWCY.png";

  // res/atlas/minma1.json
  var minma1_default2 = "./minma1-6Z2CTON5.json";

  // src/data/testWorld.ts
  var _ = { floor: 1 /* White */, ceiling: 1 /* White */ };
  var a = __spreadProps(__spreadValues({}, _), { solid: true, wall: 1 /* White */ });
  var b = __spreadProps(__spreadValues({}, _), { solid: true, wall: 1 /* White */, decal: 2 /* Door */ });
  var testWorld = {
    atlas: { image: minma1_default, json: minma1_default2 },
    cells: [
      [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
      [a, _, _, _, _, _, _, a, b, _, _, a, _, _, _, a],
      [a, _, a, a, a, a, _, a, a, a, _, a, _, a, a, a],
      [a, a, _, _, _, _, _, _, _, _, _, _, _, _, _, a],
      [a, _, _, _, a, _, a, b, a, _, a, _, a, a, _, a],
      [a, _, a, _, a, _, a, a, a, _, a, _, a, _, _, a],
      [a, _, _, _, _, _, _, _, _, _, _, _, _, _, _, a],
      [a, _, a, _, a, _, _, _, a, a, a, _, _, _, _, a],
      [a, _, _, a, a, _, b, _, a, _, _, _, _, a, _, a],
      [a, _, _, _, _, _, a, _, _, a, _, _, a, a, _, a],
      [a, a, _, a, a, _, a, _, a, a, _, _, _, _, _, a],
      [a, _, _, _, a, _, _, _, _, _, _, a, a, _, a, a],
      [a, _, a, _, a, _, _, a, _, _, _, a, a, _, _, a],
      [a, a, a, _, _, _, a, a, a, _, a, a, _, _, _, a],
      [a, _, _, _, a, _, _, a, _, _, _, _, _, a, _, a],
      [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a]
    ],
    start: xy(1, 2),
    facing: Dir_default.N
  };
  var testWorld_default = testWorld;

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
    g.loadWorld(testWorld_default);
  }
  window.addEventListener("load", () => loadEngine(document.body));
})();
//# sourceMappingURL=bundle.js.map
