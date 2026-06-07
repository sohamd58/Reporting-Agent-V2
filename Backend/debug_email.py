# debug_email.py
import pandas as pd
import numpy as np
import json
import re
from importers.clevertap_channels.clevertap_email import clean_clevertap_email

# Load your mixed CSV (adjust path if needed)
file_path = "Levis_20Aprto26Apr_RawData - Levis_20Aprto26Apr_RawData.csv"
df_raw = pd.read_csv(file_path)

# Clean using your email cleaner
df_cleaned = clean_clevertap_email(df_raw)

print("\n--- Cleaned DataFrame columns ---")
print(list(df_cleaned.columns))

print("\n--- First 5 rows of Date and Time columns ---")
if 'Date' in df_cleaned.columns:
    print(df_cleaned['Date'].head())
else:
    print("Column 'Date' not found in cleaned output")

if 'Time' in df_cleaned.columns:
    print(df_cleaned['Time'].head())
else:
    print("Column 'Time' not found in cleaned output")

print("\n--- Any other date-like columns? ---")
for col in df_cleaned.columns:
    if 'date' in col.lower():
        print(col)
