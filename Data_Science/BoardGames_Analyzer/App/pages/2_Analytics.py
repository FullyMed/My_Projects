import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import ast
from collections import Counter

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import streamlit as st

import theme

st.set_page_config(
    page_title="Analytics — Board Game Discovery Engine",
    page_icon="📊",
    layout="wide",
)

st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
colors = theme.chart_colors(selected_theme)

PROJECT_ROOT = Path(__file__).parent.parent.parent
RAW_PATH = PROJECT_ROOT / "Dataset" / "Raw"
PROCESSED_PATH = PROJECT_ROOT / "Dataset" / "Processed"


# ─────────────────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────────────────
@st.cache_data
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


@st.cache_data
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
# ─────────────────────────────────────────────────────────────────
def _hbar_chart(labels, values, title, color, n):
    """Horizontal bar chart sized to look good at all viewport widths."""
    height = max(3.5, n * 0.35)
    fig, ax = plt.subplots(figsize=(8, height))
    theme.style_ax(ax, fig, colors, title)
    bars = ax.barh(labels, values, color=color, alpha=colors["bar_alpha"])
    ax.set_xlabel("Number of Games", fontsize=9)
    ax.tick_params(labelsize=8)
    # Value labels only when bars are legible
    if n <= 20:
        for bar, val in zip(bars, values):
            ax.text(
                bar.get_width() * 1.01,
                bar.get_y() + bar.get_height() / 2,
                f"{int(val):,}",
                va="center", color=colors["text"], fontsize=8,
            )
    plt.tight_layout()
    st.pyplot(fig, width='stretch')
    plt.close()


def _rating_hbar(names, ratings, title, n, min_votes):
    if len(ratings) == 0:
        st.info("No games match the current vote threshold. Lower the **Min. votes** slider to see results.")
        return
    height = max(3.5, n * 0.35)
    fig, ax = plt.subplots(figsize=(8, height))
    theme.style_ax(ax, fig, colors, "")
    bars = ax.barh(names, ratings, color=colors["primary"], alpha=colors["bar_alpha"])
    ax.set_xlabel("Bayes Average Rating", fontsize=9)
    ax.tick_params(labelsize=8)
    x_pad = (ratings.max() - ratings.min()) * 0.04
    if x_pad == 0:
        x_pad = 0.05
    ax.set_xlim(ratings.min() - x_pad * 4, ratings.max() + x_pad * 6)
    for bar, val in zip(bars, ratings):
        ax.text(
            bar.get_width() + x_pad,
            bar.get_y() + bar.get_height() / 2,
            f"{val:.2f}",
            va="center", color=colors["text"], fontsize=8,
        )
    plt.tight_layout()
    st.pyplot(fig, width='stretch')
    plt.close()


# ─────────────────────────────────────────────────────────────────
# Load data
# ─────────────────────────────────────────────────────────────────
df = load_games()
sent_df = load_sentiment()

# ─────────────────────────────────────────────────────────────────
# Sidebar filters
# ─────────────────────────────────────────────────────────────────
st.sidebar.markdown("---")
st.sidebar.markdown("**Chart Filters**")

min_votes = st.sidebar.slider("Min. votes (rating charts)", 100, 5000, 500, step=100)

year_min_raw = int(df["yearpublished"].dropna().clip(1900, 2030).min())
year_max_raw = min(int(df["yearpublished"].dropna().clip(1900, 2030).max()), 2025)
year_range = st.sidebar.slider(
    "Publication year range",
    year_min_raw, year_max_raw,
    (1970, year_max_raw),
)

top_n_bars = st.sidebar.slider("Items in bar charts", 10, 25, 15, step=5)

df_rated = df[df["usersrated"].fillna(0) >= min_votes].copy()

