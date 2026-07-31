import path from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const rels = process.argv.slice(2);
const out: Record<string, string> = {};

for (const rel of rels) {
  const mod = await import(
    path.resolve("examples", rel.replace(/^examples\//, ""))
  );
  out[rel] = renderToStaticMarkup(createElement(mod.default));
}

process.stdout.write(JSON.stringify(out));
