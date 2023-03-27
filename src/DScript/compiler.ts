import { Grammar, Parser } from "nearley";

import { Program } from "./ast";
import grammar from "./grammar";

export default function compile(src: string): Program[] {
  const p = new Parser(Grammar.fromCompiled(grammar));
  p.feed(src.trim());
  return p.finish();
}
