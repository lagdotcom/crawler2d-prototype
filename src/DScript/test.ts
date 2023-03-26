import DScriptHost from "./host";
import compile from "./compiler";

const compiled = compile(`x = 3
y  =    5.5-x z=6/x yo=z == x   z*= 3
greeting = "Hi!" other = 'Yo' well = true`);
console.dir(compiled, { depth: Infinity });

const host = new DScriptHost();
host.run(compiled[0]);

console.log(host);
