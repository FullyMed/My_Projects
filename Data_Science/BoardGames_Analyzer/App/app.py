import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Board Game Discovery Engine",
    page_icon="🎲",
    layout="wide",
)

st.sidebar.title("Navigation")
st.sidebar.info("Use the pages above to navigate between the Recommendation engine and the Analytics dashboard.")
st.sidebar.markdown("---")
st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)

# Header
st.markdown('<div class="main-title"><span class="title-icon">🎲</span> Board Game Discovery Engine</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">An explainable hybrid recommendation system for board game discovery.</div>',
    unsafe_allow_html=True,
)

st.markdown("---")

# Navigation cards
col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div class="home-card">
        <div class="home-card-icon">🧠</div>
        <div class="home-card-title">Recommendation Engine</div>
        <div class="home-card-desc">
            Discover board games by entering titles you enjoy, selecting gameplay traits,
            or combining both. Three modes: Title-Based, Trait-Based, and Combined.
        </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="home-card">
        <div class="home-card-icon">📊</div>
        <div class="home-card-title">Dataset Analytics</div>
        <div class="home-card-desc">
            Explore the BoardGameGeek dataset powering the engine — rating distributions,
            top-rated games, most common mechanics, categories, and publication trends.
        </div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Key stats
st.markdown('<div class="section-title">Project at a Glance</div>', unsafe_allow_html=True)

s1, s2, s3, s4 = st.columns(4)

with s1:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">21K+</div>
        <div class="stat-label">Board Games</div>
    </div>
    """, unsafe_allow_html=True)

with s2:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">18.7M</div>
        <div class="stat-label">User Ratings</div>
    </div>
    """, unsafe_allow_html=True)

with s3:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">3</div>
        <div class="stat-label">Recommendation Modes</div>
    </div>
    """, unsafe_allow_html=True)

with s4:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">20.3%</div>
        <div class="stat-label">Recall@10 (Title Mode)</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# How it works
st.markdown('<div class="section-title">How It Works</div>', unsafe_allow_html=True)

h1, h2, h3 = st.columns(3)

with h1:
    st.markdown("""
    <div class="info-box">
        <b>Content Similarity</b><br><br>
        TF-IDF and MiniLM sentence-transformer embeddings capture keyword-level
        and semantic similarity between board game descriptions and metadata.
    </div>
    """, unsafe_allow_html=True)

with h2:
    st.markdown("""
    <div class="info-box">
        <b>Sentiment Analysis</b><br><br>
        DistilBERT SST-2 sentiment scores aggregated from user reviews add
        qualitative community perception signals beyond raw numerical ratings.
    </div>
    """, unsafe_allow_html=True)

with h3:
    st.markdown("""
    <div class="info-box">
        <b>Popularity Signals</b><br><br>
        Normalized rating counts and average ratings ensure well-regarded games
        surface without completely overshadowing niche titles.
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")
st.caption("BoardGames Analyzer — Explainable Hybrid Recommendation System · Built with Streamlit")
