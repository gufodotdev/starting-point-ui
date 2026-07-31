"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  Blend,
  Check,
  Copy,
  Crop as CropIcon,
  Download,
  Image,
  Link2,
  MoveHorizontal,
  MoveVertical,
  Repeat,
  RotateCcw,
  SlidersHorizontal,
  WandSparkles,
  X,
} from "lucide-react";
import filterPresets from "@/lib/unsplash-filters.json";
import { CropStage } from "@/components/unsplash-crop-stage";
import type { Crop, ImageMeta, OutputOptions } from "@/lib/unsplash-crop";
import {
  UnsplashUrlError,
  buildUrl,
  displayUrl,
  loadImageMeta,
  reshapeCrop,
  resolveUnsplashUrl,
  roundedCrop,
} from "@/lib/unsplash-crop";

const ASPECTS = [
  { key: "free", label: "Free", value: null as number | null },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "3:2", label: "3:2", value: 3 / 2 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "21:9", label: "21:9", value: 21 / 9 },
  { key: "4:5", label: "4:5", value: 4 / 5 },
  { key: "9:16", label: "9:16", value: 9 / 16 },
];

const activeChipClass =
  "border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-500 dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/15 dark:hover:text-orange-400";

const EFFECT_DEFAULTS = {
  exposure: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  saturation: 0,
  vibrance: 0,
  hue: 0,
  sepia: 0,
  sharpen: 0,
  blur: 0,
};

type Effects = typeof EFFECT_DEFAULTS;

const FILTERS: { key: string; label: string; values: Partial<Effects> }[] =
  filterPresets;

const BG_SWATCHES: { key: string; label: string; color: string | null }[] = [
  { key: "transparent", label: "Transparent", color: null },
  { key: "white", label: "White", color: "ffffff" },
  { key: "neutral", label: "Neutral", color: "e5e5e5" },
];

const SIZES = [
  { key: "original", label: "Raw", width: null as number | null },
  { key: "xlarge", label: "XL", width: 2560 },
  { key: "large", label: "LG", width: 1920 },
  { key: "medium", label: "MD", width: 640 },
  { key: "small", label: "SM", width: 256 },
  { key: "xsmall", label: "XS", width: 128 },
];

const TOOLS = [
  { key: "crop", label: "Crop", Icon: CropIcon },
  { key: "adjust", label: "Adjust", Icon: SlidersHorizontal },
  { key: "filters", label: "Filters", Icon: Blend },
  { key: "effects", label: "Effects", Icon: WandSparkles },
  { key: "background", label: "Background", Icon: Image },
  { key: "export", label: "Export", Icon: Download },
] as const;

type Panel = (typeof TOOLS)[number]["key"];

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);
const percent = (value: number) => `${value}%`;
const degrees = (value: number) => `${value}°`;

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

type SliderConfig = {
  field: keyof Effects;
  label: string;
  min: number;
  max: number;
  format?: (value: number) => string;
};

const ADJUST_SLIDERS: SliderConfig[] = [
  { field: "exposure", label: "Exposure", min: -50, max: 50, format: signed },
  { field: "brightness", label: "Brightness", min: -50, max: 50, format: signed },
  { field: "contrast", label: "Contrast", min: -100, max: 100, format: signed },
  { field: "highlights", label: "Highlights", min: -100, max: 100, format: signed },
  { field: "shadows", label: "Shadows", min: -100, max: 100, format: signed },
  { field: "saturation", label: "Saturation", min: -100, max: 100, format: signed },
  { field: "vibrance", label: "Vibrance", min: -100, max: 100, format: signed },
  { field: "sharpen", label: "Sharpness", min: 0, max: 100 },
];

const EFFECT_SLIDERS: SliderConfig[] = [
  { field: "sepia", label: "Sepia", min: 0, max: 100 },
  { field: "hue", label: "Hue", min: 0, max: 359, format: degrees },
  { field: "blur", label: "Blur", min: 0, max: 200 },
];

const orangeCard =
  "rounded-md border border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10";
