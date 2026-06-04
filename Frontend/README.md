
# Frontend

React/Vite frontend for the reporting agent.

## Responsibilities

- Upload CSV files through the backend API
- Display raw and cleaned data previews
- Select platform, channels, and templates
- Trigger CSV/XLSX report downloads
- Provide the template designer UI

## Run

From this folder:

```powershell
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

API calls use `/api` by default and are proxied to `http://localhost:8000` in `vite.config.ts`.
