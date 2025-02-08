import * as esbuild from "npm:esbuild";
// Import the Wasm build on platforms where running subprocesses is not
// permitted, such as Deno Deploy, or when running without `--allow-run`.
// import * as esbuild from "https://deno.land/x/esbuild@0.20.2/wasm.js";

import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["./src/main.ts"],
  outfile: "./dist/main.esm.js",
  bundle: true,
  format: "esm",
});

esbuild.stop();
