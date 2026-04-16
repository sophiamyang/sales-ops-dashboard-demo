import { createContext, useContext, useState, useMemo } from 'react';
import opportunities from './data/opportunities.json';
import reps from './data/reps.json';
import quarterlyActuals from './data/quarterly-actuals.json';

const FilterContext = createContext();

const ALL_QUARTERS = [...new Set(opportunities.map(o => o.quarter))].sort();
const CURRENT_QUARTER = 'Q2 2025';

export function FilterProvider({ children }) {
  const [selectedQuarter, setSelectedQuarter] = useState(CURRENT_QUARTER);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedRep, setSelectedRep] = useState('All');

  const filtered = useMemo(() => {
    let result = opportunities;
    if (selectedQuarter !== 'All') result = result.filter(o => o.quarter === selectedQuarter);
    if (selectedRegion !== 'All') result = result.filter(o => o.region === selectedRegion);
    if (selectedSegment !== 'All') result = result.filter(o => o.segment === selectedSegment);
    if (selectedRep !== 'All') result = result.filter(o => o.repId === selectedRep);
    return result;
  }, [selectedQuarter, selectedRegion, selectedSegment, selectedRep]);

  const value = {
    opportunities: filtered,
    allOpportunities: opportunities,
    reps,
    quarterlyActuals,
    allQuarters: ALL_QUARTERS,
    currentQuarter: CURRENT_QUARTER,
    selectedQuarter, setSelectedQuarter,
    selectedRegion, setSelectedRegion,
    selectedSegment, setSelectedSegment,
    selectedRep, setSelectedRep,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  return useContext(FilterContext);
}
