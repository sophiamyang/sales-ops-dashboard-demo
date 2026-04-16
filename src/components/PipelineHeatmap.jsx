import { useMemo } from 'react';
import { useFilters } from '../FilterContext';
import { formatCurrency, OPEN_STAGES, STAGE_WEIGHTS } from '../utils';

const REGIONS = ['NA', 'EMEA', 'APAC'];
const SEGMENTS = ['SMB', 'Mid-Market', 'Enterprise'];

function coverageColor(ratio) {
  if (ratio >= 3) return { bg: 'rgba(16, 185, 129, 0.25)', text: '#10b981', label: 'Strong' };
  if (ratio >= 2) return { bg: 'rgba(245, 158, 11, 0.25)', text: '#f59e0b', label: 'Adequate' };
  return { bg: 'rgba(239, 68, 68, 0.25)', text: '#ef4444', label: 'At Risk' };
}

export default function PipelineHeatmap() {
  const { opportunities, reps } = useFilters();

  const matrix = useMemo(() => {
    return REGIONS.map(region => {
      const cells = SEGMENTS.map(segment => {
        const opps = opportunities.filter(o => o.region === region && o.segment === segment);
        const open = opps.filter(o => OPEN_STAGES.includes(o.stage));
        const won = opps.filter(o => o.stage === 'Closed Won');

        const openPipeline = open.reduce((s, o) => s + o.arrValue, 0);
        const weightedPipeline = open.reduce((s, o) => s + o.arrValue * (STAGE_WEIGHTS[o.stage] || 0.5), 0);
        const bookings = won.reduce((s, o) => s + o.arrValue, 0);

        // Quota for this region+segment
        const matchingReps = reps.filter(r => r.region === region && r.team === segment);
        const quota = matchingReps.reduce((s, r) => s + r.quarterlyQuota, 0);
        const remaining = Math.max(quota - bookings, 0);
        const coverage = remaining > 0 ? openPipeline / remaining : openPipeline > 0 ? 10 : 0;

        return {
          region, segment,
          pipeline: openPipeline,
          weighted: weightedPipeline,
          coverage,
          dealCount: open.length,
          quota,
          bookings,
        };
      });
      return { region, cells };
    });
  }, [opportunities, reps]);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Pipeline Health Heatmap</h3>
      <p className="text-xs text-text-muted mb-4">Region x Segment — colored by pipeline coverage ratio</p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2 w-20"></th>
              {SEGMENTS.map(s => (
                <th key={s} className="text-center text-xs font-medium text-text-muted uppercase tracking-wider px-3 py-2">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(row => (
              <tr key={row.region}>
                <td className="text-sm font-medium text-text-secondary px-3 py-2">{row.region}</td>
                {row.cells.map(cell => {
                  const c = coverageColor(cell.coverage);
                  return (
                    <td key={cell.segment} className="px-2 py-2">
                      <div
                        className="rounded-lg p-3 text-center transition-all hover:scale-[1.02] cursor-default group relative"
                        style={{ backgroundColor: c.bg }}
                      >
                        <div className="text-lg font-bold" style={{ color: c.text }}>
                          {cell.coverage.toFixed(1)}x
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {formatCurrency(cell.pipeline, true)}
                        </div>
                        <div className="text-xs text-text-muted">
                          {cell.dealCount} deals
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48">
                          <div className="bg-bg-secondary border border-border rounded-lg p-3 shadow-xl text-left">
                            <p className="text-xs font-semibold text-text-primary">{cell.region} {cell.segment}</p>
                            <p className="text-xs text-text-secondary mt-1">Pipeline: {formatCurrency(cell.pipeline, true)}</p>
                            <p className="text-xs text-text-secondary">Weighted: {formatCurrency(cell.weighted, true)}</p>
                            <p className="text-xs text-text-secondary">Quota: {formatCurrency(cell.quota, true)}</p>
                            <p className="text-xs text-text-secondary">Booked: {formatCurrency(cell.bookings, true)}</p>
                            <p className="text-xs font-medium mt-1" style={{ color: c.text }}>{c.label}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.4)' }} />
          {'<'}2x (At Risk)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.4)' }} />
          2-3x (Adequate)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.4)' }} />
          {'>'}3x (Strong)
        </span>
      </div>
    </div>
  );
}
