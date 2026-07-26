// Bundles the JS for the test harness. Tests inject their own markup and assert
// behavior (events, attributes, DOM state), so no CSS is needed.

import * as esbuild from "esbuild";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const out = join(dir, ".tmp");

await mkdir(out, { recursive: true });

await esbuild.build({
  entryPoints: [join(dir, "../src/js/index.ts")],
  bundle: true,
  outfile: join(out, "index.js"),
  format: "esm",
  logLevel: "warning",
});

// Blank page that loads the bundle. Tests inject markup into the body; the
// observer auto-initializes it.
await writeFile(
  join(out, "index.html"),
  `<!doctype html><meta charset="utf-8"><script type="module" src="/index.js"></script>`,
);

console.log("test bundle built");
