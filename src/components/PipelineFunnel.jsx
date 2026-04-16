import { useMemo } from 'react';
import { useFilters } from '../FilterContext';
import { formatCurrency, STAGE_ORDER, STAGE_COLORS } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold text-text-primary">{d.stage}</p>
      <p className="text-xs text-text-secondary mt-1">{d.count} deals</p>
      <p className="text-xs text-text-secondary">{formatCurrency(d.arr, true)} ARR</p>
      {d.convRate !== null && (
        <p className="text-xs mt-1" style={{ color: d.convDelta < -5 ? '#ef4444' : '#94a3b8' }}>
          {d.convRate.toFixed(1)}% conversion
          {d.convDelta !== null && ` (${d.convDelta > 0 ? '+' : ''}${d.convDelta.toFixed(1)}% vs avg)`}
        </p>
      )}
    </div>
  );
}

export default function PipelineFunnel() {
  const { opportunities, allOpportunities } = useFilters();

  const data = useMemo(() => {
    // Count deals at each stage (for current view)
    const stageCounts = {};
    STAGE_ORDER.forEach(s => { stageCounts[s] = { count: 0, arr: 0 }; });
    opportunities.forEach(o => {
      if (stageCounts[o.stage]) {
        stageCounts[o.stage].count++;
        stageCounts[o.stage].arr += o.arrValue;
      }
    });

    // Historical average conversion rates (all data)
    const allStageCounts = {};
    STAGE_ORDER.forEach(s => { allStageCounts[s] = 0; });
    allOpportunities.forEach(o => { allStageCounts[o.stage]++; });

    // Build funnel data
    return STAGE_ORDER.map((stage, i) => {
      const { count, arr } = stageCounts[stage];
      const prevCount = i > 0 ? stageCounts[STAGE_ORDER[i - 1]].count : null;
      const convRate = prevCount && prevCount > 0 ? (count / prevCount) * 100 : null;

      // Historical conv rate
      const allPrev = i > 0 ? allStageCounts[STAGE_ORDER[i - 1]] : null;
      const allConv = allPrev && allPrev > 0 ? (allStageCounts[stage] / allPrev) * 100 : null;
      const convDelta = convRate !== null && allConv !== null ? convRate - allConv : null;

      return { stage, count, arr, convRate, convDelta, fill: STAGE_COLORS[stage] };
    });
  }, [opportunities, allOpportunities]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Pipeline Funnel</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
            <YAxis type="category" dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="arr" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={entry.convDelta !== null && entry.convDelta < -5 ? 1 : 0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Conversion badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        {data.filter(d => d.convRate !== null).map(d => (
          <span key={d.stage} className={`text-xs px-2 py-1 rounded-md ${
            d.convDelta !== null && d.convDelta < -5
              ? 'bg-accent-red/15 text-accent-red'
              : 'bg-bg-hover text-text-secondary'
          }`}>
            {STAGE_ORDER[STAGE_ORDER.indexOf(d.stage) - 1]} → {d.stage}: {d.convRate?.toFixed(0)}%
            {d.convDelta !== null && d.convDelta < -5 && ' (below avg)'}
          </span>
        ))}
      </div>
    </div>
  );
}
