import { writeFileSync, readFileSync } from 'fs';

const STAGES_OPEN = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];
const SOURCES = ['Inbound', 'Outbound', 'Partner', 'Event'];
const INDUSTRIES = ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail', 'Media & Entertainment', 'Education', 'Professional Services'];

const ACCOUNTS = [
  'Apex Dynamics', 'BlueShift Analytics', 'Cascade Systems', 'DataForge Inc', 'Elevate Corp',
  'Frontier Labs', 'GreenPath Solutions', 'Horizon Digital', 'Ignite Platforms', 'Jetstream AI',
  'Keystone Group', 'Luminary Tech', 'Meridian Software', 'NovaBridge', 'Optimus Networks',
  'Pinnacle Health', 'Quantum Edge', 'Ridgeline Partners', 'Stellar Dynamics', 'TrueNorth Systems',
  'Unified Data Co', 'Vertex Solutions', 'Wavelength Inc', 'Xenith Corp', 'Zenith Global',
  'AlphaWave', 'BrightPath', 'CoreSync', 'DeepField', 'EchoPoint',
  'FluxMedia', 'GridIron Tech', 'HyperScale', 'InnoVault', 'JunctionAI',
  'KineticOps', 'LatticeWorks', 'MosaicData', 'NexGen Health', 'OmniLayer',
  'PulsePoint', 'QuickSilver', 'ReachOut', 'SynapseIO', 'TerraForm Digital',
  'UpLink Systems', 'VantagePoint', 'WarpDrive', 'XcelRate', 'YieldMax',
  'ArcLight', 'BoltShift', 'ClearView', 'DriftNet', 'EdgeWise',
  'FocalPoint', 'GlideOps', 'HaloTech', 'IronClad', 'JoltEnergy',
  'KernelSoft', 'LeapFrog AI', 'MintBridge', 'NodeStar', 'OrbitX',
  'PrismWorks', 'QueueLogic', 'RippleEffect', 'ScaleUp', 'TidalWave',
  'UltraNet', 'VibeSync', 'WindsorTech', 'XpandAI', 'ZephyrCloud'
];

const repConfigs = [
  { id: 'rep-01', region: 'NA', segment: 'Enterprise', winRate: 0.42, dealRange: [80000, 200000] },
  { id: 'rep-02', region: 'NA', segment: 'Enterprise', winRate: 0.37, dealRange: [70000, 180000] },
  { id: 'rep-03', region: 'EMEA', segment: 'Enterprise', winRate: 0.33, dealRange: [65000, 170000] },
  { id: 'rep-04', region: 'EMEA', segment: 'Enterprise', winRate: 0.18, dealRange: [60000, 150000] },
  { id: 'rep-05', region: 'NA', segment: 'Mid-Market', winRate: 0.40, dealRange: [30000, 75000] },
  { id: 'rep-06', region: 'NA', segment: 'Mid-Market', winRate: 0.35, dealRange: [28000, 70000] },
  { id: 'rep-07', region: 'EMEA', segment: 'Mid-Market', winRate: 0.32, dealRange: [25000, 65000] },
  { id: 'rep-08', region: 'APAC', segment: 'Mid-Market', winRate: 0.30, dealRange: [22000, 60000] },
  { id: 'rep-09', region: 'NA', segment: 'SMB', winRate: 0.48, dealRange: [10000, 35000] },
  { id: 'rep-10', region: 'APAC', segment: 'SMB', winRate: 0.38, dealRange: [8000, 30000] },
  { id: 'rep-11', region: 'NA', segment: 'SMB', winRate: 0.25, dealRange: [9000, 32000] },
  { id: 'rep-12', region: 'APAC', segment: 'Enterprise', winRate: 0.28, dealRange: [60000, 160000] },
];

const QUARTERS = [
  { label: 'Q3 2023', start: '2023-07-01', end: '2023-09-30' },
  { label: 'Q4 2023', start: '2023-10-01', end: '2023-12-31' },
  { label: 'Q1 2024', start: '2024-01-01', end: '2024-03-31' },
  { label: 'Q2 2024', start: '2024-04-01', end: '2024-06-30' },
  { label: 'Q3 2024', start: '2024-07-01', end: '2024-09-30' },
  { label: 'Q4 2024', start: '2024-10-01', end: '2024-12-31' },
  { label: 'Q1 2025', start: '2025-01-01', end: '2025-03-31' },
  { label: 'Q2 2025', start: '2025-04-01', end: '2025-06-30' },
];

