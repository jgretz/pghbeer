import {useCallback, useEffect, useRef, useState} from 'react';

export interface PanZoomView {
  scale: number;
  tx: number;
  ty: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 6;

function clampScale(s: number): number {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
}

// Pan/zoom controller for an SVG "world" of the given dimensions. Pan = single
// pointer drag; pinch = two pointers; wheel + zoomBy() as fallbacks. All browser
// access is in effects/handlers (SSR-safe) and the focal point is resolved from
// the container's own bounding rect (portal-proof).
export function usePanZoom(world: {width: number; height: number}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef<Map<number, {x: number; y: number}>>(new Map());
  const pinchDist = useRef<number | null>(null);
  const [size, setSize] = useState({w: 0, h: 0});
  const [view, setView] = useState<PanZoomView>({scale: 1, tx: 0, ty: 0});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({w: entry.contentRect.width, h: entry.contentRect.height});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fitView = useCallback((): PanZoomView => {
    const {w, h} = size;
    if (!w || !h) return {scale: 1, tx: 0, ty: 0};
    const scale = clampScale(Math.min(w / world.width, h / world.height) * 0.92);
    return {
      scale,
      tx: (w - world.width * scale) / 2,
      ty: (h - world.height * scale) / 2,
    };
  }, [size, world.width, world.height]);

  const fit = useCallback(() => setView(fitView()), [fitView]);

  const centerOnRect = useCallback(
    (r: Rect) => {
      const {w, h} = size;
      if (!w || !h) return;
      const fitScale = Math.min(w / world.width, h / world.height) * 0.92;
      const target = clampScale(
        Math.max(fitScale, (Math.min(w, h) * 0.4) / Math.max(r.width, r.height)),
      );
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      setView({scale: target, tx: w / 2 - cx * target, ty: h / 2 - cy * target});
    },
    [size, world.width, world.height],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      setView((v) => {
        const next = clampScale(v.scale * factor);
        const fx = size.w / 2;
        const fy = size.h / 2;
        const k = next / v.scale;
        return {scale: next, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k};
      });
    },
    [size],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const pts = pointers.current;
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId)!;
    pts.set(e.pointerId, {x: e.clientX, y: e.clientY});

    if (pts.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setView((v) => ({...v, tx: v.tx + dx, ty: v.ty + dy}));
    } else if (pts.size === 2) {
      const [a, b] = Array.from(pts.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = containerRef.current?.getBoundingClientRect();
      const fx = (a.x + b.x) / 2 - (rect?.left ?? 0);
      const fy = (a.y + b.y) / 2 - (rect?.top ?? 0);
      if (pinchDist.current != null && pinchDist.current > 0) {
        const ratio = dist / pinchDist.current;
        setView((v) => {
          const next = clampScale(v.scale * ratio);
          const k = next / v.scale;
          return {scale: next, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k};
        });
      }
      pinchDist.current = dist;
    }
  }, []);

  const endPointer = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const fx = e.clientX - (rect?.left ?? 0);
    const fy = e.clientY - (rect?.top ?? 0);
    setView((v) => {
      const next = clampScale(v.scale * (e.deltaY < 0 ? 1.1 : 0.9));
      const k = next / v.scale;
      return {scale: next, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k};
    });
  }, []);

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onPointerLeave: endPointer,
    onWheel,
  };

  return {containerRef, size, view, setView, fit, fitView, centerOnRect, zoomBy, bind};
}
