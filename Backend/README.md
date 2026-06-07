# Backend

FastAPI and Python data-processing code for the reporting agent.

## Responsibilities

- CSV upload and preview endpoints
- CleverTap and MoEngage channel detection and cleaning
- Report-template loading, saving, and deletion
- CSV/XLSX report generation
- Runtime storage under `Backend/data/`

## Run

From this folder:

```powershell
..\venv\Scripts\python.exe -m uvicorn api_server:app --reload --port 8000
```

The API is available at `http://localhost:8000`.

The React dev server proxies `/api` calls to this backend.
