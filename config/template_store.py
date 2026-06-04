# config/template_store.py
import json
import os

TEMPLATES_FILE = os.path.join(os.path.dirname(__file__), "report_templates.json")

def get_default_templates():
    """Return all default templates for CleverTap and MoEngage channels."""
    return {
        # ==============================
        # CLEVERTAP TEMPLATES
        # ==============================
        # Email
        "CleverTap Email - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Opens", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Delivered(users) * 100"}
            ]
        },
        # Push
        "CleverTap Push - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Impressions", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # SMS
        "CleverTap SMS - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Delivery Rate (%)", "source": "calculated", "formula": "Total Delivered(users) / Total Sent(users) * 100"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Delivered(users) * 100"}
            ]
        },
        # RCS
        "CleverTap RCS - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Viewed", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "View Rate (%)", "source": "calculated", "formula": "Total Viewed(users) / Total Delivered(users) * 100"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # WhatsApp
        "CleverTap WhatsApp - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Read", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Read Rate (%)", "source": "calculated", "formula": "Total Viewed(users) / Total Delivered(users) * 100"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # In-app
        "CleverTap In-app - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Viewed", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "View Rate (%)", "source": "calculated", "formula": "Total Viewed(users) / Total Sent(users) * 100"},
                {"name": "Click Rate (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # Web Pop-up
        "CleverTap Web Pop-up - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Viewed", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Conversion Rate (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # Native Display
        "CleverTap Native Display - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Impressions", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # Mixed (All Channels)
        "CleverTap Mixed - Default": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Channel", "source": "direct", "column": "Channel"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Viewed", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicked", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Conversions", "source": "direct", "column": "Conversions"},
                {"name": "Revenue", "source": "direct", "column": "Revenue"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Delivered(users) * 100"}
            ]
        },

        # ==============================
        # MOENGAGE TEMPLATES
        # ==============================
        # Email
        "MoEngage Email - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Opens", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Delivered(users) * 100"}
            ]
        },
        # Push
        "MoEngage Push - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Impressions", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # SMS
        "MoEngage SMS - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Delivery Rate (%)", "source": "calculated", "formula": "Total Delivered(users) / Total Sent(users) * 100"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Delivered(users) * 100"}
            ]
        },
        # RCS
        "MoEngage RCS - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Viewed", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "View Rate (%)", "source": "calculated", "formula": "Total Viewed(users) / Total Delivered(users) * 100"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # WhatsApp
        "MoEngage WhatsApp - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Read", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Read Rate (%)", "source": "calculated", "formula": "Total Viewed(users) / Total Delivered(users) * 100"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # OSM (Web personalisation)
        "MoEngage OSM - Weekly Summary": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Impressions", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicks", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Viewed(users) * 100"}
            ]
        },
        # Mixed (All Channels)
        "MoEngage Mixed - Default": {
            "columns": [
                {"name": "Campaign Name", "source": "direct", "column": "Campaign Name"},
                {"name": "Channel", "source": "direct", "column": "Channel"},
                {"name": "Run Date", "source": "direct", "column": "Run Date"},
                {"name": "Total Sent", "source": "direct", "column": "Total Sent(users)"},
                {"name": "Total Delivered", "source": "direct", "column": "Total Delivered(users)"},
                {"name": "Total Viewed", "source": "direct", "column": "Total Viewed(users)"},
                {"name": "Total Clicked", "source": "direct", "column": "Total Clicked(users)"},
                {"name": "Conversions", "source": "direct", "column": "Conversions"},
                {"name": "Revenue", "source": "direct", "column": "Revenue"},
                {"name": "CTR (%)", "source": "calculated", "formula": "Total Clicked(users) / Total Delivered(users) * 100"}
            ]
        }
    }

def load_templates():
    """Load saved report templates from JSON file. If file doesn't exist, create with defaults."""
    if not os.path.exists(TEMPLATES_FILE):
        os.makedirs(os.path.dirname(TEMPLATES_FILE), exist_ok=True)
        defaults = get_default_templates()
        with open(TEMPLATES_FILE, "w") as f:
            json.dump(defaults, f, indent=2)
        return defaults
    with open(TEMPLATES_FILE, "r") as f:
        return json.load(f)

def save_templates(templates):
    """Save report templates to JSON file."""
    os.makedirs(os.path.dirname(TEMPLATES_FILE), exist_ok=True)
    with open(TEMPLATES_FILE, "w") as f:
        json.dump(templates, f, indent=2)

def add_template(name, column_definitions):
    """Add a new template or overwrite existing."""
    templates = load_templates()
    templates[name] = {"columns": column_definitions}
    save_templates(templates)

def delete_template(name):
    """Delete a template."""
    templates = load_templates()
    if name in templates:
        del templates[name]
        save_templates(templates)