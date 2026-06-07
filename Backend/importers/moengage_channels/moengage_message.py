import pandas as pd

from .utils import select_columns

MOENGAGE_MESSAGE_COLUMNS = [
    "Date", "Send Time", "Channel", "Campaign Type", "Brand",
    "Master Campaign / Offer Category", "Campaign Name", "Segment Name",
    "Segment Logic", "Total Sent", "Total Delivered", "Delivery Rate",
    "Total Read", "Read Rate", "Total Clicks", "Unique Clicks", "CTR",
    "Click to Open Rate", "Goal 1 Conversions", "Goal 2 Add to Cart",
    "Total Campaign Revenue INR", "Campaign Channel Type", "Template Type",
    "Segment Customer Base Type", "Track Goals for", "Campaign ID",
    "Campaign Purchased Customers", "Campaign Purchased Customers - Online",
    "Campaign Purchased Customers - Offline", "Influenced Revenue",
    "Influenced Revenue - Online", "Influenced Revenue - Offline",
]

MESSAGE_ALIASES = {
    "Date": ["Send Date", "Run Date"],
    "Send Time": ["Time", "Start Time"],
    "Campaign Type": ["Type"],
    "Brand": ["App Name", "Project", "Workspace"],
    "Master Campaign / Offer Category": ["Master Campaign", "Offer Category", "Category"],
    "Segment Name": ["Segment", "Audience"],
    "Segment Logic": ["Segment Filter", "Segment Query"],
    "Total Sent": ["Sent"],
    "Total Delivered": ["Delivered"],
    "Delivery Rate": ["Delivery rate (%)", "Delivery %"],
    "Total Read": ["Read", "Viewed", "Total Viewed"],
    "Read Rate": ["Read rate (%)", "Read %", "View Rate"],
    "Total Clicks": ["Clicks"],
    "Unique Clicks": ["Clicked Users", "Unique Clicked"],
    "Click to Open Rate": ["CTOR"],
    "Goal 1 Conversions": ["Conversion Goal 1", "Goal 1 Converted Users"],
    "Goal 2 Add to Cart": ["Conversion Goal 2", "Goal 2 Converted Users"],
    "Total Campaign Revenue INR": ["Total Revenue", "Revenue"],
    "Campaign Channel Type": ["Channel"],
    "Campaign ID": ["Campaign Id", "CampaignID"],
}


def clean_moengage_whatsapp(df: pd.DataFrame) -> pd.DataFrame:
    return select_columns(df, MOENGAGE_MESSAGE_COLUMNS, MESSAGE_ALIASES)


def clean_moengage_sms(df: pd.DataFrame) -> pd.DataFrame:
    return select_columns(df, MOENGAGE_MESSAGE_COLUMNS, MESSAGE_ALIASES)


def clean_moengage_rcs(df: pd.DataFrame) -> pd.DataFrame:
    return select_columns(df, MOENGAGE_MESSAGE_COLUMNS, MESSAGE_ALIASES)