# ─────────────────────────────────────────────────────────────────
# Header
# ─────────────────────────────────────────────────────────────────
st.markdown('<div class="main-title"><span class="title-icon">📊</span> Dataset Analytics</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Explore the BoardGameGeek dataset powering the recommendation engine.</div>',
    unsafe_allow_html=True,
)
st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Overview metric cards
# ─────────────────────────────────────────────────────────────────
m1, m2, m3, m4 = st.columns(4)
with m1:
    st.metric("Total Games", f"{len(df):,}")
with m2:
    avg_r = df_rated["bayesaverage"].mean()
    st.metric("Avg. Bayes Rating", f"{avg_r:.2f}" if not np.isnan(avg_r) else "—")
with m3:
    avg_w = df_rated["averageweight"].mean()
    st.metric("Avg. Complexity", f"{avg_w:.2f}" if not np.isnan(avg_w) else "—")
with m4:
    st.metric(f"Games (≥ {min_votes:,} votes)", f"{len(df_rated):,}")

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 1 — Rating distribution + Complexity distribution
# ─────────────────────────────────────────────────────────────────
st.markdown('<div class="section-title">Score & Complexity Distributions</div>', unsafe_allow_html=True)
d1, d2 = st.columns(2)

with d1:
    ratings = df_rated["bayesaverage"].dropna()
    fig, ax = plt.subplots(figsize=(6, 3.5))
    theme.style_ax(ax, fig, colors, "Distribution of Bayes Average Ratings")
    ax.hist(ratings, bins=40, color=colors["primary"], alpha=colors["bar_alpha"], edgecolor="none")
    ax.set_xlabel("Bayes Average Rating", fontsize=9)
    ax.set_ylabel("Games", fontsize=9)
    ax.tick_params(labelsize=8)
    plt.tight_layout()
    st.pyplot(fig, width='stretch')
    plt.close()

with d2:
    complexity = df_rated["averageweight"].dropna()
    fig, ax = plt.subplots(figsize=(6, 3.5))
    theme.style_ax(ax, fig, colors, "Complexity Distribution  (1 = Light → 5 = Heavy)")
    ax.hist(complexity, bins=30, color=colors["secondary"], alpha=colors["bar_alpha"], edgecolor="none")
    ax.set_xlabel("Average Weight", fontsize=9)
    ax.set_ylabel("Games", fontsize=9)
    ax.tick_params(labelsize=8)
    plt.tight_layout()
    st.pyplot(fig, width='stretch')
    plt.close()

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 2 — Top-rated games
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Top {top_n_bars} Highest-Rated Games  (min {min_votes:,} votes)</div>',
    unsafe_allow_html=True,
)
top_rated = df_rated.nlargest(top_n_bars, "bayesaverage")[["game_name", "bayesaverage"]].copy()
_rating_hbar(
    top_rated["game_name"].iloc[::-1].values,
    top_rated["bayesaverage"].iloc[::-1].values,
    "",
    top_n_bars,
    min_votes,
)

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 3 — Most reviewed games
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Top {top_n_bars} Most Reviewed Games</div>',
    unsafe_allow_html=True,
)
top_reviewed = df.nlargest(top_n_bars, "usersrated")[["game_name", "usersrated"]].copy()
height = max(3.5, top_n_bars * 0.35)
fig, ax = plt.subplots(figsize=(8, height))
theme.style_ax(ax, fig, colors, "")
bars = ax.barh(
    top_reviewed["game_name"].iloc[::-1].values,
    top_reviewed["usersrated"].iloc[::-1].values,
    color=colors["accent"], alpha=colors["bar_alpha"],
)
ax.set_xlabel("Number of User Ratings", fontsize=9)
ax.tick_params(labelsize=8)
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
for bar, val in zip(bars, top_reviewed["usersrated"].iloc[::-1].values):
    ax.text(
        bar.get_width() * 1.01,
        bar.get_y() + bar.get_height() / 2,
        f"{int(val):,}",
        va="center", color=colors["text"], fontsize=8,
    )
