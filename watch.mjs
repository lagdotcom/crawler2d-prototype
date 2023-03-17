/*eslint-env node*/

import config from "./buildConfig.mjs";
import { context } from "esbuild";

const result = await context(config);
const serve = await result.serve({ servedir: "docs", port: 8080 });
console.log(`Serving: http://${serve.host}:${serve.port}`);
