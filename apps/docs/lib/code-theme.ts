import type { ThemeRegistration } from "shiki";

// A Tailwind-style palette shared across light and dark: sky tags, pink
// attributes, emerald strings, slate text. Light uses the 600 shades, dark the
// 400 shades, so both stay legible on their background.
const TAG = { light: "#0284c7", dark: "#38bdf8" }; // sky-600 / sky-400
const ATTR = { light: "#db2777", dark: "#f472b6" }; // pink-600 / pink-400
const STRING = { light: "#059669", dark: "#34d399" }; // emerald-600 / emerald-400
const TEXT = { light: "#334155", dark: "#e2e8f0" }; // slate-700 / slate-200
const COMMENT = { light: "#94a3b8", dark: "#94a3b8" }; // slate-400

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
