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
theme.set_meta_description(
    "Find board games like the ones you already love. BoardGames Analyzer suggests games "
    "from 21,000+ BoardGameGeek titles and tells you why it picked each one."
)

st.sidebar.title("Navigation")
st.sidebar.info("Pick a page above. Recommendation finds games for you; Analytics shows the data behind it.")
st.sidebar.markdown("---")
st.sidebar.title("Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)

# Header
st.markdown(
    f'<div class="main-title">{theme.icon_svg("dice", "brand-mark")}Board Game Discovery Engine</div>',
    unsafe_allow_html=True,
)
st.markdown(
    '<div class="subtitle">Find board games like the ones you love, and see why each one was picked.</div>',
    unsafe_allow_html=True,
)

st.markdown("---")

# Navigation cards
col1, col2 = st.columns(2)

# Keyed containers (styled like .home-card in theme.py) so each card holds a real link;
# the cards used to look clickable but did nothing
with col1:
    with st.container(key="home_card_recommend"):
        st.markdown(f"""
        <div class="home-card-icon">{theme.icon_svg("search")}</div>
        <div class="home-card-title">Get recommendations</div>
        <div class="home-card-desc">
            Type a few games you like, pick the traits you want, or do both.
            Each suggestion lists the mechanics and categories it shares with your picks.
        </div>
        """, unsafe_allow_html=True)
        st.page_link("pages/1_Recommendation.py", label="Find games", icon=":material/casino:")

with col2:
    with st.container(key="home_card_data"):
        st.markdown(f"""
        <div class="home-card-icon">{theme.icon_svg("chart")}</div>
        <div class="home-card-title">Explore the data</div>
        <div class="home-card-desc">
            Charts of the BoardGameGeek games behind the recommender: ratings, complexity,
            the most common mechanics, and how many games came out each year.
        </div>
        """, unsafe_allow_html=True)
        st.page_link("pages/2_Analytics.py", label="See the charts", icon=":material/bar_chart:")

st.markdown("---")

# Key stats
st.markdown('<div class="section-title">At a glance</div>', unsafe_allow_html=True)

s1, s2, s3, s4 = st.columns(4)

with s1:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">21K+</div>
        <div class="stat-label">Board games</div>
    </div>
    """, unsafe_allow_html=True)

with s2:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">18.7M</div>
        <div class="stat-label">User ratings</div>
    </div>
    """, unsafe_allow_html=True)

with s3:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">3</div>
        <div class="stat-label">Ways to search</div>
    </div>
    """, unsafe_allow_html=True)

with s4:
    st.markdown("""
    <div class="stat-box">
        <div class="stat-number">21.5K</div>
        <div class="stat-label">Games with review sentiment</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# How it works
st.markdown('<div class="section-title">How it works</div>', unsafe_allow_html=True)

h1, h2, h3 = st.columns(3)

with h1:
    st.markdown("""
    <div class="info-box">
        <b>Similar games</b><br><br>
        We compare game descriptions word by word (TF-IDF) and by meaning
        (MiniLM embeddings), and check which BGG mechanics and themes they share.
    </div>
    """, unsafe_allow_html=True)

with h2:
    st.markdown("""
    <div class="info-box">
        <b>Review sentiment</b><br><br>
        A DistilBERT model read up to 10 user reviews per game and scored how
        positive they sound. It's a small part of the score.
    </div>
    """, unsafe_allow_html=True)

with h3:
    st.markdown("""
    <div class="info-box">
        <b>Popularity</b><br><br>
        Games with more ratings get a boost, so well-known titles aren't buried.
        The trade-off: big hits show up more often than hidden gems.
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")
f1, f2 = st.columns(2)
with f1:
    st.page_link("pages/4_Terms_of_Use.py", label="Terms of use", icon=":material/description:")
with f2:
    st.page_link("pages/5_Privacy_Policy.py", label="Privacy policy", icon=":material/lock:")

st.markdown("---")
st.caption("BoardGames Analyzer · board game recommendations with reasons · built with Streamlit")
