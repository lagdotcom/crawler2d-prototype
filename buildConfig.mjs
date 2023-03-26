import CDNModule from "./CDNModule.mjs";

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: true,
  outfile: "docs/bundle.js",
  // minify: true,
  plugins: [CDNModule],
  loader: { ".dscript": "file", ".json": "file", ".png": "file" },
};
export default config;
