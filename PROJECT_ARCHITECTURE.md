# Reporting_Agent_v2 Architecture and Structure

## Overview
This repository implements an offline analytics reporting tool built with Streamlit and pandas. It is designed to ingest CSV exports from marketing platforms (primarily CleverTap and MoEngage), clean and normalize campaign data, and generate structured Excel reports using configurable output templates.

The main application is a Streamlit web interface (`app.py`) that offers two primary functions:
- Upload, clean, inspect, and save cleaned CSV data
- Build or select report templates and generate Excel reports

## Repository Structure

- `app.py` - main Streamlit application frontend and controller
- `check_csv.py` - simple local CSV inspection helper
- `debug_email.py` - developer script to test the CleverTap email cleaner
- `test_sidebar.py` - simple Streamlit sidebar debug page
- `config/` - configuration package for template storage
  - `__init__.py` - empty package marker
  - `template_store.py` - load/save report template definitions
  - `report_templates.json` - persisted template JSON data
- `importers/` - CSV cleaning modules for specific channels
  - `__init__.py` - empty package marker
  - `clevertap_email.py` - CleverTap email campaign CSV cleanup
  - `clevertap_push.py` - CleverTap push campaign CSV cleanup
  - `clevertap_mixed.py` - mixed CleverTap channel detection and dispatch
- `data/` - persisted cleaned data output files
- CSV / Excel files - sample input and generated output files in root

## Architecture Summary

### Layers and responsibilities
1. **Presentation Layer**
   - `app.py` renders the Streamlit UI, manages user interactions, and calls cleaning logic.
   - The UI has two views: `main` and `template_editor`.

2. **Business Logic / Cleaning Layer**
   - `importers/clevertap_email.py` cleans email campaign data in detail.
   - `importers/clevertap_push.py` cleans push campaign exports.
   - `importers/clevertap_mixed.py` routes rows to specific cleaners based on channel.

3. **Template Configuration Layer**
   - `config/template_store.py` stores saved templates in `report_templates.json`.
   - It provides default templates for CleverTap and MoEngage channels.

4. **Persistence Layer**
   - Cleaned datasets are saved as parquet files under `data/`.
   - Generated reports are written to `.xlsx` files in the root working directory.

5. **Developer Utilities**
   - `debug_email.py` is a local debugging harness for email cleaning.
   - `check_csv.py` inspects CSV columns and date/time types.
   - `test_sidebar.py` verifies the Streamlit page UI basics.

## Detailed File Behavior

### `app.py`

1. Imports
   - Streamlit UI: `streamlit as st`
   - pandas, os, datetime
   - cleaning functions from `importers.clevertap_email`, `importers.clevertap_push`, and `importers.clevertap_mixed`
   - template helpers from `config.template_store`

2. Streamlit page configuration
   - `st.set_page_config(...)` sets title, icon, layout, and sidebar state.

3. Session state initialization
   - `view` defaults to `main`
   - `cleaned_df` defaults to `None`
   - `saved_files` defaults to `[]`
   - `editor_columns` defaults to `[]`

4. Inline CSS injection
   - Custom CSS styles page background, sidebar, buttons, tables, and form elements.

5. Sidebar content
   - Project branding block
   - Button to switch to `template_editor`
   - Button to return to `main`
   - Footer captions stating offline operation

6. Function `main_view()`
   - Renders upload section: title, description, file uploader
   - Presents platform selector: `CleverTap` or `MoEngage`
   - Presents report type selector:
     - `Email Campaign`
     - `Push Notification`
     - `Mixed (auto‑detect channel)`
   - After upload, reads the CSV with `pd.read_csv(uploaded_file)`
   - Shows row/column/file metadata and raw preview
   - Defines `clean_based_on_type(...)` dispatch:
     - `CleverTap Email Campaign` → `clean_clevertap_email(df)`
     - `CleverTap Push Notification` → `clean_clevertap_push(df)`
     - `CleverTap Mixed` → `clean_clevertap_mixed(df)`
     - Other combinations display warning and return raw data
   - `Clean & Prepare Data` button cleans and stores in session state
   - If cleaned data exists, shows preview and column type summary
   - `Confirm & Save` button writes cleaned data to `data/*.parquet`

