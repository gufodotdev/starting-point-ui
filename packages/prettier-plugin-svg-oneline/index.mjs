import * as md from "prettier/plugins/markdown";
import * as babel from "prettier/plugins/babel";
import * as ts from "prettier/plugins/typescript";
import * as estree from "prettier/plugins/estree";
import * as html from "prettier/plugins/html";
import { doc } from "prettier";

const collapse = (text) =>
  text.replace(/<svg\b(?:[\s\S]*?<\/svg>|[^<>]*?\/>)/g, (svg) =>
    svg
      .replace(/\n\s*/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/ +(\/?>)/g, "$1"),
  );

const isRoot = (node) => {
  if (!node) return false;
  if (node.type === "root" || node.type === "Program" || node.type === "File")
    return true;
  return !("type" in node) && node.parent === undefined;
};

const wrap = (basePrinter) => ({
  ...basePrinter,
  print: (path, options, printFn) => {
    const out = basePrinter.print(path, options, printFn);
    if (!isRoot(path.node)) return out;
    const { formatted } = doc.printer.printDocToString(out, {
      printWidth: options.printWidth,
      tabWidth: options.tabWidth,
      useTabs: options.useTabs,
    });
    return collapse(formatted);
  },
});

const mdastFormat = "mdast-svg-oneline";
const estreeFormat = "estree-svg-oneline";
const htmlFormat = "html-svg-oneline";

export const parsers = {
  markdown: { ...md.parsers.markdown, astFormat: mdastFormat },
  mdx: { ...md.parsers.mdx, astFormat: mdastFormat },
  remark: { ...md.parsers.remark, astFormat: mdastFormat },
  babel: { ...babel.parsers.babel, astFormat: estreeFormat },
  "babel-ts": { ...babel.parsers["babel-ts"], astFormat: estreeFormat },
  typescript: { ...ts.parsers.typescript, astFormat: estreeFormat },
  html: { ...html.parsers.html, astFormat: htmlFormat },
};

export const printers = {
  [mdastFormat]: wrap(md.printers.mdast),
  [estreeFormat]: wrap(estree.printers.estree),
  [htmlFormat]: wrap(html.printers.html),
};
