# FinPilot AI Frontend

Modern fintech UI built with React, TypeScript, and SCSS Modules.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- React Router v7
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios (withCredentials)
- Recharts
- SCSS Modules

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173` — API proxied to `http://localhost:5000`.

## Pages

| Route | Feature |
|-------|---------|
| `/login`, `/register` | Authentication (+ optional 2FA) |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/verify-email` | Email verification |
| `/dashboard` | Main dashboard with charts |
| `/profiles` | Multi-profile management |
| `/income`, `/expenses` | Financial tracking + analytics |
| `/investments`, `/goals` | Wealth & planning |
| `/debts` | Loans & debt tracking |
| `/budgets` | Category budgets & alerts |
| `/recurring` | Recurring bill schedule |
| `/family` | Combined family dashboard |
| `/payslips` | AI payslip extraction |
| `/health` | Financial health score + history |
| `/coach` | AI financial coach (conversation history) |
| `/simulator` | Scenario simulator |
| `/insights` | Monthly AI insights (month picker) |
| `/settings` | Account, 2FA, CSV import/export |

## Deployment (Vercel)

See the full guide: [DEPLOY.md](../DEPLOY.md)

- Build: `npm run build` · Output: `dist`
- SPA rewrites: `vercel.json`
- Set **build-time** env: `VITE_API_URL=https://<render-host>/api/v1`
- Put the Vercel URL into the backend `CLIENT_URL`

## Design

- Primary: `#2563EB`
- Secondary: `#10B981`
- Background: `#F8FAFC`
- Responsive: desktop, tablet, mobile
