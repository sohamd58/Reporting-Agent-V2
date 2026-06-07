import pandas as pd

from .utils import add_common_dimensions, add_if_missing, clean_number, first_existing, safe_rate


PUSH_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Impression", "Impression %",
    "Clicked", "Clicked%", "CTR", "Click Through Conversion",
    "Click Through Conversion %", "Click through Revenue",
    "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
    "Headline", "Body",
]


def clean_clevertap_push(df: pd.DataFrame) -> pd.DataFrame:
    df = add_common_dimensions(df.copy())
    sent = clean_number(first_existing(df, "Total Sent(users)", "Total Sent"))
    impressions = clean_number(first_existing(df, "Total Viewed(users)", "Impression", "Total Viewed"))
    clicks = clean_number(first_existing(df, "Total Clicked(users)", "Clicked", "Total Clicks"))
    conversions = clean_number(first_existing(df, "Click through conversions", "Click Through Conversion"))
    influenced = clean_number(first_existing(df, "Influenced Conversions", "Influenced Conversion"))

    df["Total Sent"] = sent.astype(int)
    df["Impression"] = impressions.astype(int)
    df["Impression %"] = safe_rate(impressions, sent)
    df["Clicked"] = clicks.astype(int)
    df["Clicked%"] = safe_rate(clicks, sent)
    df["CTR"] = safe_rate(clicks, impressions)
    df["Click Through Conversion"] = conversions.astype(int)
    df["Click Through Conversion %"] = safe_rate(conversions, clicks)
    df["Click through Revenue"] = clean_number(first_existing(df, "Click through conversion revenue", "Click through Revenue"))
    df["Influenced Conversion"] = influenced.astype(int)
    df["Influenced Conversion %"] = safe_rate(influenced, sent)
    df["Influenced Revenue"] = clean_number(first_existing(df, "Influenced Revenue"))
    df["Headline"] = first_existing(df, "Headline", "Title")
    df["Body"] = first_existing(df, "Body", "Message")
    return add_if_missing(df, PUSH_COLUMNS)
