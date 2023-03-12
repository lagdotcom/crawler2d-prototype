/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: true,
  outfile: "docs/bundle.js",
  // minify: true,
  loader: { ".json": "file", ".png": "file" },
};
export default config;
