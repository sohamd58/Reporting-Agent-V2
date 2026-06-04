import pandas as pd

from .clevertap_email import clean_clevertap_email
from .clevertap_push import clean_clevertap_push
from .clevertap_sms import clean_clevertap_sms
from .clevertap_whatsapp import clean_clevertap_whatsapp

CLEVERTAP_CLEANERS = {
    "Email": clean_clevertap_email,
    "Push Notification": clean_clevertap_push,
    "Sms": clean_clevertap_sms,
    "WhatsApp": clean_clevertap_whatsapp,
}


def _infer_channel(name):
    """Infer channel from common CleverTap campaign-name prefixes."""
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
    return df


def detect_channels_only(df: pd.DataFrame) -> list:
    """Return all channels found in the upload."""
    df_temp = _with_channel(df)
    return sorted(df_temp["Channel"].dropna().unique().tolist())


def detect_cleanable_channels(df: pd.DataFrame) -> list:
    """Return only channels with an implemented cleaning pipeline."""
    return [channel for channel in detect_channels_only(df) if channel in CLEVERTAP_CLEANERS]


def clean_clevertap_mixed(df: pd.DataFrame, selected_channels: list = None) -> pd.DataFrame:
    """
    Clean a mixed CleverTap CSV by channel.

    Only channels with implemented cleaners are processed. Unsupported channels
    are not passed through as raw rows because that creates broken report exports.
    """
    df = _with_channel(df)

    cleanable_channels = detect_cleanable_channels(df)
    if selected_channels is None:
        selected_channels = cleanable_channels

    selected_channels = [channel for channel in selected_channels if channel in cleanable_channels]
    cleaned_dfs = []

    for channel in sorted(selected_channels):
        subset = df[df["Channel"] == channel].copy()
        cleaner = CLEVERTAP_CLEANERS[channel]
        cleaned = cleaner(subset)
        cleaned["Channel"] = channel
        cleaned_dfs.append(cleaned)

    if not cleaned_dfs:
        return df.iloc[0:0].copy()

    return pd.concat(cleaned_dfs, ignore_index=True)
