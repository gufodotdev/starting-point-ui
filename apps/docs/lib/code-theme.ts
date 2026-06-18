import type { ThemeRegistration } from "shiki";

const TAG = { light: "#116329", dark: "#38bdf8" };
const ATTR = { light: "#d73a49", dark: "#f472b6" };
const STRING = { light: "#6f42c1", dark: "#34d399" };
const TEXT = { light: "#1e293b", dark: "#e2e8f0" };
const COMMENT = { light: "#64748b", dark: "#94a3b8" };

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
