import io
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from config.template_store import add_template, delete_template, load_templates
from importers.clevertap_channels.clevertap_mixed import (
    clean_clevertap_mixed,
    detect_channels_only,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
CLEANED_DIR = DATA_DIR / "cleaned"
REPORTS_DIR = DATA_DIR / "reports"

for folder in (UPLOADS_DIR, CLEANED_DIR, REPORTS_DIR):
    folder.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Reporting Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dist_path = BASE_DIR / "Frontend" / "dist"
assets_path = dist_path / "assets"
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")


def _load_csv(file_id: str) -> pd.DataFrame:
    file_path = UPLOADS_DIR / f"{file_id}.csv"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return pd.read_csv(file_path)


def _save_cleaned(file_id: str, df: pd.DataFrame) -> Path:
    file_path = CLEANED_DIR / f"{file_id}.csv"
    df.to_csv(file_path, index=False)
    return file_path


def _load_cleaned(file_id: str) -> pd.DataFrame:
    file_path = CLEANED_DIR / f"{file_id}.csv"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Cleaned data not found")
    return pd.read_csv(file_path)


def _preview_payload(df: pd.DataFrame, limit: int = 10) -> dict[str, Any]:
    preview = df.head(limit)
    return {
        "columns": list(df.columns),
        "rows": preview.to_dict(orient="records"),
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
    }


def _normalize_platform(platform: str | None) -> str:
    if not platform:
        return ""
    return platform.strip().lower()


def _column_types(df: pd.DataFrame) -> dict[str, str]:
    return {col: str(dtype) for col, dtype in df.dtypes.items()}


def _sort_cleaned_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    has_date = "Date" in df.columns
    has_time = "Time" in df.columns
    has_channel = "Channel" in df.columns

    if has_date and has_time:
        df["_datetime_sort"] = pd.to_datetime(
            df["Date"].astype(str) + " " + df["Time"].astype(str),
            errors="coerce",
        )

    sort_columns = []
    if has_channel:
        sort_columns.append("Channel")
    if has_date and has_time:
        sort_columns.append("_datetime_sort")
    elif has_date:
        sort_columns.append("Date")

    if sort_columns:
        df = df.sort_values(by=sort_columns, ascending=True).reset_index(drop=True)

    if "_datetime_sort" in df.columns:
        df.drop(columns=["_datetime_sort"], inplace=True)

    percentage_cols = [
        "Delivery %",
        "Delivered %",
        "Impression %",
        "Viewed %",
        "View Rate %",
        "Clicked%",
        "Click Rate %",
        "Unique Clicked%",
        "Conversion Rate %",
        "Click Through Conversion %",
        "Influenced Conversion %",
        "Total Open%",
        "Unique Open %",
        "Total Clicked%",
        "Unique Clicked%",
        "CTR %",
        "CTOR %",
        "Unsubscribed %",
        "Error %",
        "CTR",
        "Read Rate %",
    ]

    for col in percentage_cols:
        if col in df.columns and df[col].dtype != "object":
            df[col] = df[col].apply(lambda x: f"{x:.2f}%" if pd.notna(x) else "")

    return df


def _apply_template(df: pd.DataFrame, template: dict[str, Any]) -> pd.DataFrame:
    output = pd.DataFrame()
    for col_def in template.get("columns", []):
        name = col_def.get("name")
        source = col_def.get("source")
        if not name or not source:
            continue
        if source == "direct":
            column = col_def.get("column", "")
            output[name] = df[column] if column in df.columns else ""
        elif source == "calculated":
            formula = col_def.get("formula", "")
            if not formula:
                output[name] = ""
                continue
            try:
                series = df.eval(formula)
                if "/" in formula:
                    output[name] = (series * 100).round(2).apply(
                        lambda x: f"{x:.2f}%" if pd.notna(x) else ""
                    )
                else:
                    output[name] = series
            except Exception:
                output[name] = ""
        else:
            output[name] = ""
    return output


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    file_id = uuid.uuid4().hex
    file_path = UPLOADS_DIR / f"{file_id}.csv"
    content = await file.read()
    file_path.write_bytes(content)

    try:
        df = pd.read_csv(file_path)
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Unable to read CSV: {exc}")

    payload = _preview_payload(df)
    payload.update({"file_id": file_id, "filename": file.filename})
    return payload


@app.post("/api/detect-channels")
async def detect_channels(payload: dict[str, Any]) -> dict[str, Any]:
    file_id = payload.get("file_id")
    platform = payload.get("platform")
    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required")

    df = _load_csv(file_id)
    platform_key = _normalize_platform(platform)
    if platform_key in {"clevertap", "clever tap"}:
        channels = detect_channels_only(df)
    else:
        channels = []
    return {"channels": channels}


@app.post("/api/clean")
async def clean_data(payload: dict[str, Any]) -> dict[str, Any]:
    file_id = payload.get("file_id")
    platform = payload.get("platform")
    selected_channels = payload.get("selected_channels")

    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required")
    platform_key = _normalize_platform(platform)
    if platform_key not in {"clevertap", "clever tap"}:
        raise HTTPException(status_code=400, detail="Only CleverTap is supported for now")

    df = _load_csv(file_id)
    cleaned = clean_clevertap_mixed(df, selected_channels=selected_channels)
    cleaned = _sort_cleaned_data(cleaned)
    _save_cleaned(file_id, cleaned)

    preview = _preview_payload(cleaned)
    return {
        "file_id": file_id,
        "preview": preview,
        "column_types": _column_types(cleaned),
    }


@app.get("/api/templates")
async def list_templates(platform: str | None = None) -> dict[str, Any]:
    templates = load_templates()
    if platform:
        platform_key = _normalize_platform(platform)
        prefix = "CleverTap " if platform_key in {"clevertap", "clever tap"} else "MoEngage "
        filtered = {k: v for k, v in templates.items() if k.startswith(prefix)}
        return {"templates": filtered}
    return {"templates": templates}


@app.post("/api/templates")
async def save_template(payload: dict[str, Any]) -> dict[str, Any]:
    name = payload.get("name")
    columns = payload.get("columns")
    if not name or not columns:
        raise HTTPException(status_code=400, detail="Template name and columns are required")
    add_template(name, columns)
    return {"status": "saved", "name": name}


@app.delete("/api/templates")
async def remove_template(name: str) -> dict[str, Any]:
    delete_template(name)
    return {"status": "deleted", "name": name}


@app.post("/api/report")
async def generate_report(payload: dict[str, Any]) -> StreamingResponse:
    file_id = payload.get("file_id")
    template_name = payload.get("template_name")
    export_format = payload.get("format", "xlsx")

    if not file_id or not template_name:
        raise HTTPException(status_code=400, detail="file_id and template_name are required")

    templates = load_templates()
    if template_name not in templates:
        raise HTTPException(status_code=404, detail="Template not found")

    df = _load_cleaned(file_id)
    report_df = _apply_template(df, templates[template_name])

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if export_format == "csv":
        csv_data = report_df.to_csv(index=False)
        buffer = io.BytesIO(csv_data.encode("utf-8"))
        filename = f"report_{timestamp}.csv"
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    if export_format == "xlsx":
        buffer = io.BytesIO()
        report_df.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)
        filename = f"report_{timestamp}.xlsx"
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    raise HTTPException(status_code=400, detail="Unsupported format")


@app.get("/api/cleaned/download")
async def download_cleaned(file_id: str, export_format: str = "csv") -> StreamingResponse:
    df = _load_cleaned(file_id)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if export_format == "csv":
        csv_data = df.to_csv(index=False)
        buffer = io.BytesIO(csv_data.encode("utf-8"))
        filename = f"cleaned_{timestamp}.csv"
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    if export_format == "xlsx":
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)
        filename = f"cleaned_{timestamp}.xlsx"
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    raise HTTPException(status_code=400, detail="Unsupported format")


@app.get("/api/cleaned/preview")
async def cleaned_preview(file_id: str) -> dict[str, Any]:
    df = _load_cleaned(file_id)
    preview = _preview_payload(df)
    return {"file_id": file_id, "preview": preview, "column_types": _column_types(df)}


@app.get("/")
async def root():
    index_path = BASE_DIR / "Frontend" / "dist" / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return JSONResponse({"message": "Frontend build not found. Run `npm run build` in Frontend."})
