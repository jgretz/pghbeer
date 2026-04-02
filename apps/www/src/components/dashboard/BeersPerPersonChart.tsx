import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import type {ChartTheme} from '../../hooks/useChartTheme';
import type {DistributionBucket} from '../../lib/types';

interface Props {
  data: DistributionBucket[];
  uniqueUsers: number;
  theme: ChartTheme;
}

export function BeersPerPersonChart({data, uniqueUsers, theme: t}: Props) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
        Beers Per Person
      </div>
      <div className="mb-3 text-[11px] text-text-muted">
        Distribution across {uniqueUsers} users
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
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
          <Bar dataKey="count" fill={t.gold} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
