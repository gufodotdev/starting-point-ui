"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  WandSparkles,
  X,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { fonts } from "@/lib/fonts";
import {
  colors,
  primaryColorNames,
  baseColorNames,
  type ColorScale,
  type ColorName,
} from "@/lib/colors";

type ThemeConfig = {
  primaryColor: string;
  baseColor: string;
  font: string;
  tintedBackground: boolean;
};

type ColorOption = {
  name: string;
  preview: string;
  previewDark: string;
  light: Record<string, string>;
  dark: Record<string, string>;
};

function makePrimaryColor(name: string, color: ColorScale): ColorOption {
  return {
    name,
    preview: color["600"],
    previewDark: color["500"],
    light: {
      "--primary": color["600"],
      "--primary-foreground": "oklch(0.985 0 0)",
    },
    dark: {
      "--primary": color["500"],
      "--primary-foreground": "oklch(0.985 0 0)",
    },
  };
}

function makeBaseColor(name: string, scale: ColorScale): ColorOption {
  return {
    name,
    preview: scale["300"],
    previewDark: scale["700"],
    light: {
      "--radius": "0.625rem",
      "--background": "oklch(1 0 0)",
      "--foreground": scale["950"],
      "--card": "oklch(1 0 0)",
      "--card-foreground": scale["950"],
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": scale["950"],
      "--secondary": scale["100"],
      "--secondary-foreground": scale["900"],
      "--muted": scale["100"],
      "--muted-foreground": scale["500"],
      "--accent": scale["500"],
      "--accent-foreground": "oklch(0.985 0 0)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": scale["200"],
      "--input": scale["200"],
      "--ring": scale["400"],
      "--sidebar": scale["50"],
      "--sidebar-foreground": scale["950"],
      "--sidebar-primary": scale["900"],
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": scale["100"],
      "--sidebar-accent-foreground": scale["900"],
      "--sidebar-border": scale["200"],
      "--sidebar-ring": scale["400"],
    },
    dark: {
      "--background": scale["950"],
      "--foreground": "oklch(0.985 0 0)",
      "--card": scale["900"],
      "--card-foreground": "oklch(0.985 0 0)",
      "--popover": scale["900"],
      "--popover-foreground": "oklch(0.985 0 0)",
      "--secondary": scale["800"],
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": scale["800"],
      "--muted-foreground": scale["400"],
      "--accent": scale["400"],
      "--accent-foreground": scale["900"],
      "--destructive": "oklch(0.704 0.191 22.216)",
      "--border": "oklch(1 0 0 / 10%)",
      "--input": "oklch(1 0 0 / 15%)",
      "--ring": scale["500"],
      "--sidebar": scale["900"],
      "--sidebar-foreground": "oklch(0.985 0 0)",
      "--sidebar-primary": scale["200"],
      "--sidebar-primary-foreground": scale["900"],
      "--sidebar-accent": scale["800"],
      "--sidebar-accent-foreground": "oklch(0.985 0 0)",
      "--sidebar-border": "oklch(1 0 0 / 10%)",
      "--sidebar-ring": scale["500"],
    },
  };
}

const defaultConfig: ThemeConfig = {
  primaryColor: "Default",
  baseColor: "Neutral",
  font: "Inter",
  tintedBackground: false,
};

const primaryColorOptions: ColorOption[] = primaryColorNames.map((name) =>
  makePrimaryColor(name.charAt(0).toUpperCase() + name.slice(1), colors[name]),
);

const baseColorOptions: ColorOption[] = baseColorNames.map((name) =>
  makeBaseColor(name.charAt(0).toUpperCase() + name.slice(1), colors[name]),
);

