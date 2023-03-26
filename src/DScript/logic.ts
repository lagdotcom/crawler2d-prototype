import {
  Assignment,
  BinaryOp,
  Expression,
  FunctionArg,
  FunctionArgType,
  FunctionDefinition,
  Literal,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  Program,
  UnaryOp,
} from "./ast";

export type LiteralType = Literal["_"];

export interface NativeFunction {
  _: "native";
  name: string;
  args: FunctionArgType[];
  value: Function;
}

export interface DScriptFunction {
  _: "function";
  name: string;
  args: FunctionArg[];
  value: Program;
}

export type RuntimeFunction = NativeFunction | DScriptFunction;
export type RuntimeValue = Literal | RuntimeFunction;
export type RuntimeType = RuntimeValue["_"];

export type Env = Map<string, RuntimeValue>;

export interface Scope {
  parent?: Scope;
  env: Env;
}

export function bool(value: boolean): LiteralBoolean {
  return { _: "bool", value };
}

export function num(value: number): LiteralNumber {
  return { _: "number", value };
}

export function str(value: string): LiteralString {
  return { _: "string", value };
}

function box(value: any): Literal | undefined {
  switch (typeof value) {
    case "undefined":
      return undefined;
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

function unbox(value: RuntimeValue) {
  if (value._ === "function" || value._ === "native") return value;

  return value.value;
}

function truthy(value: RuntimeValue["value"]): boolean {
  return !!value;
}

function unary(op: UnaryOp, value: RuntimeValue): RuntimeValue {
  switch (op) {
    case "-":
      if (value._ === "number") return num(-value.value);
      throw new Error(`Cannot negate a ${value._}`);

    case "not":
      return bool(!truthy(value.value));
  }
}

function binary(
  op: BinaryOp,
  left: RuntimeValue,
  right: RuntimeValue
): RuntimeValue {
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
  }
}

function convertToFunction(stmt: FunctionDefinition): DScriptFunction {
  return {
    _: "function",
    name: stmt.name.value,
    args: stmt.args,
    value: stmt.program,
  };
}

export function runInScope(scope: Scope, prg: Program) {
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
          runInScope(scope, stmt.positive);
        } else if (stmt.negative) {
          runInScope(scope, stmt.negative);
        }
        break;
      }

      default:
        // @ts-expect-error
        throw new Error(`${stmt._} statements not implemented`);
    }
  }
}

function lookup(scope: Scope, name: string): RuntimeValue;
function lookup(
  scope: Scope,
  name: string,
  canBeNew: boolean
): RuntimeValue | undefined;
function lookup(
  scope: Scope,
  name: string,
  canBeNew = false
): RuntimeValue | undefined {
  let found: RuntimeValue | undefined;
  let current: Scope | undefined = scope;
  while (current) {
    found = current.env.get(name);
    if (found) break;

    current = current.parent;
  }

  if (!found && !canBeNew) throw new Error(`Could not resolve: ${name}`);
  return found;
}

function evaluate(scope: Scope, expr: Expression): RuntimeValue {
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

      if (!value) throw new Error(`${expr.fn.value}() returned no value`);
      return value;
    }
  }
}

function isTypeMatch(want: FunctionArgType, got: RuntimeType) {
  if (want === "any") return true;

  if (want === got) return true;
  if (want === "function" && got === "native") return true;

  return false;
}

function checkFunctionArgs(fn: RuntimeFunction, got: RuntimeValue[]) {
  const argTypes =
    fn._ === "function" ? fn.args.map((arg) => arg.type) : fn.args;

  const fail = () => {
    throw new Error(
      `${fn.name} wants (${argTypes.join(", ")}) but got (${got
        .map((arg) => arg._)
        .join(", ")})`
    );
  };

  if (argTypes.length !== got.length) fail();
  for (let i = 0; i < argTypes.length; i++) {
    if (!isTypeMatch(argTypes[i], got[i]._)) fail();
  }
}

export function callFunction(
  parent: Scope,
  fn: RuntimeValue,
  args: RuntimeValue[]
): Literal | undefined {
  if (fn._ !== "function" && fn._ !== "native")
    throw new Error(`Cannot call a ${fn._}`);

  checkFunctionArgs(fn, args);

  if (fn._ === "native") {
    const result = fn.value.call(undefined, ...args.map(unbox));
    return box(result);
  }

  const scope: Scope = { env: new Map(), parent };
  for (let i = 0; i < args.length; i++)
    scope.env.set(fn.args[i].name.value, args[i]);

  // TODO DScript functions that return things
  runInScope(scope, fn.value);
}

const opMapping = {
  "+=": "+",
  "-=": "-",
  "*=": "*",
  "/=": "/",
  "^=": "^",
} as const;
function assignment(scope: Scope, stmt: Assignment) {
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

  if (stmt.op === "=") left.value = right.value;
  else left.value = binary(opMapping[stmt.op], left, right).value;
}
