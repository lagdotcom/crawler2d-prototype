import { Env } from "./logic";
import { FunctionArgType } from "./ast";

export default class DScriptHost {
  env: Env;

  constructor() {
    this.env = new Map();
  }

  addNative(name: string, args: FunctionArgType[], value: Function) {
    this.env.set(name, { _: "native", name, args, value });
  }
}
