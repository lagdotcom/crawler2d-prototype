"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
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

  // globalExternal:nearley
  var require_nearley = __commonJS({
    "globalExternal:nearley"(exports, module) {
      module.exports = globalThis.nearley;
    }
  });

  // globalExternal:moo
  var require_moo = __commonJS({
    "globalExternal:moo"(exports, module) {
      module.exports = globalThis.moo;
    }
  });

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
  var tileTag = (id2, type, tile) => `${type}${id2}:${tile.x},${tile.z}`;
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
    getImage(id2, type, x, z) {
      const tag = tileTag(id2, type, { x, z });
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
    drawImage(id2, type, x, z) {
      const result = this.getImage(id2, type, x, z);
      if (result)
        this.draw(result);
    }
    drawFrontImage(id2, type, x, z) {
      const result = this.getImage(id2, type, 0, z);
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

  // src/tools/assertUnreachable.ts
  function assertUnreachable(x, message) {
    throw new Error(message);
  }

  // src/DScript/logic.ts
  function bool(value) {
    return { _: "bool", value };
  }
  function num(value) {
    return { _: "number", value };
  }
  function str(value) {
    return { _: "string", value };
  }
  function box(value) {
    switch (typeof value) {
      case "undefined":
        return void 0;
      case "boolean":
        return bool(value);
      case "number":
        return num(value);
      case "string":
        return str(value);
      default:
        throw new Error(`Cannot box ${typeof value}`);
    }
  }
  function unbox(value) {
    if (value._ === "function" || value._ === "native")
      return value;
    return value.value;
  }
  function truthy(value) {
    return !!value;
  }
  function unary(op, value) {
    switch (op) {
      case "-":
        if (value._ === "number")
          return num(-value.value);
        throw new Error(`Cannot negate a ${value._}`);
      case "not":
        return bool(!truthy(value.value));
      default:
        assertUnreachable(op, `unary operator ${op} not implemented`);
    }
  }
  function binary(op, left, right) {
    switch (op) {
      case "+":
        if (left._ === "string" && right._ === "string")
          return str(left.value + right.value);
        if (left._ === "number" && right._ === "number")
          return num(left.value + right.value);
        throw new Error(`Cannot add ${left._} and ${right._}`);
      case "-":
        if (left._ === "number" && right._ === "number")
          return num(left.value - right.value);
        throw new Error(`Cannot subtract ${left._} and ${right._}`);
      case "*":
        if (left._ === "number" && right._ === "number")
          return num(left.value * right.value);
        throw new Error(`Cannot multiply ${left._} and ${right._}`);
      case "/":
        if (left._ === "number" && right._ === "number")
          return num(left.value / right.value);
        throw new Error(`Cannot divide ${left._} and ${right._}`);
      case "^":
        if (left._ === "number" && right._ === "number")
          return num(Math.pow(left.value, right.value));
        throw new Error(`Cannot exponentiate ${left._} and ${right._}`);
      case "==":
        return bool(left.value === right.value);
      case "!=":
        return bool(left.value !== right.value);
      case ">":
        return bool(left.value > right.value);
      case ">=":
        return bool(left.value >= right.value);
      case "<":
        return bool(left.value < right.value);
      case "<=":
        return bool(left.value <= right.value);
      case "and":
        return truthy(left.value) ? right : left;
      case "or":
        return truthy(left.value) ? left : right;
      case "xor": {
        const lt = truthy(left.value);
        const rt = truthy(right.value);
        return bool(!(lt === rt));
      }
      default:
        assertUnreachable(op, `binary operator ${op} not implemented`);
    }
  }
  function convertToFunction(stmt) {
    return {
      _: "function",
      name: stmt.name.value,
      args: stmt.args,
      type: stmt.type,
      value: stmt.program
    };
  }
  function run(scope, prg) {
    scope.exited = false;
    scope.returned = void 0;
    return runInScope(scope, prg, true);
  }
  function runInScope(scope, prg, checkReturnValue) {
    var _a, _b, _c;
    for (const stmt of prg) {
      switch (stmt._) {
        case "assignment":
          assignment(scope, stmt);
          break;
        case "call":
          callFunction(
            scope,
            lookup(scope, stmt.fn.value),
            stmt.args.map((arg) => evaluate(scope, arg))
          );
          break;
        case "function":
          scope.env.set(stmt.name.value, convertToFunction(stmt));
          break;
        case "if": {
          if (truthy(evaluate(scope, stmt.expr).value)) {
            runInScope(scope, stmt.positive, false);
          } else if (stmt.negative) {
            runInScope(scope, stmt.negative, false);
          }
          break;
        }
        case "return": {
          const returnValue = stmt.expr ? evaluate(scope, stmt.expr) : void 0;
          if (isTypeMatch(scope.type, returnValue == null ? void 0 : returnValue._)) {
            scope.exited = true;
            scope.returned = returnValue;
            return returnValue;
          }
          throw new Error(
            `trying to return ${(_a = returnValue == null ? void 0 : returnValue._) != null ? _a : "void"} when '${scope.name}' requires ${(_b = scope.type) != null ? _b : "void"}`
          );
        }
        default:
          assertUnreachable(stmt, "Not all statement types implemented");
      }
      if (scope.exited)
        break;
    }
    if (checkReturnValue && !isTypeMatch(scope.type, (_c = scope.returned) == null ? void 0 : _c._))
      throw new Error(`exited '${scope.name}' without returning ${scope.type}`);
    return scope.returned;
  }
  function lookup(scope, name, canBeNew = false) {
    let found;
    let current = scope;
    while (current) {
      found = current.env.get(name);
      if (found)
        break;
      current = current.parent;
    }
    if (!found && !canBeNew)
      throw new Error(`Could not resolve: ${name}`);
    return found;
  }
  function evaluate(scope, expr) {
    switch (expr._) {
      case "bool":
      case "number":
      case "string":
        return expr;
      case "id":
        return lookup(scope, expr.value);
      case "unary":
        return unary(expr.op, evaluate(scope, expr.value));
      case "binary":
        return binary(
          expr.op,
          evaluate(scope, expr.left),
          evaluate(scope, expr.right)
        );
      case "call": {
        const value = callFunction(
          scope,
          lookup(scope, expr.fn.value),
          expr.args.map((arg) => evaluate(scope, arg))
        );
        if (!value)
          throw new Error(`${expr.fn.value}() returned no value`);
        return value;
      }
      default:
        assertUnreachable(expr, "not all expression types implemented");
    }
  }
  function isTypeMatch(want, got) {
    if (want === "any")
      return true;
    if (want === got)
      return true;
    if (want === "function" && got === "native")
      return true;
    return false;
  }
  function checkFunctionArgs(fn, got) {
    const argTypes = fn._ === "function" ? fn.args.map((arg) => arg.type) : fn.args;
    const fail = () => {
      throw new Error(
        `${fn.name} wants (${argTypes.join(", ")}) but got (${got.map((arg) => arg._).join(", ")})`
      );
    };
    if (argTypes.length !== got.length)
      fail();
    for (let i = 0; i < argTypes.length; i++) {
      if (!isTypeMatch(argTypes[i], got[i]._))
        fail();
    }
  }
  function callFunction(parent, fn, args) {
    if (fn._ !== "function" && fn._ !== "native")
      throw new Error(`Cannot call a ${fn._}`);
    checkFunctionArgs(fn, args);
    if (fn._ === "native") {
      const result = fn.value.call(void 0, ...args.map(unbox));
      return box(result);
    }
    const scope = {
      parent,
      name: `function ${fn.name}`,
      env: /* @__PURE__ */ new Map(),
      type: fn.type
    };
    for (let i = 0; i < args.length; i++)
      scope.env.set(fn.args[i].name.value, args[i]);
    return run(scope, fn.value);
  }
  var opMapping = {
    "+=": "+",
    "-=": "-",
    "*=": "*",
    "/=": "/",
    "^=": "^"
  };
  function assignment(scope, stmt) {
    const right = evaluate(scope, stmt.expr);
    const left = lookup(scope, stmt.name.value, true);
    if (!left) {
      if (stmt.op === "=") {
        scope.env.set(stmt.name.value, right);
        return;
      }
      throw new Error(`Could not resolve: ${stmt.name.value}`);
    }
    if (left._ !== right._)
      throw new Error(`Cannot assign ${right._} to ${left._}`);
    if (stmt.op === "=")
      left.value = right.value;
    else
      left.value = binary(opMapping[stmt.op], left, right).value;
  }

  // src/DScript/host.ts
  var DScriptHost = class {
    constructor() {
      this.env = /* @__PURE__ */ new Map();
      this.name = "<Host>";
    }
    addNative(name, args, type, value) {
      this.env.set(name, { _: "native", name, args, type, value });
    }
  };

  // src/EngineScripting.ts
  var EngineScripting = class extends DScriptHost {
    constructor(g) {
      super();
      this.g = g;
      this.onTagEnter = /* @__PURE__ */ new Map();
      this.addNative(
        "debug",
        ["any"],
        void 0,
        (thing) => console.log("[debug]", thing)
      );
      this.addNative(
        "onTagEnter",
        ["string", "function"],
        void 0,
        (tag, cb) => {
          this.onTagEnter.set(tag, cb);
        }
      );
      this.addNative(
        "tileHasTag",
        ["number", "number", "string"],
        "bool",
        (x, y, tag) => {
          const cell = this.g.getCell(x, y);
          return cell == null ? void 0 : cell.tags.includes(tag);
        }
      );
    }
    run(program) {
      return run(this, program);
    }
    runCallback(fn, ...args) {
      if (fn._ === "function")
        return callFunction(this, fn, args);
      else
        return fn.value.call(void 0, ...args);
    }
    onEnter(newPos, oldPos) {
      const tile = this.g.getCell(newPos.x, newPos.y);
      if (!tile)
        return;
      for (const tag of tile.tags) {
        const cb = this.onTagEnter.get(tag);
        if (cb)
          this.runCallback(cb, num(oldPos.x), num(oldPos.y));
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
      this.scripts = {};
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
    loadScript(src) {
      const res = this.promises.get(src);
      if (res)
        return res;
      return this.start(
        src,
        fetch(src).then((r) => r.text()).then((script) => {
          this.scripts[src] = script;
          return script;
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

  // res/map.dscript
  var map_default = "./map-L6YAJIBP.dscript";

  // res/atlas/minma1.png
  var minma1_default = "./minma1-VI5UXWCY.png";

  // res/atlas/minma1.json
  var minma1_default2 = "./minma1-6Z2CTON5.json";

  // src/resources.ts
  var Resources = {
    "minma1.png": minma1_default,
    "minma1.json": minma1_default2,
    "map.dscript": map_default
  };
  function getResourceURL(id2) {
    const value = Resources[id2];
    if (!value)
      throw new Error(`Invalid resource ID: ${id2}`);
    return value;
  }

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
  var GCMapConverter = class {
    constructor() {
      this.decals = /* @__PURE__ */ new Map();
      this.definitions = /* @__PURE__ */ new Map();
      this.facing = Dir_default.N;
      this.grid = new Grid(() => ({ sides: {}, tags: [] }));
      this.scripts = [];
      this.start = xy(0, 0);
      this.textures = /* @__PURE__ */ new Map();
    }
    convert(j, region = 0, floor = 0) {
      var _a, _b;
      if (!(region in j.regions))
        throw new Error(`No such region: ${region}`);
      const r = j.regions[region];
      const f = r.floors.find((f2) => f2.index === floor);
      if (!f)
        throw new Error(`No such floor: ${floor}`);
      for (const note of f.notes) {
        const { __data, x, y } = note;
        for (const line of (_a = __data == null ? void 0 : __data.split("\n")) != null ? _a : []) {
          if (!line.startsWith("#"))
            continue;
          const [cmd, arg] = line.split(" ");
          this.applyCommand(cmd, arg, x, y);
        }
      }
      for (const row of (_b = f.tiles.rows) != null ? _b : []) {
        let x = f.tiles.bounds.x0 + row.start;
        const y = r.setup.origin === "tl" ? row.y : f.tiles.bounds.height - (row.y - f.tiles.bounds.y0) - 1;
        for (const tile of row.tdata) {
          const mt = this.grid.getOrDefault({ x, y });
          if (tile.t)
            mt.floor = this.getTexture(tile.tc);
          if (tile.c)
            mt.ceiling = this.getTexture(0);
          if (tile.b)
            this.setEdge(
              tile.b,
              tile.bc,
              mt,
              Dir_default.S,
              this.grid.getOrDefault({ x, y: y + 1 }),
              Dir_default.N
            );
          if (tile.r)
            this.setEdge(
              tile.r,
              tile.rc,
              mt,
              Dir_default.E,
              this.grid.getOrDefault({ x: x + 1, y }),
              Dir_default.W
            );
          x++;
        }
      }
      const { atlas, scripts, start, facing } = this;
      const cells = this.grid.asArray();
      return { atlas, cells, scripts, start, facing };
    }
    getTexture(index = 0) {
      const texture = this.textures.get(index);
      if (typeof texture === "undefined")
        throw new Error(`Unknown texture for palette index ${index}`);
      return texture;
    }
    eval(s) {
      const def = this.definitions.get(s);
      if (typeof def !== "undefined")
        return def;
      const num2 = Number(s);
      if (!isNaN(num2))
        return num2;
      throw new Error(`Could not evaluate: ${s}`);
    }
    applyCommand(cmd, arg, x, y) {
      switch (cmd) {
        case "#ATLAS":
          this.atlas = {
            image: getResourceURL(arg + ".png"),
            json: getResourceURL(arg + ".json")
          };
          return;
        case "#DEFINE": {
          const [key, value] = arg.split(",");
          if (this.definitions.has(key))
            throw new Error(`Already defined: ${key}`);
          this.definitions.set(key, this.eval(value));
          return;
        }
        case "#STYLE": {
          const [index, value] = arg.split(",");
          this.textures.set(this.eval(index), this.eval(value));
          return;
        }
        case "#DECAL": {
          const [name, texture, decal] = arg.split(",");
          this.decals.set(`${name},${this.eval(texture)}`, this.eval(decal));
          return;
        }
        case "#START":
          this.start = { x, y };
          this.facing = dirFromInitial(arg);
          return;
        case "#TAG": {
          const t = this.grid.getOrDefault({ x, y });
          for (const tag of arg.split(","))
            t.tags.push(tag);
          break;
        }
        case "#SCRIPT":
          for (const id2 of arg.split(","))
            this.scripts.push(getResourceURL(id2));
          break;
        default:
          throw new Error(`Unknown command: ${cmd} ${arg} at (${x},${y})`);
      }
    }
    setEdge(edge, index, lt, ld, rt, rd) {
      var _a;
      const { main, opposite } = (_a = EdgeDetails[edge]) != null ? _a : defaultEdge;
      const texture = this.getTexture(index);
      lt.sides[ld] = {
        wall: main.wall ? texture : void 0,
        decal: this.decals.get(`${main.decal},${texture}`),
        solid: main.solid
      };
      rt.sides[rd] = {
        wall: opposite.wall ? texture : void 0,
        decal: this.decals.get(`${opposite.decal},${texture}`),
        solid: opposite.solid
      };
    }
  };
  function convertGridCartographerMap(j, region = 0, floor = 0) {
    const converter = new GCMapConverter();
    return converter.convert(j, region, floor);
  }

  // src/DScript/parser.ts
  var import_nearley = __toESM(require_nearley());

  // src/DScript/grammar.ts
  var import_moo = __toESM(require_moo());
  function id(d) {
    return d[0];
  }
  var always = (value) => () => value;
  var val = ([tok]) => tok.value;
  var lexer = import_moo.default.compile({
    ws: { match: /[ \t\n\r]+/, lineBreaks: true },
    comment: { match: /;[^\n]*\n/, lineBreaks: true },
    number: /[0-9]+/,
    sqstring: /'.*?'/,
    dqstring: /".*?"/,
    keywords: ["and", "any", "bool", "else", "end", "false", "function", "if", "not", "number", "or", "return", "string", "true", "xor"],
    word: { match: /[a-zA-Z][a-zA-Z0-9_]*/ },
    colon: ":",
    comma: ",",
    lp: "(",
    rp: ")",
    dot: ".",
    le: "<=",
    lt: "<",
    ge: ">=",
    gt: ">",
    eq: "==",
    ne: "!=",
    plusequals: "+=",
    minusequals: "-=",
    timesequals: "*=",
    divideequals: "/=",
    expequals: "^=",
    equals: "=",
    plus: "+",
    minus: "-",
    times: "*",
    divide: "/",
    exp: "^",
    qm: "?"
  });
  var grammar = {
    Lexer: lexer,
    ParserRules: [
      { "name": "document", "symbols": ["_", "program"], "postprocess": ([, prog]) => prog },
      { "name": "program$ebnf$1", "symbols": [] },
      { "name": "program$ebnf$1", "symbols": ["program$ebnf$1", "declp"], "postprocess": (d) => d[0].concat([d[1]]) },
      { "name": "program", "symbols": ["program$ebnf$1"], "postprocess": id },
      { "name": "declp", "symbols": ["decl", "_"], "postprocess": id },
      { "name": "decl", "symbols": ["stmt"], "postprocess": id },
      { "name": "stmt", "symbols": ["assignment"], "postprocess": id },
      { "name": "stmt", "symbols": ["call"], "postprocess": id },
      { "name": "stmt", "symbols": ["function_def"], "postprocess": id },
      { "name": "stmt", "symbols": ["if_stmt"], "postprocess": id },
      { "name": "stmt", "symbols": ["return_stmt"], "postprocess": id },
      { "name": "assignment", "symbols": ["name", "_", "assignop", "_", "expr"], "postprocess": ([name, , op, , expr]) => ({ _: "assignment", name, op, expr }) },
      { "name": "assignop", "symbols": [{ "literal": "=" }], "postprocess": val },
      { "name": "assignop", "symbols": [{ "literal": "+=" }], "postprocess": val },
      { "name": "assignop", "symbols": [{ "literal": "-=" }], "postprocess": val },
      { "name": "assignop", "symbols": [{ "literal": "*=" }], "postprocess": val },
      { "name": "assignop", "symbols": [{ "literal": "/=" }], "postprocess": val },
      { "name": "assignop", "symbols": [{ "literal": "^=" }], "postprocess": val },
      { "name": "function_def$ebnf$1", "symbols": ["function_type_clause"], "postprocess": id },
      { "name": "function_def$ebnf$1", "symbols": [], "postprocess": () => null },
      { "name": "function_def", "symbols": [{ "literal": "function" }, "__", "name", { "literal": "(" }, "function_args", { "literal": ")" }, "function_def$ebnf$1", "document", "__", { "literal": "end" }], "postprocess": ([, , name, , args, , type, program]) => ({ _: "function", name, args, type, program }) },
      { "name": "function_type_clause", "symbols": [{ "literal": ":" }, "_", "vtype"], "postprocess": ([, , type]) => type },
      { "name": "function_args", "symbols": [], "postprocess": always([]) },
      { "name": "function_args", "symbols": ["name_with_type"] },
      { "name": "function_args", "symbols": ["function_args", "_", { "literal": "," }, "_", "name_with_type"], "postprocess": ([list, , , , value]) => list.concat([value]) },
      { "name": "if_stmt$ebnf$1", "symbols": ["else_clause"], "postprocess": id },
      { "name": "if_stmt$ebnf$1", "symbols": [], "postprocess": () => null },
      { "name": "if_stmt", "symbols": [{ "literal": "if" }, "__", "expr", "__", { "literal": "then" }, "document", "if_stmt$ebnf$1", "__", { "literal": "end" }], "postprocess": ([, , expr, , , positive, negative]) => ({ _: "if", expr, positive, negative }) },
      { "name": "else_clause", "symbols": ["__", { "literal": "else" }, "document"], "postprocess": ([, , clause]) => clause },
      { "name": "return_stmt$ebnf$1$subexpression$1", "symbols": ["__", "expr"], "postprocess": ([, expr]) => expr },
      { "name": "return_stmt$ebnf$1", "symbols": ["return_stmt$ebnf$1$subexpression$1"], "postprocess": id },
      { "name": "return_stmt$ebnf$1", "symbols": [], "postprocess": () => null },
      { "name": "return_stmt", "symbols": [{ "literal": "return" }, "return_stmt$ebnf$1"], "postprocess": ([, expr]) => ({ _: "return", expr }) },
      { "name": "expr", "symbols": ["maths"], "postprocess": id },
      { "name": "maths", "symbols": ["logic"], "postprocess": id },
      { "name": "logic", "symbols": ["logic", "_", "logicop", "_", "boolean"], "postprocess": ([left, , op, , right]) => ({ _: "binary", left, op, right }) },
      { "name": "logic", "symbols": ["boolean"], "postprocess": id },
      { "name": "boolean", "symbols": ["boolean", "_", "boolop", "_", "sum"], "postprocess": ([left, , op, , right]) => ({ _: "binary", left, op, right }) },
      { "name": "boolean", "symbols": ["sum"], "postprocess": id },
      { "name": "sum", "symbols": ["sum", "_", "sumop", "_", "product"], "postprocess": ([left, , op, , right]) => ({ _: "binary", left, op, right }) },
      { "name": "sum", "symbols": ["product"], "postprocess": id },
      { "name": "product", "symbols": ["product", "_", "mulop", "_", "exp"], "postprocess": ([left, , op, , right]) => ({ _: "binary", left, op, right }) },
      { "name": "product", "symbols": ["exp"], "postprocess": id },
      { "name": "exp", "symbols": ["unary", "_", "expop", "_", "exp"], "postprocess": ([left, , op, , right]) => ({ _: "binary", left, op, right }) },
      { "name": "exp", "symbols": ["unary"], "postprocess": id },
      { "name": "unary", "symbols": [{ "literal": "-" }, "value"], "postprocess": ([op, value]) => ({ _: "unary", op: op.value, value }) },
      { "name": "unary", "symbols": [{ "literal": "not" }, "_", "value"], "postprocess": ([op, , value]) => ({ _: "unary", op: op.value, value }) },
      { "name": "unary", "symbols": ["value"], "postprocess": id },
      { "name": "logicop", "symbols": [{ "literal": "and" }], "postprocess": val },
      { "name": "logicop", "symbols": [{ "literal": "or" }], "postprocess": val },
      { "name": "logicop", "symbols": [{ "literal": "xor" }], "postprocess": val },
      { "name": "boolop", "symbols": [{ "literal": ">" }], "postprocess": val },
      { "name": "boolop", "symbols": [{ "literal": ">=" }], "postprocess": val },
      { "name": "boolop", "symbols": [{ "literal": "<" }], "postprocess": val },
      { "name": "boolop", "symbols": [{ "literal": "<=" }], "postprocess": val },
      { "name": "boolop", "symbols": [{ "literal": "==" }], "postprocess": val },
      { "name": "boolop", "symbols": [{ "literal": "!=" }], "postprocess": val },
      { "name": "sumop", "symbols": [{ "literal": "+" }], "postprocess": val },
      { "name": "sumop", "symbols": [{ "literal": "-" }], "postprocess": val },
      { "name": "mulop", "symbols": [{ "literal": "*" }], "postprocess": val },
      { "name": "mulop", "symbols": [{ "literal": "/" }], "postprocess": val },
      { "name": "expop", "symbols": [{ "literal": "^" }], "postprocess": val },
      { "name": "value", "symbols": ["literal_number"], "postprocess": id },
      { "name": "value", "symbols": ["literal_boolean"], "postprocess": id },
      { "name": "value", "symbols": ["literal_string"], "postprocess": id },
      { "name": "value", "symbols": ["name"], "postprocess": id },
      { "name": "value", "symbols": ["call"], "postprocess": id },
      { "name": "call", "symbols": ["name", { "literal": "(" }, "call_args", { "literal": ")" }], "postprocess": ([fn, , args]) => ({ _: "call", fn, args }) },
      { "name": "call_args", "symbols": [], "postprocess": always([]) },
      { "name": "call_args", "symbols": ["expr"] },
      { "name": "call_args", "symbols": ["call_args", "_", { "literal": "," }, "_", "expr"], "postprocess": ([list, , , , value]) => list.concat([value]) },
      { "name": "literal_number", "symbols": [lexer.has("number") ? { type: "number" } : number], "postprocess": ([tok]) => ({ _: "number", value: Number(tok.value) }) },
      { "name": "literal_number", "symbols": [lexer.has("number") ? { type: "number" } : number, { "literal": "." }, lexer.has("number") ? { type: "number" } : number], "postprocess": ([whole, , frac]) => ({ _: "number", value: Number(whole.value + "." + frac.value) }) },
      { "name": "literal_boolean", "symbols": [{ "literal": "true" }], "postprocess": always({ _: "bool", value: true }) },
      { "name": "literal_boolean", "symbols": [{ "literal": "false" }], "postprocess": always({ _: "bool", value: false }) },
      { "name": "literal_string", "symbols": [lexer.has("sqstring") ? { type: "sqstring" } : sqstring], "postprocess": ([tok]) => ({ _: "string", value: tok.value.slice(1, -1) }) },
      { "name": "literal_string", "symbols": [lexer.has("dqstring") ? { type: "dqstring" } : dqstring], "postprocess": ([tok]) => ({ _: "string", value: tok.value.slice(1, -1) }) },
      { "name": "name_with_type", "symbols": ["name", { "literal": ":" }, "_", "vtype"], "postprocess": ([name, , , type]) => ({ _: "arg", type, name }) },
      { "name": "vtype", "symbols": [{ "literal": "any" }], "postprocess": val },
      { "name": "vtype", "symbols": [{ "literal": "bool" }], "postprocess": val },
      { "name": "vtype", "symbols": [{ "literal": "function" }], "postprocess": val },
      { "name": "vtype", "symbols": [{ "literal": "number" }], "postprocess": val },
      { "name": "vtype", "symbols": [{ "literal": "string" }], "postprocess": val },
      { "name": "name", "symbols": [lexer.has("word") ? { type: "word" } : word], "postprocess": ([tok]) => ({ _: "id", value: tok.value }) },
      { "name": "_", "symbols": ["ws"], "postprocess": always(null) },
      { "name": "_", "symbols": ["comment"], "postprocess": always(null) },
      { "name": "_", "symbols": [], "postprocess": always(null) },
      { "name": "__", "symbols": ["ws"], "postprocess": always(null) },
      { "name": "ws", "symbols": [lexer.has("ws") ? { type: "ws" } : ws], "postprocess": always(null) },
      { "name": "comment", "symbols": ["_", lexer.has("comment") ? { type: "comment" } : comment, "_"], "postprocess": always(null) }
    ],
    ParserStart: "document"
  };
  var grammar_default = grammar;

  // src/DScript/parser.ts
  function parse(src) {
    const p = new import_nearley.Parser(import_nearley.Grammar.fromCompiled(grammar_default));
    p.feed(src.trim());
    const result = p.finish();
    if (result.length === 0)
      throw new Error("Invalid program.");
    if (result.length > 1) {
      for (let i = 0; i < result.length; i++) {
        console.log(`--- PARSE #${i}`);
        console.dir(result[0], { depth: Infinity });
      }
      throw new Error("Ambiguous parse.");
    }
    return result[0];
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
      this.scripting = new EngineScripting(this);
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
        const { atlas, cells, scripts, start, facing } = convertGridCartographerMap(
          map,
          region,
          floor
        );
        if (!atlas)
          throw new Error(`${jsonUrl} did not contain #ATLAS`);
        const codeFiles = yield Promise.all(
          scripts.map((url) => this.res.loadScript(url))
        );
        for (const code of codeFiles) {
          const program = parse(code);
          this.scripting.run(program);
        }
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
      const wall2 = at.sides[dir];
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
        const old = this.position;
        this.position = move(this.position, dir);
        this.draw();
        this.scripting.onEnter(this.position, old);
      }
    }
    turn(clockwise) {
      this.facing = rotate(this.facing, clockwise);
      this.draw();
    }
  };

  // res/map.json
  var map_default2 = "./map-W63ZI7ST.json";

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
    g.loadGCMap(map_default2, 0, 1);
  }
  window.addEventListener("load", () => loadEngine(document.body));
})();
//# sourceMappingURL=bundle.js.map
