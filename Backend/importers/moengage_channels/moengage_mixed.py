import pandas as pd

from .moengage_email import clean_moengage_email
from .moengage_message import (
    clean_moengage_rcs,
    clean_moengage_sms,
    clean_moengage_whatsapp,
)
from .moengage_push import clean_moengage_push
from .utils import normalize_text


MOENGAGE_CLEANERS = {
    "Email": clean_moengage_email,
    "Push": clean_moengage_push,
    "RCS": clean_moengage_rcs,
    "SMS": clean_moengage_sms,
    "WhatsApp": clean_moengage_whatsapp,
}


def _normalize_channel(value) -> str:
    value = normalize_text(value).lower()
    if not value:
        return ""
    if "whatsapp" in value or value in {"wa", "waba"}:
        return "WhatsApp"
    if value == "sms" or "sms" in value:
        return "SMS"
    if value == "rcs" or "rcs" in value:
        return "RCS"
    if "email" in value:
        return "Email"
    if "push" in value:
        return "Push"
    return ""


def _infer_channel_from_name(value) -> str:
    value = normalize_text(value).lower()
    if not value:
        return ""
    if value.startswith("wa_") or value.startswith("whatsapp_"):
        return "WhatsApp"
    if value.startswith("sms_"):
        return "SMS"
    if value.startswith("rcs_"):
        return "RCS"
    if value.startswith("email_"):
        return "Email"
    if value.startswith("push_"):
        return "Push"
    return _normalize_channel(value)


def _infer_file_channel(df: pd.DataFrame) -> str:
    columns = set(df.columns)
    if {"Android Sent", "Ios Sent", "Web Sent", "All Platform Sent"} & columns:
        return "Push"
    if {"Email Subject", "Unique opens", "Total Open", "Complaints"} & columns:
        return "Email"
    if {"Total Read", "Read Rate", "Campaign Channel Type", "Template Type"} & columns:
        return ""
    return ""


def _with_channel(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    channel = pd.Series([""] * len(df), index=df.index, dtype="object")

    for column in ["Channel", "Campaign Channel Type", "Campaign Type", "Template Type"]:
        if column not in df.columns:
            continue
        detected = df[column].apply(_normalize_channel)
        channel = channel.mask(channel.eq("") & detected.ne(""), detected)

    if "Campaign Name" in df.columns:
        detected = df["Campaign Name"].apply(_infer_channel_from_name)
        channel = channel.mask(channel.eq("") & detected.ne(""), detected)

    file_channel = _infer_file_channel(df)
    if file_channel:
        channel = channel.mask(channel.eq(""), file_channel)

    df["Channel"] = channel.where(channel.ne(""), "Unknown")
    return df


def detect_channels_only(df: pd.DataFrame) -> list[str]:
    df = _with_channel(df)
    return sorted(df["Channel"].dropna().unique().tolist())


def detect_cleanable_channels(df: pd.DataFrame) -> list[str]:
    return [channel for channel in detect_channels_only(df) if channel in MOENGAGE_CLEANERS]


def clean_moengage_mixed(df: pd.DataFrame, selected_channels: list | None = None) -> pd.DataFrame:
    df = _with_channel(df)
    cleanable_channels = detect_cleanable_channels(df)
    if selected_channels is None:
        selected_channels = cleanable_channels

    selected_channels = [channel for channel in selected_channels if channel in cleanable_channels]
    cleaned_dfs = []
    for channel in sorted(selected_channels):
        subset = df[df["Channel"] == channel].copy()
        cleaned = MOENGAGE_CLEANERS[channel](subset).reset_index(drop=True)
        raw_subset = subset.reset_index(drop=True)
        for column in raw_subset.columns:
            if column not in cleaned.columns:
                cleaned[column] = raw_subset[column]
        cleaned["Channel"] = channel
        cleaned_dfs.append(cleaned)

    if not cleaned_dfs:
        return df.iloc[0:0].copy()

    return pd.concat(cleaned_dfs, ignore_index=True)
