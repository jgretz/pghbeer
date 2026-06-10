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
  const {x, y, width, height, rotation, label, kind} = slot;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const transform = rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined;

  if (kind === 'zone') {
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
        <text
          x={cx}
          y={y + 16}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill="var(--color-text-secondary)"
          style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}
        >
          {label}
        </text>
      </g>
    );
  }

  const filled = slot.breweryId != null;
  const labelSize = Math.max(8, Math.min(width, height) * 0.32);
  const nameSize = Math.max(6, Math.min(width, height) * 0.18);

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
      <text
        x={cx}
        y={filled ? cy - height * 0.06 : cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={labelSize}
        fontWeight={700}
        fill={filled ? 'var(--color-text)' : 'var(--color-text-muted)'}
      >
        {label}
      </text>
      {filled && slot.breweryName && (
        <text
          x={cx}
          y={cy + height * 0.26}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={nameSize}
          fill="var(--color-text-secondary)"
        >
          {slot.breweryName}
        </text>
      )}
    </g>
  );
}

export const MapSlot = memo(MapSlotImpl);
