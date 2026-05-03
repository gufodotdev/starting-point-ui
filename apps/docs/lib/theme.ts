import {
  colors,
  primaryShades,
  accentShades,
  baseColorNames,
  SHADES,
  type ColorScale,
  type ColorName,
  type Shade,
} from "@/lib/colors";
import { fonts } from "@/lib/fonts";

// --- Radius ---

export type RadiusMode = "none" | "base" | "pill";

export const radiusValues: Record<RadiusMode, Record<string, string>> = {
  none: {
    "--btn-radius": "0",
    "--badge-radius": "0",
    "--input-radius": "0",
    "--card-radius": "0",
    "--popover-radius": "0",
  },
  base: {
    "--btn-radius": "0.5rem",
    "--badge-radius": "9999px",
    "--input-radius": "0.5rem",
    "--card-radius": "0.875rem",
    "--popover-radius": "0.5rem",
  },
  pill: {
    "--btn-radius": "9999px",
    "--badge-radius": "9999px",
    "--input-radius": "9999px",
    "--card-radius": "1.25rem",
    "--popover-radius": "1rem",
  },
};

// --- Input style ---

export type InputStyle = "outline" | "fill" | "inset";

export const inputStyleValues: Record<
  InputStyle,
  { light: Record<string, string>; dark: Record<string, string> }
> = {
  outline: {
    light: {},
    dark: {},
  },
  fill: {
    light: {
      "--input": "var(--muted)",
      "--input-border": "var(--muted)",
      "--input-shadow": "none",
    },
    dark: {
      "--input": "var(--muted)",
      "--input-border": "var(--muted)",
      "--input-shadow": "none",
    },
  },
  inset: {
    light: {
      "--input": "var(--muted)",
      "--input-shadow": "none",
    },
    dark: {
      "--input": "var(--muted)",
      "--input-shadow": "none",
    },
  },
};

// --- Elevation ---

export type Elevation = "flat" | "raised";

