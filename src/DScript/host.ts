import { Env, LiteralType, Scope, runInScope } from "./logic";

import { Program } from "./ast";

export default class DScriptHost {
  env: Env;

  constructor() {
    this.env = new Map();
  }

  addNative(name: string, args: LiteralType[], value: Function) {
    this.env.set(name, { _: "native", name, args, value });
  }

  run(prg: Program, env: Env = new Map()) {
    const scope: Scope = { parent: this, env };
    runInScope(scope, prg);
    return scope;
  }
}
