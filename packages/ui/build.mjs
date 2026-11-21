import * as esbuild from "esbuild";
import postcss from "postcss";
import postcssImport from "postcss-import";
import { mkdir, readFile, writeFile, watch as fsWatch } from "fs/promises";
import { join } from "path";

const isWatch = process.argv.includes("--watch");

await mkdir("dist", { recursive: true });

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

// For the Tailwind browser build, which only compiles text/tailwindcss style tags.
// Prepended so page CSS can @apply our tokens. The browser build skips its own
// tailwindcss import once any @import appears, so ours leads. The runtime is
// inlined so `sp` exists for scripts after it.
async function buildCdn() {
  const css = await readFile("dist/index.css", "utf8");
  const styles = `(() => {
  const style = document.createElement("style");
  style.type = "text/tailwindcss";
  style.textContent = ${JSON.stringify(`@import "tailwindcss";\n${css}`)};
  document.head.prepend(style);
})();`;
  const { outputFiles } = await esbuild.build({
    entryPoints: ["src/js/index.ts"],
    bundle: true,
    format: "iife",
    minify: !isWatch,
    write: false,
    banner: { js: styles },
  });
  await writeFile("dist/cdn.js", outputFiles[0].text);
}

async function watchCSS() {
  const watcher = fsWatch(join(process.cwd(), "src/css"), { recursive: true });
  for await (const event of watcher) {
    if (event.filename?.endsWith(".css")) {
      await buildCSS();
      await buildCdn();
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
  await buildCSS();
  const jsCtx = await esbuild.context({
    ...jsConfig,
    plugins: [{ name: "cdn", setup: (build) => build.onEnd(() => buildCdn()) }],
  });
  await jsCtx.watch();
  watchCSS();
  console.log("Watching for changes...");
} else {
  await Promise.all([buildCSS(), esbuild.build(jsConfig)]);
  await buildCdn();
}
