import pandas as pd

from .utils import (
    add_common_dimensions,
    add_if_missing,
    clean_number,
    first_existing,
    parse_email_title,
    safe_rate,
)


EMAIL_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Total Viewed", "Viewed %",
    "Clicked", "Clicked%", "CTR", "Click Through Conversion",
    "Click Through Conversion %", "Click through Revenue",
    "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
    "Subject", "Preheader",
]


def clean_clevertap_email(df: pd.DataFrame) -> pd.DataFrame:
    df = add_common_dimensions(df.copy())
    df = parse_email_title(df)

    sent = clean_number(first_existing(df, "Total Sent(users)", "Total Sent"))
    delivered = clean_number(first_existing(df, "Total Delivered(users)", "Delivered", "Total Delivered"))
    viewed = clean_number(first_existing(df, "Total Viewed(users)", "Total Viewed", "Unique Opens", "Total Opens"))
    clicks = clean_number(first_existing(df, "Total Clicked(users)", "Clicked", "Unique Clicks", "Total Clicks"))
    conversions = clean_number(first_existing(df, "Click through conversions", "Click Through Conversion"))
    influenced = clean_number(first_existing(df, "Influenced Conversions", "Influenced Conversion"))

    df["Total Sent"] = sent.astype(int)
    df["Total Viewed"] = viewed.astype(int)
    df["Viewed %"] = safe_rate(viewed, delivered.where(delivered.ne(0), sent))
    df["Clicked"] = clicks.astype(int)
    df["Clicked%"] = safe_rate(clicks, sent)
    df["CTR"] = safe_rate(clicks, viewed)
    df["Click Through Conversion"] = conversions.astype(int)
    df["Click Through Conversion %"] = safe_rate(conversions, clicks)
    df["Click through Revenue"] = clean_number(first_existing(df, "Click through conversion revenue", "Click through Revenue"))
    df["Influenced Conversion"] = influenced.astype(int)
    df["Influenced Conversion %"] = safe_rate(influenced, sent)
    df["Influenced Revenue"] = clean_number(first_existing(df, "Influenced Revenue"))
    return add_if_missing(df, EMAIL_COLUMNS)
