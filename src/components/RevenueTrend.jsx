import { useMemo } from 'react';
import { useFilters } from '../FilterContext';
import { formatCurrency, SEGMENT_COLORS } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
}

export default function RevenueTrend() {
  const { quarterlyActuals, allOpportunities, reps, selectedRegion, selectedSegment, selectedRep } = useFilters();

  const data = useMemo(() => {
    // Recompute from allOpportunities to respect region/segment/rep filters
    const quarters = [...new Set(allOpportunities.map(o => o.quarter))].sort();

    return quarters.map(q => {
      let qOpps = allOpportunities.filter(o => o.quarter === q && o.stage === 'Closed Won');
      if (selectedRegion !== 'All') qOpps = qOpps.filter(o => o.region === selectedRegion);
      if (selectedSegment !== 'All') qOpps = qOpps.filter(o => o.segment === selectedSegment);
      if (selectedRep !== 'All') qOpps = qOpps.filter(o => o.repId === selectedRep);

      const smb = qOpps.filter(o => o.segment === 'SMB').reduce((s, o) => s + o.arrValue, 0);
      const mm = qOpps.filter(o => o.segment === 'Mid-Market').reduce((s, o) => s + o.arrValue, 0);
      const ent = qOpps.filter(o => o.segment === 'Enterprise').reduce((s, o) => s + o.arrValue, 0);

      // Quota line
      let quota;
      if (selectedRep !== 'All') {
        const rep = reps.find(r => r.id === selectedRep);
        quota = rep ? rep.quarterlyQuota : 0;
      } else {
        let filteredReps = reps;
        if (selectedRegion !== 'All') filteredReps = filteredReps.filter(r => r.region === selectedRegion);
        if (selectedSegment !== 'All') filteredReps = filteredReps.filter(r => r.team === selectedSegment);
        quota = filteredReps.reduce((s, r) => s + r.quarterlyQuota, 0);
      }

      return { quarter: q, SMB: smb, 'Mid-Market': mm, Enterprise: ent, Quota: quota };
    });
  }, [allOpportunities, reps, selectedRegion, selectedSegment, selectedRep]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue Trend — Closed Won ARR by Segment</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Bar dataKey="SMB" stackId="a" fill={SEGMENT_COLORS.SMB} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Mid-Market" stackId="a" fill={SEGMENT_COLORS['Mid-Market']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Enterprise" stackId="a" fill={SEGMENT_COLORS.Enterprise} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Quota" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
