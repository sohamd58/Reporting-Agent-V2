import json
import re

import numpy as np
import pandas as pd


def clean_number(series: pd.Series) -> pd.Series:
    cleaned = (
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("%", "", regex=False)
        .str.replace("-", "NaN", regex=False)
        .str.replace("\u2014", "NaN", regex=False)
        .str.replace("N/A", "NaN", regex=False)
    )
    return pd.to_numeric(cleaned, errors="coerce").fillna(0)


def first_existing(df: pd.DataFrame, *columns: str, default="") -> pd.Series:
    result = pd.Series([pd.NA] * len(df), index=df.index, dtype="object")
    for column in columns:
        if column not in df.columns:
            continue
        series = df[column]
        missing = result.isna() | result.astype(str).str.strip().isin(["", "nan", "NaT", "<NA>"])
        result = result.mask(missing, series)
    return result.where(result.notna(), default)


def find_column(df: pd.DataFrame, pattern: str) -> str | None:
    for column in df.columns:
        if re.search(pattern, column, re.IGNORECASE):
            return column
    return None


def add_date_time_parts(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    date_col = find_column(df, r"run\s*date")
    if date_col:
        parsed = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
        df["Date"] = parsed.dt.date
        df["Week"] = ((parsed.dt.dayofyear - 1) // 7 + 1).astype("Int64")
        df["Month"] = parsed.dt.month_name()
    else:
        df["Date"] = ""
        df["Week"] = ""
        df["Month"] = ""

    time_col = find_column(df, r"start\s*time")
    if time_col:
        df["Time"] = pd.to_datetime(df[time_col], format="%H:%M", errors="coerce").dt.time
    else:
        df["Time"] = ""
    return df


def add_common_dimensions(df: pd.DataFrame) -> pd.DataFrame:
    df = add_date_time_parts(df)
    df["Campaign Name"] = first_existing(df, "Campaign Name")
    df["Label"] = first_existing(df, "Label", "Labels")
    df["Segment"] = first_existing(df, "Segment", "Who query")
    df["Estimated Reach"] = first_existing(df, "Estimated Reach", "estimated reach")
    return df


def safe_rate(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
    denominator = denominator.replace(0, np.nan)
    return ((numerator.astype(float) / denominator.astype(float)) * 100).round(2).fillna(0)


def add_if_missing(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    df = df.copy()
    for column in columns:
        if column not in df.columns:
            df[column] = ""
    return df[columns]


def parse_email_title(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "Title" not in df.columns:
        df["Subject"] = ""
        df["Preheader"] = ""
        return df

    def parse(value):
        if pd.isna(value):
            return "", ""
        try:
            value = str(value).strip('"').replace('""', '"')
            data = json.loads(value)
            return data.get("Subject", ""), data.get("Preheader", "")
        except Exception:
            return "", ""

    parsed = df["Title"].apply(parse)
    df["Subject"] = parsed.apply(lambda item: item[0])
    df["Preheader"] = parsed.apply(lambda item: item[1])
    return df
