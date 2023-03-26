import DScriptHost from "./host";
import compile from "./compiler";

const compiled = compile(`x = 3
y  =    5.5-x z=6/x yo=z == x   z*= 3
greeting = "Hi!" other = 'Yo' well = not yo
itIsAFunction(x, yo,greeting,true,-z)
`);
console.dir(compiled, { depth: Infinity });

const host = new DScriptHost();
host.addNative(
  "itIsAFunction",
  ["number", "bool", "string", "bool", "number"],
  (a: number, b: boolean, c: string, d: string, e: number) => {
    console.log("function called:", a, b, c, d, e);
  }
);
console.log(host.run(compiled[0]));
