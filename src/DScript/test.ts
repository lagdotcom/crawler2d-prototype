import DScriptHost from "./host";
import compile from "./compiler";
import { runInScope } from "./logic";

const compiled = compile(`x = 3
y  =    5.5-x z=6/x yo=z == x   z*= 3
greeting = "Hi!" other = 'Yo' well = not yo
itIsAFunction(x, yo,greeting,true,-z)

function something(number a, function cb)
  amazing = a ^ 3
  debug(amazing)
end
something(4, debug)
`);
console.dir(compiled, { depth: Infinity });

const host = new DScriptHost();
host.addNative(
  "itIsAFunction",
  ["number", "bool", "string", "bool", "number"],
  (a: number, b: boolean, c: string, d: string, e: number) =>
    console.log("function called:", a, b, c, d, e)
);
host.addNative("debug", ["any"], (thing: any) => console.log("[debug]", thing));
runInScope(host, compiled[0]);
console.log(host.env);
