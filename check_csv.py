import pandas as pd

# Change this to your actual CSV file path
file_path = "Levis_20Aprto26Apr_RawData - Levis_20Aprto26Apr_RawData.csv"

df = pd.read_csv(file_path)
print("Column names:", list(df.columns))
print("\nFirst 2 rows of 'Run Date' and 'Start Time':")
print(df[["Run Date", "Start Time"]].head(2))
print("\nData types:")
print(df[["Run Date", "Start Time"]].dtypes)