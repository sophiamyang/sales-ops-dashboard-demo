# Sales Operations Dashboard

Interactive Sales Operations Dashboard for a B2B SaaS company, built with React, Recharts, and Tailwind CSS.

**[Live Demo](https://sophiamyang.github.io/sales-ops-dashboard-demo/)**

![Dashboard Screenshot](./screenshot.png)

## Overview

This dashboard helps a VP of Sales answer three questions at a glance:

1. **Are we hitting our number?** — KPI strip shows quarterly bookings vs. quota with trend sparklines
2. **Where is the pipeline healthy or leaking?** — Pipeline funnel, heatmap, and revenue trend charts
3. **Which reps and segments need attention?** — Rep leaderboard with sortable metrics and auto-generated insights

### The Story in the Data

The company is roughly on track overall (~85-95% quarterly attainment), but the dashboard surfaces clear weak spots:

- **EMEA Enterprise** pipeline coverage has dropped significantly — well below the 3x target
- **James O'Brien** (EMEA Enterprise, 1.3yr tenure) is struggling with low win rate and quota attainment
- **Proposal stage** is a bottleneck — deals are getting stuck before advancing to Negotiation
- **NA region** is the strongest performer, carrying the team

## Dashboard Components

| Component | Description |
|---|---|
| **KPI Strip** | Bookings vs. quota, pipeline coverage, avg deal size, win rate, sales cycle — with sparklines and deltas |
| **Pipeline Funnel** | Stage-by-stage conversion with deal count and ARR, highlighting conversion drops |
| **Revenue Trend** | Stacked bar of closed-won ARR by segment over 8 quarters with quota line overlay |
| **Rep Leaderboard** | Sortable table with attainment, bookings, pipeline, win rate, and status indicators |
| **Pipeline Heatmap** | Region x Segment matrix colored by coverage ratio (red/yellow/green) |
| **Insight Callouts** | Auto-generated text insights driven by the underlying data |
| **Filters** | Quarter, region, segment, and rep — all cross-filter every component |

## Mock Data Model

All data is stored as static JSON in `src/data/`:

- **`opportunities.json`** — ~565 opportunities across 8 quarters with: deal ID, account name, industry, region (NA/EMEA/APAC), segment (SMB/Mid-Market/Enterprise), ARR value, stage, rep owner, created/close dates, source
- **`reps.json`** — 12 sales reps with quotas, tenure, team assignments, and regions
- **`quarterly-actuals.json`** — 7 quarters of historical bookings vs. quota with region and segment breakdowns

Data is generated deterministically via `scripts/generate-data.mjs` with a seeded PRNG.

## Tech Stack

- **React 19** + **Vite 8** — fast dev and build
- **Recharts** — composable chart components
- **Tailwind CSS v4** — utility-first styling with custom dark theme
- **GitHub Pages** — static deployment via GitHub Actions

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Regenerate mock data
node scripts/generate-data.mjs
```

## Deployment

The project auto-deploys to GitHub Pages on push to `main` via the workflow in `.github/workflows/deploy.yml`.

To deploy manually:
1. Enable GitHub Pages in repo Settings → Pages → Source: GitHub Actions
2. Push to `main` or trigger the workflow manually

## Project Structure

```
├── .github/workflows/deploy.yml   # GitHub Pages deployment
├── scripts/generate-data.mjs      # Mock data generator
├── src/
│   ├── data/                      # Static JSON data files
│   │   ├── opportunities.json
│   │   ├── reps.json
│   │   └── quarterly-actuals.json
│   ├── components/
│   │   ├── FilterBar.jsx
│   │   ├── KPIStrip.jsx
│   │   ├── PipelineFunnel.jsx
│   │   ├── RevenueTrend.jsx
│   │   ├── RepLeaderboard.jsx
│   │   ├── PipelineHeatmap.jsx
│   │   └── InsightCallout.jsx
│   ├── FilterContext.jsx          # Cross-filter state management
│   ├── utils.js                   # Formatting helpers and constants
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  # Tailwind + custom theme
├── index.html
├── vite.config.js
└── package.json
```