// Mulberry32 PRNG
let seed = 42;
function rand() {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randBetween(min, max) { return min + rand() * (max - min); }
function randDate(start, end) {
  const s = new Date(start).getTime(), e = new Date(end).getTime();
  return new Date(s + rand() * (e - s)).toISOString().split('T')[0];
}

const repsList = JSON.parse(readFileSync('src/data/reps.json', 'utf-8'));
const opps = [];
let dealId = 1;

// Quarter-level modifiers for the story
// Company is growing, roughly on track. EMEA Enterprise drops in recent Qs.
const quarterMods = {
  'Q3 2023': { global: 1.0 },
  'Q4 2023': { global: 1.05 },
  'Q1 2024': { global: 0.95 },
  'Q2 2024': { global: 1.0 },
  'Q3 2024': { global: 1.02 },
  'Q4 2024': { global: 1.0, emeaEntMod: 0.5 },  // EMEA Enterprise starts dropping
  'Q1 2025': { global: 1.03, emeaEntMod: 0.45 }, // Continues
  'Q2 2025': { global: 1.0, emeaEntMod: 0.4 },   // Current Q, worst
};

for (const quarter of QUARTERS) {
  const isCurrentQ = quarter.label === 'Q2 2025';
  const mod = quarterMods[quarter.label];

  for (const rep of repConfigs) {
    // Deals per rep per quarter
    let dealCount;
    if (rep.segment === 'SMB') dealCount = Math.floor(randBetween(7, 10));
    else if (rep.segment === 'Mid-Market') dealCount = Math.floor(randBetween(5, 8));
    else dealCount = Math.floor(randBetween(4, 6));

    // Effective win rate
    let winRate = rep.winRate * mod.global;
    if (rep.region === 'EMEA' && rep.segment === 'Enterprise' && mod.emeaEntMod) {
      winRate = rep.winRate * mod.emeaEntMod;
    }

    for (let i = 0; i < dealCount; i++) {
      const arrValue = Math.round(randBetween(rep.dealRange[0], rep.dealRange[1]) / 1000) * 1000;
      const createdDate = randDate(quarter.start, quarter.end);

      let stage;
      if (!isCurrentQ) {
        // All past deals are closed
        stage = rand() < winRate ? 'Closed Won' : 'Closed Lost';
      } else {
        // Current quarter: ~48% still open, rest closed
        const r = rand();
        if (r < 0.10) stage = 'Prospecting';
        else if (r < 0.20) stage = 'Qualification';
        else if (r < 0.36) stage = 'Proposal';     // Bottleneck
        else if (r < 0.48) stage = 'Negotiation';
        else {
          stage = rand() < winRate ? 'Closed Won' : 'Closed Lost';
        }
      }

      const cycleDays = rep.segment === 'Enterprise' ? Math.floor(randBetween(55, 110))
        : rep.segment === 'Mid-Market' ? Math.floor(randBetween(28, 65))
        : Math.floor(randBetween(14, 40));

      const closeDate = stage.startsWith('Closed')
        ? new Date(new Date(createdDate).getTime() + cycleDays * 86400000).toISOString().split('T')[0]
        : null;

      opps.push({
        dealId: `DEAL-${String(dealId).padStart(4, '0')}`,
        accountName: pick(ACCOUNTS),
        industry: pick(INDUSTRIES),
        region: rep.region,
        segment: rep.segment,
        arrValue,
        stage,
        repId: rep.id,
        createdDate,
        closeDate,
        source: pick(SOURCES),
        quarter: quarter.label,
      });
      dealId++;
    }
  }
}

// Generate quarterly actuals
const totalQuota = repsList.reduce((s, r) => s + r.quarterlyQuota, 0);
const quarterlyActuals = QUARTERS.filter(q => q.label !== 'Q2 2025').map(q => {
  const qWon = opps.filter(o => o.quarter === q.label && o.stage === 'Closed Won');
  const totalBookings = qWon.reduce((s, o) => s + o.arrValue, 0);
  const byRegion = {};
  ['NA', 'EMEA', 'APAC'].forEach(r => {
    byRegion[r] = qWon.filter(o => o.region === r).reduce((s, o) => s + o.arrValue, 0);
  });
  const bySegment = {};
  ['SMB', 'Mid-Market', 'Enterprise'].forEach(seg => {
    bySegment[seg] = qWon.filter(o => o.segment === seg).reduce((s, o) => s + o.arrValue, 0);
  });
  return { quarter: q.label, totalBookings, totalQuota, attainment: Math.round(totalBookings / totalQuota * 100), byRegion, bySegment };
});

writeFileSync('src/data/opportunities.json', JSON.stringify(opps, null, 2));
writeFileSync('src/data/quarterly-actuals.json', JSON.stringify(quarterlyActuals, null, 2));

console.log(`Generated ${opps.length} opportunities`);
console.log(`Generated ${quarterlyActuals.length} quarterly actuals`);

const stages = {};
opps.forEach(o => { stages[o.stage] = (stages[o.stage] || 0) + 1; });
console.log('Stage distribution:', stages);

const currentQ = opps.filter(o => o.quarter === 'Q2 2025');
const cs = {};
currentQ.forEach(o => { cs[o.stage] = (cs[o.stage] || 0) + 1; });
console.log('Current Q stages:', cs);

quarterlyActuals.forEach(q => console.log(q.quarter, `${(q.totalBookings/1000).toFixed(0)}K / ${(q.totalQuota/1000).toFixed(0)}K = ${q.attainment}%`));

const emeaEnt = opps.filter(o => o.region === 'EMEA' && o.segment === 'Enterprise');
const ew = emeaEnt.filter(o => o.stage === 'Closed Won').length;
const el = emeaEnt.filter(o => o.stage === 'Closed Lost').length;
console.log(`EMEA Enterprise win rate: ${(ew/(ew+el)*100).toFixed(1)}% (${ew}W/${el}L)`);
