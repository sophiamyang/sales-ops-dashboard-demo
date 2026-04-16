import { useMemo } from 'react';
import { useFilters } from '../FilterContext';
import { formatCurrency, OPEN_STAGES, STAGE_WEIGHTS } from '../utils';

export default function InsightCallout() {
  const { opportunities, allOpportunities, reps, quarterlyActuals } = useFilters();

  const insights = useMemo(() => {
    const result = [];

    // 1. EMEA Enterprise pipeline coverage
    const emeaEntOpen = opportunities.filter(o => o.region === 'EMEA' && o.segment === 'Enterprise' && OPEN_STAGES.includes(o.stage));
    const emeaEntWon = opportunities.filter(o => o.region === 'EMEA' && o.segment === 'Enterprise' && o.stage === 'Closed Won');
    const emeaEntPipeline = emeaEntOpen.reduce((s, o) => s + o.arrValue, 0);
    const emeaEntBookings = emeaEntWon.reduce((s, o) => s + o.arrValue, 0);
    const emeaEntReps = reps.filter(r => r.region === 'EMEA' && r.team === 'Enterprise');
    const emeaEntQuota = emeaEntReps.reduce((s, r) => s + r.quarterlyQuota, 0);
    const emeaEntRemaining = Math.max(emeaEntQuota - emeaEntBookings, 0);
    const emeaEntCoverage = emeaEntRemaining > 0 ? emeaEntPipeline / emeaEntRemaining : 0;

    // Compare to previous quarter
    if (quarterlyActuals.length >= 2) {
      const prevQ = quarterlyActuals[quarterlyActuals.length - 1];
      const prevEmeaEnt = prevQ.byRegion?.EMEA || 0;
      const prevCoverage = emeaEntQuota > 0 ? (prevEmeaEnt / emeaEntQuota) : 0;

      if (emeaEntCoverage < 2.5) {
        result.push({
          type: 'warning',
          text: `EMEA Enterprise pipeline coverage is at ${emeaEntCoverage.toFixed(1)}x this quarter — well below the 3x target. Only ${formatCurrency(emeaEntPipeline, true)} in open pipeline against ${formatCurrency(emeaEntRemaining, true)} remaining quota.`,
        });
      }
    }

    // 2. Struggling rep
    const repStats = reps.map(rep => {
      const repOpps = opportunities.filter(o => o.repId === rep.id);
      const won = repOpps.filter(o => o.stage === 'Closed Won');
      const lost = repOpps.filter(o => o.stage === 'Closed Lost');
      const bookings = won.reduce((s, o) => s + o.arrValue, 0);
      const closedCount = won.length + lost.length;
      const winRate = closedCount > 0 ? (won.length / closedCount) * 100 : 0;
      const attainment = rep.quarterlyQuota > 0 ? (bookings / rep.quarterlyQuota) * 100 : 0;
      return { ...rep, bookings, winRate, attainment };
    });

    const struggling = repStats.filter(r => r.attainment < 50 && r.winRate < 25);
    if (struggling.length > 0) {
      const worst = struggling.sort((a, b) => a.attainment - b.attainment)[0];
      result.push({
        type: 'alert',
        text: `${worst.name} (${worst.region} ${worst.team}) is at ${worst.attainment.toFixed(0)}% quota attainment with a ${worst.winRate.toFixed(0)}% win rate. Tenure: ${worst.tenure} years — may need coaching or pipeline support.`,
      });
    }

    // 3. Proposal stage bottleneck
    const proposalCount = opportunities.filter(o => o.stage === 'Proposal').length;
    const negotiationCount = opportunities.filter(o => o.stage === 'Negotiation').length;
    if (proposalCount > 0 && negotiationCount > 0 && proposalCount > negotiationCount * 1.5) {
      const proposalArr = opportunities.filter(o => o.stage === 'Proposal').reduce((s, o) => s + o.arrValue, 0);
      result.push({
        type: 'info',
        text: `${proposalCount} deals (${formatCurrency(proposalArr, true)}) are stuck in Proposal stage — ${(proposalCount / (proposalCount + negotiationCount) * 100).toFixed(0)}% of mid-funnel deals. Consider reviewing proposal turnaround times.`,
      });
    }

    // 4. Positive insight
    const naWon = opportunities.filter(o => o.region === 'NA' && o.stage === 'Closed Won');
    const naBookings = naWon.reduce((s, o) => s + o.arrValue, 0);
    const naReps = reps.filter(r => r.region === 'NA');
    const naQuota = naReps.reduce((s, r) => s + r.quarterlyQuota, 0);
    const naAttainment = naQuota > 0 ? (naBookings / naQuota) * 100 : 0;
    if (naAttainment > 60) {
      result.push({
        type: 'success',
        text: `NA region is leading at ${naAttainment.toFixed(0)}% quota attainment with ${formatCurrency(naBookings, true)} booked. Strong performance from the Enterprise and Mid-Market teams.`,
      });
    }

    return result.length > 0 ? result : [{ type: 'info', text: 'All metrics are within normal ranges for this quarter.' }];
  }, [opportunities, reps, quarterlyActuals]);

  const iconMap = {
    warning: { bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30', icon: '!', iconBg: 'bg-accent-yellow' },
    alert: { bg: 'bg-accent-red/10', border: 'border-accent-red/30', icon: '!!', iconBg: 'bg-accent-red' },
    info: { bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', icon: 'i', iconBg: 'bg-accent-blue' },
    success: { bg: 'bg-accent-green/10', border: 'border-accent-green/30', icon: '+', iconBg: 'bg-accent-green' },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">AI Insights</h3>
      {insights.map((insight, i) => {
        const style = iconMap[insight.type];
        return (
          <div key={i} className={`${style.bg} border ${style.border} rounded-xl p-4 flex items-start gap-3`}>
            <span className={`${style.iconBg} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
              {style.icon}
            </span>
            <p className="text-sm text-text-primary leading-relaxed">{insight.text}</p>
          </div>
        );
      })}
    </div>
  );
}
