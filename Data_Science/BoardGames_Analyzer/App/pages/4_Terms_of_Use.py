import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Terms of use · Board Game Discovery Engine",
    page_icon="📜",
    layout="wide",
)
theme.set_meta_description(
    "The terms for using BoardGames Analyzer, a free, non-commercial student project "
    "that recommends board games."
)

st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine, a student research project.")

st.markdown('<div class="main-title"><span class="title-icon">📜</span> Terms of use</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">The ground rules for using BoardGames Analyzer.</div>',
    unsafe_allow_html=True,
)
st.caption("Last updated: October 15, 2026")
st.markdown("---")

sections = [
    (
        "1. What this is",
        "BoardGames Analyzer is a free student project. It's a portfolio and research demo of an "
        "explainable board game recommender, not a business or a commercial service, and these terms "
        "are written with that in mind.",
    ),
    (
        "2. Using the app",
        "Use it to look around and find games for yourself. Please don't scrape it with automated "
        "tools, flood it with requests, or try to get around how it normally works.",
    ),
    (
        "3. Recommendations aren't advice",
        "An algorithm builds every recommendation from public BoardGameGeek (BGG) data, using content "
        "similarity, trait matching, review sentiment and popularity. The suggestions are for discovery "
        "and fun. They can be incomplete or wrong, and they don't guarantee that a game is good, "
        "available, or right for you.",
    ),
    (
        "4. Where the data comes from",
        "The game details, ratings and review text come from publicly available BoardGameGeek (BGG) "
        "datasets. BoardGameGeek LLC and Geekdo, Inc. have no connection to this project: they don't "
        "endorse or sponsor it. \"BoardGameGeek\" and related trademarks belong to their owners.",
    ),
    (
        "5. No warranty",
        "The app comes \"as is\", with no warranty of any kind, express or implied. That covers "
        "availability, uptime, accuracy, and fitness for any particular purpose. The maintainer isn't "
        "liable for any damage that comes from using the app or from not being able to use it.",
    ),
    (
        "6. Source code",
        "The code lives on GitHub. The repository doesn't publish an open-source license yet, so "
        "please ask the maintainer on GitHub before you reuse the code.",
    ),
    (
        "7. Changes to these terms",
        "The maintainer may update these terms as the project changes. If you keep using the app "
        "after an update, you accept the new terms.",
    ),
    (
        "8. Contact",
        "Questions about these terms? Ask on the project's GitHub repository: "
        '<a href="https://github.com/FullyMed/My_Projects" target="_blank">github.com/FullyMed/My_Projects</a>.',
    ),
]

for title, body in sections:
    st.markdown(f'<div class="section-title">{title}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="info-box">{body}</div>', unsafe_allow_html=True)

st.markdown("---")
c1, c2 = st.columns(2)
with c1:
    st.page_link("app.py", label="Home", icon="🏠")
with c2:
    st.page_link("pages/5_Privacy_Policy.py", label="Privacy policy", icon="🔒")

st.markdown("---")
st.caption("BoardGames Analyzer · board game recommendations with reasons · built with Streamlit")
