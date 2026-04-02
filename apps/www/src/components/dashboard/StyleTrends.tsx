import {useMemo} from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type {ChartTheme} from '../../hooks/useChartTheme';
import type {StyleTrendBucket} from '../../lib/types';

interface Props {
  data: StyleTrendBucket[];
  theme: ChartTheme;
}

const STYLE_COLORS = [
  '#F2B827', // gold
  '#E67E22', // orange
  '#9B59B6', // purple
  '#555555', // dark gray
  '#888888', // light gray
  '#3498DB', // blue
  '#2ECC71', // green
];

export function StyleTrends({data, theme: t}: Props) {
  const styleNames = useMemo(function () {
    const names = new Set<string>();
    for (const bucket of data) {
      for (const key of Object.keys(bucket)) {
        if (key !== 'bucket') names.add(key);
      }
    }
    return Array.from(names);
  }, [data]);

  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
        Style Trends Over Time
      </div>
      <div className="mb-3 text-[11px] text-text-muted">
        Check-ins by style per 10 min window
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
          <XAxis
            dataKey="bucket"
            tick={{fontSize: 10, fill: t.textMuted}}
            axisLine={{stroke: t.border}}
            tickLine={false}
          />
          <YAxis
            tick={{fontSize: 10, fill: t.textMuted}}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              fontSize: 12,
              color: t.text,
            }}
          />
          {styleNames.map(function (name, i) {
            const color = STYLE_COLORS[i % STYLE_COLORS.length];
            return (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2.5 flex flex-wrap gap-3.5">
        {styleNames.map(function (name, i) {
          const color = STYLE_COLORS[i % STYLE_COLORS.length];
          return (
            <span
              key={name}
              className="flex items-center gap-1 text-[11px] text-text-secondary"
            >
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{background: color}}
              />
              {name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
