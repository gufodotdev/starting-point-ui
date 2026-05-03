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
  primaryShades,
  accentShades,
  primaryColorNames,
  baseColorNames,
  type ColorName,
  type Shade,
} from "@/lib/colors";
import { Picker } from "@/components/picker";
import {
  type ThemeConfig,
  type RadiusMode,
  type InputStyle,
  type Elevation,
  defaultConfig,
  buildThemeCSS,
  buildCodeOutput,
} from "@/lib/theme";

const fontOptions = fonts.map((f) => ({
  value: f.name,
  label: f.name,
}));

function dot(color: string) {
  return (
    <span
      className="block size-4 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

function loadFont(font: (typeof fonts)[number]) {
  const id = `sp-font-${font.name.toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = font.cdn;
  document.head.appendChild(link);
}

function applyTheme(css: string) {
  let style = document.getElementById("sp-theme") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "sp-theme";
    document.head.appendChild(style);
  }
  style.textContent = css;
}

function clearTheme() {
  document.getElementById("sp-theme")?.remove();
}

export function ThemeEditor({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const isDark = ready && resolvedTheme === "dark";

  const baseColorName = config.baseColor.toLowerCase() as ColorName;

  const buildColorOptions = (
    shades: Record<ColorName, { light: Shade; dark: Shade }>,
    includeBase: boolean,
  ) => {
    const items = includeBase
      ? [
          { name: config.baseColor, scaleName: baseColorName },
          ...primaryColorNames.map((n) => ({
            name: n.charAt(0).toUpperCase() + n.slice(1),
            scaleName: n as ColorName,
          })),
        ]
      : baseColorNames.map((n) => ({
          name: n.charAt(0).toUpperCase() + n.slice(1),
          scaleName: n as ColorName,
        }));

    return items.map((item) => {
      const scale = colors[item.scaleName];
      const shade = isDark ? shades[item.scaleName].dark : shades[item.scaleName].light;
      return {
        value: item.name,
        label: item.name,
        preview: dot(scale[shade]),
      };
    });
  };

  const baseColorOptions = buildColorOptions(
    Object.fromEntries(
      baseColorNames.map((n) => [n, { light: "400" as Shade, dark: "600" as Shade }]),
    ) as Record<ColorName, { light: Shade; dark: Shade }>,
    false,
  );
  const primaryPickerOptions = buildColorOptions(primaryShades, true);
  const accentPickerOptions = buildColorOptions(accentShades, true);

  useEffect(() => {
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
    if (config === defaultConfig) return;

    const bodyFont = fonts.find((f) => f.name === config.bodyFont);
    const headingFont = fonts.find((f) => f.name === config.headingFont);
    if (bodyFont) loadFont(bodyFont);
    if (headingFont) loadFont(headingFont);

    applyTheme(buildThemeCSS(config));
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
        className={`btn btn-ghost btn-icon-sm${className ? ` ${className}` : ""}`}
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
        <div className="sheet-panel w-110 max-w-full! flex flex-col overflow-y-auto px-6">
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
          <div className="pt-6 pb-6">
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
          <hr className="separator" />
          <div className="py-6 flex-1">
            <div className="space-y-6">
              <div className="space-y-3">
                <Picker
                  id="theme-base"
                  label="Base Color"
                  value={config.baseColor}
                  preview={baseColorOptions.find((o) => o.value === config.baseColor)?.preview}
                  options={baseColorOptions}
                  onSelect={(c) => {
                    const updates: Partial<ThemeConfig> = { baseColor: c };
                    if (config.primaryColor === config.baseColor) updates.primaryColor = c;
                    if (config.accentColor === config.baseColor) updates.accentColor = c;
                    update(updates);
                  }}
                />

                <Picker
                  id="theme-primary"
                  label="Primary Color"
                  value={config.primaryColor}
                  preview={primaryPickerOptions.find((o) => o.value === config.primaryColor)?.preview}
                  options={primaryPickerOptions}
                  onSelect={(c) => update({ primaryColor: c })}
                />

                <Picker
                  id="theme-accent"
                  label="Accent Color"
                  value={config.accentColor}
                  preview={accentPickerOptions.find((o) => o.value === config.accentColor)?.preview}
                  options={accentPickerOptions}
                  onSelect={(c) => update({ accentColor: c })}
                />
              </div>

              <div className="separator" />

              <div className="space-y-3">
                <Picker
                  id="theme-heading-font"
                  label="Heading Font"
                  value={config.headingFont}
                  preview={<span className="text-base text-foreground select-none">Aa</span>}
                  options={fontOptions}
                  onSelect={(v) => update({ headingFont: v })}
                  search
                  searchPlaceholder="Search font..."
                />

                <Picker
                  id="theme-body-font"
                  label="Body Font"
                  value={config.bodyFont}
                  preview={<span className="text-base text-foreground select-none">Aa</span>}
                  options={fontOptions}
                  onSelect={(v) => update({ bodyFont: v })}
                  search
                  searchPlaceholder="Search font..."
                />
              </div>

              <div className="separator" />

              <div className="space-y-3">
                <Picker
                  id="theme-radius"
                  label="Radius"
                  value={config.radius}
                  preview={
                    <svg
                      className="size-4 rotate-90 text-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {config.radius === "none" && <path d="M4 20V4h16" />}
                      {config.radius === "base" && (
                        <path d="M4 20v-5C4 8.925 8.925 4 15 4h5" />
                      )}
                      {config.radius === "pill" && (
                        <path d="M4 20v-1C4 10.611 10.611 4 20 4h0" />
                      )}
                    </svg>
                  }
                  options={["none", "base", "pill"].map((m) => ({
                    value: m,
                    label: m.charAt(0).toUpperCase() + m.slice(1),
                  }))}
                  onSelect={(v) => update({ radius: v as RadiusMode })}
                />

                <Picker
                  id="theme-input-style"
                  label="Input Style"
                  value={config.inputStyle}
                  preview={
                    <span
                      className={`size-4 rounded-full ${
                        config.inputStyle === "outline"
                          ? "border border-muted-foreground"
                          : config.inputStyle === "fill"
                            ? "bg-muted"
                            : "bg-muted border border-muted-foreground"
                      }`}
                    />
                  }
                  options={["outline", "fill", "inset"].map((s) => ({
                    value: s,
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                  }))}
                  onSelect={(v) => update({ inputStyle: v as InputStyle })}
                />

                <Picker
                  id="theme-elevation"
                  label="Elevation"
                  value={config.elevation}
                  preview={
                    <svg
                      className="size-4 text-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {config.elevation === "flat" && (
                        <path d="M4 16h16" />
                      )}
                      {config.elevation === "raised" && (
                        <path d="M4 16c4-8 12-8 16 0" />
                      )}
                    </svg>
                  }
                  options={["flat", "raised"].map((e) => ({
                    value: e,
                    label: e.charAt(0).toUpperCase() + e.slice(1),
                  }))}
                  onSelect={(v) => update({ elevation: v as Elevation })}
                />
              </div>

              <div className="separator" />

              <div className="space-y-3">
                <label className="relative flex w-full items-center rounded-lg px-3 py-2 ring-1 ring-foreground/10 hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Background
                    </span>
                    <span className="text-sm font-medium">
                      {config.tintedBackground ? "Tinted" : "Default"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="switch absolute top-1/2 right-3 -translate-y-1/2"
                    checked={config.tintedBackground}
                    onChange={(e) =>
                      update({ tintedBackground: e.target.checked })
                    }
                  />
                </label>

                <label className="relative flex w-full items-center rounded-lg px-3 py-2 ring-1 ring-foreground/10 hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Appearance
                    </span>
                    <span className="text-sm font-medium">
                      {isDark ? "Dark" : "Light"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="switch absolute top-1/2 right-3 -translate-y-1/2"
                    checked={isDark}
                    onChange={(e) =>
                      setTheme(e.target.checked ? "dark" : "light")
                    }
                  />
                </label>
              </div>
            </div>
          </div>
          <hr className="separator" />
          <div className="flex gap-2 py-6">
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
                className="rounded-md border bg-card p-4 text-sm/6 overflow-auto max-h-120 [&_pre]:bg-transparent! [&_pre]:m-0! [&_pre]:p-0!"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
              <div className="rounded-md border bg-card p-4 space-y-3">
                <h4 className="text-sm font-medium">How to use</h4>
                <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
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
