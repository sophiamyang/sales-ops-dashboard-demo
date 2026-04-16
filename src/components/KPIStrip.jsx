import { useMemo } from 'react';
import { useFilters } from '../FilterContext';
import { formatCurrency, formatPercent, OPEN_STAGES, STAGE_WEIGHTS } from '../utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function KPICard({ title, value, subtitle, delta, sparkData, sparkColor }) {
  const isPositive = delta > 0;
  const deltaColor = isPositive ? 'text-accent-green' : delta < 0 ? 'text-accent-red' : 'text-text-muted';
  const arrow = isPositive ? 'up' : delta < 0 ? 'down' : '';

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-2 hover:border-border/80 transition-colors min-w-0">
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xl font-bold text-text-primary truncate">{value}</div>
          {subtitle && <div className="text-xs text-text-secondary mt-1">{subtitle}</div>}
          {delta !== undefined && delta !== null && (
            <div className={`text-xs font-medium mt-1 ${deltaColor}`}>
              {arrow === 'up' ? '\u25B2' : arrow === 'down' ? '\u25BC' : '\u2014'} {Math.abs(delta).toFixed(1)}% vs prev Q
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <div className="w-20 h-10 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke={sparkColor || '#3b82f6'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KPIStrip() {
  const { opportunities, quarterlyActuals, reps, currentQuarter, allOpportunities } = useFilters();

  const kpis = useMemo(() => {
    const won = opportunities.filter(o => o.stage === 'Closed Won');
    const lost = opportunities.filter(o => o.stage === 'Closed Lost');
    const open = opportunities.filter(o => OPEN_STAGES.includes(o.stage));

    // Bookings
    const bookings = won.reduce((s, o) => s + o.arrValue, 0);

    // Quota (sum of rep quotas for the filtered set)
    const repIds = [...new Set(opportunities.map(o => o.repId))];
    const quota = reps.filter(r => repIds.includes(r.id)).reduce((s, r) => s + r.quarterlyQuota, 0);
    const pctToGoal = quota > 0 ? (bookings / quota) * 100 : 0;

    // Pipeline coverage = open pipeline / remaining quota
    const openPipeline = open.reduce((s, o) => s + o.arrValue, 0);
    const weightedPipeline = open.reduce((s, o) => s + o.arrValue * (STAGE_WEIGHTS[o.stage] || 0.5), 0);
    const remaining = Math.max(quota - bookings, 0);
    const coverage = remaining > 0 ? openPipeline / remaining : openPipeline > 0 ? 999 : 0;

    // Avg deal size (won)
    const avgDeal = won.length > 0 ? bookings / won.length : 0;

    // Win rate
    const closedTotal = won.length + lost.length;
    const winRate = closedTotal > 0 ? (won.length / closedTotal) * 100 : 0;

    // Sales cycle (avg days for won deals)
    const cycles = won.filter(o => o.closeDate && o.createdDate).map(o => {
      return (new Date(o.closeDate) - new Date(o.createdDate)) / 86400000;
    });
    const avgCycle = cycles.length > 0 ? cycles.reduce((s, d) => s + d, 0) / cycles.length : 0;

    // Sparklines from quarterly actuals
    const bookingsSpark = quarterlyActuals.map(q => ({ v: q.totalBookings }));
    const winRateSpark = quarterlyActuals.map(q => {
      const qOpps = allOpportunities.filter(o => o.quarter === q.quarter);
      const qWon = qOpps.filter(o => o.stage === 'Closed Won').length;
      const qClosed = qOpps.filter(o => o.stage.startsWith('Closed')).length;
      return { v: qClosed > 0 ? (qWon / qClosed) * 100 : 0 };
    });
    const avgDealSpark = quarterlyActuals.map(q => {
      const qWon = allOpportunities.filter(o => o.quarter === q.quarter && o.stage === 'Closed Won');
      const total = qWon.reduce((s, o) => s + o.arrValue, 0);
      return { v: qWon.length > 0 ? total / qWon.length : 0 };
    });
    const cycleSpark = quarterlyActuals.map(q => {
      const qWon = allOpportunities.filter(o => o.quarter === q.quarter && o.stage === 'Closed Won' && o.closeDate && o.createdDate);
      const days = qWon.map(o => (new Date(o.closeDate) - new Date(o.createdDate)) / 86400000);
      return { v: days.length > 0 ? days.reduce((s, d) => s + d, 0) / days.length : 0 };
    });

    // Period-over-period deltas
    const prevQ = quarterlyActuals.length >= 2 ? quarterlyActuals[quarterlyActuals.length - 1] : null;
    const prevPrevQ = quarterlyActuals.length >= 3 ? quarterlyActuals[quarterlyActuals.length - 2] : null;

    let bookingsDelta = null;
    if (prevQ && prevPrevQ) {
      bookingsDelta = prevPrevQ.totalBookings > 0
        ? ((prevQ.totalBookings - prevPrevQ.totalBookings) / prevPrevQ.totalBookings) * 100
        : 0;
    }

    let winRateDelta = null;
    if (winRateSpark.length >= 2) {
      const curr = winRateSpark[winRateSpark.length - 1].v;
      const prev = winRateSpark[winRateSpark.length - 2].v;
      winRateDelta = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
    }

    return {
      bookings, quota, pctToGoal, coverage, avgDeal, winRate, avgCycle,
      bookingsSpark, winRateSpark, avgDealSpark, cycleSpark,
      bookingsDelta, winRateDelta,
    };
  }, [opportunities, quarterlyActuals, reps, allOpportunities]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="Quarterly Bookings"
        value={formatCurrency(kpis.bookings, true)}
        subtitle={`${kpis.pctToGoal.toFixed(0)}% of ${formatCurrency(kpis.quota, true)} quota`}
        delta={kpis.bookingsDelta}
        sparkData={kpis.bookingsSpark}
        sparkColor={kpis.pctToGoal >= 80 ? '#10b981' : '#ef4444'}
      />
      <KPICard
        title="Pipeline Coverage"
        value={`${kpis.coverage.toFixed(1)}x`}
        subtitle="Open pipeline / remaining quota"
        sparkData={[]}
        sparkColor="#3b82f6"
      />
      <KPICard
        title="Avg Deal Size"
        value={formatCurrency(kpis.avgDeal, true)}
        subtitle="Closed-won deals"
        sparkData={kpis.avgDealSpark}
        sparkColor="#8b5cf6"
      />
      <KPICard
        title="Win Rate"
        value={formatPercent(kpis.winRate)}
        subtitle="Won / (Won + Lost)"
        delta={kpis.winRateDelta}
        sparkData={kpis.winRateSpark}
        sparkColor={kpis.winRate >= 30 ? '#10b981' : '#ef4444'}
      />
      <KPICard
        title="Avg Sales Cycle"
        value={`${Math.round(kpis.avgCycle)} days`}
        subtitle="Created to close (won)"
        sparkData={kpis.cycleSpark}
        sparkColor="#06b6d4"
      />
    </div>
  );
}
