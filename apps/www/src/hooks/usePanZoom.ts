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

// Rounded SVG transform — full-precision floats bloat the attribute string on
// the render hot path (rendering-svg-precision).
function transformStr(v: PanZoomView): string {
  return `translate(${v.tx.toFixed(2)} ${v.ty.toFixed(2)}) scale(${v.scale.toFixed(4)})`;
}

// Pan/zoom controller for an SVG "world" of the given dimensions. Pan = single
// pointer drag; pinch = two pointers; wheel + zoomBy() as fallbacks.
//
// During a gesture the transform is written directly to the <g> node (rAF-
// batched) and React state is left untouched, so dragging a 100-table map
// doesn't reconcile the whole slot tree on every pointermove; the committed
// `view` state is synced once on pointer-up. All browser access is in
// effects/handlers (SSR-safe) and the focal point is resolved from the
// container's own bounding rect (portal-proof).
export function usePanZoom(world: {width: number; height: number}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const pointers = useRef<Map<number, {x: number; y: number}>>(new Map());
  const pinchDist = useRef<number | null>(null);
  const rectRef = useRef<DOMRect | null>(null); // cached for the duration of a gesture
  const rafId = useRef<number | null>(null);
  const [size, setSize] = useState({w: 0, h: 0});
  const [view, setView] = useState<PanZoomView>({scale: 1, tx: 0, ty: 0});
  const viewRef = useRef(view);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({w: entry.contentRect.width, h: entry.contentRect.height});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
  }, []);

  // Commit to React state (re-renders) and keep the live ref in sync. For
  // discrete actions: buttons, fit, wheel, pointer-up.
  const commit = useCallback((v: PanZoomView) => {
    viewRef.current = v;
    setView(v);
  }, []);

  // Live update during a gesture: mutate the ref and write the DOM, no React
  // re-render. Coalesced to one write per animation frame.
  const applyLive = useCallback((v: PanZoomView) => {
    viewRef.current = v;
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      groupRef.current?.setAttribute('transform', transformStr(viewRef.current));
    });
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

  const fit = useCallback(() => commit(fitView()), [commit, fitView]);

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
      commit({scale: target, tx: w / 2 - cx * target, ty: h / 2 - cy * target});
    },
    [size, world.width, world.height, commit],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const v = viewRef.current;
      const next = clampScale(v.scale * factor);
      const fx = size.w / 2;
      const fy = size.h / 2;
      const k = next / v.scale;
      commit({scale: next, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k});
    },
    [size, commit],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
    // Cache the rect once per gesture — getBoundingClientRect forces layout and
    // the container doesn't move mid-gesture.
    rectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pts = pointers.current;
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId)!;
      pts.set(e.pointerId, {x: e.clientX, y: e.clientY});

      if (pts.size === 1) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        const v = viewRef.current;
        applyLive({...v, tx: v.tx + dx, ty: v.ty + dy});
      } else if (pts.size === 2) {
        const [a, b] = Array.from(pts.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = rectRef.current;
        const fx = (a.x + b.x) / 2 - (rect?.left ?? 0);
        const fy = (a.y + b.y) / 2 - (rect?.top ?? 0);
        if (pinchDist.current != null && pinchDist.current > 0) {
          const ratio = dist / pinchDist.current;
          const v = viewRef.current;
          const next = clampScale(v.scale * ratio);
          const k = next / v.scale;
          applyLive({scale: next, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k});
        }
        pinchDist.current = dist;
      }
    },
    [applyLive],
  );

  const endPointer = useCallback(
    (e: React.PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinchDist.current = null;
      if (pointers.current.size === 0) {
        rectRef.current = null;
        // Sync React state to where the gesture left the live transform.
        commit(viewRef.current);
      }
    },
    [commit],
  );

  // Non-passive wheel listener: a React onWheel handler is registered passive,
  // so preventDefault() is ignored and the page scrolls while zooming.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const fx = e.clientX - rect.left;
      const fy = e.clientY - rect.top;
      const v = viewRef.current;
      const next = clampScale(v.scale * (e.deltaY < 0 ? 1.1 : 0.9));
      const k = next / v.scale;
      commit({scale: next, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k});
    };
    el.addEventListener('wheel', handler, {passive: false});
    return () => el.removeEventListener('wheel', handler);
  }, [commit]);

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onPointerLeave: endPointer,
  };

  return {
    containerRef,
    groupRef,
    size,
    view,
    transform: transformStr(view),
    fit,
    fitView,
    centerOnRect,
    zoomBy,
    bind,
  };
}
