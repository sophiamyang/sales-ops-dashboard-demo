import { useFilters } from '../FilterContext';

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar() {
  const {
    allQuarters, reps,
    selectedQuarter, setSelectedQuarter,
    selectedRegion, setSelectedRegion,
    selectedSegment, setSelectedSegment,
    selectedRep, setSelectedRep,
  } = useFilters();

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-bg-secondary rounded-xl border border-border">
      <Select
        label="Quarter"
        value={selectedQuarter}
        onChange={setSelectedQuarter}
        options={[{ value: 'All', label: 'All Quarters' }, ...allQuarters.map(q => ({ value: q, label: q }))]}
      />
      <Select
        label="Region"
        value={selectedRegion}
        onChange={setSelectedRegion}
        options={[
          { value: 'All', label: 'All Regions' },
          { value: 'NA', label: 'NA' },
          { value: 'EMEA', label: 'EMEA' },
          { value: 'APAC', label: 'APAC' },
        ]}
      />
      <Select
        label="Segment"
        value={selectedSegment}
        onChange={setSelectedSegment}
        options={[
          { value: 'All', label: 'All Segments' },
          { value: 'SMB', label: 'SMB' },
          { value: 'Mid-Market', label: 'Mid-Market' },
          { value: 'Enterprise', label: 'Enterprise' },
        ]}
      />
      <Select
        label="Rep"
        value={selectedRep}
        onChange={setSelectedRep}
        options={[
          { value: 'All', label: 'All Reps' },
          ...reps.map(r => ({ value: r.id, label: r.name })),
        ]}
      />
      {(selectedQuarter !== 'Q2 2025' || selectedRegion !== 'All' || selectedSegment !== 'All' || selectedRep !== 'All') && (
        <button
          onClick={() => {
            setSelectedQuarter('Q2 2025');
            setSelectedRegion('All');
            setSelectedSegment('All');
            setSelectedRep('All');
          }}
          className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors px-3 py-2"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
