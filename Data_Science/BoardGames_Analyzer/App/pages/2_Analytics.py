import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import ast
from collections import Counter

import altair as alt
import numpy as np
import pandas as pd
import streamlit as st

import theme

st.set_page_config(
    page_title="Analytics · Board Game Discovery Engine",
    page_icon="📊",
    layout="wide",
)
theme.set_meta_description(
    "Charts of the BoardGameGeek data behind the recommender: ratings, complexity, "
    "top games, common mechanics and categories, and releases per year."
)

st.sidebar.title("Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
colors = theme.chart_colors(selected_theme)

PROJECT_ROOT = Path(__file__).parent.parent.parent
RAW_PATH = PROJECT_ROOT / "Dataset" / "Raw"
PROCESSED_PATH = PROJECT_ROOT / "Dataset" / "Processed"


# ─────────────────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────────────────
@st.cache_data(show_spinner="Loading the game data...")
def load_games() -> pd.DataFrame:
    df = pd.read_csv(RAW_PATH / "games_detailed_info.csv", low_memory=False)
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    df = df.dropna(subset=["id"]).drop_duplicates(subset=["id"]).copy()
    df["id"] = df["id"].astype(int)
    for col in ["bayesaverage", "average", "usersrated", "averageweight", "yearpublished", "numcomments"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    for candidate in ["primary", "name", "title"]:
        if candidate in df.columns:
            df["game_name"] = df[candidate].astype(str)
            break
    return df


@st.cache_data(show_spinner="Loading review sentiment...")
def load_sentiment() -> pd.DataFrame:
    path = PROCESSED_PATH / "sentiment_summary.csv"
    if not path.exists():
        return pd.DataFrame()
    df = pd.read_csv(path)
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    return df.dropna(subset=["id"])


@st.cache_data
def parse_list_col(series: pd.Series) -> pd.Series:
    def _parse(x):
        if pd.isna(x) or not str(x).strip():
            return []
        s = str(x).strip()
        if s.startswith("["):
            try:
                parsed = ast.literal_eval(s)
                if isinstance(parsed, (list, tuple)):
                    return [str(i).strip() for i in parsed if str(i).strip()]
            except Exception:
                pass
        if "|" in s:
            return [i.strip() for i in s.split("|") if i.strip()]
        return [i.strip() for i in s.split(",") if i.strip()]
    return series.apply(_parse)


@st.cache_data
def top_values(parsed_series: pd.Series, n: int = 20) -> pd.Series:
    counter: Counter = Counter()
    for items in parsed_series:
        counter.update(items)
    return pd.Series(dict(counter.most_common(n)))


# ─────────────────────────────────────────────────────────────────
# Chart helpers
# Altair draws vector charts with fixed-size text, so labels stay readable on a phone.
# (The old matplotlib images shrank to about a quarter of their size there, leaving
# ~5px labels.) theme=None keeps Streamlit's OS-driven chart theme from overriding
# these colours, which follow the app's own Light/Dark toggle.
# ─────────────────────────────────────────────────────────────────
CHART_FONT = '"Source Sans", "Source Sans Pro", sans-serif'


def show_chart(chart, height):
    chart = (
        chart.properties(height=height, background="transparent")
        .configure_view(stroke=None)
        .configure_axis(
            labelColor=colors["text"], titleColor=colors["text"],
            gridColor=colors["grid"], domainColor=colors["grid"], tickColor=colors["grid"],
            labelFontSize=12, titleFontSize=12, labelFont=CHART_FONT, titleFont=CHART_FONT,
            titleFontWeight=600,
        )
        .configure_title(color=colors["text"], fontSize=14, font=CHART_FONT, anchor="start", fontWeight=600)
    )
    st.altair_chart(chart, width="stretch", theme=None)


def hbar_chart(data, label_col, value_col, color, value_title, value_format=",.0f", title="", zero=True):
    """Horizontal bars, longest at the top, each labelled with its value."""
    domain = None
    if not zero:
        # Ratings bunch together (e.g. 8.0 to 8.6), so start the axis just below the lowest bar
        lo, hi = data[value_col].min(), data[value_col].max()
        pad = max((hi - lo) * 0.15, 0.05)
        domain = [lo - pad, hi + pad]
    base = alt.Chart(data, title=title).encode(
        y=alt.Y(f"{label_col}:N", sort="-x", title=None, axis=alt.Axis(labelLimit=170)),
        x=alt.X(
            f"{value_col}:Q", title=value_title,
            scale=alt.Scale(zero=zero, domain=domain) if domain else alt.Scale(zero=zero),
            # Big counts read as 20k / 40k on the axis (full numbers sit on the bars);
            # at phone width "80,000100,000" ran together
            axis=alt.Axis(format="~s" if value_format == ",.0f" else value_format, tickCount=4, labelOverlap=True),
        ),
        tooltip=[
            alt.Tooltip(f"{label_col}:N", title="Name"),
            alt.Tooltip(f"{value_col}:Q", title=value_title, format=value_format),
        ],
    )
    bars = base.mark_bar(color=color, cornerRadiusEnd=3)
    if domain:
        # Vega-Lite draws bars from 0 even on a non-zero axis (they came out 0px wide),
        # so start them at the axis minimum. No clip=True: with several charts on one
        # page the SVG clip-path ids can collide and hide another chart's bars.
        bars = bars.encode(x2=alt.datum(domain[0]))
    values = base.mark_text(align="left", dx=4, color=colors["text"], fontSize=11, font=CHART_FONT).encode(
        text=alt.Text(f"{value_col}:Q", format=value_format)
    )
    show_chart(bars + values, height=max(220, 24 * len(data)))


def histogram_chart(values, bins, color, value_title, title="", mean_label=None):
    """Bins in pandas first, so the browser gets ~40 bars instead of thousands of raw values."""
    counts, edges = np.histogram(values.dropna(), bins=bins)
    hist = pd.DataFrame({"start": edges[:-1], "end": edges[1:], "games": counts})
    chart = alt.Chart(hist, title=title).mark_bar(color=color, opacity=0.9).encode(
        x=alt.X("start:Q", title=value_title, bin="binned", axis=alt.Axis(tickCount=6)),
        x2="end:Q",
        y=alt.Y("games:Q", title="Games", axis=alt.Axis(format=",.0f", tickCount=5)),
        tooltip=[
            alt.Tooltip("start:Q", title="From", format=".2f"),
            alt.Tooltip("end:Q", title="To", format=".2f"),
            alt.Tooltip("games:Q", title="Games", format=","),
        ],
    )
    if mean_label is not None:
        mean = float(values.mean())
        rule = alt.Chart(pd.DataFrame({"mean": [mean]})).mark_rule(
            color=colors["text"], strokeDash=[5, 4], size=1.5
        ).encode(x="mean:Q")
        label = alt.Chart(pd.DataFrame({"mean": [mean], "text": [mean_label]})).mark_text(
            align="left", dx=6, dy=-6, baseline="top", color=colors["text"], fontSize=12, font=CHART_FONT
        ).encode(x="mean:Q", y=alt.value(0), text="text:N")
        chart = chart + rule + label
    show_chart(chart, height=280)


# ─────────────────────────────────────────────────────────────────
# Load data
# ─────────────────────────────────────────────────────────────────
df = load_games()
sent_df = load_sentiment()

# ─────────────────────────────────────────────────────────────────
# Sidebar filters
# ─────────────────────────────────────────────────────────────────
st.sidebar.markdown("---")
st.sidebar.markdown("**Chart filters**")

min_votes = st.sidebar.slider("Minimum ratings", 100, 5000, 500, step=100, help="Hides games with fewer user ratings from the rating and complexity charts.")

year_min_raw = int(df["yearpublished"].dropna().clip(1900, 2030).min())
year_max_raw = min(int(df["yearpublished"].dropna().clip(1900, 2030).max()), 2025)
year_range = st.sidebar.slider(
    "Years shown",
    year_min_raw, year_max_raw,
    (1970, year_max_raw),
)

top_n_bars = st.sidebar.slider("Bars per chart", 10, 25, 15, step=5)

df_rated = df[df["usersrated"].fillna(0) >= min_votes].copy()

# ─────────────────────────────────────────────────────────────────
# Header
# ─────────────────────────────────────────────────────────────────
st.markdown('<div class="main-title">The data behind it</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">The 21,631 BoardGameGeek games the recommender searches, in charts.</div>',
    unsafe_allow_html=True,
)
st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Overview metric cards
# ─────────────────────────────────────────────────────────────────
m1, m2, m3, m4 = st.columns(4)
with m1:
    st.metric("Games", f"{len(df):,}")
with m2:
    avg_r = df_rated["bayesaverage"].mean()
    st.metric("Average BGG rating", f"{avg_r:.2f}" if not np.isnan(avg_r) else "—")
with m3:
    avg_w = df_rated["averageweight"].mean()
    st.metric("Average complexity (1 to 5)", f"{avg_w:.2f}" if not np.isnan(avg_w) else "—")
with m4:
    st.metric(f"Games with {min_votes:,}+ ratings", f"{len(df_rated):,}")

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 1 — Rating distribution + Complexity distribution
# ─────────────────────────────────────────────────────────────────
st.markdown('<div class="section-title">Ratings and complexity</div>', unsafe_allow_html=True)
d1, d2 = st.columns(2)

with d1:
    histogram_chart(df_rated["bayesaverage"], 40, colors["primary"], "BGG rating (Bayes average)",
                    title="BGG rating")

with d2:
    histogram_chart(df_rated["averageweight"], 30, colors["secondary"], "Complexity (1 = light, 5 = heavy)",
                    title="Complexity")

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 2 — Top-rated games
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Top {top_n_bars} highest-rated games (at least {min_votes:,} ratings)</div>',
    unsafe_allow_html=True,
)
top_rated = df_rated.nlargest(top_n_bars, "bayesaverage")[["game_name", "bayesaverage"]].copy()
if top_rated.empty:
    st.info("No games have that many ratings. Lower the **Minimum ratings** slider.")
else:
    hbar_chart(top_rated, "game_name", "bayesaverage", colors["primary"], "BGG rating (Bayes average)",
               value_format=".2f", zero=False)

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 3 — Most-rated games (by number of user ratings)
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Top {top_n_bars} most-rated games</div>',
    unsafe_allow_html=True,
)
top_reviewed = df.nlargest(top_n_bars, "usersrated")[["game_name", "usersrated"]].copy()
hbar_chart(top_reviewed, "game_name", "usersrated", colors["accent"], "User ratings")

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 4 — Mechanics + Categories (side by side)
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Top {top_n_bars} mechanics and categories</div>',
    unsafe_allow_html=True,
)
mc1, mc2 = st.columns(2)

