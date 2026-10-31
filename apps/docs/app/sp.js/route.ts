import { readFileSync } from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

export function GET() {
  const file = path.join(process.cwd(), "..", "..", "packages", "ui", "dist", "index.js");
  return new Response(readFileSync(file, "utf8"), {
    headers: { "Content-Type": "text/javascript; charset=utf-8" },
  });
}
