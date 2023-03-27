import { Grammar, Parser } from "nearley";

import { Program } from "./ast";
import grammar from "./grammar";

export default function parse(src: string): Program {
  const p = new Parser(Grammar.fromCompiled(grammar));
  p.feed(src.trim());
  const result = p.finish();

  if (result.length === 0) throw new Error("Invalid program.");
  if (result.length > 1) {
    for (let i = 0; i < result.length; i++) {
      console.log(`--- PARSE #${i}`);
      console.dir(result[0], { depth: Infinity });
    }
    throw new Error("Ambiguous parse.");
  }
  return result[0];
}
