export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ImageMeta {
  base: string;
  width: number;
  height: number;
}

export type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const HANDLE_DIRS: Record<HandleId, [number, number]> = {
  nw: [-1, -1],
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
};

export const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

export function fitCrop(meta: ImageMeta, aspect: number | null): Crop {
  const { width: W, height: H } = meta;
  const r = aspect ?? W / H;
  let w = W * 0.6;
  let h = w / r;
  if (h > H * 0.9) {
    h = H * 0.9;
    w = h * r;
  }
  if (w > W * 0.9) {
    w = W * 0.9;
    h = w / r;
  }
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

export function reshapeCrop(crop: Crop, meta: ImageMeta, aspect: number): Crop {
  const { width: W, height: H } = meta;
  const cx = crop.x + crop.w / 2;
  const cy = crop.y + crop.h / 2;
  let w = crop.w;
  let h = w / aspect;
  if (h > H) {
    h = H;
    w = h * aspect;
  }
  if (w > W) {
    w = W;
    h = w / aspect;
  }
  return {
    x: clamp(cx - w / 2, 0, W - w),
    y: clamp(cy - h / 2, 0, H - h),
    w,
    h,
  };
}

export interface ResizeInput {
  ax: number;
  ay: number;
  px: number;
  py: number;
  dirX: number;
  dirY: number;
  cx: number;
  cy: number;
  prev: Crop;
  meta: ImageMeta;
  aspect: number | null;
  minSize: number;
}

export function resizeFromAnchor(input: ResizeInput): Crop {
  const { ax, ay, px, py, dirX, dirY, cx, cy, prev, meta, aspect: r, minSize: min } = input;
  const { width: W, height: H } = meta;

  const availW = dirX > 0 ? W - ax : dirX < 0 ? ax : Infinity;
  const availH = dirY > 0 ? H - ay : dirY < 0 ? ay : Infinity;
  const wantW = dirX !== 0 ? Math.max(min, dirX > 0 ? px - ax : ax - px) : 0;
  const wantH = dirY !== 0 ? Math.max(min, dirY > 0 ? py - ay : ay - py) : 0;

  let w: number;
  let h: number;

  if (r) {
    if (dirX !== 0 && dirY !== 0) {
      w = Math.max(wantW, wantH * r);
    } else if (dirX !== 0) {
      w = wantW;
    } else {
      w = wantH * r;
    }
    let maxW = Math.min(availW, availH * r);
    // edge handles keep the perpendicular center fixed, which halves the room
    if (dirX === 0) maxW = Math.min(maxW, 2 * cx, 2 * (W - cx));
    if (dirY === 0) maxW = Math.min(maxW, 2 * cy * r, 2 * (H - cy) * r);
    w = clamp(w, min, maxW);
    h = w / r;
  } else {
    w = dirX !== 0 ? clamp(wantW, min, availW) : prev.w;
    h = dirY !== 0 ? clamp(wantH, min, availH) : prev.h;
  }

  const x = dirX > 0 ? ax : dirX < 0 ? ax - w : clamp(cx - w / 2, 0, W - w);
  const y = dirY > 0 ? ay : dirY < 0 ? ay - h : clamp(cy - h / 2, 0, H - h);
  return { x, y, w, h };
}

export function roundedCrop(crop: Crop, meta: ImageMeta): Crop {
  const x = Math.round(crop.x);
  const y = Math.round(crop.y);
  return {
    x,
    y,
    w: Math.min(Math.round(crop.w), meta.width - x),
    h: Math.min(Math.round(crop.h), meta.height - y),
  };
}

export interface OutputOptions {
  width?: number | null;
  quality?: number;
  orient?: number;
  saturation?: number;
  contrast?: number;
  exposure?: number;
  brightness?: number;
  highlights?: number;
  shadows?: number;
  vibrance?: number;
  hue?: number;
  sepia?: number;
  sharpen?: number;
  blur?: number;
  flipH?: boolean;
  flipV?: boolean;
  faceMode?: boolean;
  facePad?: number;
  bgRemove?: boolean;
  bgColor?: string;
}

// The base may carry the photo's ixid tracking parameter, which the docs
// require keeping so photographers get credited for views.
function joinParams(base: string, params: string[]): string {
  return `${base}${base.includes("?") ? "&" : "?"}${params.join("&")}`;
}

function effectParams(opts: OutputOptions): string[] {
  const params: string[] = [];
  if (opts.saturation) params.push(`sat=${opts.saturation}`);
  if (opts.contrast) params.push(`con=${opts.contrast}`);
  if (opts.exposure) params.push(`exp=${opts.exposure}`);
  if (opts.brightness) params.push(`bri=${opts.brightness}`);
  if (opts.highlights) params.push(`high=${opts.highlights}`);
  if (opts.shadows) params.push(`shad=${opts.shadows}`);
  if (opts.vibrance) params.push(`vib=${opts.vibrance}`);
  if (opts.hue) params.push(`hue=${opts.hue}`);
  if (opts.sepia) params.push(`sepia=${opts.sepia}`);
  if (opts.sharpen) params.push(`sharp=${opts.sharpen}`);
  if (opts.blur) params.push(`blur=${opts.blur}`);
  const flip = `${opts.flipH ? "h" : ""}${opts.flipV ? "v" : ""}`;
  if (flip) params.push(`flip=${flip}`);
  if (opts.bgRemove) params.push("bg-remove=true");
  if (opts.bgRemove && opts.bgColor) params.push(`bg=${opts.bgColor}`);
  return params;
}

export function buildUrl(meta: ImageMeta, crop: Crop, opts: OutputOptions = {}): string {
  const r = roundedCrop(crop, meta);
  const params: string[] = [];
  // orient is applied by the CDN before rect, so crop coordinates live in
  // the rotated space; meta here must carry the rotated dimensions.
  if (opts.orient) params.push(`orient=${opts.orient}`);
  if (opts.faceMode) {
    // facearea ignores rect: the CDN finds the face and pads it, so only the
    // output frame (w/h from the selected aspect) and facepad apply.
    const w = opts.width ?? 640;
    params.push(
      `w=${w}`,
      `h=${Math.round(w * (r.h / r.w))}`,
      "fit=facearea",
      `facepad=${opts.facePad ?? 2.5}`,
    );
  } else {
    // The CDN crops rect in original coordinates before flipping, while the
    // editor selects on the flipped image, so mirror the rect to compensate.
    const rx = opts.flipH ? meta.width - r.x - r.w : r.x;
    const ry = opts.flipV ? meta.height - r.y - r.h : r.y;
    params.push(`rect=${rx},${ry},${r.w},${r.h}`);
    if (opts.width) {
      params.push(`w=${opts.width}`, `h=${Math.round(opts.width * (r.h / r.w))}`, "fit=crop");
    }
  }
  params.push("auto=format", `q=${opts.quality ?? 80}`, ...effectParams(opts));
  return joinParams(meta.base, params);
}

export class UnsplashUrlError extends Error {}

export async function resolveUnsplashUrl(raw: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UnsplashUrlError("That does not look like a URL.");
  }
  if (!/(^|\.)unsplash\.com$/.test(url.hostname)) {
    throw new UnsplashUrlError(
      "Only Unsplash URLs are supported (unsplash.com or images.unsplash.com).",
    );
  }

  // A photo page URL carries the photo id as the last token of the slug;
  // the server resolves it to the raw image URL via the download redirect.
  if (url.hostname === "unsplash.com" || url.hostname === "www.unsplash.com") {
    const segments = url.pathname.split("/").filter(Boolean);
    const slug = segments[0] === "photos" ? segments[1] : null;
    const id = slug?.split("-").pop();
    if (!id) {
      throw new UnsplashUrlError(
        "That Unsplash page is not a photo. Paste a photo page or image URL.",
      );
    }
    const res = await fetch(`/api/unsplash?id=${encodeURIComponent(id)}`);
    if (!res.ok) {
      throw new UnsplashUrlError(
        "Could not resolve that Unsplash page. Open the photo, right-click the image and choose Copy Image Address instead.",
      );
    }
    const data = await res.json();
    return data.base;
  }

  const ixid = url.searchParams.get("ixid");
  return url.origin + url.pathname + (ixid ? `?ixid=${ixid}` : "");
}

export function displayUrl(base: string, opts: OutputOptions = {}): string {
  const params = ["w=1600", "q=80", "auto=format"];
  if (opts.orient) params.push(`orient=${opts.orient}`);
  params.push(...effectParams(opts));
  return joinParams(base, params);
}

export async function loadImageMeta(base: string): Promise<ImageMeta> {
  let width = 0;
  let height = 0;
  try {
    // imgix fm=json metadata has open CORS and returns original pixel size
    const res = await fetch(joinParams(base, ["fm=json"]));
    if (res.ok) {
      const meta = await res.json();
      width = meta.PixelWidth ?? 0;
      height = meta.PixelHeight ?? 0;
    }
  } catch {
    // fall through to the image probe below
  }

  const probe = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () =>
      reject(new UnsplashUrlError("Could not load that image. Check the URL and try again."));
    img.src = displayUrl(base);
  });

  if (!width || !height) {
    width = probe.w;
    height = probe.h;
  }
  return { base, width, height };
}
