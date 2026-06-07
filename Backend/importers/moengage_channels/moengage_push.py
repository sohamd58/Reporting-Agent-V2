import pandas as pd

from .utils import select_columns

MOENGAGE_PUSH_COLUMNS = [
    "Date", "Time", "Month", "Campaign Name", "Campaign ID",
    "Conversion Goal 1 Event", "Message", "Title", "Android Sent",
    "Ios Sent", "Web Sent", "All Platform Sent", "Android Sent Rate",
    "Ios Sent Rate", "Web Sent Rate", "All Platform Sent Rate",
    "Android Impressions", "Ios Impressions", "Web Impressions",
    "All Platform Impressions", "Android Impression Rate",
    "Ios Impression Rate", "Web Impression Rate", "All Platform Impression Rate",
    "Android Clicks", "Ios Clicks", "Web Clicks", "All Platform Clicks",
    "Android CTR", "Ios CTR", "Web CTR", "All Platform CTR",
    "Goal 1 Click Through Conversion Events Android",
    "Goal 1 Click Through Conversion Events Ios",
    "Goal 1 Click Through Conversion Events Web",
    "Goal 1 Click Through Conversion Events All Platform",
    "Goal 1 Click Through Total Revenue Android",
    "Goal 1 Click Through Total Revenue Ios",
    "Goal 1 Click Through Total Revenue Web",
    "Goal 1 Click Through Total Revenue All Platform",
    "Goal 1 View Through Conversion Events Android",
    "Goal 1 View Through Conversion Events Ios",
    "Goal 1 View Through Conversion Events Web",
    "Goal 1 View Through Conversion Events All Platform",
    "Goal 1 View Through Total Revenue Android",
    "Goal 1 View Through Total Revenue Ios",
    "Goal 1 View Through Total Revenue Web",
    "Goal 1 View Through Total Revenue All Platform",
]

PUSH_ALIASES = {
    "Date": ["Send Date", "Run Date"],
    "Time": ["Send Time", "Start Time"],
    "Month": ["Month Name"],
    "Campaign ID": ["Campaign Id", "CampaignID"],
    "Conversion Goal 1 Event": ["Conversion Goal 1", "Goal 1 Event"],
    "Message": ["Body", "Description"],
    "Title": ["Headline", "Push Title"],
    "Android Sent": ["Sent Android"],
    "Ios Sent": ["iOS Sent", "IOS Sent", "Sent Ios", "Sent iOS"],
    "Web Sent": ["Sent Web"],
    "All Platform Sent": ["Total Sent", "Sent"],
    "Android Impressions": ["Android Impression", "Impressions Android"],
    "Ios Impressions": ["iOS Impressions", "IOS Impressions", "Impressions Ios"],
    "Web Impressions": ["Web Impression", "Impressions Web"],
    "All Platform Impressions": ["Total Impressions", "Impressions"],
    "Android Clicks": ["Clicks Android"],
    "Ios Clicks": ["iOS Clicks", "IOS Clicks", "Clicks Ios"],
    "Web Clicks": ["Clicks Web"],
    "All Platform Clicks": ["Total Clicks", "Clicks"],
    "All Platform CTR": ["CTR"],
}


def clean_moengage_push(df: pd.DataFrame) -> pd.DataFrame:
    return select_columns(df, MOENGAGE_PUSH_COLUMNS, PUSH_ALIASES)
