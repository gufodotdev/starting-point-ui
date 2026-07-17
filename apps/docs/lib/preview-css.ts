import path from "node:path";
import { compile } from "@tailwindcss/node";

// Preview fences may carry a <style> block written in the same dialect as the
// customization docs (@apply etc.). Tailwind directives don't exist at
// runtime, so the frame compiles them against the app stylesheet via
// @reference before serving. Plain CSS blocks pass through untouched, and the
// code tab always shows the authored source.
const STYLE_RE = /<style>([\s\S]*?)<\/style>/g;
const DIRECTIVE_RE = /@(?:apply|utility|variant|custom-variant)\b/;

export async function compilePreviewStyles(html: string): Promise<string> {
  const blocks = [...html.matchAll(STYLE_RE)];
  let out = html;
  for (const block of blocks) {
    if (!DIRECTIVE_RE.test(block[1])) continue;
    const compiled = await compileCss(block[1]);
    out = out.replace(block[0], `<style>${compiled}</style>`);
  }
  return out;
}

async function compileCss(css: string): Promise<string> {
  const base = path.join(process.cwd(), "app");
  const compiler = await compile(`@reference "./globals.css";\n${css}`, {
    base,
    onDependency: () => {},
  });
  return compiler.build([]);
}
