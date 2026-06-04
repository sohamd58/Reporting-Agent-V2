# importers/clevertap_channels/clevertap_mixed.py
import pandas as pd
from .clevertap_email import clean_clevertap_email
from .clevertap_push import clean_clevertap_push
from .clevertap_sms import clean_clevertap_sms
from .clevertap_whatsapp import clean_clevertap_whatsapp

def _infer_channel(name):
    """Helper to infer channel from campaign name prefix."""
    if pd.isna(name):
        return "Unknown"
    name = str(name)
    if name.startswith("Push_"):
        return "Push Notification"
    elif name.startswith("Email_"):
        return "Email"
    elif name.startswith("SMS_"):
        return "Sms"
    elif name.startswith("WA_"):
        return "WhatsApp"
    elif name.startswith("InApp_"):
        return "InApp Notification"
    elif name.startswith("WebPopUp_"):
        return "Web"
    elif name.startswith("NativeDisplay_"):
        return "Native Display"
    else:
        return "Unknown"

def detect_channels_only(df: pd.DataFrame) -> list:
    """
    Detects all unique channels in a raw CSV without cleaning.
    Returns list of detected channel names.
    """
    df_temp = df.copy()
    if "Channel" not in df_temp.columns:
        df_temp["Channel"] = df_temp["Campaign Name"].apply(_infer_channel)
    return sorted(df_temp["Channel"].unique().tolist())

def clean_clevertap_mixed(df: pd.DataFrame, selected_channels: list = None) -> pd.DataFrame:
    """
    Cleans a mixed CleverTap CSV by detecting channel from 'Channel' column.
    For each channel in selected_channels (or all if None), applies the corresponding cleaning script, then concatenates.
    Data is sorted alphabetically by channel name.
    If no 'Channel' column, infers from campaign name prefix.
    
    Args:
        df: Raw DataFrame
        selected_channels: List of channels to clean. If None, cleans all detected channels.
    
    Returns:
        DataFrame with cleaned data sorted alphabetically by channel.
    """
    df = df.copy()
    
    # If no 'Channel' column, fallback to campaign name prefix detection
    if "Channel" not in df.columns:
        df["Channel"] = df["Campaign Name"].apply(_infer_channel)
    
    # If selected_channels is None, use all detected channels
    if selected_channels is None:
        selected_channels = df["Channel"].unique().tolist()
    
    # Sort selected channels alphabetically for consistent output
    selected_channels = sorted(selected_channels)
    
    # Mapping from Channel value to cleaning function
    cleaners = {
        "Email": clean_clevertap_email,
        "Push Notification": clean_clevertap_push,
        "Sms": clean_clevertap_sms,
        "WhatsApp": clean_clevertap_whatsapp,
        # Add others when scripts are ready:
        # "InApp Notification": clean_clevertap_inapp,
        # "Web": clean_clevertap_webpopup,
        # "Native Display": clean_clevertap_nativedisplay,
    }
    
    cleaned_dfs = []
    for channel in selected_channels:
        if channel not in df["Channel"].values:
            continue  # Skip if channel not present in data
        subset = df[df["Channel"] == channel].copy()
        if channel in cleaners:
            try:
                cleaned = cleaners[channel](subset)
                cleaned["Channel"] = channel
                cleaned_dfs.append(cleaned)
            except Exception as e:
                # If cleaning fails, keep raw but add warning (printed to terminal)
                subset["Channel"] = channel
                cleaned_dfs.append(subset)
                print(f"Warning: Cleaning failed for channel '{channel}': {e}")
        else:
            # No cleaner yet – keep raw, but add Channel column
            subset["Channel"] = channel
            cleaned_dfs.append(subset)
    
    if not cleaned_dfs:
        return df
    
    # Concatenate all channel dataframes (already in alphabetical order)
    result = pd.concat(cleaned_dfs, ignore_index=True)
    return result
