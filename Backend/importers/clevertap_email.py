# importers/clevertap_email.py
import pandas as pd
import numpy as np
import json
import re

def clean_clevertap_email(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # 1. Remove duplicate identical columns
    df = _deduplicate_identical_columns(df)
    
    # 2. Find and parse Run Date
    date_col = None
    for col in df.columns:
        if re.search(r"run\s*date", col, re.IGNORECASE):
            date_col = col
            break
    if date_col:
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
        df["Date"] = df[date_col].dt.date
        df["Month"] = df[date_col].dt.month_name()
        df["Run Date"] = df[date_col]   # keep for sorting
    else:
        df["Date"] = np.nan
        df["Month"] = np.nan
        df["Run Date"] = np.nan
    
    # 3. Find and parse Start Time
    time_col = None
    for col in df.columns:
        if re.search(r"start\s*time", col, re.IGNORECASE):
            time_col = col
            break
    if time_col:
        df["Time"] = pd.to_datetime(df[time_col], format="%H:%M", errors="coerce").dt.time
        df["Start Time"] = df["Time"]
    else:
        df["Time"] = np.nan
        df["Start Time"] = np.nan
    
    # 4. Convert numeric columns (handle dashes, N/A)
    # Define all possible metric columns
    numeric_metrics = [
        "Total Sent(users)", "Total Delivered(users)", "Total Viewed(events)",
        "Total Viewed(users)", "Total Clicked(events)", "Total Clicked(users)",
        "Errors", "Total Unsubscribes", "Click through conversions",
        "Click through conversion revenue", "Influenced Conversions", "Influenced Revenue",
        "estimated reach", "Unique Sent (users)", "Revenue Within Conversion Time",
        "Influenced Conversions %", "Click through conversions %"
    ]
    # Add any column that looks like a metric
    for col in df.columns:
        if any(key in col for key in ["Sent", "Delivered", "Viewed", "Clicked", "Errors", "Unsubscribes", "conversions", "revenue", "Influenced"]):
            if col not in numeric_metrics:
                numeric_metrics.append(col)
    
    for col in numeric_metrics:
        if col in df.columns:
            # Force string, replace dash, then convert to numeric
            df[col] = df[col].astype(str).str.replace('-', 'NaN', regex=False)
            df[col] = df[col].str.replace('—', 'NaN', regex=False)
            df[col] = df[col].str.replace('N/A', 'NaN', regex=False)
            df[col] = pd.to_numeric(df[col], errors="coerce")
            # Fill NA with 0 and convert to int (only if we have numeric values)
            if df[col].notna().any():
                df[col] = df[col].fillna(0).astype(int).clip(lower=0)
    
    # 5. Compute derived columns
    if "Total Sent(users)" in df.columns and "Total Delivered(users)" in df.columns:
        df["Delivered %"] = (df["Total Delivered(users)"].astype(float) / df["Total Sent(users)"].astype(float) * 100).round(2)
    if "Total Viewed(events)" in df.columns and "Total Delivered(users)" in df.columns:
        df["Total Open%"] = (df["Total Viewed(events)"].astype(float) / df["Total Delivered(users)"].astype(float) * 100).round(2)
    if "Total Viewed(users)" in df.columns and "Total Delivered(users)" in df.columns:
        df["Unique Open %"] = (df["Total Viewed(users)"].astype(float) / df["Total Delivered(users)"].astype(float) * 100).round(2)
    if "Total Clicked(events)" in df.columns and "Total Delivered(users)" in df.columns:
        df["Total Clicked%"] = (df["Total Clicked(events)"].astype(float) / df["Total Delivered(users)"].astype(float) * 100).round(2)
    if "Total Clicked(users)" in df.columns and "Total Delivered(users)" in df.columns:
        df["Unique Clicked%"] = (df["Total Clicked(users)"].astype(float) / df["Total Delivered(users)"].astype(float) * 100).round(2)
    if "Total Clicked(users)" in df.columns and "Total Viewed(users)" in df.columns:
        denom = df["Total Viewed(users)"].astype(float).replace(0, np.nan)
        df["CTR %"] = (df["Total Clicked(users)"].astype(float) / denom * 100).round(2)
    if "Total Clicked(events)" in df.columns and "Total Viewed(events)" in df.columns:
        denom = df["Total Viewed(events)"].astype(float).replace(0, np.nan)
        df["CTOR %"] = (df["Total Clicked(events)"].astype(float) / denom * 100).round(2)
    if "Total Unsubscribes" in df.columns and "Total Delivered(users)" in df.columns:
        df["Unsubscribed %"] = (df["Total Unsubscribes"].astype(float) / df["Total Delivered(users)"].astype(float) * 100).round(2)
    if "Errors" in df.columns and "Total Sent(users)" in df.columns:
        df["Error %"] = (df["Errors"].astype(float) / df["Total Sent(users)"].astype(float) * 100).round(2)
    
    # 6. Parse Subject and Preheader from Title JSON
    if "Title" in df.columns:
        def parse_title(title):
            if pd.isna(title):
                return (None, None)
            try:
                if isinstance(title, str):
                    title = title.strip('"').replace('""', '"')
                    data = json.loads(title)
                    subject = data.get("Subject", "")
                    preheader = data.get("Preheader", "")
                    return (subject, preheader)
                else:
                    return (None, None)
            except:
                return (None, None)
        parsed = df["Title"].apply(parse_title)
        df["Subject"] = parsed.apply(lambda x: x[0])
        df["Preheader"] = parsed.apply(lambda x: x[1])
    
    # 7. Rename columns to output names
    rename_map = {
        "Total Sent(users)": "Total Sent",
        "Total Delivered(users)": "Delivered",
        "Total Viewed(events)": "Total Opens",
        "Total Viewed(users)": "Unique Opens",
        "Total Clicked(events)": "Total Clicks",
        "Total Clicked(users)": "Unique Clicks",
        "Errors": "Total Errors",
        "Total Unsubscribes": "Total Unsubscribes",
        "Click through conversions": "Click through conversions",
        "Click through conversion revenue": "Click through conversion revenue",
        "Influenced Conversions": "Influenced Conversions",
        "Influenced Revenue": "Influenced Revenue",
        "estimated reach": "Estimated Reach",
        "Campaign Name": "Campaign Name",
        "Labels": "Label",
        "Who query": "Segment",
        "Error: Global frequency caps exceeded": "Error: Global frequency caps exceeded",
        "Error: Campaign limit reached": "Error: Campaign limit reached",
        "Error: Email soft bounced": "Error: Email soft bounced",
    }
    for old, new in rename_map.items():
        if old in df.columns and new not in df.columns:
            df.rename(columns={old: new}, inplace=True)
    
    # 8. Select final columns in required order
    output_columns = [
        "Date", "Time", "Month", "Campaign Name", "Label", "Segment",
        "Estimated Reach", "Total Sent", "Delivered", "Delivered %",
        "Total Opens", "Total Open%", "Unique Opens", "Unique Open %",
        "Total Clicks", "Total Clicked%", "Unique Clicks", "Unique Clicked%",
        "CTR %", "CTOR %", "Total Unsubscribes", "Unsubscribed %",
        "Total Errors", "Error %", "Error: Global frequency caps exceeded",
        "Error: Campaign limit reached", "Error: Email soft bounced",
        "Click through conversions", "Click through conversion revenue",
        "Influenced Conversions", "Influenced Revenue", "Subject", "Preheader"
    ]
    final_columns = [col for col in output_columns if col in df.columns]
    # Also add any derived percentages that were created
    for col in ["Delivered %", "Total Open%", "Unique Open %", "Total Clicked%", "Unique Clicked%", "CTR %", "CTOR %", "Unsubscribed %", "Error %"]:
        if col in df.columns and col not in final_columns:
            final_columns.append(col)
    df = df[final_columns]
    
    # 9. Sort by Date and Time
    if "Run Date" in df.columns and "Start Time" in df.columns:
        # Create a combined datetime for sorting
        df["_sort"] = pd.to_datetime(
            df["Run Date"].astype(str) + " " + df["Start Time"].astype(str),
            errors="coerce"
        )
        df = df.sort_values(by="_sort", ascending=True).reset_index(drop=True)
        df.drop(columns=["_sort"], inplace=True)
    elif "Run Date" in df.columns:
        df = df.sort_values(by="Run Date", ascending=True).reset_index(drop=True)
    
    # Drop helper columns
    df.drop(columns=[c for c in df.columns if c in ["Run Date", "Start Time"]], errors="ignore", inplace=True)
    
    return df

def _deduplicate_identical_columns(df: pd.DataFrame) -> pd.DataFrame:
    cols_to_drop = []
    total_unsub_cols = [c for c in df.columns if c.startswith("Total Unsubscribes")]
    if len(total_unsub_cols) > 1:
        for i in range(1, len(total_unsub_cols)):
            if df[total_unsub_cols[0]].equals(df[total_unsub_cols[i]]):
                cols_to_drop.append(total_unsub_cols[i])
    df = df.drop(columns=cols_to_drop)
    return df