export const elevationValues: Record<Elevation, Record<string, string>> = {
  flat: {
    "--btn-shadow": "none",
    "--input-shadow": "none",
    "--card-shadow": "none",
  },
  raised: {
    "--btn-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--input-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--card-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
};

// --- Theme config ---

export type ThemeConfig = {
  primaryColor: string;
  baseColor: string;
  accentColor: string;
  radius: RadiusMode;
  inputStyle: InputStyle;
  elevation: Elevation;
  bodyFont: string;
  headingFont: string;
  tintedBackground: boolean;
};

export const defaultConfig: ThemeConfig = {
  primaryColor: "Neutral",
  baseColor: "Neutral",
  accentColor: "Neutral",
  radius: "base",
  inputStyle: "outline",
  elevation: "raised",
  bodyFont: "Inter",
  headingFont: "Inter",
  tintedBackground: false,
};

// --- Color helpers ---

function isLightShade(shade: Shade): boolean {
  return SHADES.indexOf(shade) <= SHADES.indexOf("400");
}

type ColorVars = { light: Record<string, string>; dark: Record<string, string> };

function makePrimaryColor(
  scale: ColorScale,
  lightShade: Shade,
  darkShade: Shade,
): ColorVars {
  return {
    light: {
      "--primary": scale[lightShade],
      "--primary-foreground": isLightShade(lightShade)
        ? scale["950"]
        : scale["50"],
    },
    dark: {
      "--primary": scale[darkShade],
      "--primary-foreground": isLightShade(darkShade)
        ? scale["950"]
        : scale["50"],
    },
  };
}

function makeAccentColor(
  scale: ColorScale,
  lightShade: Shade,
  darkShade: Shade,
): ColorVars {
  return {
    light: {
      "--accent": scale[lightShade],
      "--accent-foreground": isLightShade(lightShade)
        ? scale["950"]
        : scale["50"],
    },
    dark: {
      "--accent": scale[darkShade],
      "--accent-foreground": isLightShade(darkShade)
        ? scale["950"]
        : scale["50"],
    },
  };
}

type BaseColorOption = {
  name: string;
  light: Record<string, string>;
  dark: Record<string, string>;
};

function makeBaseColor(name: string, scale: ColorScale): BaseColorOption {
  return {
    name,
    light: {
      "--radius": "0.625rem",
      "--background": "oklch(1 0 0)",
      "--foreground": scale["950"],
      "--card": "oklch(1 0 0)",
      "--card-foreground": scale["950"],
      "--card-border": scale["200"],
      "--card-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": scale["950"],
      "--popover-border": scale["200"],
      "--popover-shadow":
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "--secondary": scale["100"],
      "--secondary-foreground": scale["900"],
      "--muted": scale["100"],
      "--muted-foreground": scale["500"],
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--destructive-foreground": "oklch(0.985 0 0)",
      "--border": scale["200"],
      "--input": "oklch(1 0 0 / 0%)",
      "--input-foreground": scale["950"],
      "--input-placeholder": scale["500"],
      "--input-border": scale["200"],
      "--input-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--ring": scale["400"],
      "--sidebar": scale["50"],
      "--sidebar-foreground": scale["950"],
      "--sidebar-primary": scale["900"],
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": scale["100"],
      "--sidebar-accent-foreground": scale["900"],
      "--sidebar-border": scale["200"],
      "--sidebar-ring": scale["400"],
      "--btn": "oklch(1 0 0)",
      "--btn-foreground": scale["950"],
      "--btn-border": scale["200"],
      "--btn-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--track": scale["200"],
      "--thumb": "oklch(1 0 0)",
    },
    dark: {
      "--background": scale["950"],
      "--foreground": "oklch(0.985 0 0)",
      "--card": scale["900"],
      "--card-foreground": "oklch(0.985 0 0)",
      "--card-border": "oklch(1 0 0 / 10%)",
      "--card-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--popover": scale["900"],
      "--popover-foreground": "oklch(0.985 0 0)",
      "--popover-border": "oklch(1 0 0 / 10%)",
      "--popover-shadow":
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "--secondary": scale["800"],
      "--secondary-foreground": "oklch(0.985 0 0)",
      "--muted": scale["800"],
      "--muted-foreground": scale["400"],
      "--destructive": "oklch(0.704 0.191 22.216)",
      "--destructive-foreground": "oklch(0.985 0 0)",
      "--border": "oklch(1 0 0 / 10%)",
      "--input": "oklch(1 0 0 / 4.5%)",
      "--input-foreground": "oklch(0.985 0 0)",
      "--input-placeholder": scale["400"],
      "--input-border": "oklch(1 0 0 / 15%)",
      "--input-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--ring": scale["500"],
      "--sidebar": scale["900"],
      "--sidebar-foreground": "oklch(0.985 0 0)",
      "--sidebar-primary": scale["200"],
      "--sidebar-primary-foreground": scale["900"],
      "--sidebar-accent": scale["800"],
      "--sidebar-accent-foreground": "oklch(0.985 0 0)",
      "--sidebar-border": "oklch(1 0 0 / 10%)",
      "--sidebar-ring": scale["500"],
      "--btn": "oklch(1 0 0 / 4.5%)",
      "--btn-foreground": "oklch(0.985 0 0)",
      "--btn-border": "oklch(1 0 0 / 15%)",
      "--btn-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--track": "oklch(1 0 0 / 12%)",
      "--thumb": "oklch(1 0 0)",
    },
  };
}

const baseThemeOptions: BaseColorOption[] = baseColorNames.map((name) =>
  makeBaseColor(name.charAt(0).toUpperCase() + name.slice(1), colors[name]),
);

// --- Resolve & build ---

export function resolveThemeVars(config: ThemeConfig) {
  const primaryScaleName = config.primaryColor.toLowerCase() as ColorName;
  const pShades = primaryShades[primaryScaleName];
  const primary = makePrimaryColor(
    colors[primaryScaleName],
    pShades.light,
    pShades.dark,
  );

  const base = baseThemeOptions.find((c) => c.name === config.baseColor);

  const accentScaleName = config.accentColor.toLowerCase() as ColorName;
  const aShades = accentShades[accentScaleName];
  const accent = makeAccentColor(
    colors[accentScaleName],
    aShades.light,
    aShades.dark,
  );

  const radius = radiusValues[config.radius];
  const input = inputStyleValues[config.inputStyle];
  const elevation = elevationValues[config.elevation];
  const lightVars = {
    ...base?.light,
    ...primary.light,
    ...accent.light,
    ...radius,
    ...input.light,
    ...elevation,
  };
  const darkVars = {
    ...base?.dark,
    ...primary.dark,
    ...accent.dark,
    ...input.dark,
  };

  if (config.tintedBackground) {
    const scale = colors[config.baseColor.toLowerCase() as ColorName];
    if (scale) {
      lightVars["--background"] = scale["50"];
      lightVars["--card"] = "oklch(1 0 0)";
      darkVars["--background"] = scale["950"];
      darkVars["--card"] = scale["900"];
    }
  }

  const bodyFont = fonts.find((f) => f.name === config.bodyFont);
  const headingFont = fonts.find((f) => f.name === config.headingFont);

  if (bodyFont) lightVars["--font-sans"] = bodyFont.value;
  if (headingFont) lightVars["--font-heading"] = headingFont.value;

  return { lightVars, darkVars, bodyFont, headingFont };
}

export function buildThemeCSS(config: ThemeConfig): string {
  const { lightVars, darkVars } = resolveThemeVars(config);

  const toCSS = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `${k}: ${v};`)
      .join(" ");

  return `:root { ${toCSS(lightVars)} } .dark { ${toCSS(darkVars)} }`;
}

export function buildCodeOutput(config: ThemeConfig): string {
  const { lightVars, darkVars, bodyFont, headingFont } =
    resolveThemeVars(config);

  const indent = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");

  const cdns = new Set<string>();
  if (bodyFont) cdns.add(bodyFont.cdn);
  if (headingFont) cdns.add(headingFont.cdn);

  let code = "";
  for (const cdn of cdns) {
    code += `@import url("${cdn}");\n`;
  }
  if (cdns.size > 0) code += "\n";

  code += `:root {\n${indent(lightVars)}\n}\n\n`;
  code += `.dark {\n${indent(darkVars)}\n}`;

  return code;
}
