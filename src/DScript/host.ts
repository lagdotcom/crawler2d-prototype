import { Env } from "./logic";
import { FunctionArgType } from "./ast";

export default class DScriptHost {
  env: Env;
  name: string;

  constructor() {
    this.env = new Map();
    this.name = "<Host>";
  }

  addNative(
    name: string,
    args: FunctionArgType[],
    type: FunctionArgType | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: (...args: any[]) => unknown
  ) {
    this.env.set(name, { _: "native", name, args, type, value });
  }
}
