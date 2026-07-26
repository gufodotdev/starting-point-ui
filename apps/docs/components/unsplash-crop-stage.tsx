"use client";

import { useEffect, useRef, useState } from "react";
import type { Crop, HandleId, ImageMeta } from "@/lib/unsplash-crop";
import { HANDLE_DIRS, clamp, resizeFromAnchor } from "@/lib/unsplash-crop";

const HANDLES = Object.keys(HANDLE_DIRS) as HandleId[];

const HANDLE_POS: Record<HandleId, string> = {
  nw: "top-0 left-0 cursor-nwse-resize",
  n: "top-0 left-1/2 cursor-ns-resize",
  ne: "top-0 left-full cursor-nesw-resize",
  e: "top-1/2 left-full cursor-ew-resize",
  se: "top-full left-full cursor-nwse-resize",
  s: "top-full left-1/2 cursor-ns-resize",
  sw: "top-full left-0 cursor-nesw-resize",
  w: "top-1/2 left-0 cursor-ew-resize",
};

const THIRDS_LINES = [
  "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25)) no-repeat 0 33.33% / 100% 1px",
  "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25)) no-repeat 0 66.67% / 100% 1px",
  "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25)) no-repeat 33.33% 0 / 1px 100%",
  "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25)) no-repeat 66.67% 0 / 1px 100%",
].join(", ");

type DragState =
  | { mode: "move"; offX: number; offY: number }
  | { mode: "resize"; dirX: number; dirY: number; ax: number; ay: number; cx: number; cy: number }
  | { mode: "draw"; ax: number; ay: number };

