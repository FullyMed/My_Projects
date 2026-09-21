import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
import theme

st.set_page_config(
    page_title="Terms of Use — Board Game Discovery Engine",
    page_icon="📜",
    layout="wide",
)
theme.set_meta_description(
    "Terms of use for BoardGames Analyzer, an educational, non-commercial board game "
    "recommendation demo built with Streamlit."
)

st.sidebar.title("⚙ Settings")
selected_theme = theme.sidebar_theme()
theme.apply_theme(selected_theme)
st.sidebar.markdown("---")
st.sidebar.caption("Board Game Discovery Engine — interactive recommendation demo.")

st.markdown('<div class="main-title"><span class="title-icon">📜</span> Terms of Use</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Please read these terms before using BoardGames Analyzer.</div>',
    unsafe_allow_html=True,
)
st.caption("Last updated: September 21, 2026")
st.markdown("---")

sections = [
    (
        "1. About This Project",
        "BoardGames Analyzer is an independent, non-commercial educational and portfolio project "
        "that demonstrates an explainable hybrid board game recommendation system. It is not a "
        "registered business or commercial service, and these terms are offered in that spirit.",
    ),
    (
        "2. Acceptable Use",
        "This app is intended for personal, non-commercial exploration and demonstration. Please "
        "don't use automated tools to scrape, overload, or disrupt the app, or attempt to circumvent "
        "its normal operation.",
    ),
    (
        "3. Recommendations Are Not Advice",
        "Recommendations are generated algorithmically from public BoardGameGeek (BGG) data using "
        "content similarity, trait matching, sentiment analysis, and popularity signals. They are "
        "provided for discovery and entertainment purposes only, may be incomplete or inaccurate, "
        "and are not a guarantee of any game's quality, availability, or suitability for you.",
    ),
    (
        "4. Data Source &amp; Attribution",
        "Game metadata, ratings, and review text used by this app are sourced from publicly "
        "available BoardGameGeek (BGG) datasets. This project is not affiliated with, endorsed by, "
        "or sponsored by BoardGameGeek LLC or Geekdo, Inc. \"BoardGameGeek\" and related trademarks "
        "belong to their respective owners.",
    ),
    (
        "5. No Warranty",
        "This app is provided \"as is,\" without warranty of any kind, express or implied, including "
        "availability, uptime, accuracy, or fitness for a particular purpose. The maintainer is not "
        "liable for any damages arising from use of, or inability to use, this app.",
    ),
    (
        "6. Source Code",
        "The source code for this project is hosted on GitHub. No specific open-source license is "
        "currently published for this repository — please contact the maintainer via GitHub before "
        "reusing the code.",
    ),
    (
        "7. Changes to These Terms",
        "These terms may be updated as the project evolves. Continued use of the app after changes "
        "are posted constitutes acceptance of the updated terms.",
    ),
    (
        "8. Contact",
        "Questions about these terms can be raised via the project's GitHub repository: "
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
    st.page_link("pages/5_Privacy_Policy.py", label="Privacy Policy", icon="🔒")

st.markdown("---")
st.caption("BoardGames Analyzer — Explainable Hybrid Recommendation System · Built with Streamlit")