const orangeLabel = "text-xs font-medium text-orange-800 dark:text-orange-300";
const orangeValue = "font-mono text-[11.5px] text-orange-700 dark:text-orange-400";
const ratioInputClass =
  "input h-6 w-14 rounded-[min(var(--radius-md),8px)] border-orange-200 bg-white px-1 text-center font-mono text-[11.5px] dark:border-orange-500/30 dark:bg-white/10";

const railButtonClass = (active: boolean) =>
  `flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors [&>svg]:size-4 ${
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium">{label}</p>
      <input
        type="checkbox"
        role="switch"
        className="switch"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label text-xs">{label}</span>
        <span
          className={`font-mono text-[11.5px] ${
            value === 0 ? "text-muted-foreground" : "text-foreground/80"
          }`}
        >
          {format ? format(value) : step < 1 ? value.toFixed(1) : value}
        </span>
      </div>
      <input
        type="range"
        className="slider mt-2"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--val": `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}

export function UnsplashEditor() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loadedBaseRef = useRef<string | null>(null);
  const [panel, setPanel] = useState<Panel>("crop");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, w: 100, h: 100 });
  const [aspect, setAspect] = useState<number | null>(null);
  const [freeAspect, setFreeAspect] = useState(true);
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");
  const [rotation, setRotation] = useState(0);
  const [outWidth, setOutWidth] = useState<number | null>(null);
  const [quality, setQuality] = useState(100);
  const [effects, setEffects] = useState<Effects>({ ...EFFECT_DEFAULTS });
  const [activeFilter, setActiveFilter] = useState("original");
  const [intensity, setIntensity] = useState(100);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [faceMode, setFaceMode] = useState(false);
  const [facePad, setFacePad] = useState(2.5);
  const [bgRemove, setBgRemove] = useState(false);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const bgPickerRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [estBytes, setEstBytes] = useState<number | null>(null);

  // orient rotates the source before rect, so all crop math runs in the
  // rotated coordinate space.
  const workMeta: ImageMeta | null = meta
    ? rotation % 180 === 90
      ? { base: meta.base, width: meta.height, height: meta.width }
      : meta
    : null;

  const resetEdits = useCallback((target: ImageMeta) => {
    setCrop({ x: 0, y: 0, w: target.width, h: target.height });
    setAspect(null);
    setFreeAspect(true);
    setCustomW("");
    setCustomH("");
    setRotation(0);
    setOutWidth(null);
    setQuality(100);
    setEffects({ ...EFFECT_DEFAULTS });
    setActiveFilter("original");
    setIntensity(100);
    setFlipH(false);
    setFlipV(false);
    setFaceMode(false);
    setFacePad(2.5);
    setBgRemove(false);
    setBgColor(null);
    setBgPreview(null);
  }, []);

  const load = useCallback(
    async (raw: string) => {
      setError("");
      setLoading(true);
      try {
        const base = await resolveUnsplashUrl(raw);
        const loaded = await loadImageMeta(base);
        const sameImage = loadedBaseRef.current === base;
        loadedBaseRef.current = base;
        setMeta(loaded);
        if (!sameImage) {
          resetEdits(loaded);
          setPanel("crop");
        }
        setInput(base);
        return true;
      } catch (e) {
        setMeta(null);
        setError(
          e instanceof UnsplashUrlError
            ? e.message
            : "Could not load that image. Check the URL and try again.",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [resetEdits],
  );

  const openEditor = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.classList.add("show");
    dialog.showModal();
  };

  const closeEditor = () => {
    dialogRef.current?.classList.remove("show");
    dialogRef.current?.close();
  };

  const loadAndOpen = async () => {
    if (await load(input)) openEditor();
  };

  const changeAspect = (next: number | null) => {
    setAspect(next);
    if (workMeta && next) setCrop((c) => reshapeCrop(c, workMeta, next));
  };

  const applyCustomAspect = (w: string, h: string) => {
    const rw = parseFloat(w);
    const rh = parseFloat(h);
    changeAspect(rw > 0 && rh > 0 ? rw / rh : null);
  };

  // While the free crop is unconstrained, mirror its current ratio into the
  // inputs; pause while the user is typing so their edit is not overwritten.
  const ratioEditing = useRef(false);
  useEffect(() => {
    if (!freeAspect || aspect !== null || ratioEditing.current) return;
    if (crop.w <= 0 || crop.h <= 0) return;
    const fmt = (n: number) => String(Math.round(n * 100) / 100);
    if (crop.w >= crop.h) {
      setCustomW(fmt(crop.w / crop.h));
      setCustomH("1");
    } else {
      setCustomW("1");
      setCustomH(fmt(crop.h / crop.w));
    }
  }, [crop, freeAspect, aspect]);

  const rotate = (delta: number) => {
    if (!meta) return;
    const next = (rotation + delta + 360) % 360;
    setRotation(next);
    const rotated = next % 180 === 90;
    const w = rotated ? meta.height : meta.width;
    const h = rotated ? meta.width : meta.height;
    const full = { x: 0, y: 0, w, h };
    setCrop(
      aspect ? reshapeCrop(full, { base: meta.base, width: w, height: h }, aspect) : full,
    );
  };

  const sizeKey =
    outWidth === null
      ? "original"
      : (SIZES.find((size) => size.width === outWidth)?.key ?? "custom");

  const applyFilter = (key: string, strength: number) => {
    const filter = FILTERS.find((entry) => entry.key === key);
    if (!filter) return;
    const scaled = Object.fromEntries(
      Object.entries(filter.values).map(([field, value]) => [
        field,
        Math.round((value as number) * (strength / 100)),
      ]),
    );
    setEffects({ ...EFFECT_DEFAULTS, ...scaled });
    setActiveFilter(key);
  };

  const setEffect = (field: keyof Effects) => (value: number) => {
    setEffects((current) => ({ ...current, [field]: value }));
    setActiveFilter("custom");
  };

  const resetAdjustments = () => {
    setEffects((current) => ({
      ...EFFECT_DEFAULTS,
      sepia: current.sepia,
      hue: current.hue,
      blur: current.blur,
    }));
    setActiveFilter("custom");
  };

  const resetAll = () => {
    if (meta) resetEdits(meta);
  };

  const rect = workMeta ? roundedCrop(crop, workMeta) : null;
  const options: OutputOptions = {
    width: outWidth,
    quality,
    orient: rotation || undefined,
    ...effects,
    flipH,
    flipV,
    faceMode,
    facePad,
    bgRemove,
    bgColor: bgColor ?? undefined,
  };
  const url = workMeta ? buildUrl(workMeta, crop, options) : "";

  const faceSrc = useDebounced(faceMode && meta ? url : "", 300);

  const stageSrcRaw = meta
    ? displayUrl(meta.base, {
        orient: rotation || undefined,
        ...effects,
        flipH,
        flipV,
        bgRemove,
        bgColor: bgColor ?? undefined,
      })
    : "";
  const stageSrcDebounced = useDebounced(stageSrcRaw, 300);
  // The debounce is only for effect changes; a debounced value from a
  // previous image would flash the old photo, so fall back immediately.
  const stageSrc =
    meta && stageSrcDebounced.startsWith(meta.base) ? stageSrcDebounced : stageSrcRaw;

  // Filter thumbnails re-render the current crop with each recipe; debounce
  // the rect so dragging the box does not fire a dozen requests per frame.
  const thumbRect = useDebounced(
    workMeta && rect ? `${rect.x},${rect.y},${rect.w},${rect.h}` : "",
    400,
  );
  const filterThumb = (values: Partial<Effects>) => {
    if (!workMeta || !thumbRect) return "";
    const [x, y, w, h] = thumbRect.split(",").map(Number);
    return buildUrl(workMeta, { x, y, w, h }, {
      width: 96,
      quality: 60,
      orient: rotation || undefined,
      ...values,
      flipH,
      flipV,
    });
  };

  // Estimate the served file size while the export tab is open.
  const exportUrl = useDebounced(panel === "export" && url ? url : "", 500);
  useEffect(() => {
    if (!exportUrl) {
      setEstBytes(null);
      return;
    }
    let cancelled = false;
    fetch(exportUrl, { method: "HEAD" })
      .then((res) => {
        const length = Number(res.headers.get("content-length"));
        if (!cancelled) setEstBytes(length || null);
      })
      .catch(() => {
        if (!cancelled) setEstBytes(null);
      });
    return () => {
      cancelled = true;
    };
  }, [exportUrl]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = async () => {
    if (!meta || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${meta.base.split("/").pop()}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setDownloading(false);
    }
  };

  const edits =
    (aspect !== null ? 1 : 0) +
    (rotation !== 0 ? 1 : 0) +
    (flipH ? 1 : 0) +
    (flipV ? 1 : 0) +
    (faceMode ? 1 : 0) +
    (outWidth !== null ? 1 : 0) +
    (quality !== 100 ? 1 : 0) +
    (workMeta && rect && (rect.w !== workMeta.width || rect.h !== workMeta.height) ? 1 : 0) +
    (bgRemove ? 1 : 0) +
    (Object.keys(EFFECT_DEFAULTS) as (keyof Effects)[]).filter(
      (field) => effects[field] !== 0,
    ).length;

  const outDims = rect
    ? outWidth
      ? `${outWidth} × ${Math.round(outWidth * (rect.h / rect.w))}`
      : `${rect.w} × ${rect.h}`
    : "";

  const statusChips = [
    faceMode ? "Face" : null,
    bgRemove ? "Cutout" : null,
    freeAspect
      ? customW && customH && aspect
        ? `${customW}:${customH}`
        : "Free"
      : (ASPECTS.find((a) => a.value === aspect)?.label ?? "Free"),
    activeFilter !== "original" && activeFilter !== "custom"
      ? FILTERS.find((f) => f.key === activeFilter)?.label
      : null,
  ].filter(Boolean);

  const cropPanel = (
    <>
      <PanelHeader title="Crop" subtitle="Set the frame, aspect ratio, and orientation." />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium">Aspect ratio</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ASPECTS.map((a) => {
            const active = a.value === null ? freeAspect : !freeAspect && a.value === aspect;
            return (
              <button
                key={a.key}
                type="button"
                className={`btn btn-sm btn-outline w-full font-mono text-[11.5px] ${
                  active ? activeChipClass : ""
                }`}
                onClick={() => {
                  if (a.value === null) {
                    setFreeAspect(true);
                    changeAspect(null);
                  } else {
                    setFreeAspect(false);
                    changeAspect(a.value);
                  }
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        {freeAspect && (
          <div className={`flex h-9 items-center gap-1.5 px-3 ${orangeCard}`}>
            <span className={`flex-1 ${orangeLabel}`}>Ratio</span>
            <input
              className={ratioInputClass}
              inputMode="decimal"
              value={customW}
              aria-label="Ratio width"
              onFocus={() => (ratioEditing.current = true)}
              onBlur={() => (ratioEditing.current = false)}
              onChange={(e) => {
                setCustomW(e.target.value);
                applyCustomAspect(e.target.value, customH);
              }}
            />
            <span className={orangeValue}>:</span>
            <input
              className={ratioInputClass}
              inputMode="decimal"
              value={customH}
              aria-label="Ratio height"
              onFocus={() => (ratioEditing.current = true)}
              onBlur={() => (ratioEditing.current = false)}
              onChange={(e) => {
                setCustomH(e.target.value);
                applyCustomAspect(customW, e.target.value);
              }}
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-icon ml-0.5 -mr-1.5 shrink-0 text-orange-700 hover:bg-orange-100 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-500/15 dark:hover:text-orange-400"
              aria-label="Swap ratio"
              title="Swap ratio"
              onClick={() => {
                setCustomW(customH);
                setCustomH(customW);
                applyCustomAspect(customH, customW);
              }}
            >
              <Repeat />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t pt-4">
        <SwitchRow label="Face crop" checked={faceMode} onChange={setFaceMode} />
        <p className="text-xs text-muted-foreground">
          Centers the crop on the detected face.
        </p>
        {faceMode && (
          <div className={`p-3 ${orangeCard}`}>
            <div className="flex items-center justify-between">
              <span className={orangeLabel}>Facepad</span>
              <span className={orangeValue}>{facePad.toFixed(1)}</span>
            </div>
            <input
              type="range"
              className="slider mt-2"
              min={1}
              max={5}
              step={0.1}
              value={6 - facePad}
              style={{ "--val": `${((6 - facePad - 1) / 4) * 100}%` } as React.CSSProperties}
              onChange={(e) => setFacePad(6 - Number(e.target.value))}
              aria-label="Face framing"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-orange-700 dark:text-orange-400">
              <span>Shoulders</span>
              <span>Close-up</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t pt-4">
        <p className="text-xs font-medium">Transform</p>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            className="btn btn-outline btn-sm btn-icon w-full"
            aria-label="Rotate left"
            title="Rotate left"
            onClick={() => rotate(-90)}
          >
            <RotateCcw />
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm btn-icon w-full"
            aria-label="Rotate right"
            title="Rotate right"
            onClick={() => rotate(90)}
          >
            <RotateCcw className="-scale-x-100" />
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-icon w-full ${flipH ? "btn-secondary" : "btn-outline"}`}
            aria-label="Flip horizontal"
            title="Flip horizontal"
            onClick={() => setFlipH((v) => !v)}
          >
            <MoveHorizontal />
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-icon w-full ${flipV ? "btn-secondary" : "btn-outline"}`}
            aria-label="Flip vertical"
            title="Flip vertical"
            onClick={() => setFlipV((v) => !v)}
          >
            <MoveVertical />
          </button>
        </div>
      </div>
    </>
  );

  const adjustPanel = (
    <>
      <PanelHeader title="Adjust" subtitle="Fine-tune light and color." />
      {ADJUST_SLIDERS.map(({ field, label, min, max, format }) => (
        <SliderRow
          key={field}
          label={label}
          value={effects[field]}
          min={min}
          max={max}
          format={format}
          onChange={setEffect(field)}
        />
      ))}
      <button type="button" className="btn btn-outline btn-sm w-full" onClick={resetAdjustments}>
        Reset adjustments
      </button>
    </>
  );

  const filtersPanel = (
    <>
      <PanelHeader title="Filters" subtitle="Pick a look, then dial the intensity." />
      <div className="grid grid-cols-3 gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          const thumb = filterThumb(filter.values);
          return (
            <button
              key={filter.key}
              type="button"
              className="flex cursor-pointer flex-col items-center gap-1"
              onClick={() => applyFilter(filter.key, intensity)}
            >
              <span
                className={`w-full overflow-hidden rounded-md border ${
                  active ? "border-primary ring-2 ring-primary" : ""
                }`}
              >
                {thumb ? (
                  <img
                    className="aspect-square w-full object-cover"
                    src={thumb}
                    alt={`${filter.label} filter preview`}
                    loading="lazy"
                  />
                ) : (
                  <span className="block aspect-square w-full bg-muted" />
                )}
              </span>
              <span
                className={`rounded-sm px-1.5 py-0.5 text-[10.5px] ${
                  active
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {filter.label}
              </span>
            </button>
          );
        })}
      </div>
      {activeFilter !== "original" && activeFilter !== "custom" && (
        <SliderRow
          label="Intensity"
          value={intensity}
          min={10}
          max={100}
          format={percent}
          onChange={(value) => {
            setIntensity(value);
            applyFilter(activeFilter, value);
          }}
        />
      )}
    </>
  );

  const effectsPanel = (
    <>
      <PanelHeader title="Effects" subtitle="Optional finishing touches." />
      {EFFECT_SLIDERS.map(({ field, label, min, max, format }) => (
        <SliderRow
          key={field}
          label={label}
          value={effects[field]}
          min={min}
          max={max}
          format={format}
          onChange={setEffect(field)}
        />
      ))}
    </>
  );

  // The picker's input events fire on every tick of a drag; committing each
  // one would fire a paid bg-remove render per tick at the CDN. Apply the
  // color only on the native change event (picker closed / value settled).
  useEffect(() => {
    const el = bgPickerRef.current;
    if (!el) return;
    const commit = () => {
      setBgColor(el.value.slice(1).toLowerCase());
      setBgPreview(null);
    };
    el.addEventListener("change", commit);
    return () => el.removeEventListener("change", commit);
  }, [panel, bgRemove]);

  const shownBg = bgPreview ?? bgColor;
  const customBgActive = !!shownBg && !BG_SWATCHES.some((swatch) => swatch.color === shownBg);

  const backgroundPanel = (
    <>
      <PanelHeader
        title="Background"
        subtitle="Cut out the subject and swap what sits behind it."
      />
      <div className="flex flex-col gap-2">
        <SwitchRow label="Remove background" checked={bgRemove} onChange={setBgRemove} />
        <p className="text-xs text-muted-foreground">
          Cuts out the subject automatically. The first render can take a few
          seconds.
        </p>
      </div>
      {bgRemove && (
        <div className="flex flex-col gap-2 border-t pt-4">
          <p className="text-xs font-medium">Replace with</p>
          <div className="grid grid-cols-4 gap-2">
            {BG_SWATCHES.map((swatch) => (
              <button
                key={swatch.key}
                type="button"
                title={swatch.label}
                aria-label={`Background: ${swatch.label}`}
                className={`aspect-square w-full cursor-pointer rounded-md border ${
                  bgColor === swatch.color ? "ring-2 ring-primary" : ""
                } ${
                  swatch.color === null
                    ? "[background:repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)_0_0/10px_10px]"
                    : ""
                }`}
                style={swatch.color ? { backgroundColor: `#${swatch.color}` } : undefined}
                onClick={() => {
                  setBgColor(swatch.color);
                  setBgPreview(null);
                }}
              />
            ))}
            <label
              className={`relative aspect-square w-full cursor-pointer rounded-md border ${
                customBgActive ? "ring-2 ring-primary" : ""
              }`}
              style={
                customBgActive
                  ? { backgroundColor: `#${shownBg}` }
                  : {
                      background:
                        "conic-gradient(#f43f5e, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #f43f5e)",
                    }
              }
              title="Custom color"
            >
              <input
                ref={bgPickerRef}
                type="color"
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                value={`#${/^[0-9a-f]{6}$/i.test(shownBg ?? "") ? shownBg : "ffffff"}`}
                aria-label="Pick a custom background color"
                onChange={(e) => setBgPreview(e.target.value.slice(1).toLowerCase())}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            {BG_SWATCHES.find((swatch) => swatch.color === bgColor)?.label ??
              (bgColor ? `#${bgColor}` : null)}
          </p>
        </div>
      )}
    </>
  );

  const exportPanel = (
    <>
      <PanelHeader title="Export" subtitle="Output size and quality of the image." />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium">Size</p>
        <div className="tab-list h-8 w-full [&>.tab]:flex-1 [&>.tab]:text-xs">
          {SIZES.map((size) => (
            <button
              key={size.key}
              type="button"
              className={`tab ${sizeKey === size.key ? "active" : ""}`}
              onClick={() => setOutWidth(size.width)}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
      <SliderRow
        label="Quality"
        value={quality}
        min={10}
        max={100}
        format={percent}
        onChange={setQuality}
      />
      <div className="divide-y rounded-lg border text-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-muted-foreground">Dimensions</span>
          <span className="font-mono text-xs text-foreground/80">{outDims}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-muted-foreground">Est. size</span>
          <span className="font-mono text-xs text-foreground/80">
            {estBytes ? formatBytes(estBytes) : "..."}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <button type="button" className="btn btn-sm w-full" onClick={copy}>
          {copied ? (
            <>
              <Check className="text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy />
              Copy URL
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm w-full"
          disabled={downloading}
          onClick={download}
        >
          <Download />
          {downloading ? "Preparing..." : "Download"}
        </button>
      </div>
    </>
  );

  const panels: Record<Panel, React.ReactNode> = {
    crop: cropPanel,
    adjust: adjustPanel,
    filters: filtersPanel,
    effects: effectsPanel,
    background: backgroundPanel,
    export: exportPanel,
  };

  return (
    <div className="mt-6">
      <div className="input-group h-12 rounded-full border-transparent bg-muted shadow-none transition-colors has-[input:focus]:bg-background dark:bg-muted dark:has-[input:focus]:bg-input/30">
        <div className="input-group-addon pl-4">
          <Link2 />
        </div>
        <input
          className="input"
          type="text"
          spellCheck={false}
          placeholder="Paste an Unsplash image URL"
          aria-label="Unsplash image URL"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (!text.trim()) return;
            e.preventDefault();
            setInput(text);
            load(text).then((ok) => {
              if (ok) openEditor();
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadAndOpen();
          }}
        />
        <div className="input-group-addon input-group-addon-end gap-1 pr-3">
          {loading ? (
            <span className="text-xs">Loading...</span>
          ) : (
            <>
              {input && (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    aria-label="Clear"
                    onClick={() => setInput("")}
                  >
                    <X />
                  </button>
                  <span className="mx-1 h-4 w-px bg-border" />
                </>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label="Open editor"
                title="Open editor"
                onClick={() => {
                  if (meta && input.trim() === meta.base) openEditor();
                  else loadAndOpen();
                }}
              >
                <CropIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <dialog
        ref={dialogRef}
        className="dialog"
        aria-label="Edit image"
        onClose={() => dialogRef.current?.classList.remove("show")}
      >
        <div className="dialog-panel sp-photo-editor w-full max-w-[1320px] gap-0 overflow-hidden p-0">
          {meta && workMeta && (
            <div className="flex h-[900px] max-h-[94svh] flex-col">
              <header className="flex h-14 shrink-0 items-center justify-between border-b pr-3 pl-5">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Edit image</h2>
                  <span className="font-mono text-xs text-muted-foreground">
                    {meta.base.split("/").pop()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-icon text-muted-foreground"
                  aria-label="Close"
                  onClick={closeEditor}
                >
                  <X />
                </button>
              </header>

              <div className="flex min-h-0 flex-1 items-stretch">
                <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-muted/50 py-3">
                  {TOOLS.map((tool) => (
                    <Fragment key={tool.key}>
                      {tool.key === "export" && <div className="my-1.5 h-px w-6 bg-border" />}
                      <button
                        type="button"
                        title={tool.label}
                        className={railButtonClass(panel === tool.key)}
                        onClick={() => setPanel(tool.key)}
                      >
                        <tool.Icon />
                        <span className="sr-only">{tool.label}</span>
                      </button>
                    </Fragment>
                  ))}
                </aside>

                <aside className="sidebar-static h-auto w-[268px] shrink-0 border-r bg-background">
                  <div className="scrollbar-thin flex flex-1 flex-col gap-5 overflow-y-auto p-4">
                    {panels[panel]}
                  </div>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col">
                  <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6 [background:repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)_0_0/16px_16px]">
                    {faceMode ? (
                      faceSrc && (
                        <img
                          className="max-h-full max-w-full rounded-md shadow-sm"
                          src={faceSrc}
                          alt="Face crop result"
                        />
                      )
                    ) : (
                      <CropStage
                        meta={workMeta}
                        crop={crop}
                        aspect={aspect}
                        src={stageSrc || displayUrl(meta.base, { orient: rotation || undefined })}
                        preview={panel !== "crop"}
                        interactive={panel !== "crop" && panel !== "export"}
                        onCropChange={setCrop}
                      />
                    )}
                    {statusChips.length > 0 && (
                      <span className="absolute bottom-4 left-4 rounded-md bg-black/70 px-2 py-1 font-mono text-[10.5px] tracking-[0.02em] text-white">
                        {statusChips.join(" · ")}
                      </span>
                    )}
                  </div>
                  <footer className="flex h-[52px] shrink-0 items-center justify-between border-t px-4">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={resetAll}>
                      Reset
                    </button>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {edits} {edits === 1 ? "edit" : "edits"}
                    </p>
                  </footer>
                </main>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
