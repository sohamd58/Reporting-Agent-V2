import pandas as pd


BLANK_VALUES = {"", "nan", "NaT", "<NA>", "None"}


def normalize_text(value) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip()


def first_existing(df: pd.DataFrame, *columns: str, default="") -> pd.Series:
    result = pd.Series([pd.NA] * len(df), index=df.index, dtype="object")
    for column in columns:
        if column not in df.columns:
            continue
        series = df[column]
        missing = result.isna() | result.astype(str).str.strip().isin(BLANK_VALUES)
        result = result.mask(missing, series)
    return result.where(result.notna(), default)


def select_columns(
    df: pd.DataFrame,
    columns: list[str],
    aliases: dict[str, list[str]] | None = None,
) -> pd.DataFrame:
    df = df.copy()
    output = pd.DataFrame(index=df.index)
    aliases = aliases or {}
    for column in columns:
        candidates = [column, *aliases.get(column, [])]
        output[column] = first_existing(df, *candidates)
    return output[columns]
