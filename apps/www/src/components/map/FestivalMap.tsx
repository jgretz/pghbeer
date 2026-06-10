import {useEffect, useMemo, useRef} from 'react';
import {MapSlot} from './MapSlot';
import {usePanZoom} from '../../hooks/usePanZoom';
import type {MapLayout, MapSlot as MapSlotType} from '../../lib/types';

interface FestivalMapProps {
  layout: MapLayout;
  highlightBreweryId?: number;
}

// Live, pannable/zoomable SVG of a layout for public display. The "find me"
// highlight is pure props — a slot is always an addressable node, so no cached
// image to re-export.
export function FestivalMap({layout, highlightBreweryId}: FestivalMapProps) {
  const {containerRef, size, view, setView, fit, fitView, centerOnRect, zoomBy, bind} =
    usePanZoom({width: layout.width, height: layout.height});
  const didInit = useRef(false);

  // Zones render first (background), tables on top.
  const ordered = useMemo(() => {
    const zones = layout.slots.filter((s) => s.kind === 'zone');
    const tables = layout.slots.filter((s) => s.kind !== 'zone');
    return [...zones, ...tables];
  }, [layout.slots]);

  const highlightSlot = useMemo<MapSlotType | undefined>(() => {
    if (highlightBreweryId == null) return undefined;
    return layout.slots.find(
      (s) => s.kind === 'table' && s.breweryId === highlightBreweryId,
    );
  }, [layout.slots, highlightBreweryId]);

  // Fit once the container is measured; re-center when the highlight changes.
  useEffect(() => {
    if (!size.w || !size.h) return;
    if (highlightSlot) {
      centerOnRect(highlightSlot);
      didInit.current = true;
    } else if (!didInit.current) {
      setView(fitView());
      didInit.current = true;
    }
  }, [size, highlightSlot, centerOnRect, setView, fitView]);

  return (
    <div className="relative flex-1 overflow-hidden bg-bg">
      <div
        ref={containerRef}
        className="h-full w-full touch-none"
        style={{cursor: 'grab'}}
        {...bind}
      >
        <svg width="100%" height="100%">
          <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
            {ordered.map((slot) => (
              <MapSlot
                key={slot.id}
                slot={slot}
                highlighted={highlightSlot?.id === slot.id}
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <MapButton label="+" onClick={() => zoomBy(1.25)} />
        <MapButton label="−" onClick={() => zoomBy(0.8)} />
        <MapButton label="⤢" title="Fit" onClick={fit} />
      </div>
    </div>
  );
}

function MapButton({
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
}
