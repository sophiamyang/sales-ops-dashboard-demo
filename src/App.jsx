import { FilterProvider } from './FilterContext';
import FilterBar from './components/FilterBar';
import KPIStrip from './components/KPIStrip';
import PipelineFunnel from './components/PipelineFunnel';
import RevenueTrend from './components/RevenueTrend';
import RepLeaderboard from './components/RepLeaderboard';
import PipelineHeatmap from './components/PipelineHeatmap';
import InsightCallout from './components/InsightCallout';

function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen bg-bg-primary">
        {/* Header */}
        <header className="border-b border-border bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">Sales Operations Dashboard</h1>
              <p className="text-xs text-text-muted mt-0.5">B2B SaaS — Executive Readout</p>
            </div>
            <div className="text-xs text-text-muted">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
          {/* Filters */}
          <FilterBar />

          {/* KPI Strip */}
          <KPIStrip />

          {/* Insight Callouts */}
          <InsightCallout />

          {/* Charts — 2 column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineFunnel />
            <RevenueTrend />
          </div>

          {/* Heatmap + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineHeatmap />
            <RepLeaderboard />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-6">
          <div className="max-w-[1440px] mx-auto px-6 text-center text-xs text-text-muted">
            Demo dashboard with synthetic data — built with React, Recharts, and Tailwind CSS
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}

export default App;
