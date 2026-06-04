# importers/clevertap_channels/clevertap_sms.py
import pandas as pd
import numpy as np
import re

def clean_clevertap_sms(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans a CleverTap SMS campaign export CSV.
    Standardises column names, parses dates, converts numerics, handles dashes.
    Outputs: Date, Time, Week, Month, Campaign Name, Label, Segment, Estimated Reach,
    Total Sent, Total Delivered, Delivery %, Clicked, Clicked%, CTR, Click Through Conversion,
    Click Through Conversion %, Click through Revenue, Influenced Conversion,
    Influenced Conversion %, Influenced Revenue, Message.
    """
    df = df.copy()
    
    # 1. Parse Run Date
    date_col = None
    for col in df.columns:
        if re.search(r"run\s*date", col, re.IGNORECASE):
            date_col = col
            break
    if date_col:
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
        df["Date"] = df[date_col].dt.date
        df["Month"] = df[date_col].dt.month_name()
        # Week calculation: Jan 1-7 = week 1, Jan 8-14 = week 2, etc.
        df["Week"] = (df[date_col].dt.dayofyear - 1) // 7 + 1
        df["Run Date"] = df[date_col]  # keep for sorting
    else:
        df["Date"] = np.nan
        df["Month"] = np.nan
        df["Week"] = np.nan
        df["Run Date"] = np.nan
    
    # 2. Parse Start Time
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
    
    # 3. Convert numeric columns (handle dashes, N/A)
    numeric_metrics = [
        "Total Sent(users)", "Total Delivered(users)", "Total Clicked(users)",
        "Errors", "Click through conversions", "Click through conversion revenue",
        "Influenced Conversions", "Influenced Revenue", "estimated reach"
    ]
    # Add any column that looks like a metric
    for col in df.columns:
        if any(key in col for key in ["Sent", "Delivered", "Clicked", "Errors", "conversions", "revenue", "Influenced", "reach"]):
            if col not in numeric_metrics:
                numeric_metrics.append(col)
    
    for col in numeric_metrics:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace('-', 'NaN', regex=False)
            df[col] = df[col].str.replace('—', 'NaN', regex=False)
            df[col] = df[col].str.replace('N/A', 'NaN', regex=False)
            df[col] = pd.to_numeric(df[col], errors="coerce")
            if df[col].notna().any():
                df[col] = df[col].fillna(0).astype(int).clip(lower=0)
    
    # 4. Compute derived columns (percentages and CTR)
    if "Total Sent(users)" in df.columns and "Total Delivered(users)" in df.columns:
        df["Delivery %"] = (df["Total Delivered(users)"].astype(float) / df["Total Sent(users)"].astype(float) * 100).round(2)
    if "Total Sent(users)" in df.columns and "Total Clicked(users)" in df.columns:
        df["Clicked%"] = (df["Total Clicked(users)"].astype(float) / df["Total Sent(users)"].astype(float) * 100).round(2)
    if "Total Delivered(users)" in df.columns and "Total Clicked(users)" in df.columns:
        denom = df["Total Delivered(users)"].astype(float).replace(0, np.nan)
        df["CTR"] = (df["Total Clicked(users)"].astype(float) / denom * 100).round(2)
    if "Click through conversions" in df.columns and "Total Clicked(users)" in df.columns:
        denom = df["Total Clicked(users)"].astype(float).replace(0, np.nan)
        df["Click Through Conversion %"] = (df["Click through conversions"].astype(float) / denom * 100).round(2)
    if "Influenced Conversions" in df.columns and "Total Sent(users)" in df.columns:
        denom = df["Total Sent(users)"].astype(float).replace(0, np.nan)
        df["Influenced Conversion %"] = (df["Influenced Conversions"].astype(float) / denom * 100).round(2)
    
    # 5. Rename columns to output names
    rename_map = {
        "Total Sent(users)": "Total Sent",
        "Total Delivered(users)": "Total Delivered",
        "Total Clicked(users)": "Clicked",
        "Click through conversions": "Click Through Conversion",
        "Click through conversion revenue": "Click through Revenue",
        "Influenced Conversions": "Influenced Conversion",
        "Influenced Revenue": "Influenced Revenue",
        "estimated reach": "Estimated Reach",
        "Campaign Name": "Campaign Name",
        "Labels": "Label",
        "Who query": "Segment",
        "Message": "Message",
    }
    for old, new in rename_map.items():
        if old in df.columns and new not in df.columns:
            df.rename(columns={old: new}, inplace=True)
    
    # 6. Select final columns in required order
    output_columns = [
        "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
        "Estimated Reach", "Total Sent", "Total Delivered", "Delivery %",
        "Clicked", "Clicked%", "CTR", "Click Through Conversion",
        "Click Through Conversion %", "Click through Revenue",
        "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
        "Message"
    ]
    final_columns = [col for col in output_columns if col in df.columns]
    df = df[final_columns]
    
    # 7. Sort by Date and Time
    if "Run Date" in df.columns and "Start Time" in df.columns:
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
