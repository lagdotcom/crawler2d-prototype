@{%
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
%}
@preprocessor typescript

@lexer lexer

document -> _ program {% ([,prog]) => prog %}
program -> declp:* {% id %}
declp -> decl _ {% id %}
decl -> stmt {% id %}

stmt -> assignment {% id %}
      | call {% id %}
      | function_def {% id %}
      | if_stmt {% id %}

assignment -> name _ assignop _ expr {% ([name,,op,,expr]) => ({ _: 'assignment', name, op, expr }) %}
assignop -> "=" {% val %}
          | "+=" {% val %}
          | "-=" {% val %}
          | "*=" {% val %}
          | "/=" {% val %}
          | "^=" {% val %}

function_def -> "function" __ name "(" function_args ")" document __ "end" {% ([,,name,,args,,program]) => ({ _: 'function', name, args, program }) %}

function_args -> null {% () => [] %}
               | function_arg
               | function_args _ "," _ function_arg {% ([list,,,,value]) => list.concat([value]) %}

function_arg -> vtype __ name {% ([type,,name]) => ({ _: 'arg', type, name }) %}

if_stmt -> "if" __ expr __ "then" document __ "end" {% ([,,expr,,,positive]) => ({ _: 'if', expr, positive }) %}

expr -> maths {% id %}

maths   -> logic {% id %}
logic   -> logic _ logicop _ boolean {% ([left,,op,,right]) => ({ _: 'binary', left, op, right }) %}
         | boolean {% id %}
boolean -> boolean _ boolop _ sum {% ([left,,op,,right]) => ({ _: 'binary', left, op, right }) %}
         | sum {% id %}
sum     -> sum _ sumop _ product {% ([left,,op,,right]) => ({ _: 'binary', left, op, right }) %}
         | product {% id %}
product -> product _ mulop _ exp {% ([left,,op,,right]) => ({ _: 'binary', left, op, right }) %}
         | exp {% id %}
exp     -> unary _ expop _ exp {% ([left,,op,,right]) => ({ _: 'binary', left, op, right }) %}
         | unary {% id %}
unary   -> "-" value {% ([op,value]) => ({ _: 'unary', op: op.value, value }) %}
         | "not" _ value {% ([op,,value]) => ({ _: 'unary', op: op.value, value }) %}
         | value {% id %}

logicop -> "and" {% val %}
         | "or" {% val %}
         | "xor" {% val %}
boolop  -> ">" {% val %}
         | ">=" {% val %}
         | "<" {% val %}
         | "<=" {% val %}
         | "==" {% val %}
         | "!=" {% val %}
sumop   -> "+" {% val %}
         | "-" {% val %}
mulop   -> "*" {% val %}
         | "/" {% val %}
expop   -> "^" {% val %}

value -> literal_number {% id %}
       | literal_boolean {% id %}
       | literal_string {% id %}
       | name {% id %}
       | call {% id %}

call -> name "(" call_args ")" {% ([fn,,args]) => ({ _:'call', fn, args }) %}

call_args -> null {% () => [] %}
           | expr
           | call_args _ "," _ expr {% ([list,,,,value]) => list.concat([value]) %}

literal_number -> %number {% ([tok]) => ({ _: 'number', value: Number(tok.value) }) %}
                | %number "." %number {% ([whole,,frac]) => ({ _: 'number', value: Number(whole.value + '.' + frac.value)}) %}

literal_boolean -> "true" {% () => ({ _: 'bool', value: true }) %}
                 | "false" {% () => ({ _: 'bool', value: false }) %}

literal_string -> %sqstring {% ([tok]) => ({ _: 'string', value: tok.value.slice(1, -1) }) %}
                | %dqstring {% ([tok]) => ({ _: 'string', value: tok.value.slice(1, -1) }) %}

vtype -> "any" {% val %}
       | "bool" {% val %}
       | "function" {% val %}
       | "number" {% val %}
       | "string" {% val %}

name -> %word {% ([tok]) => ({ _: 'id', value: tok.value }) %}

_  -> ws {% () => null %}
    | comment {% () => null %}
    | null {% () => null %}
__ -> ws {% () => null %}

ws -> %ws {% () => null %}
comment -> _ %comment _ {% () => null %}
