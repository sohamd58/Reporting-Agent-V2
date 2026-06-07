import pandas as pd

from .utils import add_common_dimensions, add_if_missing, clean_number, first_existing, safe_rate


RCS_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Total Delivered", "Delivery %",
    "Viewed", "Viewed %", "Clicked", "Clicked%", "CTR",
    "Click Through Conversion", "Click Through Conversion %", "Click through Revenue",
    "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
    "Cost", "ROAS",
]


def clean_clevertap_rcs(df: pd.DataFrame) -> pd.DataFrame:
    df = add_common_dimensions(df.copy())
    sent = clean_number(first_existing(df, "Total Sent(users)", "Total Sent"))
    delivered = clean_number(first_existing(df, "Total Delivered(users)", "Total Delivered", "Delivered"))
    viewed = clean_number(first_existing(df, "Total Viewed(users)", "Viewed", "Total Viewed"))
    clicks = clean_number(first_existing(df, "Total Clicked(users)", "Clicked", "Total Clicks"))
    conversions = clean_number(first_existing(df, "Click through conversions", "Click Through Conversion"))
    influenced = clean_number(first_existing(df, "Influenced Conversions", "Influenced Conversion"))
    revenue = clean_number(first_existing(df, "Click through conversion revenue", "Click through Revenue"))
    cost = clean_number(first_existing(df, "Cost"))

    df["Total Sent"] = sent.astype(int)
    df["Total Delivered"] = delivered.astype(int)
    df["Delivery %"] = safe_rate(delivered, sent)
    df["Viewed"] = viewed.astype(int)
    df["Viewed %"] = safe_rate(viewed, delivered)
    df["Clicked"] = clicks.astype(int)
    df["Clicked%"] = safe_rate(clicks, sent)
    df["CTR"] = safe_rate(clicks, viewed)
    df["Click Through Conversion"] = conversions.astype(int)
    df["Click Through Conversion %"] = safe_rate(conversions, clicks)
    df["Click through Revenue"] = revenue
    df["Influenced Conversion"] = influenced.astype(int)
    df["Influenced Conversion %"] = safe_rate(influenced, sent)
    df["Influenced Revenue"] = clean_number(first_existing(df, "Influenced Revenue"))
    df["Cost"] = cost.where(cost.ne(0), "")
    df["ROAS"] = (revenue / cost.mask(cost.eq(0))).round(2).fillna("")
    return add_if_missing(df, RCS_COLUMNS)
