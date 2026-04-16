export function formatCurrency(value, compact = false) {
  if (compact) {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

export const STAGE_ORDER = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
export const OPEN_STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];

export const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  orange: '#f97316',
  pink: '#ec4899',
};

export const SEGMENT_COLORS = {
  'SMB': COLORS.cyan,
  'Mid-Market': COLORS.blue,
  'Enterprise': COLORS.purple,
};

export const REGION_COLORS = {
  'NA': COLORS.blue,
  'EMEA': COLORS.purple,
  'APAC': COLORS.cyan,
};

export const STAGE_COLORS = {
  'Prospecting': '#64748b',
  'Qualification': '#3b82f6',
  'Proposal': '#8b5cf6',
  'Negotiation': '#f59e0b',
  'Closed Won': '#10b981',
  'Closed Lost': '#ef4444',
};

// Stage weights for weighted pipeline
export const STAGE_WEIGHTS = {
  'Prospecting': 0.1,
  'Qualification': 0.25,
  'Proposal': 0.5,
  'Negotiation': 0.75,
};
