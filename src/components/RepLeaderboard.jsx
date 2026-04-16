import { useMemo, useState } from 'react';
import { useFilters } from '../FilterContext';
import { formatCurrency, formatPercent, OPEN_STAGES } from '../utils';

export default function RepLeaderboard() {
  const { opportunities, reps } = useFilters();
  const [sortKey, setSortKey] = useState('attainment');
  const [sortDir, setSortDir] = useState('desc');

  const data = useMemo(() => {
    return reps.map(rep => {
      const repOpps = opportunities.filter(o => o.repId === rep.id);
      const won = repOpps.filter(o => o.stage === 'Closed Won');
      const lost = repOpps.filter(o => o.stage === 'Closed Lost');
      const open = repOpps.filter(o => OPEN_STAGES.includes(o.stage));

      const bookings = won.reduce((s, o) => s + o.arrValue, 0);
      const pipeline = open.reduce((s, o) => s + o.arrValue, 0);
      const closedCount = won.length + lost.length;
      const winRate = closedCount > 0 ? (won.length / closedCount) * 100 : 0;
      const attainment = rep.quarterlyQuota > 0 ? (bookings / rep.quarterlyQuota) * 100 : 0;

      return {
        ...rep,
        bookings,
        pipeline,
        winRate,
        attainment,
        dealCount: repOpps.length,
        wonCount: won.length,
      };
    });
  }, [opportunities, reps]);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const mult = sortDir === 'desc' ? -1 : 1;
      return (a[sortKey] - b[sortKey]) * mult;
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortHeader({ label, field }) {
    const active = sortKey === field;
    return (
      <th
        className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2 cursor-pointer hover:text-text-secondary select-none"
        onClick={() => handleSort(field)}
      >
        {label} {active ? (sortDir === 'desc' ? '\u25BC' : '\u25B2') : ''}
      </th>
    );
  }

  function statusColor(attainment) {
    if (attainment >= 90) return 'bg-accent-green';
    if (attainment >= 70) return 'bg-accent-yellow';
    return 'bg-accent-red';
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Rep Leaderboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">Rep</th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">Team</th>
              <SortHeader label="Attainment" field="attainment" />
              <SortHeader label="Bookings" field="bookings" />
              <SortHeader label="Pipeline" field="pipeline" />
              <SortHeader label="Win Rate" field="winRate" />
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(rep => (
              <tr key={rep.id} className="border-b border-border/50 hover:bg-bg-hover transition-colors">
                <td className="px-3 py-3">
                  <div className="font-medium text-text-primary">{rep.name}</div>
                  <div className="text-xs text-text-muted">{rep.region}</div>
                </td>
                <td className="px-3 py-3 text-text-secondary">{rep.team}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColor(rep.attainment)}`}
                        style={{ width: `${Math.min(rep.attainment, 100)}%` }}
                      />
                    </div>
                    <span className="text-text-primary font-medium">{rep.attainment.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-text-primary">{formatCurrency(rep.bookings, true)}</td>
                <td className="px-3 py-3 text-text-secondary">{formatCurrency(rep.pipeline, true)}</td>
                <td className="px-3 py-3 text-text-primary">{formatPercent(rep.winRate)}</td>
                <td className="px-3 py-3">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusColor(rep.attainment)}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
