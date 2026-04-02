import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from 'recharts';
import type {ChartTheme} from '../../hooks/useChartTheme';
import type {TypeCount} from '../../lib/types';

interface Props {
  data: TypeCount[];
  theme: ChartTheme;
}

const TYPE_COLORS: Record<string, string> = {
  beer: '#F2B827',
  wine: '#9B59B6',
  mead: '#E67E22',
  cocktail: '#E74C3C',
  NA: '#4B916D',
  cider: '#2ECC71',
  seltzer: '#3498DB',
  hard_tea: '#1ABC9C',
};

const TYPE_LABELS: Record<string, string> = {
  beer: 'Beer',
  wine: 'Wine',
  mead: 'Mead',
  cocktail: 'Cocktail',
  NA: 'NA',
  cider: 'Cider',
  seltzer: 'Seltzer',
  hard_tea: 'Hard Tea',
};

export function TypeDonut({data, theme: t}: Props) {
  const chartData = data.map(function (d) {
    return {
      name: TYPE_LABELS[d.type] ?? d.type,
      value: d.count,
      color: TYPE_COLORS[d.type] ?? '#888',
    };
  });

  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3.5 font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
        Type Breakdown
      </div>
      <div className="flex items-center gap-5">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map(function (entry) {
                return <Cell key={entry.name} fill={entry.color} />;
              })}
            </Pie>
            <Tooltip
              contentStyle={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                fontSize: 12,
                color: t.text,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1">
          {chartData.map(function (entry) {
            return (
              <div
                key={entry.name}
                className="flex items-center justify-between py-1.5 text-[13px]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{background: entry.color}}
                  />
                  <span className="text-text">{entry.name}</span>
                </div>
                <span className="font-display font-semibold text-text-secondary">
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
