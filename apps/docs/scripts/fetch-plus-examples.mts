// Pulls every example from the Plus api into .plus/<category>/<slug>.html and
// .json before the build, so the pages render from disk and Tailwind scans the
// markup for classes when it compiles globals.css.

import fs from "node:fs/promises";
import path from "node:path";

const PLUS_URL = process.env.PLUS_URL ?? "http://localhost:8000";
const out = path.join(process.cwd(), ".plus");

const res = await fetch(`${PLUS_URL}/api/examples`);
if (!res.ok) throw new Error(`Plus api responded ${res.status}`);
const index = (await res.json()) as { category: string; slug: string }[];

await fs.rm(out, { recursive: true, force: true });
for (const { category, slug } of index) {
  const example = await fetch(`${PLUS_URL}/api/examples/${category}/${slug}`);
  if (!example.ok) throw new Error(`Plus example ${category}/${slug} responded ${example.status}`);
  const { title, description, builtWith, related, html } = (await example.json()) as {
    title: string;
    description: string;
    builtWith: string[];
    related?: string[];
    html: string;
  };
  await fs.mkdir(path.join(out, category), { recursive: true });
  await fs.writeFile(path.join(out, category, `${slug}.html`), html);
  await fs.writeFile(
    path.join(out, category, `${slug}.json`),
    JSON.stringify({ title, description, builtWith, related }),
  );
}

console.log(`fetched ${index.length} plus examples`);