plt.tight_layout()
st.pyplot(fig, width='stretch')
plt.close()

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 4 — Mechanics + Categories (side by side)
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Top {top_n_bars} Mechanics & Categories</div>',
    unsafe_allow_html=True,
)
mc1, mc2 = st.columns(2)

with mc1:
    if "boardgamemechanic" in df.columns:
        parsed_mechs = parse_list_col(df["boardgamemechanic"])
        top_mechs = top_values(parsed_mechs, n=top_n_bars)
        _hbar_chart(
            top_mechs.index[::-1], top_mechs.values[::-1],
            f"Top {top_n_bars} Mechanics", colors["primary"], top_n_bars,
        )

with mc2:
    if "boardgamecategory" in df.columns:
        parsed_cats = parse_list_col(df["boardgamecategory"])
        top_cats = top_values(parsed_cats, n=top_n_bars)
        _hbar_chart(
            top_cats.index[::-1], top_cats.values[::-1],
            f"Top {top_n_bars} Categories", colors["secondary"], top_n_bars,
        )

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 5 — Publication year trend
# ─────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-title">Games Published Per Year  ({year_range[0]}–{year_range[1]})</div>',
    unsafe_allow_html=True,
)
year_df = (
    df[df["yearpublished"].between(year_range[0], year_range[1])]
    .groupby("yearpublished")
    .size()
    .reset_index(name="count")
)
fig, ax = plt.subplots(figsize=(8, 3.5))
theme.style_ax(ax, fig, colors, "")
ax.plot(year_df["yearpublished"], year_df["count"], color=colors["primary"], linewidth=2.2, alpha=0.9)
ax.fill_between(year_df["yearpublished"], year_df["count"], alpha=0.12, color=colors["primary"])
ax.set_xlabel("Year Published", fontsize=9)
ax.set_ylabel("Games Released", fontsize=9)
ax.tick_params(labelsize=8)
plt.tight_layout()
st.pyplot(fig, width='stretch')
plt.close()

st.markdown("---")

# ─────────────────────────────────────────────────────────────────
# Row 6 — Sentiment (optional, only if data exists)
# ─────────────────────────────────────────────────────────────────
if not sent_df.empty and "avg_sentiment_score" in sent_df.columns:
    st.markdown('<div class="section-title">Community Sentiment Distribution</div>', unsafe_allow_html=True)

    sent_scores = sent_df["avg_sentiment_score"].dropna()
    s1, s2 = st.columns([3, 1])

    with s1:
        fig, ax = plt.subplots(figsize=(8, 3.5))
        theme.style_ax(ax, fig, colors, "Avg. Sentiment Score per Game  (0 = Negative → 1 = Positive)")
        ax.hist(sent_scores, bins=40, color=colors["accent"], alpha=colors["bar_alpha"], edgecolor="none")
        ax.set_xlabel("Avg. Sentiment Score", fontsize=9)
        ax.set_ylabel("Games", fontsize=9)
        ax.tick_params(labelsize=8)
        ax.axvline(
            sent_scores.mean(), color=colors["secondary"], linewidth=1.8,
            linestyle="--", label=f"Mean: {sent_scores.mean():.3f}",
        )
        ax.legend(facecolor=colors["bg"], edgecolor=colors["grid"], labelcolor=colors["text"], fontsize=8)
        plt.tight_layout()
        st.pyplot(fig, width='stretch')
        plt.close()

    with s2:
        st.metric("Games with Sentiment", f"{len(sent_scores):,}")
        st.metric("Mean Sentiment", f"{sent_scores.mean():.3f}")
        st.metric("Median Sentiment", f"{sent_scores.median():.3f}")
        pct_pos = (sent_scores >= 0.5).mean() * 100
        st.metric("% Positive (≥ 0.5)", f"{pct_pos:.1f}%")

    st.markdown("---")

st.caption("BoardGames Analyzer — Explainable Hybrid Recommendation System · Built with Streamlit")
