# Mantra4Change Program Intelligence

End-to-end program intelligence application for Mantra4Change PBL implementation data. Converts school-level CSV responses into decision support for monthly program reviews and grant-ready reporting.

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** MongoDB

## Features

### Tier 1 (implemented end-to-end)

1. **Program Review Filters** — month, district, block, grade, subject; all dashboard metrics update from filters
2. **Monthly Review Dashboard** — schools, participation, evidence, enrollment, attendance, MoM movement, 3-month trend
3. **District & Block Performance** — high/low performing geographies with composite scores
4. **Deterministic Risk Engine** — On Track ≥75%, Behind 60–74%, At Risk 35–59%, Critical <35%
5. **Grant Reporting Assistant** — grant/month selection, fact panel, finance, milestones, evidence, traceable narrative
6. **Review Preparation** — achievements, gaps, MoM changes, priority geographies, discussion points
7. **Recommended Actions** — 3–5 generated actions with owner, priority, due date, status, linked metric

## Project structure

```
mantra4change/
├── backend/          Express API + MongoDB models + analytics services
├── frontend/         React dashboard
├── csv/              Grant finance, performance, evidence index
├── csv_exports/      July–September 2025 PBL school responses
└── images/           Synthetic media assets referenced by evidence index
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/mantra4change`)

## Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run seed    # loads CSV data into MongoDB
npm run dev     # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Open **http://localhost:5173** for the application.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/program/filters` | Filter options |
| GET | `/api/program/dashboard` | KPIs, MoM, trend, risk |
| GET | `/api/program/geography` | District/block performance |
| GET | `/api/program/risk` | Risk classifications |
| GET | `/api/review/summary` | Review preparation summary |
| GET | `/api/review/actions` | Recommended actions |
| GET | `/api/grants/list` | Available grants |
| GET | `/api/grants/report` | Grant report with facts + narrative |

## Design notes

- **Deterministic intelligence:** All KPIs, risk labels, and review summaries are computed in code from ingested data — no AI required for core workflows.
- **Grant narrative:** Report text is assembled from computed facts. Set `USE_AI_NARRATIVE=true` in backend `.env` to wrap the deterministic narrative with an AI-enhanced prefix (still grounded in source facts).
- **Traceability:** Grant report preview lists every source fact used in the narrative.
- **Synthetic data:** All school codes, districts, donors, and media are synthetic assessment data.

## Risk thresholds

| Status | Range |
|--------|-------|
| On Track | ≥ 75% |
| Behind | 60% – 74.9% |
| At Risk | 35% – 59.9% |
| Critical | < 35% |
