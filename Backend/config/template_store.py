import json
import os

TEMPLATES_FILE = os.path.join(os.path.dirname(__file__), "report_templates.json")

LEGACY_DEFAULT_TEMPLATE_NAMES = {
    "CleverTap Email - Weekly Summary",
    "CleverTap Push - Weekly Summary",
    "CleverTap SMS - Weekly Summary",
    "CleverTap RCS - Weekly Summary",
    "CleverTap WhatsApp - Weekly Summary",
    "CleverTap In-app - Weekly Summary",
    "CleverTap Web Pop-up - Weekly Summary",
    "CleverTap Native Display - Weekly Summary",
    "CleverTap Mixed - Default",
    "MoEngage Email - Weekly Summary",
    "MoEngage Push - Weekly Summary",
    "MoEngage SMS - Weekly Summary",
    "MoEngage RCS - Weekly Summary",
    "MoEngage WhatsApp - Weekly Summary",
    "MoEngage OSM - Weekly Summary",
    "MoEngage Mixed - Default",
}


def _direct_template(columns: list[str]) -> dict:
    return {
        "columns": [
            {"name": column, "source": "direct", "column": column}
            for column in columns
        ]
    }


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

CLEVERTAP_PUSH_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Impression", "Impression %",
    "Clicked", "Clicked%", "CTR", "Click Through Conversion",
    "Click Through Conversion %", "Click through Revenue",
    "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
    "Headline", "Body",
]

CLEVERTAP_EMAIL_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Total Viewed", "Viewed %",
    "Clicked", "Clicked%", "CTR", "Click Through Conversion",
    "Click Through Conversion %", "Click through Revenue",
    "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
    "Subject", "Preheader",
]

CLEVERTAP_SMS_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Total Delivered", "Delivery %",
    "Clicked", "Clicked%", "CTR", "Click Through Conversion",
    "Click Through Conversion %", "Click through Revenue",
    "Influenced Conversion", "Influenced Conversion %", "Influenced Revenue",
    "Cost", "ROAS", "Message",
]

CLEVERTAP_RCS_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Total Delivered", "Delivery %",
    "Viewed", "Viewed %", "Clicked", "Clicked%", "CTR",
    "Click Through Conversion", "Click Through Conversion %",
    "Click through Revenue", "Influenced Conversion",
    "Influenced Conversion %", "Influenced Revenue", "Cost", "ROAS",
]

CLEVERTAP_WHATSAPP_COLUMNS = [
    "Date", "Time", "Week", "Month", "Campaign Name", "Label", "Segment",
    "Estimated Reach", "Total Sent", "Total Delivered", "Delivery %",
    "Total Viewed", "Viewed %", "Clicked", "Clicked%", "CTR",
    "Click Through Conversion", "Click Through Conversion %",
    "Click through Revenue", "Influenced Conversion",
    "Influenced Conversion %", "Influenced Revenue", "Cost", "ROAS", "Message",
]

CLEVERTAP_MIXED_COLUMNS = [
    "Date", "Time", "Channel", "Week", "Month", "Campaign Name", "Labels",
    "Segments", "Estimated Reach", "Sent", "Delivered", "Delivered %",
    "Viewed", "Viewed %", "Clicked", "Clicked %", "CTR",
    "Click through conversion", "Click Through Conversion %",
    "Click through conversion revenue", "Influenced Conversions",
    "Influenced Conversion %", "Influenced Revenue", "Cost", "ROAS",
    "Title", "Message",
]


def get_default_templates():
    return {
        "CleverTap Push": _direct_template(CLEVERTAP_PUSH_COLUMNS),
        "CleverTap Email": _direct_template(CLEVERTAP_EMAIL_COLUMNS),
        "CleverTap SMS": _direct_template(CLEVERTAP_SMS_COLUMNS),
        "CleverTap RCS": _direct_template(CLEVERTAP_RCS_COLUMNS),
        "CleverTap WhatsApp": _direct_template(CLEVERTAP_WHATSAPP_COLUMNS),
        "CleverTap Mixed": _direct_template(CLEVERTAP_MIXED_COLUMNS),
        "CleverTap Reporting Agent - Default": _direct_template(CLEVERTAP_MIXED_COLUMNS),
        "MoEngage Push": _direct_template(MOENGAGE_PUSH_COLUMNS),
        "MoEngage Email": _direct_template(MOENGAGE_EMAIL_COLUMNS),
        "MoEngage WhatsApp": _direct_template(MOENGAGE_MESSAGE_COLUMNS),
        "MoEngage SMS": _direct_template(MOENGAGE_MESSAGE_COLUMNS),
        "MoEngage RCS": _direct_template(MOENGAGE_MESSAGE_COLUMNS),
    }


def load_templates():
    defaults = get_default_templates()
    if not os.path.exists(TEMPLATES_FILE):
        save_templates(defaults)
        return defaults

    with open(TEMPLATES_FILE, "r") as f:
        templates = json.load(f)

    changed = False
    for name in LEGACY_DEFAULT_TEMPLATE_NAMES:
        if name in templates:
            del templates[name]
            changed = True

    for name, template in defaults.items():
        if templates.get(name) != template:
            templates[name] = template
            changed = True

    if changed:
        save_templates(templates)

    return templates


def save_templates(templates):
    os.makedirs(os.path.dirname(TEMPLATES_FILE), exist_ok=True)
    with open(TEMPLATES_FILE, "w") as f:
        json.dump(templates, f, indent=2)


def add_template(name, column_definitions):
    templates = load_templates()
    templates[name] = {"columns": column_definitions}
    save_templates(templates)


def delete_template(name):
    templates = load_templates()
    if name in templates:
        del templates[name]
        save_templates(templates)
