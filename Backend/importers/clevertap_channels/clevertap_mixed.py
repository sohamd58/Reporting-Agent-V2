import pandas as pd

from .clevertap_email import clean_clevertap_email
from .clevertap_push import clean_clevertap_push
from .clevertap_rcs import clean_clevertap_rcs
from .clevertap_sms import clean_clevertap_sms
from .clevertap_whatsapp import clean_clevertap_whatsapp
from .utils import add_if_missing, clean_number, first_existing, safe_rate

CLEVERTAP_CLEANERS = {
    "Email": clean_clevertap_email,
    "Push Notification": clean_clevertap_push,
    "RCS": clean_clevertap_rcs,
    "Sms": clean_clevertap_sms,
    "WhatsApp": clean_clevertap_whatsapp,
}

MIXED_COLUMNS = [
    "Date", "Time", "Channel", "Week", "Month", "Campaign Name", "Labels",
    "Segments", "Estimated Reach", "Sent", "Delivered", "Delivered %",
    "Viewed", "Viewed %", "Clicked", "Clicked %", "CTR",
    "Click through conversion", "Click Through Conversion %",
    "Click through conversion revenue", "Influenced Conversions",
    "Influenced Conversion %", "Influenced Revenue", "Cost", "ROAS",
    "Title", "Message",
]


def _infer_channel(name):
    if pd.isna(name):
        return "Unknown"
    name = str(name)
    if name.startswith("Push_"):
        return "Push Notification"
    if name.startswith("Email_"):
        return "Email"
    if name.startswith("SMS_"):
        return "Sms"
    if name.startswith("WA_"):
        return "WhatsApp"
    if name.startswith("RCS_"):
        return "RCS"
    if name.startswith("InApp_"):
        return "InApp Notification"
    if name.startswith("WebPopUp_"):
        return "Web"
    if name.startswith("NativeDisplay_"):
        return "Native Display"
    return "Unknown"


def _with_channel(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "Channel" not in df.columns:
        if "Campaign Name" not in df.columns:
            df["Channel"] = "Unknown"
        else:
            df["Channel"] = df["Campaign Name"].apply(_infer_channel)
    else:
        normalized = {
            "email": "Email",
            "push": "Push Notification",
            "push notification": "Push Notification",
            "sms": "Sms",
            "whatsapp": "WhatsApp",
            "wa": "WhatsApp",
            "rcs": "RCS",
        }
        df["Channel"] = df["Channel"].apply(
            lambda value: normalized.get(str(value).strip().lower(), value)
        )
    return df


def detect_channels_only(df: pd.DataFrame) -> list:
    df_temp = _with_channel(df)
    return sorted(df_temp["Channel"].dropna().unique().tolist())


def detect_cleanable_channels(df: pd.DataFrame) -> list:
    return [channel for channel in detect_channels_only(df) if channel in CLEVERTAP_CLEANERS]


def _to_mixed_columns(df: pd.DataFrame) -> pd.DataFrame:
    mixed = pd.DataFrame(index=df.index)
    mixed["Date"] = first_existing(df, "Date")
    mixed["Time"] = first_existing(df, "Time")
    mixed["Channel"] = first_existing(df, "Channel")
    mixed["Week"] = first_existing(df, "Week")
    mixed["Month"] = first_existing(df, "Month")
    mixed["Campaign Name"] = first_existing(df, "Campaign Name")
    mixed["Labels"] = first_existing(df, "Labels", "Label")
    mixed["Segments"] = first_existing(df, "Segments", "Segment", "Who query")
    mixed["Estimated Reach"] = first_existing(df, "Estimated Reach", "estimated reach")
    mixed["Sent"] = first_existing(df, "Sent", "Total Sent", "Total Sent(users)")
    mixed["Delivered"] = first_existing(df, "Delivered", "Total Delivered", "Total Delivered(users)")
    mixed["Delivered %"] = first_existing(df, "Delivered %", "Delivery %")
    mixed["Viewed"] = first_existing(df, "Viewed", "Total Viewed", "Total Opens", "Impression", "Total Viewed(users)")
    mixed["Viewed %"] = first_existing(df, "Viewed %", "Unique Open %", "Total Open%", "Impression %")
    mixed["Clicked"] = first_existing(df, "Clicked", "Unique Clicks", "Total Clicks", "Total Clicked(users)")
    mixed["Clicked %"] = first_existing(df, "Clicked %", "Clicked%", "Unique Clicked%", "Total Clicked%")
    mixed["CTR"] = first_existing(df, "CTR", "CTR %")
    mixed["Click through conversion"] = first_existing(
        df,
        "Click through conversion",
        "Click Through Conversion",
        "Click through conversions",
    )
    mixed["Click Through Conversion %"] = first_existing(df, "Click Through Conversion %")
    mixed["Click through conversion revenue"] = first_existing(
        df,
        "Click through conversion revenue",
        "Click through Revenue",
    )
    mixed["Influenced Conversions"] = first_existing(df, "Influenced Conversions", "Influenced Conversion")
    mixed["Influenced Conversion %"] = first_existing(df, "Influenced Conversion %")
    mixed["Influenced Revenue"] = first_existing(df, "Influenced Revenue")
    mixed["Cost"] = first_existing(df, "Cost")
    mixed["ROAS"] = first_existing(df, "ROAS")
    mixed["Title"] = first_existing(df, "Subject", "Headline", "Title")
    mixed["Message"] = first_existing(df, "Message", "Body", "Preheader")
    mixed = _fill_mixed_rates(mixed)
    return add_if_missing(mixed, MIXED_COLUMNS)


def _is_blank(series: pd.Series) -> pd.Series:
    return series.astype(str).str.strip().isin(["", "nan", "NaT", "<NA>"])


def _fill_rate_if_blank(df: pd.DataFrame, target: str, numerator: str, denominator: str) -> None:
    missing = _is_blank(df[target])
    if not missing.any():
        return
    calculated = safe_rate(clean_number(df[numerator]), clean_number(df[denominator]))
    df.loc[missing, target] = calculated.loc[missing]


def _fill_mixed_rates(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    _fill_rate_if_blank(df, "Delivered %", "Delivered", "Sent")
    _fill_rate_if_blank(df, "Viewed %", "Viewed", "Delivered")
    _fill_rate_if_blank(df, "Clicked %", "Clicked", "Sent")
    _fill_rate_if_blank(df, "CTR", "Clicked", "Viewed")
    _fill_rate_if_blank(df, "Click Through Conversion %", "Click through conversion", "Clicked")
    _fill_rate_if_blank(df, "Influenced Conversion %", "Influenced Conversions", "Sent")
    return df


def clean_clevertap_mixed(df: pd.DataFrame, selected_channels: list = None) -> pd.DataFrame:
    df = _with_channel(df)
    cleanable_channels = detect_cleanable_channels(df)
    if selected_channels is None:
        selected_channels = cleanable_channels

    selected_channels = [channel for channel in selected_channels if channel in cleanable_channels]
    cleaned_dfs = []
    for channel in sorted(selected_channels):
        subset = df[df["Channel"] == channel].copy()
        cleaned = CLEVERTAP_CLEANERS[channel](subset).reset_index(drop=True)
        raw_subset = subset.reset_index(drop=True)
        for column in raw_subset.columns:
            if column not in cleaned.columns:
                cleaned[column] = raw_subset[column]
        cleaned["Channel"] = channel
        cleaned_dfs.append(cleaned)

    if not cleaned_dfs:
        return df.iloc[0:0].copy()

    return _to_mixed_columns(pd.concat(cleaned_dfs, ignore_index=True))
