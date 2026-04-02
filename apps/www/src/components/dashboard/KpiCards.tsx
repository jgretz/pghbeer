import type {DashboardStats} from '../../lib/types';

interface Props {
  data: DashboardStats;
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 basis-[140px] rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="mb-1.5 text-xs font-medium text-text-secondary">{label}</div>
      <div
        className={`font-display text-[32px] font-bold leading-none ${accent ? 'text-na-green' : 'text-text'}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs text-text-muted">{sub}</div>}
    </div>
  );
}

export function KpiCards({data}: Props) {
  const avgPerPerson =
    data.uniqueUsers > 0 ? (data.totalCheckins / data.uniqueUsers).toFixed(1) : '0';
  const naPct =
    data.totalCheckins > 0
      ? ((data.naCheckins / data.totalCheckins) * 100).toFixed(1)
      : '0';

  return (
    <div className="flex flex-wrap gap-3.5">
      <KpiCard label="Total Check-ins" value={data.totalCheckins.toLocaleString()} />
      <KpiCard label="Active Users" value={data.activeUsers} sub="seen in last 15 min" />
      <KpiCard label="Avg / Person" value={avgPerPerson} />
      <KpiCard
        label="NA Check-ins"
        value={data.naCheckins}
        sub={`${naPct}% of total`}
        accent
      />
    </div>
  );
}