7. Report generation section
   - Lists existing `.parquet` cleaned files from `data/`
   - Loads saved templates from `load_templates()`
   - Lets user choose a template and generate an Excel report
   - For each template column definition:
     - If `source == direct`, it copies the source column from cleaned data
     - If `source == calculated`, it evaluates `df.eval(formula)`
     - If formula contains `/`, it multiplies result by 100 and formats as percent
   - Writes report to `report_YYYYMMDD_HHMMSS.xlsx`
   - Provides a download button

8. Function `template_editor_view()`
   - Renders template builder instructions and available cleaned columns
   - Presents an add-column form with:
     - output column name
     - include checkbox
     - source type selector (`direct` or `calculated`)
     - input column selector or formula text entry
   - Stores added columns in `st.session_state.editor_columns`
   - Displays current ad-hoc template columns with inline editing and deletion
   - Allows saving as:
     - ad-hoc template (session only)
     - saved named template using `add_template()`
   - Saved templates become available in `main_view()` report generation

9. View rendering
   - Chooses current view based on `st.session_state.view`

### `config/template_store.py`

1. `TEMPLATES_FILE`
   - Points to `config/report_templates.json`

2. `get_default_templates()`
   - Returns a dictionary of default report template definitions.
   - Includes templates for CleverTap and MoEngage channels:
     - Email, Push, SMS, RCS, WhatsApp, In-app, Web Pop-up, Native Display, OSM
   - Each template is a dict with a `columns` list.
   - Each column has:
     - `name` → output column label
     - `source` → `direct` or `calculated`
     - `column` → source column name when direct
     - `formula` → expression when calculated

3. `load_templates()`
   - Creates `report_templates.json` with default templates if missing
   - Loads JSON content and returns dictionary of templates

4. `save_templates(templates)`
   - Writes template dictionary to JSON file

5. `add_template(name, column_definitions)`
   - Loads existing templates
   - Adds or overwrites a named template
   - Persists back to JSON

6. `delete_template(name)`
   - Removes a named template from JSON

### `importers/clevertap_email.py`

1. Entry function `clean_clevertap_email(df)`
   - Copies input DataFrame to avoid mutating original

2. Deduplicate identical columns
   - `_deduplicate_identical_columns(df)` drops duplicate `Total Unsubscribes*` columns if identical

3. Run Date detection and parsing
   - Searches any column matching `/run\s*date/i`
   - Converts to datetime with `dayfirst=True`
   - Creates `Date`, `Month`, `Run Date` columns
   - Defaults to NaN if not found

4. Start Time detection and parsing
   - Searches columns matching `/start\s*time/i`
   - Converts times using `%H:%M`
   - Creates `Time` and `Start Time`
   - Defaults to NaN if missing

5. Numeric column cleaning
   - Defines known metric names such as `Total Sent(users)`, `Total Delivered(users)`, `Total Viewed(events)`, etc.
   - Adds any columns containing keywords like `Sent`, `Delivered`, `Viewed`, `Clicked`, `Errors`, `Unsubscribes`, `conversions`, `revenue`, `Influenced`
   - Replaces `-`, `—`, `N/A` with `NaN`
   - Converts to numeric, coerces errors
   - Fills NA with 0 and converts to integer when numeric values exist

6. Derived metrics calculation
   - Calculates percentages when required columns exist:
     - `Delivered %`
     - `Total Open%`, `Unique Open %`
     - `Total Clicked%`, `Unique Clicked%`
     - `CTR %`, `CTOR %`
     - `Unsubscribed %`, `Error %`

7. Subject and Preheader extraction
   - If `Title` column exists, attempts JSON parse
   - Extracts `Subject` and `Preheader` keys
   - Handles quoted strings and invalid JSON safely

8. Column renaming
   - Renames raw CleverTap columns to user-friendly names:
     - `Total Sent(users)` → `Total Sent`
     - `Total Delivered(users)` → `Delivered`
     - `Total Viewed(events)` → `Total Opens`
     - `Total Viewed(users)` → `Unique Opens`
     - `Total Clicked(events)` → `Total Clicks`
     - `Total Clicked(users)` → `Unique Clicks`
     - Several others preserved or renamed consistently

