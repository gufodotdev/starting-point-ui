import * as esbuild from "esbuild";
import postcss from "postcss";
import postcssImport from "postcss-import";
import { readFile, writeFile, watch as fsWatch } from "fs/promises";
import { join } from "path";

const isWatch = process.argv.includes("--watch");

async function buildCSS() {
  const entry = "src/css/index.css";
  const css = await readFile(entry, "utf8");
  const result = await postcss([postcssImport]).process(css, { from: entry });
  const output = isWatch
    ? result.css
    : (await esbuild.transform(result.css, { loader: "css", minify: true }))
        .code;
  await writeFile("dist/index.css", output);
  console.log("CSS built");
}

async function watchCSS() {
  await buildCSS();
  const watcher = fsWatch(join(process.cwd(), "src/css"), { recursive: true });
  for await (const event of watcher) {
    if (event.filename?.endsWith(".css")) {
      await buildCSS();
    }
  }
}

const jsConfig = {
  entryPoints: ["src/js/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  minify: !isWatch,
  sourcemap: true,
  treeShaking: true,
  logLevel: "info",
};

if (isWatch) {
  const jsCtx = await esbuild.context(jsConfig);
  await jsCtx.watch();
  watchCSS();
  console.log("Watching for changes...");
} else {
  await Promise.all([buildCSS(), esbuild.build(jsConfig)]);
}
