import {memo} from 'react';
import type {MapSlot as MapSlotType} from '../../lib/types';

interface MapSlotProps {
  slot: MapSlotType;
  highlighted?: boolean;
}

// A single positioned element. Zones are a translucent, non-interactive
// background layer; tables show fill state and (when filled) the brewery name.
// Rendered with a live SVG so a slot is always an addressable node — the
// "find me" highlight is pure props, no cached image to re-export.
function MapSlotImpl({slot, highlighted}: MapSlotProps) {
  const {x, y, width, height, rotation, kind} = slot;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const transform = rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined;

  if (kind === 'zone') {
    // Zones are an unlabeled background region for now — every zone's label is
    // still the "Zone" placeholder, so printing it is noise. Drop the text
    // until zone labeling is a real feature.
    return (
      <g transform={transform} style={{pointerEvents: 'none'}}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          fill="var(--color-surface-alt)"
          fillOpacity={0.5}
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
      </g>
    );
  }

  const filled = slot.breweryId != null;
  // Table numbers are arbitrary, so a filled table gives its whole area to the
  // wrapped brewery name (a foreignObject — SVG <text> can't wrap). Empty tables
  // are just a box.
  const nameSize = Math.max(8, Math.min(width, height) * 0.2);

  return (
    <g transform={transform} data-slot-id={slot.id}>
      {highlighted && (
        <rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          rx={8}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={3}
          className="animate-pulse"
        />
      )}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={5}
        fill={filled ? 'var(--color-gold-bg)' : 'var(--color-surface)'}
        stroke={filled ? 'var(--color-gold)' : 'var(--color-border)'}
        strokeWidth={1}
        strokeDasharray={filled ? undefined : '4 3'}
      />
      {filled && slot.breweryName && (
        <foreignObject x={x} y={y} width={width} height={height}>
          <div
            style={{
              display: 'flex',
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 3,
              overflow: 'hidden',
              textAlign: 'center',
              lineHeight: 1.05,
              fontSize: nameSize,
              fontWeight: 700,
              color: 'var(--color-text)',
              overflowWrap: 'break-word',
            }}
          >
            {slot.breweryName}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export const MapSlot = memo(MapSlotImpl);
