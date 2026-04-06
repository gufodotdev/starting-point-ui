import { readdir, mkdir, writeFile, rename, rm } from "fs/promises";
import { join } from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as prettier from "prettier/standalone";
import * as htmlParser from "prettier/plugins/html";
import { codeToHtml } from "shiki";

import { getPresetClasses } from "../lib/examples";
import { exampleMeta } from "../lib/examples";

import type { ExamplesData, ExampleVariant } from "../lib/examples";

const EXAMPLES_DIR = join(process.cwd(), "examples");
const SOURCE_DIR = join(process.cwd(), ".source");

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
          const rawHtml = renderToStaticMarkup(createElement(mod.default))
            .replace(/<link rel="preload"[^>]*>/g, "")
            .replace(/class="([^"]*)"/g, (_, cls) =>
              `class="${cls.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'")}"`);
          const formatted = await prettier.format(rawHtml, {
            parser: "html",
            plugins: [htmlParser],
            printWidth: 80,
            tabWidth: 2,
            htmlWhitespaceSensitivity: "ignore",
          });
          const html = await codeToHtml(formatted, {
            lang: "html",
            themes: { dark: "github-dark", light: "github-light" },
          });
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
}

collectExamples().catch(console.error);
