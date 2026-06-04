# Reporting Agent V2

A lightweight reporting agent that ingests CSV exports from platforms (CleverTap, MoEngage), normalizes and cleans the data, and generates reports/templates via a web dashboard.

## Repository Layout
- `Backend/` — Python FastAPI backend (API endpoints, importers, data cleaning)
- `Frontend/` — React + TypeScript + Vite frontend (dashboard, upload, previews)

## Quick start

Prerequisites: Python 3.11+, Node.js 18+, pnpm or npm, Git

1. Start the backend API

```bash
cd Backend
python -m pip install -r requirements.txt   # if requirements exists
# dev: run with uvicorn
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend

```bash
cd Frontend
pnpm install   # or `npm install`
pnpm run dev   # or `npm run dev`
```

3. Open the app in the browser

Navigate to `http://localhost:5173` (Vite default). The frontend proxies API calls to `http://localhost:8000`.

## Build for production

Frontend:
```bash
cd Frontend
pnpm run build   # or `npm run build`
```

Backend: package/deploy as needed

## Notes
- A responsive dashboard redesign was merged into `main` on branch `dashboard-redesign`.
- If you need to remove or ignore local data files, update `.gitignore` at the repo root.

## Contributing
- Create a branch, implement changes, open a pull request.
