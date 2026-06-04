# Reporting Agent Architecture

This project is split into a Python backend and a React frontend.

## Directory Layout

```text
Reporting-Agent-V2/
  Backend/
    api_server.py
    app.py
    config/
    importers/
    check_csv.py
    debug_email.py
    test_sidebar.py
  Frontend/
    package.json
    vite.config.ts
    src/
  dev.ps1
```

## Backend

The backend lives in `Backend/`.

Primary entrypoint:

- `Backend/api_server.py`

Main responsibilities:

- Exposes the FastAPI API under `/api`
- Accepts CSV uploads
- Detects available CleverTap channels
- Cleans selected channels using the importer modules
- Loads, saves, and deletes report templates
- Generates CSV/XLSX reports
- Stores runtime uploads, cleaned files, and reports under `Backend/data/`

Important backend modules:

- `Backend/config/template_store.py` stores report-template definitions in `Backend/config/report_templates.json`.
- `Backend/importers/clevertap_channels/` contains the active CleverTap cleaning logic.
- `Backend/app.py` is the older Streamlit monolith kept as legacy/reference code.

## Frontend

The frontend lives in `Frontend/`.

Primary entrypoint:

- `Frontend/src/main.tsx`

Main responsibilities:

- Renders the React/Vite user interface
- Handles CSV upload, platform selection, channel selection, previews, and report export controls
- Calls backend endpoints through `Frontend/src/app/api.ts`
- Provides template editing UI in `Frontend/src/app/components/TemplateDesigner.tsx`

The frontend API base defaults to `/api`. In local development, `Frontend/vite.config.ts` proxies `/api` to `http://localhost:8000`.

## API Boundary

The current frontend uses these backend endpoints:

- `GET /api/health`
- `POST /api/upload`
- `POST /api/detect-channels`
- `POST /api/clean`
- `GET /api/templates`
- `POST /api/templates`
- `DELETE /api/templates`
- `POST /api/report`
- `GET /api/cleaned/download`
- `GET /api/cleaned/preview`

## Running Locally

Use the root helper:

```powershell
.\dev.ps1
```

Or run each side manually.

Backend:

```powershell
cd Backend
..\venv\Scripts\python.exe -m uvicorn api_server:app --reload --port 8000
```

Frontend:

```powershell
cd Frontend
npm install
npm run dev
```

Backend runs on `http://localhost:8000`.
Frontend runs on `http://localhost:5173`.
