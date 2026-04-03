import { readdir, readFile, mkdir, writeFile, rename, rm } from "fs/promises";
import { join } from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

import { getPresetClasses } from "../lib/examples";
import { exampleMeta } from "../lib/examples";

import type { ExamplesData, ExampleVariant } from "../lib/examples";

const EXAMPLES_DIR = join(process.cwd(), "examples");
const SOURCE_DIR = join(process.cwd(), ".source");
const UI_DIST_DIR = join(process.cwd(), "..", "..", "packages", "ui", "dist");

async function collectExamples() {
  const typeEntries = await readdir(EXAMPLES_DIR, { withFileTypes: true });
  const typeNames = typeEntries.filter((e) => e.isDirectory()).map((e) => e.name);

  await rm(SOURCE_DIR, { recursive: true, force: true });
  await mkdir(SOURCE_DIR, { recursive: true });

  const types: ExamplesData["types"] = [];

  for (const typeName of typeNames) {
    const typeDir = join(EXAMPLES_DIR, typeName);
    const categoryEntries = await readdir(typeDir, { withFileTypes: true });
    const categoryNames = categoryEntries.filter((e) => e.isDirectory()).map((e) => e.name);

    const categories: ExamplesData["types"][number]["categories"] = [];

    for (const categoryName of categoryNames) {
      const categoryDir = join(typeDir, categoryName);
      const files = await readdir(categoryDir);
      const variantNumbers = files
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => parseInt(f.replace(".tsx", ""), 10))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      if (variantNumbers.length > 0) {
        const variants: ExampleVariant[] = [];

        for (const variantNum of variantNumbers) {
          const modulePath = `../examples/${typeName}/${categoryName}/${variantNum}`;
          const mod = await import(modulePath);
          const html = renderToStaticMarkup(createElement(mod.default))
            .replace(/<link rel="preload"[^>]*>/g, "")
            .replace(/class="([^"]*)"/g, (_, cls) =>
              `class="${cls.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'")}"`);
          const cfg = mod.config ?? {};
          const presetClasses = cfg.preset ? getPresetClasses(cfg.preset) : "";
          const customClasses = cfg.classList ?? "";
          const combinedClasses = [presetClasses, customClasses].filter(Boolean).join(" ");

          variants.push({ variant: variantNum, html, presetClasses: combinedClasses });
        }

        const meta = exampleMeta[typeName]?.[categoryName];
        if (!meta && typeName !== "docs") {
          throw new Error(
            `Missing example meta for "${typeName}/${categoryName}". Add it to lib/examples.ts`,
          );
        }

        categories.push({
          category: categoryName,
          title: meta?.title ?? categoryName,
          description: meta?.description ?? "",
          variants,
        });
      }
    }

    if (categories.length > 0) {
      types.push({ type: typeName, categories });
    }
  }

  // Write examples.json
  const tempPath = join(SOURCE_DIR, "examples.json.tmp");
  const finalPath = join(SOURCE_DIR, "examples.json");
  await writeFile(tempPath, JSON.stringify({ types }));
  await rename(tempPath, finalPath);
  console.log(`Written examples to .source/examples.json`);

  // Build CSS: Tailwind + Starting Point UI, scanned against all examples
  const uiCss = await readFile(join(UI_DIST_DIR, "index.css"), "utf-8");
  const inputCss = `@import "tailwindcss";\n${uiCss}\n@source "../examples";`;
  const result = await postcss([tailwindcss({ optimize: { minify: true } })]).process(inputCss, {
    from: join(process.cwd(), "examples.css"),
  });
  const css = result.css;

  // Read JS from UI package
  const js = await readFile(join(UI_DIST_DIR, "index.js"), "utf-8");

  // Generate shell HTML document
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.bunny.net" />
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css" rel="stylesheet" />
    <style>${css}</style>
  </head>
  <body class="font-sans antialiased">
    <script type="module">${js}</script>
  </body>
</html>`;

  await writeFile(join(SOURCE_DIR, "examples.html"), html);
  console.log(`Written shell to .source/examples.html`);
}

collectExamples().catch(console.error);
