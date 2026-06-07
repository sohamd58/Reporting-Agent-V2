import pandas as pd

from .utils import select_columns

MOENGAGE_EMAIL_COLUMNS = [
    "Send Date", "Send Time", "Brand", "Campaign Name",
    "Campaign Content Type", "Conversion Goal 1", "Conversion Goal 2",
    "Segment", "Email Subject", "Total Sent", "Total Delivered", "Drops",
    "Unique opens", "Total Open", "Unique clicks", "Total clicks",
    "Delivery rate (%)", "Open rate (%)", "CTR (%)", "Total Hard bounces",
    "Total Soft bounces", "Unsubscribes", "Complaints",
    "Goal 1 (Purchase) Converted Users",
    "Goal 2 (Add-to-Cart) Converted Users",
    "Goal 1 (Purchase) Conversion Events",
    "Goal 2 (Add-to-Cart) Conversion Events", "Total Revenue",
]

EMAIL_ALIASES = {
    "Send Date": ["Date", "Run Date"],
    "Send Time": ["Time", "Start Time"],
    "Brand": ["App Name", "Project", "Workspace"],
    "Campaign Content Type": ["Content Type"],
    "Conversion Goal 1": ["Goal 1", "Goal 1 Name"],
    "Conversion Goal 2": ["Goal 2", "Goal 2 Name"],
    "Segment": ["Segment Name", "Audience"],
    "Email Subject": ["Subject", "Title"],
    "Total Sent": ["Sent"],
    "Total Delivered": ["Delivered"],
    "Unique opens": ["Unique Opens", "Unique Open"],
    "Total Open": ["Total Opens", "Opens"],
    "Unique clicks": ["Unique Clicks", "Unique Click"],
    "Total clicks": ["Total Clicks", "Clicks"],
    "Delivery rate (%)": ["Delivery Rate", "Delivery %"],
    "Open rate (%)": ["Open Rate", "Open %"],
    "CTR (%)": ["CTR", "Click Rate"],
    "Total Hard bounces": ["Hard Bounces"],
    "Total Soft bounces": ["Soft Bounces"],
    "Unsubscribes": ["Unsubscribed"],
    "Complaints": ["Spam Complaints"],
    "Total Revenue": ["Revenue"],
}


def clean_moengage_email(df: pd.DataFrame) -> pd.DataFrame:
    return select_columns(df, MOENGAGE_EMAIL_COLUMNS, EMAIL_ALIASES)
