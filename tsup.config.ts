import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/js/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    minify: true,
    sourcemap: true,
    treeshake: true,
  },
  {
    entry: ["src/css/index.css"],
    outDir: "dist",
    minify: true,
  },
]);
