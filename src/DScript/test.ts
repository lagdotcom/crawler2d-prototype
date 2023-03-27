import DScriptHost from "./host";
import compile from "./compiler";
import { run } from "./logic";

const compiled = compile(`x = 3
y  =    5.5-x z=6/x yo=z == x   z*= 3
greeting = "Hi!" other = 'Yo' well = not yo
itIsAFunction(x, yo,greeting,true,-z)

function something(a: number, cb: function): number
  amazing = a ^ 3
  cb(amazing)
  if amazing > 10 then
    cb('high')
  else
    cb('low')
  end
  return amazing
end
something(4, debug)

function early()
  if x > 3 then return end
end
`);
console.dir(compiled, { depth: Infinity });

const host = new DScriptHost();
host.addNative(
  "itIsAFunction",
  ["number", "bool", "string", "bool", "number"],
  undefined,
  (a: number, b: boolean, c: string, d: string, e: number) =>
    console.log("function called:", a, b, c, d, e)
);
host.addNative("debug", ["any"], undefined, (thing: any) =>
  console.log("[debug]", thing)
);
run(host, compiled[0]);
console.log(host.env);