with mc1:
    if "boardgamemechanic" in df.columns:
        parsed_mechs = parse_list_col(df["boardgamemechanic"])
        top_mechs = top_values(parsed_mechs, n=top_n_bars)
        hbar_chart(top_mechs.rename_axis("mechanic").reset_index(name="games"), "mechanic", "games",
                   colors["primary"], "Games", title="Mechanics")

with mc2:
    if "boardgamecategory" in df.columns:
        parsed_cats = parse_list_col(df["boardgamecategory"])
        top_cats = top_values(parsed_cats, n=top_n_bars)
        hbar_chart(top_cats.rename_axis("category").reset_index(name="games"), "category", "games",
                   colors["secondary"], "Games", title="Categories")

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 5 — Publication year trend
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Games released per year, {year_range[0]} to {year_range[1]}</div>',
    unsafe_allow_html=True,
)
year_df = (
    df[df["yearpublished"].between(year_range[0], year_range[1])]
    .groupby("yearpublished")
    .size()
    .reset_index(name="count")
)
year_df["yearpublished"] = year_df["yearpublished"].astype(int)
year_base = alt.Chart(year_df).encode(
    x=alt.X("yearpublished:Q", title="Year released", axis=alt.Axis(format="d", tickCount=8)),
    y=alt.Y("count:Q", title="Games released", axis=alt.Axis(format=",.0f", tickCount=5)),
    tooltip=[alt.Tooltip("yearpublished:Q", title="Year", format="d"), alt.Tooltip("count:Q", title="Games", format=",")],
)
show_chart(
    year_base.mark_area(color=colors["primary"], opacity=0.15)
    + year_base.mark_line(color=colors["primary"], strokeWidth=2.2)
    + year_base.mark_point(opacity=0, size=60),  # invisible points give the tooltip something to hover
    height=280,
)

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 6 — Sentiment (optional, only if data exists)
# ─────────────────────────────────────────────────────────────────
if not sent_df.empty and "avg_sentiment_score" in sent_df.columns:
    st.markdown('<div class="section-title">How positive the reviews sound</div>', unsafe_allow_html=True)
    st.caption(
        "A DistilBERT model read up to 10 random review comments per game and estimated how likely "
        "each one is to be positive. Each game's score is the average. Games with fewer than 3 comments "
        "aren't shown, and the recommender gives them the overall average."
    )

    sent_scores = sent_df["avg_sentiment_score"].dropna()
    s1, s2 = st.columns([3, 1])

    with s1:
        histogram_chart(sent_scores, 40, colors["accent"], "Average review positivity (0 = negative, 1 = positive)",
                        mean_label=f"Mean {sent_scores.mean():.3f}")

    with s2:
        st.metric("Games scored", f"{len(sent_scores):,}")
        st.metric("Mean", f"{sent_scores.mean():.3f}")
        st.metric("Median", f"{sent_scores.median():.3f}")
        pct_pos = (sent_scores >= 0.5).mean() * 100
        st.metric("Games leaning positive", f"{pct_pos:.1f}%")

    st.markdown("---")

st.caption("BoardGames Analyzer · board game recommendations with reasons · built with Streamlit")
