import { Assignment, Expression, Literal, Program } from "./ast";
import { assign, binary, unary } from "./logic";

type Env = Map<string, Literal>;

interface Scope {
  parent?: Scope;
  env: Env;
}

export default class DScriptHost {
  env: Env;

  constructor() {
    this.env = new Map();
  }

  run(prg: Program, env: Env = new Map()) {
    const scope = { parent: this, env };
    this.runInScope(scope, prg);
  }

  runInScope(scope: Scope, prg: Program) {
    for (const stmt of prg) {
      this[stmt._](scope, stmt);
    }
  }

  resolve(scope: Scope, name: string): Literal;
  resolve(scope: Scope, name: string, canBeNew: boolean): Literal | undefined;
  resolve(scope: Scope, name: string, canBeNew = false): Literal | undefined {
    let found: Literal | undefined;
    let current: Scope | undefined = scope;
    while (current) {
      found = current.env.get(name);
      if (found) break;

      current = current.parent;
    }

    if (!found && !canBeNew) throw new Error(`Could not resolve: ${name}`);
    return found;
  }

  evaluate(scope: Scope, expr: Expression): Literal {
    switch (expr._) {
      case "bool":
      case "number":
      case "string":
        return expr;

      case "id":
        return this.resolve(scope, expr.value);

      case "unary":
        return unary(expr.op, this.evaluate(scope, expr.value));

      case "binary":
        return binary(
          expr.op,
          this.evaluate(scope, expr.left),
          this.evaluate(scope, expr.right)
        );
    }
  }

  assignment(scope: Scope, stmt: Assignment) {
    const right = this.evaluate(scope, stmt.expr);

    const left = this.resolve(scope, stmt.name.value, true);

    if (!left) {
      if (stmt.op === "=") return this.env.set(stmt.name.value, right);
      throw new Error(`Could not resolve: ${stmt.name.value}`);
    }

    if (left._ !== right._)
      throw new Error(`Cannot assign ${right._} to ${left._}`);

    left.value = assign(stmt.op, left, right).value;
  }
}
