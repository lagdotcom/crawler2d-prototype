import {
  RuntimeFunction,
  RuntimeValue,
  callFunction,
  num,
  runInScope,
} from "./DScript/logic";

import DScriptHost from "./DScript/host";
import Engine from "./Engine";
import { Program } from "./DScript/ast";
import XY from "./types/XY";

export default class EngineScripting extends DScriptHost {
  onTagEnter: Map<string, RuntimeFunction>;

  constructor(public g: Engine) {
    super();

    this.onTagEnter = new Map();

    this.addNative("debug", ["any"], (thing: any) =>
      console.log("[debug]", thing)
    );

    this.addNative(
      "onTagEnter",
      ["string", "function"],
      (tag: string, cb: RuntimeFunction) => {
        this.onTagEnter.set(tag, cb);
      }
    );

    this.addNative(
      "tileHasTag",
      ["number", "number", "string"],
      (x: number, y: number, tag: string) => {
        const cell = this.g.getCell(x, y);
        return cell?.tags.includes(tag);
      }
    );
  }

  run(program: Program) {
    runInScope(this, program);
  }

  runCallback(fn: RuntimeFunction, ...args: RuntimeValue[]) {
    if (fn._ === "function") callFunction(this, fn, args);
    else fn.value.call(undefined, ...args);
  }

  onEnter(newPos: XY, oldPos: XY) {
    const tile = this.g.getCell(newPos.x, newPos.y);
    if (!tile) return;

    for (const tag of tile.tags) {
      const cb = this.onTagEnter.get(tag);
      if (cb) this.runCallback(cb, num(oldPos.x), num(oldPos.y));
    }
  }
}
