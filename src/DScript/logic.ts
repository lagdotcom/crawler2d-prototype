import {
  AssignmentOp,
  BinaryOp,
  Literal,
  LiteralBoolean,
  LiteralNumber,
  LiteralString,
  UnaryOp,
} from "./ast";

function bool(value: boolean): LiteralBoolean {
  return { _: "bool", value };
}

function num(value: number): LiteralNumber {
  return { _: "number", value };
}

function str(value: string): LiteralString {
  return { _: "string", value };
}

function truthy(value: boolean | number | string): boolean {
  return !!value;
}

export function unary(op: UnaryOp, value: Literal): Literal {
  switch (op) {
    case "-":
      if (value._ === "number") return num(-value.value);
      throw new Error(`Cannot negate a ${value._}`);

    case "not":
      return bool(!truthy(value.value));
  }
}

export function binary(op: BinaryOp, left: Literal, right: Literal): Literal {
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

const opMapping = {
  "+=": "+",
  "-=": "-",
  "*=": "*",
  "/=": "/",
  "^=": "^",
} as const;
export function assign(op: AssignmentOp, left: Literal, right: Literal) {
  if (op === "=") return right;
  return binary(opMapping[op], left, right);
}