export function CropStage({
  meta,
  crop,
  aspect,
  src,
  preview,
  interactive,
  onCropChange,
}: {
  meta: ImageMeta;
  crop: Crop;
  aspect: number | null;
  src: string;
  preview: boolean;
  interactive: boolean;
  onCropChange: (crop: Crop) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const previewDragRef = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [previewBox, setPreviewBox] = useState({ w: 0, h: 0 });
  const [previewDragging, setPreviewDragging] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const update = () => {
      if (img.clientWidth) setScale(img.clientWidth / meta.width);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(img);
    return () => observer.disconnect();
  }, [meta]);

  const minSize = Math.max(16, 24 / scale);

  const toOrig = (e: { clientX: number; clientY: number }) => {
    const rect = imgRef.current!.getBoundingClientRect();
    return {
      px: (e.clientX - rect.left) / scale,
      py: (e.clientY - rect.top) / scale,
    };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const { px, py } = toOrig(e);
      if (drag.mode === "move") {
        onCropChange({
          ...crop,
          x: clamp(px - drag.offX, 0, meta.width - crop.w),
          y: clamp(py - drag.offY, 0, meta.height - crop.h),
        });
      } else if (drag.mode === "resize") {
        onCropChange(
          resizeFromAnchor({
            ax: drag.ax, ay: drag.ay, px, py,
            dirX: drag.dirX, dirY: drag.dirY,
            cx: drag.cx, cy: drag.cy,
            prev: crop, meta, aspect, minSize,
          }),
        );
      } else {
        onCropChange(
          resizeFromAnchor({
            ax: drag.ax, ay: drag.ay, px, py,
            dirX: px >= drag.ax ? 1 : -1,
            dirY: py >= drag.ay ? 1 : -1,
            cx: 0, cy: 0,
            prev: crop, meta, aspect, minSize,
          }),
        );
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  });

  // React registers wheel listeners as passive, so a native listener is
  // needed for preventDefault to keep the page from scrolling while zooming.
  useEffect(() => {
    if (!preview) return;
    const el = previewWrapRef.current;
    if (!el) return;
    const update = () => setPreviewBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [preview]);

  useEffect(() => {
    const el = overlayRef.current ?? (interactive ? previewWrapRef.current : null);
    if (!el) return;
    const onZoom = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.002);
      const r = aspect ?? crop.w / crop.h;
      const maxW = Math.min(meta.width, meta.height * r);
      const w = clamp(crop.w * factor, Math.max(minSize, minSize * r), maxW);
      const h = w / r;
      const cx = crop.x + crop.w / 2;
      const cy = crop.y + crop.h / 2;
      onCropChange({
        x: clamp(cx - w / 2, 0, meta.width - w),
        y: clamp(cy - h / 2, 0, meta.height - h),
        w,
        h,
      });
    };
    el.addEventListener("wheel", onZoom, { passive: false });
    return () => el.removeEventListener("wheel", onZoom);
  });

  const startBoxDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    const { px, py } = toOrig(e);
    dragRef.current = { mode: "move", offX: px - crop.x, offY: py - crop.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const startHandleDrag = (e: React.PointerEvent, handle: HandleId) => {
    e.stopPropagation();
    const [dirX, dirY] = HANDLE_DIRS[handle];
    dragRef.current = {
      mode: "resize",
      dirX,
      dirY,
      ax: dirX > 0 ? crop.x : dirX < 0 ? crop.x + crop.w : crop.x,
      ay: dirY > 0 ? crop.y : dirY < 0 ? crop.y + crop.h : crop.y,
      cx: crop.x + crop.w / 2,
      cy: crop.y + crop.h / 2,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const startDraw = (e: React.PointerEvent) => {
    const { px, py } = toOrig(e);
    dragRef.current = {
      mode: "draw",
      ax: clamp(px, 0, meta.width),
      ay: clamp(py, 0, meta.height),
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const nudge = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 50 : 10;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    onCropChange({
      ...crop,
      x: clamp(crop.x + move[0], 0, meta.width - crop.w),
      y: clamp(crop.y + move[1], 0, meta.height - crop.h),
    });
  };

  if (preview) {
    const ratio = crop.h ? crop.w / crop.h : 1;
    let vw = previewBox.w;
    let vh = ratio ? vw / ratio : 0;
    if (vh > previewBox.h) {
      vh = previewBox.h;
      vw = vh * ratio;
    }
    const pScale = crop.w ? vw / crop.w : 1;
    return (
      <div ref={previewWrapRef} className="flex h-full w-full items-center justify-center">
        {vw > 0 && (
          <div
            className={`relative touch-none overflow-hidden rounded-md select-none ${
              interactive
                ? "cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                : ""
            }`}
            style={{ width: vw, height: vh }}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? nudge : undefined}
            onPointerDown={
              interactive
                ? (e) => {
                    previewDragRef.current = { px: e.clientX, py: e.clientY, cx: crop.x, cy: crop.y };
                    setPreviewDragging(true);
                    (e.target as Element).setPointerCapture(e.pointerId);
                  }
                : undefined
            }
            onPointerMove={
              interactive
                ? (e) => {
                    const drag = previewDragRef.current;
                    if (!drag) return;
                    onCropChange({
                      ...crop,
                      x: clamp(drag.cx - (e.clientX - drag.px) / pScale, 0, meta.width - crop.w),
                      y: clamp(drag.cy - (e.clientY - drag.py) / pScale, 0, meta.height - crop.h),
                    });
                  }
                : undefined
            }
            onPointerUp={
              interactive
                ? () => {
                    previewDragRef.current = null;
                    setPreviewDragging(false);
                  }
                : undefined
            }
          >
            <img
              className="block max-w-none"
              src={src}
              alt=""
              draggable={false}
              style={{
                width: meta.width * pScale,
                height: meta.height * pScale,
                transform: `translate(${-crop.x * pScale}px, ${-crop.y * pScale}px)`,
              }}
            />
            {previewDragging && (
              <div className="pointer-events-none absolute inset-0" style={{ background: THIRDS_LINES }}>
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/70" />
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/70" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative inline-block leading-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      tabIndex={0}
      onKeyDown={nudge}
    >
      <img
        ref={imgRef}
        className="block h-auto max-h-[min(744px,calc(94svh-156px))] w-auto max-w-full rounded-md"
        src={src}
        alt=""
        draggable={false}
      />
      <div
        ref={overlayRef}
        className="absolute inset-0 cursor-crosshair overflow-hidden rounded-md touch-none"
        onPointerDown={startDraw}
      >
        <div
          className="absolute cursor-move outline-1 outline-white/90 touch-none"
          style={{
            left: crop.x * scale,
            top: crop.y * scale,
            width: crop.w * scale,
            height: crop.h * scale,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
            background: THIRDS_LINES,
          }}
          onPointerDown={startBoxDrag}
        >
          {HANDLES.map((handle) => (
            <div
              key={handle}
              className={`absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white touch-none ${HANDLE_POS[handle]}`}
              onPointerDown={(e) => startHandleDrag(e, handle)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

