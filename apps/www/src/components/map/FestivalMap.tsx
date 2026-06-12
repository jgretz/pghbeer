import {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import {MapSlot} from './MapSlot';
import {usePanZoom, type Rect} from '../../hooks/usePanZoom';
import type {MapLayout, MapSlot as MapSlotType} from '../../lib/types';

interface FestivalMapProps {
  layout: MapLayout;
  highlightBreweryId?: number;
}

// Live, pannable/zoomable SVG of a layout for public display. The "find me"
// highlight is pure props — a slot is always an addressable node, so no cached
// image to re-export.
//
// The world is derived from the slots' actual bounding box, not the stored
// canvas dims — slots overflow the nominal canvas, so the box is the source of
// truth for fit. A leading translate shifts the box origin to (0,0), and
// `toWorldRect` maps a slot's box into that world space for "find me" centering.
// Wide layouts read poorly in portrait; the /map route nudges the user to turn
// the phone to landscape rather than fighting it with an SVG rotation.
export function FestivalMap({layout, highlightBreweryId}: FestivalMapProps) {
  const {world, worldTransform, toWorldRect} = useMemo(() => {
    const {slots} = layout;
    if (slots.length === 0) {
      return {
        world: {width: layout.width, height: layout.height},
        worldTransform: undefined as string | undefined,
        toWorldRect: (r: Rect): Rect => r,
      };
    }
    const minX = Math.min(...slots.map((s) => s.x));
    const minY = Math.min(...slots.map((s) => s.y));
    const maxX = Math.max(...slots.map((s) => s.x + s.width));
    const maxY = Math.max(...slots.map((s) => s.y + s.height));

    return {
      world: {width: maxX - minX, height: maxY - minY},
      worldTransform: `translate(${-minX} ${-minY})`,
      toWorldRect: (r: Rect): Rect => ({
        x: r.x - minX,
        y: r.y - minY,
        width: r.width,
        height: r.height,
      }),
    };
  }, [layout]);

  const {containerRef, groupRef, size, fit, centerOnRect, zoomBy, bind} = usePanZoom(world);
  const didInit = useRef(false);

  const zoomIn = useCallback(() => zoomBy(1.25), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(0.8), [zoomBy]);

  // Zones render first (background), then tables, then labels on top.
  const ordered = useMemo(() => {
    const zones = layout.slots.filter((s) => s.kind === 'zone');
    const tables = layout.slots.filter((s) => s.kind === 'table');
    const labels = layout.slots.filter((s) => s.kind === 'label');
    return [...zones, ...tables, ...labels];
  }, [layout.slots]);

  const highlightSlot = useMemo<MapSlotType | undefined>(() => {
    if (highlightBreweryId == null) return undefined;
    return layout.slots.find(
      (s) => s.kind === 'table' && s.breweryId === highlightBreweryId,
    );
  }, [layout.slots, highlightBreweryId]);

  // The highlight's box has to be expressed in world space for centering.
  const highlightRect = useMemo(
    () => (highlightSlot ? toWorldRect(highlightSlot) : undefined),
    [highlightSlot, toWorldRect],
  );

  // Fit once the container is measured; re-center when the highlight changes.
  useEffect(() => {
    if (!size.w || !size.h) return;
    if (highlightRect) {
      centerOnRect(highlightRect);
      didInit.current = true;
    } else if (!didInit.current) {
      fit();
      didInit.current = true;
    }
  }, [size, highlightRect, centerOnRect, fit]);

  return (
    <div className="relative flex-1 overflow-hidden bg-bg">
      <div
        ref={containerRef}
        className="h-full w-full touch-none"
        style={{cursor: 'grab'}}
        {...bind}
      >
        <svg width="100%" height="100%">
          {/* transform is owned by usePanZoom (imperative); no prop here. The
              inner <g> applies the static landscape rotation under it. */}
          <g ref={groupRef}>
            <g transform={worldTransform}>
              {ordered.map((slot) => (
                <MapSlot
                  key={slot.id}
                  slot={slot}
                  highlighted={highlightSlot?.id === slot.id}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <MapButton label="+" onClick={zoomIn} />
        <MapButton label="−" onClick={zoomOut} />
        <MapButton label="⤢" title="Fit" onClick={fit} />
      </div>
    </div>
  );
}

const MapButton = memo(function MapButton({
  label,
  title,
  onClick,
}: {
  label: string;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-border bg-surface text-lg font-semibold text-text shadow-[0_2px_8px_var(--color-shadow)]"
    >
      {label}
    </button>
  );
});
