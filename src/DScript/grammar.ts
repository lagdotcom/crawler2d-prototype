// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var number: any;
declare var sqstring: any;
declare var dqstring: any;
declare var word: any;
declare var ws: any;
declare var comment: any;

const val = ([tok]: NearleyToken[]) => tok.value;

import moo from 'moo';

const lexer = moo.compile({
  ws:         { match: /[ \t\n\r]+/, lineBreaks: true },
  comment:    { match: /;[^\n]*\n/, lineBreaks: true },
  number:     /[0-9]+/,
  sqstring:   /'.*?'/,
  dqstring:   /".*?"/,
  keywords:   ["else", "end", "enum", "false", "if", "not", "query", "return", "true"],

  word:       { match: /[a-zA-Z][a-zA-Z0-9_]*/, },

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
  qm: "?",
});

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "document", "symbols": ["_", "program"], "postprocess": ([,prog]) => prog},
    {"name": "program$ebnf$1", "symbols": []},
    {"name": "program$ebnf$1", "symbols": ["program$ebnf$1", "declp"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "program", "symbols": ["program$ebnf$1"], "postprocess": id},
    {"name": "declp", "symbols": ["decl", "_"], "postprocess": id},
    {"name": "decl", "symbols": ["stmt"], "postprocess": id},
    {"name": "stmt", "symbols": ["assignment"], "postprocess": id},
    {"name": "stmt", "symbols": ["call"], "postprocess": id},
    {"name": "stmt", "symbols": ["function_def"], "postprocess": id},
    {"name": "assignment", "symbols": ["name", "_", "assignop", "_", "expr"], "postprocess": ([name,,op,,expr]) => ({ _: 'assignment', name, op, expr })},
    {"name": "assignop", "symbols": [{"literal":"="}], "postprocess": val},
    {"name": "assignop", "symbols": [{"literal":"+="}], "postprocess": val},
    {"name": "assignop", "symbols": [{"literal":"-="}], "postprocess": val},
    {"name": "assignop", "symbols": [{"literal":"*="}], "postprocess": val},
    {"name": "assignop", "symbols": [{"literal":"/="}], "postprocess": val},
    {"name": "assignop", "symbols": [{"literal":"^="}], "postprocess": val},
    {"name": "function_def", "symbols": [{"literal":"function"}, "__", "name", {"literal":"("}, "function_args", {"literal":")"}, "document", "__", {"literal":"end"}], "postprocess": ([,,name,,args,,program]) => ({ _: 'function', name, args, program })},
    {"name": "function_args", "symbols": [], "postprocess": () => []},
    {"name": "function_args", "symbols": ["function_arg"]},
    {"name": "function_args", "symbols": ["function_args", "_", {"literal":","}, "_", "function_arg"], "postprocess": ([list,,,,value]) => list.concat([value])},
    {"name": "function_arg", "symbols": ["vtype", "__", "name"], "postprocess": ([type,,name]) => ({ _: 'arg', type, name })},
    {"name": "expr", "symbols": ["maths"], "postprocess": id},
    {"name": "maths", "symbols": ["logic"], "postprocess": id},
    {"name": "logic", "symbols": ["logic", "_", "logicop", "_", "boolean"], "postprocess": ([left,,op,,right]) => ({ _: 'binary', left, op, right })},
    {"name": "logic", "symbols": ["boolean"], "postprocess": id},
    {"name": "boolean", "symbols": ["boolean", "_", "boolop", "_", "sum"], "postprocess": ([left,,op,,right]) => ({ _: 'binary', left, op, right })},
    {"name": "boolean", "symbols": ["sum"], "postprocess": id},
    {"name": "sum", "symbols": ["sum", "_", "sumop", "_", "product"], "postprocess": ([left,,op,,right]) => ({ _: 'binary', left, op, right })},
    {"name": "sum", "symbols": ["product"], "postprocess": id},
    {"name": "product", "symbols": ["product", "_", "mulop", "_", "exp"], "postprocess": ([left,,op,,right]) => ({ _: 'binary', left, op, right })},
    {"name": "product", "symbols": ["exp"], "postprocess": id},
    {"name": "exp", "symbols": ["unary", "_", "expop", "_", "exp"], "postprocess": ([left,,op,,right]) => ({ _: 'binary', left, op, right })},
    {"name": "exp", "symbols": ["unary"], "postprocess": id},
    {"name": "unary", "symbols": [{"literal":"-"}, "value"], "postprocess": ([op,value]) => ({ _: 'unary', op: op.value, value })},
    {"name": "unary", "symbols": [{"literal":"not"}, "_", "value"], "postprocess": ([op,,value]) => ({ _: 'unary', op: op.value, value })},
    {"name": "unary", "symbols": ["value"], "postprocess": id},
    {"name": "logicop", "symbols": [{"literal":"and"}], "postprocess": val},
    {"name": "logicop", "symbols": [{"literal":"or"}], "postprocess": val},
    {"name": "logicop", "symbols": [{"literal":"xor"}], "postprocess": val},
    {"name": "boolop", "symbols": [{"literal":">"}], "postprocess": val},
    {"name": "boolop", "symbols": [{"literal":">="}], "postprocess": val},
    {"name": "boolop", "symbols": [{"literal":"<"}], "postprocess": val},
    {"name": "boolop", "symbols": [{"literal":"<="}], "postprocess": val},
    {"name": "boolop", "symbols": [{"literal":"=="}], "postprocess": val},
    {"name": "boolop", "symbols": [{"literal":"!="}], "postprocess": val},
    {"name": "sumop", "symbols": [{"literal":"+"}], "postprocess": val},
    {"name": "sumop", "symbols": [{"literal":"-"}], "postprocess": val},
    {"name": "mulop", "symbols": [{"literal":"*"}], "postprocess": val},
    {"name": "mulop", "symbols": [{"literal":"/"}], "postprocess": val},
    {"name": "expop", "symbols": [{"literal":"^"}], "postprocess": val},
    {"name": "value", "symbols": ["literal_number"], "postprocess": id},
    {"name": "value", "symbols": ["literal_boolean"], "postprocess": id},
    {"name": "value", "symbols": ["literal_string"], "postprocess": id},
    {"name": "value", "symbols": ["name"], "postprocess": id},
    {"name": "value", "symbols": ["call"], "postprocess": id},
    {"name": "call", "symbols": ["name", {"literal":"("}, "call_args", {"literal":")"}], "postprocess": ([fn,,args]) => ({ _:'call', fn, args })},
    {"name": "call_args", "symbols": [], "postprocess": () => []},
    {"name": "call_args", "symbols": ["expr"]},
    {"name": "call_args", "symbols": ["call_args", "_", {"literal":","}, "_", "expr"], "postprocess": ([list,,,,value]) => list.concat([value])},
    {"name": "literal_number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": ([tok]) => ({ _: 'number', value: Number(tok.value) })},
    {"name": "literal_number", "symbols": [(lexer.has("number") ? {type: "number"} : number), {"literal":"."}, (lexer.has("number") ? {type: "number"} : number)], "postprocess": ([whole,,frac]) => ({ _: 'number', value: Number(whole.value + '.' + frac.value)})},
    {"name": "literal_boolean", "symbols": [{"literal":"true"}], "postprocess": () => ({ _: 'bool', value: true })},
    {"name": "literal_boolean", "symbols": [{"literal":"false"}], "postprocess": () => ({ _: 'bool', value: false })},
    {"name": "literal_string", "symbols": [(lexer.has("sqstring") ? {type: "sqstring"} : sqstring)], "postprocess": ([tok]) => ({ _: 'string', value: tok.value.slice(1, -1) })},
    {"name": "literal_string", "symbols": [(lexer.has("dqstring") ? {type: "dqstring"} : dqstring)], "postprocess": ([tok]) => ({ _: 'string', value: tok.value.slice(1, -1) })},
    {"name": "vtype", "symbols": [{"literal":"any"}], "postprocess": val},
    {"name": "vtype", "symbols": [{"literal":"bool"}], "postprocess": val},
    {"name": "vtype", "symbols": [{"literal":"function"}], "postprocess": val},
    {"name": "vtype", "symbols": [{"literal":"number"}], "postprocess": val},
    {"name": "vtype", "symbols": [{"literal":"string"}], "postprocess": val},
    {"name": "name", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": ([tok]) => ({ _: 'id', value: tok.value })},
    {"name": "_", "symbols": ["ws"], "postprocess": () => null},
    {"name": "_", "symbols": ["comment"], "postprocess": () => null},
    {"name": "_", "symbols": [], "postprocess": () => null},
    {"name": "__", "symbols": ["ws"], "postprocess": () => null},
    {"name": "ws", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": () => null},
    {"name": "comment", "symbols": ["_", (lexer.has("comment") ? {type: "comment"} : comment), "_"], "postprocess": () => null}
  ],
  ParserStart: "document",
};

export default grammar;