import type { ThemeRegistration } from "shiki";

// Custom Shiki themes using Tailwind colors so syntax highlighting matches the
// inline code and link styling: tags/functions = blue, attribute names/keywords
// = red, strings/numbers = violet, punctuation/text = neutral.

const TAG = { light: "#2563eb", dark: "#60a5fa" }; // blue-600 / blue-400
const ATTR = { light: "#dc2626", dark: "#f87171" }; // red-600 / red-400
const STRING = { light: "#7c3aed", dark: "#a78bfa" }; // violet-600 / violet-400
const TEXT = { light: "#1e293b", dark: "#e2e8f0" }; // slate-800 / slate-200
const COMMENT = { light: "#64748b", dark: "#94a3b8" }; // slate-500 / slate-400

function theme(mode: "light" | "dark"): ThemeRegistration {
  const pick = (c: { light: string; dark: string }) => c[mode];
  return {
    name: `sp-${mode}`,
    type: mode,
    colors: { "editor.foreground": pick(TEXT), "editor.background": "#00000000" },
    settings: [
      { settings: { foreground: pick(TEXT) } },
      {
        scope: [
          "entity.name.tag",
          "entity.name.function",
          "support.function",
          "support.class",
          "entity.name.class",
          "variable.other.property",
          "variable.other.object.property",
        ],
        settings: { foreground: pick(TAG) },
      },
      {
        scope: [
          "entity.other.attribute-name",
          "keyword",
          "storage",
          "storage.type",
          "support.type",
          "keyword.operator",
          "variable.language",
        ],
        settings: { foreground: pick(ATTR) },
      },
      {
        scope: ["string", "constant.numeric", "constant.language", "string.quoted"],
        settings: { foreground: pick(STRING) },
      },
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: pick(COMMENT) } },
    ],
  };
}

export const codeThemeLight = theme("light");
export const codeThemeDark = theme("dark");
