import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type {ChartTheme} from '../../hooks/useChartTheme';
import type {VelocityBucket} from '../../lib/types';

interface Props {
  data: VelocityBucket[];
  theme: ChartTheme;
}

export function VelocityChart({data, theme: t}: Props) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
          Check-in Velocity
        </div>
        <div className="flex gap-4 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-[3px] w-2.5 rounded-sm"
              style={{background: t.gold}}
            />
            Total
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-[3px] w-2.5 rounded-sm"
              style={{background: t.naGreen}}
            />
            NA
          </span>
        </div>
      </div>
      <div className="mb-3 text-[11px] text-text-muted">Check-ins per 5 min window</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.gold} stopOpacity={0.3} />
              <stop offset="100%" stopColor={t.gold} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="naGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.naGreen} stopOpacity={0.3} />
              <stop offset="100%" stopColor={t.naGreen} stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="total"
            stroke={t.gold}
            fill="url(#goldGrad)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="na"
            stroke={t.naGreen}
            fill="url(#naGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