9. Output column selection
   - Builds `final_columns` from a fixed order list
   - Includes derived percentage columns if present
   - Drops helper columns used only for sorting

10. Sorting
   - Sorts by combined `Run Date` and `Start Time` when available
   - Otherwise sorts by `Run Date`
   - Resets index

11. Returns cleaned DataFrame

### `importers/clevertap_push.py`

1. Entry function `clean_clevertap_push(df)`
   - Copies input DataFrame

2. Run Date parsing
   - Converts `Run Date` column using `%d/%m/%Y`
   - Extracts `Year`, `Month`, `Day`, `Weekday`

3. Numeric conversion
   - Converts object columns to numeric if they are not percentages
   - Replaces `-` and `—` with missing values

4. Metric normalization
   - Ensures integer values for standard metrics
   - Handles both standard CleverTap names and variations (`Total Sent`, `Total Delivered`, `Total Viewed`, `Total Clicked`)
   - Keeps raw metric columns where present

5. Returns cleaned DataFrame

### `importers/clevertap_mixed.py`

1. Entry function `clean_clevertap_mixed(df)`
   - Copies input DataFrame

2. Channel inference
   - If `Channel` column is missing, infers from `Campaign Name` prefixes:
     - `Push_` → `Push Notification`
     - `Email_` → `Email`
     - `SMS_` → `Sms`
     - `WA_` → `WhatsApp`
     - `InApp_` → `InApp Notification`
     - `WebPopUp_` → `Web`
     - `NativeDisplay_` → `Native Display`
     - otherwise `Unknown`

3. Cleaner dispatch map
   - `Email` → `clean_clevertap_email`
   - `Push Notification` → `clean_clevertap_push`
   - Other channels are not yet implemented, but current structure allows adding more cleaners

4. Batch cleaning
   - Splits rows by unique channel
   - Applies the appropriate cleaner when available
   - Preserves raw subset and prints a warning if cleaning fails or if no cleaner exists
   - Concatenates cleaned subsets back into one DataFrame

### `config/__init__.py`

- Empty file that marks `config/` as a Python package.

### `check_csv.py`

- Loads sample CSV file `Levis_20Aprto26Apr_RawData - Levis_20Aprto26Apr_RawData.csv`
- Prints column names
- Prints first 2 rows of `Run Date` and `Start Time`
- Prints dtype information for those columns
- Used as a quick diagnostic utility for CSV structure

### `debug_email.py`

- Imports `clean_clevertap_email` from `importers`
- Reads the same sample CSV file
- Runs the cleaner and prints cleaned output column names
- Prints first 5 rows of `Date` and `Time` from cleaned data
- Reports any date-like output columns
- Used to verify the email cleaner logic on sample data

### `test_sidebar.py`

- Minimal Streamlit test page
- Sets page layout to wide
- Writes a sidebar debug message and main page text
- Used for sanity-checking Streamlit deployment

## Typical Execution Flow

1. Run `streamlit run app.py`
2. `app.py` displays a branded interface with sidebar controls
3. User uploads a marketing platform CSV file
4. `app.py` parses the CSV and shows a preview
5. User chooses platform and report type
6. The matching cleaner function processes the raw DataFrame
7. Cleaned output is shown and saved as a parquet file in `data/`
8. The user selects a cleaned dataset and a report template
9. `app.py` constructs the Excel output from template column definitions
10. The report is written as `.xlsx` and served via Streamlit download button

## Notes for AI Context

- The main decision point is in `app.py` where platform and report type determine which cleaner runs.
- `config/template_store.py` contains the schema for saved report templates and default templates.
- `importers/clevertap_email.py` is the most detailed cleaner and performs parsing, numeric coercion, derived metric calculations, and output normalization.
- `importers/clevertap_push.py` handles a simpler push-specific cleanup path.
- `importers/clevertap_mixed.py` is the dispatcher for mixed channel exports and can be extended with additional channel-specific cleaners.
- The project currently assumes offline processing and local file persistence; no external API calls or network uploads are present.