function loadFont(font: (typeof fonts)[number]) {
  if (font.name === "Inter") return;
  const id = `sp-font-${font.name.toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = font.cdn;
  document.head.appendChild(link);
}

function getDefaultPrimary(baseColor: string): ColorOption {
  const scale = colors[baseColor.toLowerCase() as ColorName];
  return {
    name: "Default",
    preview: scale["900"],
    previewDark: scale["200"],
    light: {
      "--primary": scale["900"],
      "--primary-foreground": "oklch(0.985 0 0)",
    },
    dark: { "--primary": scale["200"], "--primary-foreground": scale["900"] },
  };
}

function resolveThemeVars(config: ThemeConfig) {
  const primary =
    config.primaryColor === "Default"
      ? getDefaultPrimary(config.baseColor)
      : primaryColorOptions.find((c) => c.name === config.primaryColor);
  const base = baseColorOptions.find((c) => c.name === config.baseColor);

  const lightVars = { ...base?.light, ...primary?.light };
  const darkVars = { ...base?.dark, ...primary?.dark };

  if (config.tintedBackground) {
    const scale = colors[config.baseColor.toLowerCase() as ColorName];
    if (scale) {
      lightVars["--background"] = scale["50"];
      lightVars["--card"] = "oklch(1 0 0)";
      darkVars["--background"] = darkVars["--card"];
      darkVars["--card"] = base?.dark["--secondary"] ?? darkVars["--card"];
    }
  }

  return {
    lightVars,
    darkVars,
    font: fonts.find((f) => f.name === config.font),
  };
}

function buildThemeCSS(config: ThemeConfig): string {
  const { lightVars, darkVars, font } = resolveThemeVars(config);

  const toCSS = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `${k}: ${v};`)
      .join(" ");

  let css = `:root { ${toCSS(lightVars)} } .dark { ${toCSS(darkVars)} }`;

  if (font && config.font !== "Inter") {
    css += ` body { font-family: ${font.value}; }`;
  }

  return css;
}

function buildCodeOutput(config: ThemeConfig): string {
  const { lightVars, darkVars, font } = resolveThemeVars(config);

  const indent = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");

  let code = "";

  if (font) {
    code += `@import url("${font.cdn}");\n\n`;
    code += `@theme inline {\n  --font-sans: ${font.value};\n}\n\n`;
  }

  code += `:root {\n${indent(lightVars)}\n}\n\n.dark {\n${indent(darkVars)}\n}`;

  return code;
}

function applyTheme(css: string) {
  let style = document.getElementById("sp-theme") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "sp-theme";
    document.head.appendChild(style);
  }
  style.textContent = css;
  localStorage.setItem("sp-theme", css);
}

function clearTheme() {
  document.getElementById("sp-theme")?.remove();
  localStorage.removeItem("sp-theme");
  localStorage.removeItem("sp-theme-config");
  localStorage.removeItem("sp-theme-font");
  localStorage.removeItem("sp-theme-exp");
}

export function ThemeEditor() {
  const { resolvedTheme, setTheme } = useTheme();
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const isDark = ready && resolvedTheme === "dark";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sp-theme-config");
      if (saved) setConfig(JSON.parse(saved));
    } catch {}
    setReady(true);

    const dialog = document.getElementById("theme-editor");
    if (dialog) {
      const onClose = () => setShowCode(false);
      dialog.addEventListener("close", onClose);
      return () => dialog.removeEventListener("close", onClose);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const font = fonts.find((f) => f.name === config.font);
    if (font) {
      loadFont(font);
      if (font.name !== "Inter") {
        localStorage.setItem("sp-theme-font", font.cdn);
      } else {
        localStorage.removeItem("sp-theme-font");
      }
    }
    applyTheme(buildThemeCSS(config));
    localStorage.setItem("sp-theme-config", JSON.stringify(config));
    localStorage.setItem(
      "sp-theme-exp",
      String(Date.now() + 4 * 60 * 60 * 1000),
    );
  }, [config, ready]);

  useEffect(() => {
    import("shiki").then(({ codeToHtml }) =>
      codeToHtml(buildCodeOutput(config), {
        lang: "css",
        themes: { dark: "github-dark", light: "github-light" },
      }).then(setHighlightedCode),
    );
  }, [config]);

  function update(partial: Partial<ThemeConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildCodeOutput(config));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-icon-sm"
        aria-label="Open theme editor"
        data-sp-toggle="dialog"
        data-sp-target="#theme-editor"
      >
        <WandSparkles />
      </button>
      <dialog
        id="theme-editor"
        className="dialog"
        aria-labelledby="theme-editor-title"
      >
        <div className="sheet-backdrop bg-transparent! backdrop-blur-none!" />
        <div className="sheet-panel w-110 max-w-full! flex flex-col">
          <button
            type="button"
            className={`btn btn-ghost btn-icon-sm absolute top-2 right-2 z-20 ${showCode ? "hidden" : ""}`}
            aria-label="Close"
            data-sp-dismiss="dialog"
          >
            <X />
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-icon-sm absolute top-2 right-2 z-20 ${showCode ? "" : "hidden"}`}
            aria-label="Back"
            onClick={() => setShowCode(false)}
          >
            <ArrowLeft />
          </button>
          <div className="px-6 pt-6 pb-4 border-b">
            <h2
              id="theme-editor-title"
              className="text-lg font-semibold tracking-tight"
            >
              Make it yours
            </h2>
            <p className="mt-2 text-sm/6 text-muted-foreground">
              Tweak the colors, fonts, and style to match your project. Learn
              more in the{" "}
              <a
                href="/docs/guides/theming"
                className="underline underline-offset-4 hover:text-foreground"
              >
                theming guide
              </a>
              .
            </p>
          </div>
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="label">Primary Color</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {config.primaryColor}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="tooltip" data-sp-placement="bottom">
                    <button
                      type="button"
                      className={`relative size-9 rounded-lg border-2 transition-colors ${config.primaryColor === "Default" ? "border-foreground shadow-md" : "border-transparent"}`}
                      style={{
                        backgroundColor: isDark
                          ? getDefaultPrimary(config.baseColor).previewDark
                          : getDefaultPrimary(config.baseColor).preview,
                      }}
                      data-sp-toggle="tooltip"
                      onClick={() => update({ primaryColor: "Default" })}
                    >
                      {config.primaryColor === "Default" && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="size-4 text-white" />
                        </span>
                      )}
                      <span className="sr-only">Default</span>
                    </button>
                    <div className="tooltip-content" role="tooltip">
                      Default
                    </div>
                  </div>
                  {primaryColorOptions.map((color) => (
                    <div
                      key={color.name}
                      className="tooltip"
                      data-sp-placement="bottom"
                    >
                      <button
                        type="button"
                        className={`relative size-9 rounded-lg border-2 transition-colors ${config.primaryColor === color.name ? "border-foreground shadow-md" : "border-transparent"}`}
                        style={{
                          backgroundColor: isDark
                            ? color.previewDark
                            : color.preview,
                        }}
                        data-sp-toggle="tooltip"
                        onClick={() => update({ primaryColor: color.name })}
                      >
                        {config.primaryColor === color.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check className="size-4 text-white" />
                          </span>
                        )}
                        <span className="sr-only">{color.name}</span>
                      </button>
                      <div className="tooltip-content" role="tooltip">
                        {color.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="separator" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="label">Base Color</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {config.baseColor}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {baseColorOptions.map((color) => (
                    <div
                      key={color.name}
                      className="tooltip"
                      data-sp-placement="bottom"
                    >
                      <button
                        type="button"
                        className={`relative size-9 rounded-lg border-2 transition-colors ${config.baseColor === color.name ? "border-foreground shadow-md" : "border-transparent"}`}
                        style={{
                          backgroundColor: isDark
                            ? color.previewDark
                            : color.preview,
                        }}
                        data-sp-toggle="tooltip"
                        onClick={() => update({ baseColor: color.name })}
                      >
                        {config.baseColor === color.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check className="size-4" />
                          </span>
                        )}
                        <span className="sr-only">{color.name}</span>
                      </button>
                      <div className="tooltip-content" role="tooltip">
                        {color.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="separator" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="theme-font">
                    Font Family
                  </label>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {config.font}
                  </span>
                </div>
                <div className="combobox w-full">
                  <button
                    className="combobox-trigger w-full"
                    type="button"
                    id="theme-font"
                    data-sp-toggle="combobox"
                    aria-expanded="false"
                  >
                    <span className="combobox-value">{config.font}</span>
                    <i className="ri-expand-up-down-line text-muted-foreground" />
                  </button>
                  <div className="combobox-menu w-full" role="listbox">
                    <div className="combobox-search">
                      <i className="ri-search-line" />
                      <input
                        className="combobox-input"
                        type="text"
                        placeholder="Search font..."
                      />
                    </div>
                    <div className="combobox-list">
                      {fonts.map((font) => (
                        <div
                          key={font.name}
                          className="combobox-item"
                          role="option"
                          tabIndex={0}
                          aria-selected={config.font === font.name}
                          onClick={() => update({ font: font.name })}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            tabIndex={-1}
                            name="theme-font"
                            value={font.name}
                            checked={config.font === font.name}
                            readOnly
                          />
                          {font.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="separator" />

              <div className="flex items-center justify-between">
                <span className="label">Tinted Background</span>
                <input
                  type="checkbox"
                  className="switch"
                  checked={config.tintedBackground}
                  onChange={(e) =>
                    update({ tintedBackground: e.target.checked })
                  }
                />
              </div>

              <div className="separator" />

              <div className="flex items-center justify-between">
                <span className="label">Dark Mode</span>
                <input
                  type="checkbox"
                  className="switch"
                  checked={isDark}
                  onChange={(e) =>
                    setTheme(e.target.checked ? "dark" : "light")
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 p-6 border-t">
            <button
              type="button"
              className="btn btn-sm flex-1"
              onClick={() => {
                setConfig(defaultConfig);
                clearTheme();
              }}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex-1"
              onClick={() => setShowCode(true)}
            >
              <Copy className="size-3.5" />
              Copy Theme
            </button>
          </div>

          <div
            className={`absolute inset-0 bg-background flex flex-col transition-transform duration-300 ${showCode ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="px-6 pt-6 pb-4 border-b">
              <h3 className="text-lg font-semibold tracking-tight">
                Export Theme
              </h3>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                Copy the CSS variables below.
              </p>
            </div>
            <div className="px-6 py-4 flex-1 overflow-y-auto space-y-6">
              <div
                className="rounded-md border bg-secondary p-4 text-sm/6 overflow-auto max-h-120 [&_pre]:bg-transparent! [&_pre]:m-0! [&_pre]:p-0!"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
              <div className="rounded-md border p-4 space-y-3">
                <h4 className="text-sm font-medium">How to use</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Copy the code above</li>
                  <li>Paste into your main CSS file</li>
                  <li>Include the font in your project</li>
                  <li>Adjust any values as needed</li>
                  <li>
                    For more info see the{" "}
                    <a
                      href="/docs/guides/theming"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      theming guide
                    </a>
                  </li>
                </ol>
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                type="button"
                className="btn btn-primary btn-sm w-full"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
